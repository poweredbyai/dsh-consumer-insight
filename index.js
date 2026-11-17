/**
 * dsh-consumer-insight · Host 半片
 *
 * 三件事：
 *  1. 提供 /consumer-insight/* 接口：项目状态、生成、落盘、历史项目
 *  2. 把生成结果写成 docx / xlsx / md / csv
 *  3. 向 Agent 暴露 3 个工具，让对话里也能生成与查阅
 *
 * 说明：本插件不静态 import @deepseek-ai/* 的运行时包，避免本地目录安装时的解析问题；
 * 工具用原始 JSON Schema 定义注册，参数校验在 execute 内自行完成。
 */

import { execFile } from 'node:child_process'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { brandTracker } from './src/playbooks/brand-tracker.js'
import { satisfaction } from './src/playbooks/satisfaction.js'
import { buildProject } from './src/generate.js'
import { mdAnalysis, mdBrief, mdDesign, mdQC, mdQuestionnaire, mdSampling, dateText } from './src/render/markdown.js'
import { codebookCsv, questionnaireCsv, quotaCsv } from './src/render/csv.js'
import { buildAnalysisXlsx, buildQuestionnaireDocx } from './src/render/documents.js'

const PLAYBOOKS = { 'brand-tracker': brandTracker, satisfaction }
const MAX_BODY = 2_000_000
const MAX_PROJECTS = 30

export const name = 'consumer-insight'
export const inject = ['webServer', 'connection']

// ---------------------------------------------------------------------------
// 基础工具
// ---------------------------------------------------------------------------

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw Object.assign(new Error('请求内容过大'), { status: 413 })
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks)
  if (!raw.length) return {}
  try {
    return JSON.parse(raw.toString('utf8'))
  } catch {
    throw Object.assign(new Error('请求不是有效的 JSON'), { status: 400 })
  }
}

function text(value, max = 2000) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max)
}

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

function stateFile() {
  return join(dshHome(), 'consumer-insight', 'state.json')
}

/** 默认输出目录：环境变量 > 用户文档目录（跨平台）。 */
function defaultOutputDir() {
  const configured = (process.env.DSH_CONSUMER_INSIGHT_DIR || '').trim()
  if (configured) return configured
  return join(homedir(), 'Documents', '消费者洞察')
}

/** 当前输出目录：插件设置优先，其次环境变量，最后默认值。 */
function outputDirOf(state) {
  const configured = String(state?.settings?.outputDir ?? '').trim()
  return configured || defaultOutputDir()
}

function sanitizeSegment(value, fallback) {
  const clean = String(value ?? '')
    .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return clean.slice(0, 40) || fallback
}

/** 串行的状态存储：读-改-写，写前临时文件 + rename。 */
class Store {
  constructor() {
    this.queue = Promise.resolve()
    this.cache = null
  }

  async read() {
    if (this.cache) return this.cache
    try {
      const raw = await readFile(stateFile(), 'utf8')
      this.cache = JSON.parse(raw)
    } catch {
      this.cache = { draft: null, projects: [] }
    }
    if (!Array.isArray(this.cache.projects)) this.cache.projects = []
    return this.cache
  }

  async mutate(fn) {
    this.queue = this.queue.then(async () => {
      const state = await this.read()
      const next = await fn(state)
      await mkdir(join(dshHome(), 'consumer-insight'), { recursive: true })
      const temp = `${stateFile()}.tmp`
      await writeFile(temp, JSON.stringify(next, null, 2), 'utf8')
      await rename(temp, stateFile())
      this.cache = next
      return next
    })
    return this.queue
  }
}

// ---------------------------------------------------------------------------
// 生成与落盘
// ---------------------------------------------------------------------------

