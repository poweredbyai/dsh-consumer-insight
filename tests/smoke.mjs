/**
 * 冒烟测试：生成两类项目，检查结构、时长、配额与 Office 文件包结构。
 * 运行：node tests/smoke.mjs
 */

import { inflateRawSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildProject } from '../src/generate.js'
import { brandTracker } from '../src/playbooks/brand-tracker.js'
import { satisfaction } from '../src/playbooks/satisfaction.js'
import { buildAnalysisXlsx, buildQuestionnaireDocx } from '../src/render/documents.js'
import { mdAnalysis, mdBrief, mdDesign, mdQC, mdQuestionnaire, mdSampling } from '../src/render/markdown.js'
import { codebookCsv, questionnaireCsv, quotaCsv } from '../src/render/csv.js'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'out')
mkdirSync(out, { recursive: true })

const playbooks = { 'brand-tracker': brandTracker, satisfaction }

const cases = [
  {
    type: 'brand-tracker',
    name: '即饮咖啡品牌追踪 2026Q4',
    objective: '判断是否把 A 品牌预算从商超转向校园渠道：需要知道 18-30 岁人群在认知、考虑、使用三个环节与竞品的差距。',
    decisions: ['是否加大校园渠道投入', '本轮传播是否带来认知提升'],
    category: '即饮咖啡',
    ownBrand: 'A',
    competitors: ['B', 'C', 'D'],
    audience: '18-30 岁，一二线城市，近 3 个月购买或饮用过即饮咖啡',
    sampleSize: 800,
  },
  {
    type: 'satisfaction',
    name: 'A 品牌满意度 2026H2',
    objective: '满意度连续两季下滑，找出主要拖累维度与触点，形成下季度的改进清单。',
    decisions: ['先改产品还是先改渠道'],
    category: '即饮咖啡',
    ownBrand: 'A',
    competitors: ['B', 'C'],
    audience: '18-45 岁，近 3 个月购买并饮用过 A 品牌',
    sampleSize: 600,
  },
]

function unzip(buffer) {
  const entries = new Map()
  let offset = 0
  while (offset + 30 <= buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break
    const method = buffer.readUInt16LE(offset + 8)
    const compressedSize = buffer.readUInt32LE(offset + 18)
    const nameLength = buffer.readUInt16LE(offset + 26)
    const extraLength = buffer.readUInt16LE(offset + 28)
    const name = buffer.slice(offset + 30, offset + 30 + nameLength).toString('utf8')
    const dataStart = offset + 30 + nameLength + extraLength
    const data = buffer.slice(dataStart, dataStart + compressedSize)
    entries.set(name, method === 8 ? inflateRawSync(data) : data)
    offset = dataStart + compressedSize
  }
  return entries
}

let failures = 0
function check(condition, label, detail) {
  if (condition) {
    console.log(`  ok  ${label}`)
    return
  }
  failures += 1
  console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
}

for (const input of cases) {
  const project = buildProject(input, playbooks)
  console.log(`\n== ${project.playbook.name} · ${project.brief.name} ==`)
  console.log(`   题量 ${project.stats.questions} / ${project.stats.minutes} 分钟 / 样本 ${project.stats.sample} / 误差 ±${(project.stats.marginTotal * 100).toFixed(1)}%`)
  console.log(`   体检：${project.checks.errors} error / ${project.checks.warns} warn`)

  check(project.stats.questions >= 35, '题量 ≥ 35', project.stats.questions)
  check(project.questionnaire.minutes <= project.questionnaire.modules.length * 3 + 12, '时长在合理区间', project.questionnaire.minutes)
  check(project.questionnaire.questions.every(q => q.base && q.base.length > 1), '每题都有 base')
  check(!project.questionnaire.questions.some(q => /\{\{/.test(q.text)), '占位符已替换')
  check(project.checks.errors === 0, '体检无错误', project.checks.checks.filter(c => c.level === 'error').map(c => c.text).join('；'))
  const quotaSum = project.sampling.recommended.rows.reduce((acc, row) => acc + row.n, 0)
  check(quotaSum === project.brief.sampleSize, '配额合计等于样本量', `${quotaSum} vs ${project.brief.sampleSize}`)
  check(project.sampling.recommended.rows.every(row => row.n >= 15), '所有交叉格 ≥ 15')
  check(project.sampling.plans.length === 3, '三种分配方案齐全')

  const brief = mdBrief(project)
  const design = mdDesign(project)
  const questionnaire = mdQuestionnaire(project)
  const analysis = mdAnalysis(project)
  const sampling = mdSampling(project)
  const qc = mdQC(project)
  check(brief.includes('## 1. 项目目标'), '简报结构完整')
  check(design.includes('## 8. 风险与应对'), '研究设计含风险章节')
  check(questionnaire.includes('## 访问说明（知情同意）'), '问卷含知情同意')
  check(analysis.includes('## 1. 决策—研究问题—指标—题目—产出'), '分析框架含追溯表')
  check(sampling.includes('## 3. 三种分配方案'), '抽样含方案对比')
  check(sampling.includes('## 7. 排期'), '抽样含排期')

  const qCsv = questionnaireCsv(project)
  const codebook = codebookCsv(project)
  const quota = quotaCsv(project)
  check(qCsv.startsWith('\uFEFF'), 'CSV 带 BOM')
  check(codebook.includes('q_'), '码表含变量名')

  const docx = buildQuestionnaireDocx(project)
  const docxEntries = unzip(docx)
  const docXml = docxEntries.get('word/document.xml')?.toString('utf8') ?? ''
  check(docx.subarray(0, 2).toString('utf8') === 'PK', 'docx 是 zip 包')
  check(docxEntries.has('word/styles.xml') && docxEntries.has('word/footer1.xml'), 'docx 含样式与页脚')
  check(docXml.includes('<w:body>') && docXml.includes('B2.1') || docXml.includes('C2.1'), 'docx 正文含题目')
  check(docXml.includes('<w:tbl>') || !questionnaire.includes('| # |'), 'docx 网格题用表格')

  const xlsx = buildAnalysisXlsx(project)
  const xlsxEntries = unzip(xlsx)
  const sheetNames = [...xlsxEntries.keys()].filter(name => name.startsWith('xl/worksheets/'))
  check(sheetNames.length === 4, 'xlsx 有 4 张表', sheetNames.join(','))
  const workbook = xlsxEntries.get('xl/workbook.xml')?.toString('utf8') ?? ''
  check(workbook.includes('01 追溯表'), 'xlsx 工作表命名正确')

  const slug = project.playbook.id
  writeFileSync(join(out, `${slug}-问卷.docx`), docx)
  writeFileSync(join(out, `${slug}-分析框架.xlsx`), xlsx)
  writeFileSync(join(out, `${slug}-问卷.md`), questionnaire)
  writeFileSync(join(out, `${slug}-分析框架.md`), analysis)
  writeFileSync(join(out, `${slug}-抽样.md`), sampling)
  writeFileSync(join(out, `${slug}-简报.md`), brief)
  writeFileSync(join(out, `${slug}-研究设计.md`), design)
  writeFileSync(join(out, `${slug}-QC.md`), qc)
  writeFileSync(join(out, `${slug}-问卷.csv`), qCsv)
  writeFileSync(join(out, `${slug}-码表.csv`), codebook)
  writeFileSync(join(out, `${slug}-配额.csv`), quota)
}

console.log(`\n${failures === 0 ? '全部通过' : `${failures} 项失败`}；输出目录：${out}`)
process.exit(failures === 0 ? 0 : 1)
