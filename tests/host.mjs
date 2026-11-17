/**
 * Host 集成测试：用假的 ctx 加载 index.js，走一遍接口与工具。
 * 运行：node tests/host.mjs
 */

import { mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 测试不碰真实状态与真实输出目录：先设环境变量，再动态加载插件。
const testHome = join(tmpdir(), 'consumer-insight-test-home')
const testOutput = join(tmpdir(), 'consumer-insight-test-output')
rmSync(testHome, { recursive: true, force: true })
rmSync(testOutput, { recursive: true, force: true })
process.env.DSH_HOME = testHome
process.env.DSH_CONSUMER_INSIGHT_DIR = testOutput
mkdirSync(testHome, { recursive: true })

const { apply } = await import('../index.js')

const here = dirname(fileURLToPath(import.meta.url))

let failures = 0
function check(condition, label, detail) {
  if (condition) {
    console.log(`  ok  ${label}`)
    return
  }
  failures += 1
  console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
}

let handler = null
const tools = new Map()
const registered = []

const ctx = {
  effect(fn) {
    const disposer = fn()
    return () => disposer?.()
  },
  inject(deps, callback) {
    callback(ctx)
  },
  get(name) {
    if (name === 'connection') return { requestRejection: () => undefined }
    return undefined
  },
  webServer: {
    register(route) {
      handler = route.handler
      return () => { handler = null }
    },
  },
  tools: {
    register(definition) {
      registered.push(definition.name)
      tools.set(definition.name, definition)
      return () => tools.delete(definition.name)
    },
  },
  logger: { warn() {}, info() {} },
}

apply(ctx)

function request(method, path, body, headers = {}) {
  const payload = body === undefined ? '' : JSON.stringify(body)
  const req = {
    method,
    url: `/consumer-insight/${path}`,
    headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/json', ...headers },
    async *[Symbol.asyncIterator]() {
      if (payload) yield Buffer.from(payload, 'utf8')
    },
  }
  return new Promise((resolve, reject) => {
    const chunks = []
    const res = {
      statusCode: 0,
      headersSent: false,
      setHeader() {},
      end(value) {
        if (value !== undefined) chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(String(value)))
        this.headersSent = true
        const text = Buffer.concat(chunks).toString('utf8')
        let json
        try { json = JSON.parse(text) } catch { json = null }
        resolve({ status: this.statusCode, json, text })
      },
    }
    handler(req, res).catch(reject)
  })
}

console.log('\n== Host 接口 ==')
check(typeof handler === 'function', '路由已注册')
check(registered.length === 3, '注册了 3 个工具', registered.join(','))

const state = await request('GET', 'state')
check(state.status === 200, 'GET /state 200', String(state.status))
check(state.json.types.length === 2, '返回 2 类调研')
check(state.json.outputDir === testOutput, '默认输出目录读自环境变量', state.json.outputDir)

const input = {
  type: 'brand-tracker',
  name: '即饮咖啡品牌追踪 2026Q4',
  objective: '判断是否把 A 品牌预算从商超转向校园渠道：需要知道 18-30 岁人群在认知、考虑、使用三个环节与竞品的差距。',
  decisions: ['是否加大校园渠道投入', '本轮传播是否带来认知提升'],
  category: '即饮咖啡',
  ownBrand: 'A',
  competitors: 'B, C, D',
  audience: '18-30 岁，一二线城市，近 3 个月购买或饮用过即饮咖啡',
  sampleSize: 800,
}

const generated = await request('POST', 'generate', input)
check(generated.status === 200, 'POST /generate 200', String(generated.status))
check(generated.json?.project?.stats?.questions > 40, '生成题量 > 40', generated.json?.project?.stats?.questions)
check(generated.json?.project?.checks?.errors === 0, '体检无错误')

const saved = await request('POST', 'save', input)
check(saved.status === 200, 'POST /save 200', saved.json?.error ?? String(saved.status))
const dir = saved.json?.dir
check(typeof dir === 'string' && dir.startsWith(testOutput), '保存到测试输出目录', dir)
if (dir) {
  const files = saved.json.files
  check(files.includes('02-问卷.docx') && files.includes('03-分析框架.xlsx'), '生成 Word 与 Excel')
  const docx = statSync(join(dir, '02-问卷.docx'))
  const xlsx = statSync(join(dir, '03-分析框架.xlsx'))
  check(docx.size > 10_000, 'docx 体积正常', String(docx.size))
  check(xlsx.size > 5_000, 'xlsx 体积正常', String(xlsx.size))
  const project = JSON.parse(readFileSync(join(dir, 'project.json'), 'utf8'))
  check(project.brief.sampleSize === 800, 'project.json 参数正确')
  console.log(`  目录：${dir}`)
}

const getProject = await request('POST', 'project/get', { id: saved.json?.project?.id })
check(getProject.status === 200 && getProject.json.project.brief.ownBrand === 'A', 'POST /project/get 读回项目')

const list = await request('GET', 'state')
check(list.json.projects.length >= 1, '项目库有记录', String(list.json.projects.length))

const altDir = join(tmpdir(), 'consumer-insight-alt-output')
const settings = await request('POST', 'settings', { outputDir: altDir })
check(settings.status === 200 && settings.json.outputDir === altDir, 'POST /settings 更换输出目录')
const afterSettings = await request('GET', 'state')
check(afterSettings.json.outputDir === altDir, 'GET /state 反映新目录')

const crossSite = await request('POST', 'save', input, { 'sec-fetch-site': 'cross-site' })
check(crossSite.status === 403, '拒绝跨站写请求')

console.log('\n== Agent 工具 ==')
const playbookList = await tools.get('insight_playbook').execute({ action: 'list' })
check(playbookList.types.length === 2, 'insight_playbook list')
const playbookGet = await tools.get('insight_playbook').execute({ action: 'get', type: 'satisfaction' })
check(playbookGet.playbook.modules.length === 9, 'insight_playbook get 返回模块', String(playbookGet.playbook.modules.length))

const toolGen = await tools.get('insight_generate').execute({ ...input, competitors: ['B', 'C'], save: false })
check(toolGen.stats.questions > 40 && toolGen.dir === null, 'insight_generate 不落盘模式')

const toolProjects = await tools.get('insight_project').execute({ action: 'list' })
check(toolProjects.projects.length >= 1, 'insight_project list')

let rejected = false
try {
  await tools.get('insight_generate').execute({ type: 'brand-tracker', objective: 'x' })
} catch {
  rejected = true
}
check(rejected, 'insight_generate 缺参数时拒绝')

console.log(`\n${failures === 0 ? 'Host 集成测试全部通过' : `${failures} 项失败`}`)
process.exit(failures === 0 ? 0 : 1)
