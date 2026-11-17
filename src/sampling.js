/**
 * 抽样与配额引擎
 *
 * 回答四个问题：
 *  1. 这个样本量能看多细（精度表）
 *  2. 样本怎么分（三种方案 + 推荐方案的交叉配额表）
 *  3. 要接触多少人、做多久、花多少钱（接触量 / 排期 / 成本）
 *  4. 加权后还有多少有效样本（设计效应）
 */

export const DEFAULT_DEFF = 1.2
const Z95 = 1.96

/** 比例的抽样误差（半宽，百分点）。 */
export function marginOfError(n, { p = 0.5, z = Z95, deff = DEFAULT_DEFF } = {}) {
  if (!(n > 0)) return null
  return z * Math.sqrt((p * (1 - p)) / n) * Math.sqrt(deff)
}

/** 要在 95% 置信下把误差控制在 e 以内，需要多少样本。 */
export function sampleForMargin(e, { p = 0.5, z = Z95, deff = DEFAULT_DEFF } = {}) {
  if (!(e > 0)) return null
  return Math.ceil((z * z * p * (1 - p) * deff) / (e * e))
}

/** 常用样本量的精度对照表。 */
export function precisionTable({ p = 0.5, deff = DEFAULT_DEFF, sizes = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500] } = {}) {
  return sizes.map(n => ({
    n,
    margin: marginOfError(n, { p, deff }),
    effective: Math.round(n / deff),
  }))
}

const sum = values => values.reduce((a, b) => a + b, 0)

/** 按策略给出每个维度的水平份额。 */
export function levelShares(dims, strategy = 'proportional') {
  return dims.map(dim => {
    if (strategy === 'equal') {
      const each = 1 / dim.levels.length
      return { ...dim, levels: dim.levels.map(level => ({ ...level, useShare: each })) }
    }
    return { ...dim, levels: dim.levels.map(level => ({ ...level, useShare: level.share })) }
  })
}

/** 笛卡尔积：每个交叉格一条记录。 */
export function cellsOf(dims) {
  let cells = [{ codes: [], labels: [], shareProduct: 1 }]
  for (const dim of dims) {
    const next = []
    for (const cell of cells) {
      for (const level of dim.levels) {
        next.push({
          codes: [...cell.codes, level.code],
          labels: [...cell.labels, level.label],
          shareProduct: cell.shareProduct * (level.useShare ?? level.share),
        })
      }
    }
    cells = next
  }
  return cells
}

/** 按目标总量取整：最大余数法，保证合计精确等于 total。 */
export function roundToTotal(values, total) {
  const bases = values.map(v => Math.floor(v))
  let rest = total - sum(bases)
  const order = values
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < rest; k += 1) bases[order[k % order.length].i] += 1
  return bases
}

/** 抬到下限后再按比例回撤，让总量回到 n。 */
function applyFloors(raw, floors, n) {
  let cells = raw.map((v, i) => Math.max(v, floors[i]))
  let total = sum(cells)
  for (let iter = 0; iter < 80 && total - n > 0.01; iter += 1) {
    const reducible = cells.map((v, i) => Math.max(0, v - floors[i]))
    const pool = sum(reducible)
    if (pool <= 1e-9) break
    const factor = Math.min(1, (total - n) / pool)
    cells = cells.map((v, i) => v - reducible[i] * factor)
    total = sum(cells)
  }
  if (total < n - 0.01) {
    const gap = n - total
    const pool = sum(raw)
    cells = cells.map((v, i) => v + (gap * raw[i]) / (pool || 1))
  }
  return cells
}

/**
 * 生成一份配额表。
 * @param {number} n 总样本
 * @param {object} sampling playbook.sampling
 * @param {'proportional'|'equal'|'mixed'} strategy 分配策略
 */
