# 参与贡献

欢迎提 issue、补 playbook、修 bug。这个项目刻意保持「零依赖」：Node 内置模块 + 原生 OOXML，不引入构建链。

## 本地跑起来

```bash
node build.mjs          # 生成 client.js
node tests/smoke.mjs    # 生成两类项目，验证结构与 Office 文件包
node tests/host.mjs     # 接口与 3 个工具（用假 ctx，不碰真实状态）
node tests/panel.mjs    # 用 React 替身渲染面板与四个视图
```

提交前请保证三组测试全绿，并重新 `build.mjs`（`client.js` 是构建产物，需要一起提交）。

## 项目结构

| 路径 | 作用 |
| --- | --- |
| `index.js` | Host 半片：`/consumer-insight/*` 接口、落盘、Agent 工具 |
| `src/playbooks/*.js` | 调研标准件，一类调研一个文件 |
| `src/generate.js` | 占位符替换、体检、分析框架装配 |
| `src/sampling.js` | 配额分配、精度、接触量、排期 |
| `src/render/` | Markdown、CSV、Word/Excel 文档规格 |
| `src/ooxml/` | 无依赖 DOCX / XLSX 生成器 |
| `src/panel*.js` | 整页工作台（React，内联样式） |
| `src/main.js` | 客户端注册（`main` 面板 + `sidebar.panellist` 入口） |
| `tests/` | 三组测试 |

## 加一类调研

1. 复制 `src/playbooks/satisfaction.js` 为 `src/playbooks/<your-type>.js`，改 `id`、`name`、`subtitle`、`modules`、`kpis`、`analysis`、`sampling`、`pitfalls`。
2. 在 `index.js` 顶部的 `PLAYBOOKS` 里注册：`{ 'your-type': yourType }`。
3. 若题目用到动态选项（品牌、场合、维度清单），在 `src/generate.js` 的 `resolveOptionSource` 里加映射；品牌列表用 `BRANDS` 即可。
4. 面板的类型清单来自 `PLAYBOOKS`，不需要改前端；若默认样本、时长上限不同，在 playbook 里写 `defaultN`、`loiMinutes`、`durationLimit`、`openLimit`。
5. 跑测试，并补一条 `tests/smoke.mjs` 的用例。

## 题目字段约定

```js
{
  id: 'B2.1',            // 模块字母 + 序号，跨版本稳定
  type: 'single',        // single | multi | scale | grid | open | numeric | rank
  text: '提到{{品类}}，你第一个想到的品牌是？',
  base: '全部合格受访者',
  required: true,
  options: [{ code: 1, label: '是' }],   // 或 'BRANDS' 等动态来源
  rows: ['口味 / 口感'],                 // grid 用
  scale: { min: 1, max: 5, minLabel: '很差', maxLabel: '很好' },
  randomize: 'brands',   // none | options | brands | rows
  routing: '选 2 → 终止访问',
  note: '编程说明',
}
```

占位符：`{{品类}}`、`{{主品牌}}`、`{{品牌列表}}`、`{{人群}}`、`{{市场}}`、`{{首选品牌}}`、`{{主用品牌}}`。

## 改动约定

- 生成结果必须可复现：不要在生成路径里引入随机数、时间戳（项目时间除外）或网络。
- 新增题目时同时补 `base` 和 `note`，体检会检查。
- 文案风格：短句、具体、不堆形容词；问卷题面用受访者能听懂的话。
- 涉及调研伦理的改动（知情同意、配额、个人信息）请在 PR 里说明依据。

## CI

仓库尚未启用 GitHub Actions：首次推送所用的凭据没有 `workflow` 权限。想启用：

1. 复制 `docs/ci.yml.example` 到 `.github/workflows/ci.yml`；
2. 用带 `workflow` 权限的凭据推送（`gh auth refresh -s workflow` 后即可）。

工作流只做三件事：`node build.mjs`、三组测试，不需要安装依赖。

## 提交

- 一个 PR 做一件事；描述里写清「改了什么、为什么、怎么验证」。
- 涉及 UI 的改动请附截图或说明无法截图的原因。