function pickProjectInput(body) {
  return {
    name: text(body.name, 80),
    type: PLAYBOOKS[body.type] ? body.type : 'brand-tracker',
    objective: text(body.objective, 2000),
    decisions: Array.isArray(body.decisions)
      ? body.decisions.map(item => text(item, 300)).filter(Boolean)
      : text(body.decisions, 2000).split(/\n/).map(item => item.trim()).filter(Boolean),
    category: text(body.category, 60),
    ownBrand: text(body.ownBrand, 40),
    competitors: Array.isArray(body.competitors)
      ? body.competitors.map(item => text(item, 40)).filter(Boolean)
      : text(body.competitors, 300).split(/[;,；、\n]/).map(item => item.trim()).filter(Boolean),
    audience: text(body.audience, 400),
    markets: text(body.markets, 100),
    method: text(body.method, 40),
    sampleSize: Number(body.sampleSize) || undefined,
    quotas: text(body.quotas, 300),
    timeline: text(body.timeline, 120),
    budget: text(body.budget, 120),
    notes: text(body.notes, 2000),
    disableModules: Array.isArray(body.disableModules) ? body.disableModules.map(item => text(item, 8)) : [],
    extraQuestions: Array.isArray(body.extraQuestions) ? body.extraQuestions : [],
    now: new Date().toISOString(),
  }
}

function docsOf(project) {
  return {
    brief: mdBrief(project),
    design: mdDesign(project),
    questionnaire: mdQuestionnaire(project),
    analysis: mdAnalysis(project),
    sampling: mdSampling(project),
    qc: mdQC(project),
    questionnaireCsv: questionnaireCsv(project),
    codebookCsv: codebookCsv(project),
    quotaCsv: quotaCsv(project),
  }
}

function filesOf(project) {
  const docs = docsOf(project)
  return [
    { name: '00-项目简报.md', data: docs.brief },
    { name: '01-研究设计.md', data: docs.design },
    { name: '02-问卷.docx', data: buildQuestionnaireDocx(project) },
    { name: '02-问卷.md', data: docs.questionnaire },
    { name: '02-问卷.csv', data: docs.questionnaireCsv },
    { name: '03-分析框架.xlsx', data: buildAnalysisXlsx(project) },
    { name: '03-分析框架.md', data: docs.analysis },
    { name: '04-抽样与配额.md', data: docs.sampling },
    { name: '04-配额表.csv', data: docs.quotaCsv },
    { name: '05-码表.csv', data: docs.codebookCsv },
    { name: '06-执行与QC清单.md', data: docs.qc },
    { name: 'project.json', data: JSON.stringify(project, null, 2) },
  ]
}

function folderNameOf(project) {
  const day = dateText(project.createdAt)
  return `${day}_${sanitizeSegment(project.brief.category, '未命名品类')}_${sanitizeSegment(project.playbook.name, '调研')}`
}

async function saveProject(project, store) {
  const state = await store.read()
  const root = outputDirOf(state)
  await mkdir(root, { recursive: true })
  const known = state.projects.find(item => item.id === project.id)
  let dir = known?.dir
  if (!dir) {
    const base = folderNameOf(project)
    dir = join(root, base)
    let index = 2
    for (;;) {
      try {
        await stat(dir)
        dir = join(root, `${base}-${index}`)
        index += 1
      } catch {
        break
      }
    }
  }
  await mkdir(dir, { recursive: true })

  const files = filesOf(project)
  for (const file of files) {
    await writeFile(join(dir, file.name), file.data)
  }

  const record = {
    id: project.id,
    name: project.brief.name,
    type: project.playbook.id,
    typeName: project.playbook.name,
    category: project.brief.category,
    ownBrand: project.brief.ownBrand,
    createdAt: project.createdAt,
    dir,
    files: files.map(file => file.name),
    stats: project.stats,
    checks: { errors: project.checks.errors, warns: project.checks.warns },
  }
  await store.mutate(current => {
    const rest = current.projects.filter(item => item.id !== record.id)
    return { ...current, projects: [record, ...rest].slice(0, MAX_PROJECTS) }
  })
  return { dir, files: record.files, record }
}

function openFolder(dir) {
  const command = process.platform === 'win32'
    ? 'explorer.exe'
    : process.platform === 'darwin' ? 'open' : 'xdg-open'
  return new Promise(resolve => {
    execFile(command, [dir], { windowsHide: true }, error => resolve(!error))
  })
}

// ---------------------------------------------------------------------------
// 路由
// ---------------------------------------------------------------------------