export function allocate(n, sampling, strategy = 'proportional') {
  const dims = levelShares(sampling.dims, strategy === 'equal' ? 'equal' : 'proportional')
  const cells = cellsOf(dims)
  const minCell = strategy === 'mixed' ? Math.max(sampling.minCell ?? 15, 20) : Math.max(4, sampling.minCell ?? 15)
  const raw = cells.map(cell => cell.shareProduct * n)
  const floors = cells.map(() => minCell)
  const counts = roundToTotal(applyFloors(raw, floors, n), n)

  const rows = cells.map((cell, i) => ({
    codes: cell.codes,
    labels: cell.labels,
    key: cell.codes.join('·'),
    label: cell.labels.join(' · '),
    n: counts[i],
    sampleShare: counts[i] / n,
    popShare: cell.shareProduct,
    weight: clamp((cell.shareProduct) / (counts[i] / n || 1e-9), 0.3, 3),
  }))

  return { strategy, n, minCell, rows, marginals: marginalRows(rows, dims, n) }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** 每个维度的边际样本量与设计权重。 */
export function marginalRows(rows, dims, n) {
  return dims.map((dim, index) => {
    const levels = dim.levels.map(level => {
      const count = rows
        .filter(row => row.codes[index] === level.code)
        .reduce((acc, row) => acc + row.n, 0)
      return {
        code: level.code,
        label: level.label,
        n: count,
        sampleShare: count / n,
        popShare: level.useShare ?? level.share,
        weight: clamp((level.useShare ?? level.share) / (count / n || 1e-9), 0.3, 3),
      }
    })
    return { key: dim.key, name: dim.name, levels }
  })
}

/** 三种分配方案的对比摘要（给抽样页第一屏用）。 */
export function comparePlans(n, sampling) {
  const plans = (sampling.alternatives ?? []).map(alt => {
    const alloc = allocate(n, sampling, alt.key)
    return {
      ...alt,
      marginals: alloc.marginals.map(m => ({
        name: m.name,
        levels: m.levels.map(level => ({ label: level.label, n: level.n })),
      })),
      minCell: Math.min(...alloc.rows.map(row => row.n)),
      maxWeight: Math.max(...alloc.rows.map(row => row.weight)),
    }
  })
  return plans
}

/** 研究结论所依赖的「有效样本」与每个边际的精度。 */
export function effectiveSample(n, deff = DEFAULT_DEFF) {
  return Math.round(n / deff)
}

/** 接触量、工时、成本。 */
export function contactPlan({ n, incidence = 0.5, responseRate = 0.15, loi = 15, cpi = 50, dailyCompletes = 80 }) {
  const invites = Math.ceil(n / Math.max(0.01, incidence * responseRate))
  const hours = (n * loi) / 60
  const fieldDays = Math.ceil(n / Math.max(1, dailyCompletes))
  return {
    n,
    incidence,
    responseRate,
    loi,
    cpi,
    invites,
    hours: Math.round(hours),
    fieldDays,
    dailyCompletes,
    cost: n * cpi,
    costPerComplete: cpi,
  }
}

/** 执行排期（以开始日为 D0 的相对天数）。 */
export function schedule({ fieldDays, loi }) {
  const programming = 3
  const pilot = 2
  const data = 4
  const report = 5
  let day = 0
  const rows = []
  const push = (name, days, note) => {
    rows.push({ name, start: day, end: day + days, note })
    day += days
  }
  push('问卷编程与逻辑测试', programming, '含配额设置、随机化、跳转测试')
  push('试访', pilot, `5-10 份试访，单份约 ${loi} 分钟`)
  push('正式访问', fieldDays, '按日均完成量倒排')
  push('数据清洗与编码', data, '含开放题编码、异常值处理')
  push('分析与报告', report, '含图表与建议')
  return { rows, totalDays: day, fieldworkStart: programming + pilot, fieldworkEnd: programming + pilot + fieldDays }
}

/** 把整套抽样建议汇总成一份可渲染的结构。 */
export function buildSamplingReport({ n, playbook, project }) {
  const sampling = playbook.sampling
  const plans = comparePlans(n, sampling)
  const recommended = allocate(n, sampling, 'mixed')
  const contact = contactPlan({
    n,
    incidence: project.incidence ?? playbook.incidence,
    responseRate: project.responseRate ?? playbook.responseRate,
    loi: playbook.loiMinutes,
    cpi: project.cpi ?? playbook.cpi,
  })
  const plan = schedule({ fieldDays: contact.fieldDays, loi: playbook.loiMinutes })
  const precision = precisionTable({ deff: DEFAULT_DEFF })
  const flags = []
  for (const marginal of recommended.marginals) {
    const min = sampling.minMarginal?.[marginal.key]
    if (!min) continue
    for (const level of marginal.levels) {
      if (level.n < min) {
        flags.push({
          level: 'warn',
          text: `${marginal.name}「${level.label}」只有 ${level.n} 个样本，低于建议的 ${min}，单独下结论不稳`,
        })
      }
    }
  }
  const tiny = recommended.rows.filter(row => row.n < 10)
  if (tiny.length) {
    flags.push({
      level: 'info',
      text: `有 ${tiny.length} 个交叉格样本 ≤ 10，只能用于加权，不能单独分析`,
    })
  }
  return {
    n,
    deff: DEFAULT_DEFF,
    precision,
    plans,
    recommended,
    contact,
    schedule: plan,
    flags,
    weighting: sampling.weighting,
    note: '配额为建议值，最终以实际抽样框与代理执行能力为准；加权方案只给口径。',
  }
}
