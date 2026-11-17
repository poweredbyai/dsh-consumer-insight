/**
 * 生成引擎：项目参数 + 标准件 → 全套交付内容
 *
 * 这里只产出结构化数据与纯文本（Markdown / CSV）；Word 与 Excel 由 render 层转换。
 * 所有函数都是纯函数，方便单测与在 Agent 工具里复用。
 */

import { buildSamplingReport, marginOfError, precisionTable, DEFAULT_DEFF } from './sampling.js'

const PLACEHOLDERS = {
  '{{品类}}': p => p.category,
  '{{主品牌}}': p => p.ownBrand,
  '{{品牌列表}}': p => p.brands.join('、'),
  '{{人群}}': p => p.audience,
  '{{市场}}': p => p.markets,
  '{{首选品牌}}': () => '你首选的品牌',
  '{{主用品牌}}': () => '你最常使用的品牌',
}

const MINUTES = { single: 0.28, multi: 0.38, scale: 0.22, open: 0.8, numeric: 0.28, rank: 0.55 }
const OPEN_LIMIT = 3
const GRID_ROW_LIMIT = 20
const TEXT_LIMIT = 60

/** 把项目输入补全成完整 brief。 */
export function normalizeBrief(input = {}, playbook) {
  const brandsRaw = input.brands
  const ownBrand = (input.ownBrand || '').trim()
  const competitors = Array.isArray(brandsRaw)
    ? brandsRaw.map(b => String(b).trim()).filter(Boolean)
    : String(brandsRaw || input.competitors || '')
      .split(/[;,；、\n]/)
      .map(b => b.trim())
      .filter(Boolean)

  const decisions = Array.isArray(input.decisions)
    ? input.decisions
    : String(input.decisions || '').split(/\n/).map(d => d.trim()).filter(Boolean)

  const sampleSize = Number(input.sampleSize)
  const category = (input.category || '').trim()
  const name = (input.name || '').trim() || `${playbook.name}-${category || '未命名'}-${dateStamp(input.now)}`

  return {
    name,
    type: playbook.id,
    typeName: playbook.name,
    objective: (input.objective || '').trim(),
    decisions,
    category,
    ownBrand,
    competitors,
    brands: [ownBrand, ...competitors].filter(Boolean),
    audience: (input.audience || '').trim(),
    markets: (input.markets || '全国一至三线').trim(),
    method: (input.method || '线上 panel').trim(),
    sampleSize: Number.isFinite(sampleSize) && sampleSize > 0 ? Math.round(sampleSize) : playbook.defaultN,
    quotas: (input.quotas || '').trim(),
    timeline: (input.timeline || '').trim(),
    budget: (input.budget || '').trim(),
    outputs: Array.isArray(input.outputs) && input.outputs.length ? input.outputs : ['questionnaire', 'analysis', 'sampling', 'codebook', 'qc'],
    notes: (input.notes || '').trim(),
    disableModules: Array.isArray(input.disableModules) ? input.disableModules : [],
    extraQuestions: Array.isArray(input.extraQuestions) ? input.extraQuestions : [],
    language: input.language || 'zh',
    now: input.now || new Date().toISOString(),
  }
}