function typeList() {
  return Object.values(PLAYBOOKS).map(playbook => ({
    id: playbook.id,
    name: playbook.name,
    subtitle: playbook.subtitle,
    defaultN: playbook.defaultN,
    loi: playbook.loiMinutes,
    modules: playbook.modules.length,
    questions: playbook.modules.reduce((acc, module) => acc + module.questions.length, 0),
    whenToUse: playbook.whenToUse,
  }))
}

async function route(store, req, res) {
  const url = new URL(req.url || '/', 'http://local')
  const path = url.pathname.replace(/^\/consumer-insight\/?/, '')
  const method = req.method || 'GET'

  if (method === 'GET') {
    if (path === '' || path === 'state') {
      const state = await store.read()
      return json(res, 200, {
        types: typeList(),
        draft: state.draft ?? null,
        projects: state.projects ?? [],
        outputDir: outputDirOf(state),
      })
    }
    return json(res, 404, { error: '接口不存在' })
  }
  if (method !== 'POST') return json(res, 405, { error: '不支持的方法' })

  const site = req.headers['sec-fetch-site']
  if (site && site !== 'same-origin' && site !== 'none') return json(res, 403, { error: '拒绝跨站请求' })

  const body = await readJson(req)
  switch (path) {
    case 'generate': {
      const project = buildProject(pickProjectInput(body), PLAYBOOKS)
      return json(res, 200, { project })
    }
    case 'save': {
      const project = buildProject(pickProjectInput(body), PLAYBOOKS)
      if (project.checks.errors > 0) {
        return json(res, 400, {
          error: '体检未通过，先修掉错误再保存',
          checks: project.checks,
        })
      }
      const saved = await saveProject(project, store)
      await store.mutate(current => ({ ...current, draft: body }))
      return json(res, 200, { project, ...saved })
    }
    case 'draft': {
      await store.mutate(current => ({ ...current, draft: body }))
      return json(res, 200, { ok: true })
    }
    case 'settings': {
      const dir = text(body.outputDir, 400)
      if (!dir) return json(res, 400, { error: '缺少输出目录' })
      try {
        await mkdir(dir, { recursive: true })
        const info = await stat(dir)
        if (!info.isDirectory()) throw new Error('not a directory')
      } catch {
        return json(res, 400, { error: '目录不可用，请换一个路径' })
      }
      await store.mutate(current => ({ ...current, settings: { ...(current.settings ?? {}), outputDir: dir } }))
      return json(res, 200, { outputDir: dir })
    }
    case 'project/get': {
      const id = text(body.id, 80)
      const state = await store.read()
      const record = state.projects.find(item => item.id === id)
      if (!record) return json(res, 404, { error: '项目不存在' })
      try {
        const raw = await readFile(join(record.dir, 'project.json'), 'utf8')
        return json(res, 200, { record, project: JSON.parse(raw) })
      } catch {
        return json(res, 404, { error: '项目文件已被移动或删除' })
      }
    }
    case 'project/delete': {
      const id = text(body.id, 80)
      await store.mutate(current => ({ ...current, projects: current.projects.filter(item => item.id !== id) }))
      return json(res, 200, { ok: true })
    }
    case 'reveal': {
      const dir = text(body.dir, 400)
      if (!dir) return json(res, 400, { error: '缺少目录' })
      try {
        const info = await stat(dir)
        if (!info.isDirectory()) throw new Error('not a directory')
      } catch {
        return json(res, 404, { error: '目录不存在' })
      }
      const opened = await openFolder(dir)
      return json(res, 200, { ok: opened })
    }
    default:
      return json(res, 404, { error: '接口不存在' })
  }
}

// ---------------------------------------------------------------------------
// Agent 工具（原始 JSON Schema，自行校验参数）
// ---------------------------------------------------------------------------

function toolText(value) {
  return [{ type: 'text', text: value }]
}

