/**
 * 文档渲染：把结构化项目转成 Word 问卷与 Excel 分析框架的输出规格。
 */

import { buildDocx } from '../ooxml/docx.js'
import { buildXlsx } from '../ooxml/xlsx.js'

const typeName = {
  single: '单选', multi: '多选', scale: '量表', grid: '网格', open: '开放题',
  numeric: '数值', rank: '排序',
}

const randomText = {
  options: '选项随机', brands: '品牌随机', rows: '行随机', none: '',
}

function dateText(iso) {
  const d = iso ? new Date(iso) : new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function scaleHint(scale) {
  if (!scale) return '1　2　3　4　5'
  const { min, max } = scale
  if (max - min <= 6) {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i).join('　')
  }
  return `${min}　${min + 1}　…　${max}`
}

function questionBlocks(question) {
  const blocks = []
  blocks.push({ type: 'q', text: `${question.id}　${question.text}` })
  const meta = [
    `题型：${typeName[question.type] ?? question.type}`,
    `base：${question.base || '未填'}`,
    question.required ? '必答' : '选答',
  ]
  if (question.randomize && question.randomize !== 'none') meta.push(randomText[question.randomize])
  blocks.push({ type: 'meta', text: meta.join('｜') })

  if (question.type === 'grid') {
    const rows = question.rows ?? []
    blocks.push({
      type: 'table',
      header: ['#', question.brands ? '属性（每个品牌分别评分）' : '属性', `评分 ${question.scale?.min ?? 1}-${question.scale?.max ?? 5}`],
      rows: rows.map((row, index) => [
        index + 1,
        row,
        scaleHint(question.scale),
      ]),
      widths: [500, 6600, 2300],
    })
    blocks.push({ type: 'meta', text: `刻度：${question.scale?.min} = ${question.scale?.minLabel}；${question.scale?.max} = ${question.scale?.maxLabel}` })
  } else if (question.type === 'scale') {
    blocks.push({ type: 'option', text: `刻度：${question.scale?.min}（${question.scale?.minLabel}）— ${question.scale?.max}（${question.scale?.maxLabel}）` })
  } else if (question.options?.length) {
    blocks.push({ type: 'options', texts: question.options.map(option => `［${option.code}］ ${option.label}`) })
  }

  if (question.routing) blocks.push({ type: 'note', text: `跳转：${question.routing}` })
  if (question.note) blocks.push({ type: 'note', text: `编程说明：${question.note}` })
  return blocks
}

/** 02-问卷.docx */
export function buildQuestionnaireDocx(project) {
  const b = project.brief
  const blocks = [
    { type: 'title', text: b.name },
    { type: 'subtitle', text: `${project.playbook.name}调研问卷 · ${b.category}${b.ownBrand ? '（' + b.ownBrand + '）' : ''}` },
    {
      type: 'meta',
      text: `版本：v1（生成稿）　日期：${dateText(project.createdAt)}　样本：${b.sampleSize}　预计时长：${project.questionnaire.minutes} 分钟　题目数：${project.stats.questions}`,
    },
    { type: 'spacer' },
    { type: 'h1', text: '访问说明（知情同意）' },
    {
      type: 'quote',
      text: `您好！我们受委托开展一项关于${b.category}的使用习惯与看法研究。访问大约需要 ${Math.round(project.questionnaire.minutes)} 分钟，所有回答仅用于整体分析，不会单独披露您的个人信息，也不会用于推销。您可以随时中止访问。`,
    },
    { type: 'quote', text: '如同意参加，请按真实想法作答；没有对错答案，也没有标准答案。' },
  ]

  for (const module of project.questionnaire.modules) {
    blocks.push({ type: 'h1', text: `${module.code} ${module.name}（${module.questions.length} 题）` })
    if (module.purpose) blocks.push({ type: 'quote', text: module.purpose })
    for (const question of module.questions) blocks.push(...questionBlocks(question))
  }

  blocks.push({ type: 'h1', text: '附：题型与编码说明' })
  blocks.push({ type: 'bullet', text: '单选题只选一个；多选题按题目上限选择，含「其他」时请注明。' })
  blocks.push({ type: 'bullet', text: '量表题：数值越大越正面；价格感知题除外（1 = 很便宜，5 = 很贵）。' })
  blocks.push({ type: 'bullet', text: '开放题保留原文，编码时按编码表归类，不改变原话。' })
  blocks.push({ type: 'bullet', text: '本问卷为生成稿，投放前需经研究员审校，并与客户确认品牌、渠道与价盘口径。' })

  return buildDocx({
    blocks,
    footer: `${b.name} · ${b.ownBrand || b.category}`,
    createdAt: project.createdAt,
  })
}

/** 03-分析框架.xlsx（4 张表） */
export function buildAnalysisXlsx(project) {
  const a = project.analysis
  const bannerRows = a.banners.map(row => [row.name, row.levels, row.detail, row.note])
  const sheetBanners = [
    ['分组维度', '水平', '本期样本', '说明'],
    ...bannerRows,
    [],
    ['交叉表行', '交叉表列', '检验方法', '最小 base'],
    ...a.crosstabs.map(row => [row.rows, row.cols, row.test, row.minBase]),
  ]

  return buildXlsx({
    createdAt: project.createdAt,
    sheets: [
      {
        name: '01 追溯表',
        columns: [34, 34, 26, 22, 32],
        rows: [
          ['业务决策', '研究问题', '指标', '对应题目', '产出'],
          ...a.trace.map(row => [row.decision, row.question, row.metric, (row.items ?? []).join('、'), row.output]),
        ],
      },
      {
        name: '02 指标定义',
        columns: [24, 42, 22, 40, 30],
        rows: [
          ['指标', '口径', 'base', '公式 / 来源', '对比规则'],
          ...project.kpis.map(kpi => [kpi.name, kpi.definition, kpi.base, kpi.formula, kpi.compare]),
        ],
      },
      {
        name: '03 交叉表与分组',
        columns: [26, 40, 34, 30],
        headerRows: [0, bannerRows.length + 2],
        filter: false,
        rows: sheetBanners,
      },
      {
        name: '04 图表清单',
        columns: [8, 26, 22, 26, 20, 36],
        rows: [
          ['图号', '图名', '类型', '数据源', 'base', '要说明什么'],
          ...a.charts.map(row => [row.no, row.title, row.type, row.source, row.base, row.takeaway]),
        ],
      },
    ],
  })
}
