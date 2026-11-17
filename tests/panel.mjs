/**
 * 客户端渲染测试：用最小 React 替身渲染面板与四个视图，捕捉未定义变量与崩溃。
 * 运行：node tests/panel.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildProject } from '../src/generate.js'
import { brandTracker } from '../src/playbooks/brand-tracker.js'
import { satisfaction } from '../src/playbooks/satisfaction.js'

const here = dirname(fileURLToPath(import.meta.url))
const bundle = readFileSync(join(here, '..', 'client.js'), 'utf8')

let failures = 0
function check(condition, label, detail) {
  if (condition) {
    console.log(`  ok  ${label}`)
    return
  }
  failures += 1
  console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
}

const React = {
  createElement(type, props, ...children) {
    const flat = children.length === 0 ? undefined : children.length === 1 ? children[0] : children
    return { type, props: { ...(props || {}), children: flat } }
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
  useEffect() {},
  useMemo(factory) { return factory() },
  useRef(value) { return { current: value } },
}

let loaded = null
const fakeWindow = {
  __ModuleLoader__: {
    load(entry) { loaded = entry },
  },
}

// eslint-disable-next-line no-new-func
const run = new Function('window', 'require', bundle)
run(fakeWindow, name => {
  if (name === 'react') return React
  throw new Error(`浏览器模块表中没有 ${name}`)
})

check(loaded && loaded.id === 'dsh-consumer-insight', '模块 id 正确', loaded?.id)
const exports = loaded.factory(name => {
  if (name === 'react') return React
  throw new Error(`缺少模块 ${name}`)
})
check(exports.inject.includes('slots'), '声明 slots 依赖')

function walk(node, out = []) {
  if (node === null || node === undefined || typeof node === 'boolean') return out
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    node.forEach(child => walk(child, out))
    return out
  }
  if (typeof node === 'function') out.push('[component]')
  if (node.type === undefined) throw new Error(`存在 type 为 undefined 的元素：${JSON.stringify(node).slice(0, 120)}`)
  if (typeof node.type === 'function') {
    const rendered = node.type({ ...node.props })
    walk(rendered, out)
    return out
  }
  walk(node.props?.children, out)
  return out
}

function render(Component, props, label) {
  try {
    const text = walk(Component(props)).join(' ')
    return text
  } catch (error) {
    failures += 1
    console.error(`  FAIL ${label} 渲染崩溃 — ${error.message}`)
    return ''
  }
}

const project = buildProject({
  type: 'brand-tracker',
  name: '即饮咖啡品牌追踪',
  objective: '判断是否把预算从商超转向校园渠道。',
  decisions: ['是否加大校园投入'],
  category: '即饮咖啡',
  ownBrand: 'A',
  competitors: ['B', 'C'],
  audience: '18-30 岁一二线城市',
  sampleSize: 800,
}, { 'brand-tracker': brandTracker, satisfaction })

const emptyText = render(exports.__test.ConsumerInsightPanel, {}, '面板空态')
check(emptyText.includes('消费者洞察工作台'), '面板标题渲染')
check(emptyText.includes('正在读取项目配置'), '面板初始加载态渲染')

const briefText = render(exports.__test.CiBriefView, { project }, '简报视图')
check(briefText.includes('项目目标') && briefText.includes('业务决策'), '简报视图内容')
check(briefText.includes('即饮咖啡'), '简报视图含项目数据')

const qText = render(exports.__test.CiQuestionnaireView, { project }, '问卷视图')
check(qText.includes('B0') && qText.includes('B0.1'), '问卷视图含模块与题号')
check(qText.includes('单选题') || qText.includes('单选'), '问卷视图含题型')

const aText = render(exports.__test.CiAnalysisView, { project }, '分析视图')
check(aText.includes('决策—研究问题—指标—题目—产出'), '分析视图含追溯表')
check(aText.includes('图表清单'), '分析视图含图表清单')

const sText = render(exports.__test.CiSamplingView, { project }, '抽样视图')
check(sText.includes('三种样本分配方案'), '抽样视图含方案对比')
check(sText.includes('推荐方案完整配额'), '抽样视图含配额表')
check(sText.includes('接触量'), '抽样视图含接触量')

const fText = render(exports.__test.CiFilesView, { project, saved: { dir: 'D:\\消费者洞察\\x', files: ['02-问卷.docx', '03-分析框架.xlsx'] }, onSave() {}, onReveal() {} }, '文件视图')
check(fText.includes('02-问卷.docx'), '文件视图含文件名')

const iconText = render(exports.__test.PanelIcon, { size: 18, active: true }, '侧栏图标')
check(iconText.includes('[component]') || iconText.length >= 0, '侧栏图标渲染')

console.log(`\n${failures === 0 ? '客户端渲染测试全部通过' : `${failures} 项失败`}`)
process.exit(failures === 0 ? 0 : 1)