function playbookSummary(playbook) {
  return {
    id: playbook.id,
    name: playbook.name,
    subtitle: playbook.subtitle,
    whenToUse: playbook.whenToUse,
    notFor: playbook.notFor,
    defaultSample: playbook.defaultN,
    loiMinutes: playbook.loiMinutes,
    modules: playbook.modules.map(module => ({
      code: module.code,
      name: module.name,
      purpose: module.purpose,
      questions: module.questions.length,
      sample: module.questions.slice(0, 3).map(q => `${q.id} ${q.text}`),
    })),
    kpis: playbook.kpis.map(kpi => `${kpi.name}：${kpi.definition}`),
    sampling: playbook.sampling.dims.map(dim => `${dim.name}（${dim.levels.map(level => level.label).join('/')}）`),
    pitfalls: playbook.pitfalls,
  }
}

function registerTools(ctx, store) {
  ctx.tools.register({
    name: 'insight_playbook',
    description: '查询消费者洞察方法库：支持的调研类型、每类的标准模块、指标口径与抽样建议。做调研设计前先用它对齐标准。',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'get'], description: 'list 列出全部类型；get 读取某一类完整标准件' },
        type: { type: 'string', enum: ['brand-tracker', 'satisfaction'], description: 'action=get 时必填' },
      },
      required: ['action'],
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(
        value?.action === 'list'
          ? `支持 ${value.types.length} 类调研：\n${value.types.map(t => `- ${t.name}（${t.id}）：${t.subtitle}，标准题量 ${t.questions} 题，建议样本 ${t.defaultN}`).join('\n')}`
          : `${value.playbook.name}：${value.playbook.modules.length} 个模块\n${value.playbook.modules.map(m => `- ${m.code} ${m.name}（${m.questions} 题）`).join('\n')}`,
      ),
    },
    async execute(rawArgs) {
      const args = rawArgs ?? {}
      if (args.action === 'list') {
        return {
          action: 'list',
          types: Object.values(PLAYBOOKS).map(playbook => ({
            id: playbook.id,
            name: playbook.name,
            subtitle: playbook.subtitle,
            questions: playbook.modules.reduce((acc, module) => acc + module.questions.length, 0),
            defaultN: playbook.defaultN,
          })),
        }
      }
      const playbook = PLAYBOOKS[args.type]
      if (!playbook) throw new Error(`未知调研类型：${args.type}；可用 brand-tracker / satisfaction`)
      return { action: 'get', playbook: playbookSummary(playbook) }
    },
  })

  ctx.tools.register({
    name: 'insight_generate',
    description: '按项目参数生成一套消费者调研交付物（简报、研究设计、问卷、分析框架、抽样配额、码表、QC 清单），并写入输出目录。问卷与 Word/Excel 由标准件确定性生成，不依赖模型。',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['brand-tracker', 'satisfaction'], description: '调研类型' },
        objective: { type: 'string', description: '项目目标：要支撑什么决策，一段话' },
        category: { type: 'string', description: '品类 / 产品' },
        ownBrand: { type: 'string', description: '主品牌' },
        competitors: { type: 'array', items: { type: 'string' }, description: '竞品品牌列表（品牌追踪至少 1 个）' },
        audience: { type: 'string', description: '目标人群，如「18-30 岁一二线城市女性，近 3 个月买过即饮咖啡」' },
        sampleSize: { type: 'integer', description: '样本量，留空用该类默认值' },
        markets: { type: 'string', description: '覆盖市场，默认全国一至三线' },
        method: { type: 'string', description: '调研方式，默认线上 panel' },
        decisions: { type: 'array', items: { type: 'string' }, description: '要支撑的业务决策，一行一条' },
        notes: { type: 'string', description: '补充要求，如「加一道校园场景题」「去掉价格模块」' },
        disableModules: { type: 'array', items: { type: 'string' }, description: '要关闭的模块代码，如 ["B8"]' },
        save: { type: 'boolean', description: '是否写入磁盘，默认 true' },
      },
      required: ['type', 'objective', 'category', 'ownBrand', 'audience'],
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText([
        `已生成：${value.name}`,
        `- 题量 ${value.stats.questions} 题 / ${value.stats.minutes} 分钟；样本 ${value.stats.sample}（有效约 ${value.stats.effectiveSample}）`,
        `- 体检：${value.checks.errors} 个错误，${value.checks.warns} 个提醒`,
        value.dir ? `- 目录：${value.dir}` : '- 未写入磁盘',
        value.dir ? `- 文件：${value.files.join('、')}` : '',
        value.checks.errors > 0 ? `- 需先处理的错误：${value.checks.list.filter(c => c.level === 'error').map(c => c.text).join('；')}` : '',
      ].filter(Boolean).join('\n')),
    },
    async execute(rawArgs) {
      const args = rawArgs ?? {}
      if (!PLAYBOOKS[args.type]) throw new Error(`未知调研类型：${args.type}；可用 brand-tracker / satisfaction`)
      for (const key of ['objective', 'category', 'ownBrand', 'audience']) {
        if (!String(args[key] ?? '').trim()) throw new Error(`缺少必填参数：${key}`)
      }
      const project = buildProject({
        ...args,
        competitors: args.competitors ?? [],
        decisions: args.decisions ?? [],
        disableModules: args.disableModules ?? [],
        now: new Date().toISOString(),
      }, PLAYBOOKS)
      const result = {
        id: project.id,
        name: project.brief.name,
        stats: project.stats,
        checks: { errors: project.checks.errors, warns: project.checks.warns, list: project.checks.checks },
        dir: null,
        files: [],
        brief: project.brief,
        sample: project.sampling.recommended.marginals.map(marginal => ({
          dim: marginal.name,
          levels: marginal.levels.map(level => `${level.label}:${level.n}`),
        })),
      }
      if (args.save !== false && project.checks.errors === 0) {
        const saved = await saveProject(project, store)
        result.dir = saved.dir
        result.files = saved.files
      }
      return result
    },
  })

  ctx.tools.register({
    name: 'insight_project',
    description: '查看、读取或删除本机已生成的消费者调研项目。读取会返回项目参数（可直接改参数后用 insight_generate 重生成）。',
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['list', 'get', 'delete'] },
        id: { type: 'string', description: 'action=get / delete 时必填' },
      },
      required: ['action'],
    },
    output: {
      schema: { type: 'object', additionalProperties: true },
      render: (_args, value) => toolText(
        value?.action === 'list'
          ? (value.projects.length ? value.projects.map(p => `- ${p.name}｜${p.typeName}｜${p.createdAt?.slice(0, 10) ?? ''}｜${p.dir}`).join('\n') : '还没有生成过项目')
          : `${value.record.name}（${value.record.dir}）\n参数：${JSON.stringify(value.brief ?? {})}`,
      ),
    },
    async execute(rawArgs) {
      const args = rawArgs ?? {}
      const state = await store.read()
      if (args.action === 'list') {
        return { action: 'list', projects: state.projects }
      }
      const record = state.projects.find(item => item.id === args.id)
      if (!record) throw new Error(`项目不存在：${args.id}`)
      if (args.action === 'delete') {
        await store.mutate(current => ({ ...current, projects: current.projects.filter(item => item.id !== args.id) }))
        return { action: 'delete', ok: true, record }
      }
      let project = null
      try {
        project = JSON.parse(await readFile(join(record.dir, 'project.json'), 'utf8'))
      } catch {
        project = null
      }
      return {
        action: 'get',
        record: { ...record, brief: project?.brief ?? null },
        brief: project?.brief ?? null,
        files: record.files,
      }
    },
  })
}

// ---------------------------------------------------------------------------
// 插件入口
// ---------------------------------------------------------------------------

export function apply(ctx) {
  const store = new Store()

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/consumer-insight',
    handler: async (req, res) => {
      const connection = ctx.get('connection')
      const rejection = typeof connection?.requestRejection === 'function'
        ? connection.requestRejection({ headers: req.headers })
        : 403
      if (rejection) {
        json(res, rejection, { error: '未授权' })
        return
      }
      try {
        await route(store, req, res)
      } catch (error) {
        if (res.headersSent) {
          res.end()
          return
        }
        json(res, error.status || 500, { error: error.message || '服务器出错了' })
      }
    },
  }), 'consumer-insight: /consumer-insight routes')

  ctx.inject(['tools'], child => {
    registerTools(child, store)
  })
}