function dateStamp(now) {
  const d = now ? new Date(now) : new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** 中英文之间补空格，避免「形容A这个品牌」这类挤在一起的字。 */
function spaceCJK(value) {
  return String(value ?? '')
    .replace(/([\u4e00-\u9fff])([A-Za-z0-9])/g, '$1 $2')
    .replace(/([A-Za-z0-9])([\u4e00-\u9fff])/g, '$1 $2')
}

/** 替换题干与说明里的占位符。 */
export function fillPlaceholders(text, brief) {
  let out = String(text ?? '')
  for (const [token, value] of Object.entries(PLACEHOLDERS)) {
    if (!out.includes(token)) continue
    const replacement = value(brief)
    out = out.split(token).join(replacement ?? '')
  }
  return spaceCJK(out)
}

/** 动态选项来源：把 playbook 里用字符串引用的选项解析成真实选项。 */
function resolveOptionSource(source, playbook, brief) {
  if (source === 'BRANDS' || source === 'CONSIDERED_BRANDS' || source === 'USED_BRANDS' || source === 'KNOWN_BRANDS') {
    return brief.brands.map((brand, index) => ({ code: index + 1, label: brand }))
  }
  const map = {
    'brand-tracker': { OCCASIONS: 'B1.5' },
    satisfaction: { OCCASIONS: 'C1.5', C3_ROWS: 'C3.1', C4_TOUCHPOINTS: 'C4.1' },
  }[playbook.id] ?? {}
  if (source === 'C3_ROWS') {
    const q = findQuestion(playbook, map.C3_ROWS)
    return (q?.rows ?? []).map((label, index) => ({ code: index + 1, label }))
  }
  if (source === 'C4_TOUCHPOINTS') {
    const q = findQuestion(playbook, map.C4_TOUCHPOINTS)
    return (q?.options ?? []).map(o => ({ ...o, label: fillPlaceholders(o.label, brief) }))
  }
  if (source === 'OCCASIONS') {
    const q = findQuestion(playbook, map.OCCASIONS)
    return (q?.options ?? []).filter(o => o.code !== 98).map(o => ({ ...o, label: fillPlaceholders(o.label, brief) }))
  }
  return []
}

function findQuestion(playbook, id) {
  for (const mod of playbook.modules) {
    for (const question of mod.questions) {
      if (question.id === id) return question
    }
  }
  return undefined
}

/** 单题预计耗时（分钟）。 */
export function questionMinutes(question, brandCount = 1) {
  if (question.type === 'grid') {
    if (question.brands) return Math.max(1.0, brandCount * 0.9)
    return Math.max(0.45, (question.rows?.length ?? 4) * 0.05)
  }
  return MINUTES[question.type] ?? 0.4
}

/** 生成一份问卷模型（模块 + 题目 + 选项 + 时长）。 */
export function buildQuestionnaire(playbook, brief) {
  const brandCount = brief.brands.length
  const modules = []
  for (const mod of playbook.modules) {
    if (brief.disableModules.includes(mod.code)) continue
    const questions = mod.questions.map(question => {
      const resolved = { ...question }
      resolved.text = fillPlaceholders(question.text, brief)
      resolved.base = fillPlaceholders(question.base ?? '', brief)
      resolved.note = fillPlaceholders(question.note ?? '', brief)
      resolved.routing = fillPlaceholders(question.routing ?? '', brief)
      resolved.purpose = mod.purpose
      if (typeof question.options === 'string') {
        resolved.options = resolveOptionSource(question.options, playbook, brief)
      } else if (Array.isArray(question.options)) {
        resolved.options = question.options.map(o => ({ ...o, label: fillPlaceholders(o.label, brief) }))
      }
      if (Array.isArray(question.extraOptions)) {
        resolved.options = [
          ...(resolved.options ?? []),
          ...question.extraOptions.map(o => ({ ...o, label: fillPlaceholders(o.label, brief) })),
        ]
      }
      if (Array.isArray(question.rows)) {
        resolved.rows = question.rows.map(row => fillPlaceholders(row, brief))
      } else if (typeof question.rows === 'string') {
        resolved.rows = resolveOptionSource(question.rows, playbook, brief).map(option => option.label)
      }
      resolved.minutes = questionMinutes(resolved, brandCount)
      return resolved
    })
    // 追加项目级自定义题（Agent 在对话里补题时用）
    const extras = brief.extraQuestions.filter(q => q.module === mod.code)
    extras.forEach((q, index) => {
      questions.push({
        id: q.id || `${mod.code}.X${index + 1}`,
        type: q.type || 'open',
        text: fillPlaceholders(q.text || '（待补充题目）', brief),
        base: q.base || '合格受访者',
        required: false,
        note: q.note || '项目自定义题',
        options: q.options,
        rows: q.rows,
        scale: q.scale,
        minutes: questionMinutes(q, brandCount),
        custom: true,
      })
    })
    modules.push({ code: mod.code, name: mod.name, purpose: fillPlaceholders(mod.purpose, brief), questions })
  }
  const allQuestions = modules.flatMap(m => m.questions)
  const minutes = Math.round((1.2 + allQuestions.reduce((acc, q) => acc + q.minutes, 0)) * 10) / 10
  return { modules, questions: allQuestions, minutes }
}

/** 自动体检：返回可展示的问题清单。 */
export function runChecks({ brief, playbook, questionnaire, sampling }) {
  const checks = []
  const push = (level, text, target) => checks.push({ level, text, target })

  if (!brief.objective) push('error', '项目目标为空：没有目标就无法判断该砍哪些题', 'objective')
  else if (brief.objective.length < 12) push('warn', '项目目标偏短，建议写清"要做什么决策"', 'objective')

  if (!brief.category) push('error', '品类为空：题目里的品类占位无法替换', 'category')
  if (!brief.ownBrand) push('error', '主品牌为空：认知与形象题无法生成', 'ownBrand')
  if (!brief.audience) push('error', '目标人群为空：筛选与配额无法确定', 'audience')

  if (playbook.id === 'brand-tracker' && brief.brands.length < 2) {
    push('warn', '只填了主品牌：品牌追踪至少需要 1 个竞品才能看竞争格局', 'brands')
  }

  if (questionnaire.minutes > playbook.durationLimit) {
    push('warn', `预计时长 ${questionnaire.minutes} 分钟，超过该类调研上限 ${playbook.durationLimit} 分钟；建议砍掉优先度低的模块或网格题`, 'duration')
  }

  const openLimit = playbook.openLimit ?? OPEN_LIMIT
  const openCount = questionnaire.questions.filter(q => q.type === 'open').length
  if (openCount > openLimit) push('warn', `开放题 ${openCount} 道（建议 ≤ ${openLimit}），会拉低完成率并增加编码成本`, 'questionnaire')

  for (const q of questionnaire.questions) {
    if (!q.base) push('error', `${q.id} 没有 base：统计时无法确定分母`, q.id)
    if (!q.text || q.text.length < 6) push('error', `${q.id} 题干缺失或过短`, q.id)
    if (q.text && q.text.length > TEXT_LIMIT) {
      push('info', `${q.id} 题干 ${q.text.length} 字，超过 ${TEXT_LIMIT} 字建议，移动端阅读会吃力`, q.id)
    }
    if (q.type === 'grid' && (q.rows?.length ?? 0) > GRID_ROW_LIMIT) {
      push('warn', `${q.id} 网格有 ${q.rows.length} 行，超过 ${GRID_ROW_LIMIT} 行，受访者容易疲劳`, q.id)
    }
    for (const word of ['难道', '是不是', '你不觉得', '众所周知']) {
      if (q.text.includes(word)) push('warn', `${q.id} 题干含引导性表达「${word}」`, q.id)
    }
    if (q.routing) {
      const ids = q.routing.match(/[A-Z]\d+\.\d+/g) ?? []
      for (const id of ids) {
        if (id === q.id) continue
        if (!questionnaire.questions.some(x => x.id === id)) {
          push('error', `${q.id} 的跳转指向不存在的题目 ${id}`, q.id)
        }
      }
    }
  }

  const firstModule = questionnaire.modules[0]
  if (firstModule && !['B0', 'C0'].includes(firstModule.code)) {
    push('warn', '第一模块不是筛选模块：样本资格无法保证', 'questionnaire')
  }

  if (brief.sampleSize < 300) {
    push('warn', `样本量 ${brief.sampleSize} 偏小：只能看总量，不建议做人群拆分`, 'sampleSize')
  }
  for (const flag of sampling.flags) push(flag.level, flag.text, 'sampling')

  const errors = checks.filter(c => c.level === 'error').length
  const warns = checks.filter(c => c.level === 'warn').length
  return { checks, errors, warns, pass: errors === 0 }
}

/** 把 playbook 的分析框架套上项目参数与样本。 */
export function buildAnalysis(playbook, brief, sampling) {
  const fill = value => fillPlaceholders(value, brief)
  const analysis = playbook.analysis

  const banners = analysis.banners.map(banner => {
    const marginal = sampling.recommended.marginals.find(m => m.name === fill(banner.name))
    return {
      ...banner,
      name: fill(banner.name),
      levels: fill(banner.levels),
      detail: marginal
        ? marginal.levels.map(l => `${l.label} ${l.n}`).join(' / ')
        : '不设硬配额，按数据自然分布（分析时看实际样本）',
    }
  })

  return {
    trace: analysis.trace.map(row => ({
      ...row,
      decision: fill(row.decision),
      question: fill(row.question),
      metric: fill(row.metric),
      output: fill(row.output),
    })),
    banners,
    crosstabs: analysis.crosstabs.map(row => ({ ...row, rows: fill(row.rows), cols: fill(row.cols) })),
    models: analysis.models.map(row => ({
      ...row,
      name: fill(row.name),
      input: fill(row.input),
      output: fill(row.output),
      note: fill(row.note),
    })),
    charts: analysis.charts.map(row => ({ ...row, title: fill(row.title), takeaway: fill(row.takeaway) })),
    outline: analysis.outline.map(row => ({ ...row, chapter: fill(row.chapter), content: fill(row.content) })),
    dataSpec: analysis.dataSpec.map(row => ({ ...row, rule: fill(row.rule) })),
  }
}

/** 主入口：输入项目参数，产出可以落盘的一整套内容和结构化项目。 */
export function buildProject(input, playbooks) {
  const playbook = playbooks[input.type] ?? playbooks['brand-tracker']
  const brief = normalizeBrief(input, playbook)
  const questionnaire = buildQuestionnaire(playbook, brief)
  const sampling = buildSamplingReport({ n: brief.sampleSize, playbook, project: brief })
  const checks = runChecks({ brief, playbook, questionnaire, sampling })
  const analysis = buildAnalysis(playbook, brief, sampling)

  const stats = {
    modules: questionnaire.modules.length,
    questions: questionnaire.questions.length,
    minutes: questionnaire.minutes,
    brands: brief.brands.length,
    sample: brief.sampleSize,
    effectiveSample: Math.round(brief.sampleSize / DEFAULT_DEFF),
    marginTotal: marginOfError(brief.sampleSize),
    fieldDays: sampling.contact.fieldDays,
    cost: sampling.contact.cost,
  }

  const project = {
    version: 1,
    id: projectId(brief),
    createdAt: brief.now,
    brief,
    playbook: { id: playbook.id, name: playbook.name, subtitle: playbook.subtitle },
    questionnaire,
    analysis,
    sampling,
    kpis: playbook.kpis.map(kpi => ({ ...kpi, definition: fillPlaceholders(kpi.definition, brief), base: fillPlaceholders(kpi.base, brief) })),
    pitfalls: playbook.pitfalls.map(p => fillPlaceholders(p, brief)),
    stats,
    checks,
    precision: precisionTable(),
  }
  return project
}

function projectId(brief) {
  const slug = `${brief.type}-${dateStamp(brief.now)}`
  const hash = hashString(`${brief.name}|${brief.category}|${brief.ownBrand}|${brief.now}`)
  return `${slug}-${hash}`
}

function hashString(value) {
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0
  return hash.toString(36).slice(0, 6)
}
