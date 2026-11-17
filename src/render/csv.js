/**
 * CSV 渲染层：给编程、码表、Excel 直接用的平面表。
 * 统一 UTF-8 BOM，Excel 双击打开不乱码。
 */

const BOM = '\uFEFF'

function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** 数组的数组 → CSV 文本。 */
export function toCsv(rows, { bom = true } = {}) {
  const body = rows.map(row => row.map(escapeCell).join(',')).join('\r\n')
  return `${bom ? BOM : ''}${body}\r\n`
}

const typeName = {
  single: '单选', multi: '多选', scale: '量表', grid: '网格', open: '开放题',
  numeric: '数值', rank: '排序',
}

const randomText = {
  options: '选项随机', brands: '品牌随机', rows: '行随机', none: '',
}

function optionText(question) {
  if (question.type === 'scale') {
    return `${question.scale?.min}（${question.scale?.minLabel}）— ${question.scale?.max}（${question.scale?.maxLabel}）`
  }
  if (question.type === 'grid') {
    const rows = question.rows ?? []
    const head = question.brands ? '品牌见题干；属性：' : '属性：'
    return `${head}${rows.join(' / ')}`
  }
  return (question.options ?? []).map(o => `[${o.code}] ${o.label}`).join(' / ')
}

/** 02-问卷.csv：给编程同学的平面表。 */
export function questionnaireCsv(project) {
  const rows = [['题号', '模块', '模块名称', '题型', '题干', '选项 / 刻度', 'base', '必答', '随机化', '跳转', '编程说明']]
  for (const module of project.questionnaire.modules) {
    for (const question of module.questions) {
      rows.push([
        question.id,
        module.code,
        module.name,
        typeName[question.type] ?? question.type,
        question.text,
        optionText(question),
        question.base,
        question.required ? '是' : '否',
        randomText[question.randomize] ?? '',
        question.routing ?? '',
        question.note ?? '',
      ])
    }
  }
  return toCsv(rows)
}

/** 05-码表.csv：变量、编码与缺失值约定。 */
export function codebookCsv(project) {
  const rows = [['变量名', '题号', '模块', '题型', '题干', '编码 / 取值', 'base', '缺失值']]
  for (const module of project.questionnaire.modules) {
    for (const question of module.questions) {
      const variable = `q_${question.id.replace('.', '_')}`
      let coding
      if (question.type === 'grid') {
        const rowsText = (question.rows ?? []).length
        coding = question.brands
          ? `按品牌 × 属性拆列：${variable}_1_1 … ${variable}_n_${rowsText}（1-5）`
          : `按属性拆列：${variable}_1 … ${variable}_${rowsText}（1-5）`
      } else if (question.type === 'scale') {
        coding = `${question.scale?.min}-${question.scale?.max} 连续整数`
      } else if (question.type === 'multi') {
        const codes = (question.options ?? []).map(o => o.code).join('/')
        coding = `哑变量拆列：${variable}_${codes.split('/')[0]} … （0/1）；编码：${(question.options ?? []).map(o => `${o.code}=${o.label}`).join('，')}`
      } else if (question.type === 'open') {
        coding = '原文列 + 编码列（按开放题编码表）'
      } else {
        coding = (question.options ?? []).map(o => `${o.code}=${o.label}`).join('，')
      }
      rows.push([
        variable,
        question.id,
        `${module.code} ${module.name}`,
        typeName[question.type] ?? question.type,
        question.text,
        coding,
        question.base,
        '-9 未回答；-8 不适用；-7 拒答',
      ])
    }
  }
  rows.push(['wgt', '—', '加权', '数值', '设计权重', '按城市 × 性别 × 年龄联合分布，截断 0.3-3.0', '全部合格受访者', '—'])
  return toCsv(rows)
}

/** 04-配额表.csv：可直接贴进 Excel 的交叉配额。 */
export function quotaCsv(project) {
  const dims = project.playbook.id === 'brand-tracker' ? ['城市级别', '性别', '年龄'] : ['城市级别', '性别', '年龄']
  const rows = [[...dims, '样本量', '样本占比', '总体占比', '设计权重']]
  for (const cell of project.sampling.recommended.rows) {
    rows.push([
      ...cell.labels,
      cell.n,
      `${(cell.sampleShare * 100).toFixed(1)}%`,
      `${(cell.popShare * 100).toFixed(1)}%`,
      cell.weight.toFixed(2),
    ])
  }
  rows.push(['合计', '', '', project.sampling.recommended.rows.reduce((acc, row) => acc + row.n, 0), '100%', '100%', '—'])
  return toCsv(rows)
}
