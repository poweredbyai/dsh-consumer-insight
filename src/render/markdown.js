/**
 * Markdown 渲染层：把结构化项目写成可读、可再编辑的文稿。
 */

const pad = n => String(n).padStart(2, '0')

function dateText(iso) {
  const d = iso ? new Date(iso) : new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function pct(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${(value * 100).toFixed(digits)}%`
}

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`
  const line = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map(row => `| ${row.map(cell => String(cell ?? '').replace(/\n/g, ' ')).join(' | ')} |`)
  return [head, line, ...body].join('\n')
}

const typeName = {
  single: '单选', multi: '多选', scale: '量表', grid: '网格', open: '开放题',
  numeric: '数值', rank: '排序',
}

const randomText = {
  options: '选项随机', brands: '品牌随机', rows: '行随机', none: '不随机',
}

function questionBlock(question, index) {
  const lines = []
  lines.push(`### ${question.id} ${question.text}`)
  const meta = [`题型：${typeName[question.type] ?? question.type}`, `base：${question.base || '未填'}`]
  meta.push(question.required ? '必答' : '选答')
  if (question.randomize && question.randomize !== 'none') meta.push(randomText[question.randomize])
  lines.push(meta.join('｜'))
  if (question.type === 'grid') {
    const rows = question.rows ?? []
    lines.push('')
    lines.push(`评分：${question.scale?.min ?? 1} = ${question.scale?.minLabel ?? '最低'}，${question.scale?.max ?? 5} = ${question.scale?.maxLabel ?? '最高'}`)
    lines.push('')
    lines.push(`| # | ${question.brands ? '品牌 / 属性' : '属性'} | ${question.brands ? '评分（1-5）' : '评分'} |`)
    lines.push('| --- | --- | --- |')
    if (question.brands && Array.isArray(question.brands)) {
      rows.forEach((row, i) => lines.push(`| ${i + 1} | ${row} | 对每个品牌分别评分 |`))
    } else {
      rows.forEach((row, i) => lines.push(`| ${i + 1} | ${row} | 1　2　3　4　5 |`))
    }
  } else if (question.type === 'scale') {
    lines.push(`刻度：${question.scale?.min}（${question.scale?.minLabel}）— ${question.scale?.max}（${question.scale?.maxLabel}）`)
  } else if (question.options?.length) {
    lines.push('')
    for (const option of question.options) lines.push(`- [${option.code}] ${option.label}`)
  }
  if (question.routing) lines.push(`- 跳转：${question.routing}`)
  if (question.note) lines.push(`- 编程说明：${question.note}`)
  lines.push('')
  return lines.join('\n')
}

/** 00 项目简报 */
export function mdBrief(project) {
  const b = project.brief
  const decisions = b.decisions.length ? b.decisions.map((d, i) => `${i + 1}. ${d}`).join('\n') : '（未填，建议补充 1-3 条要支撑的业务决策）'
  const questions = [...new Set(project.analysis.trace.map(row => row.question))]
  const lines = [
    `# 00 项目简报 · ${b.name}`,
    '',
    `- 调研类型：${project.playbook.name}（${project.playbook.subtitle}）`,
    `- 生成时间：${dateText(project.createdAt)}`,
    `- 版本：v1（生成稿，需研究员审校后发出）`,
    '',
    '## 1. 项目目标',
    '',
    b.objective || '（未填）',
    '',
    '## 2. 要支撑的业务决策',
    '',
    decisions,
    '',
    '## 3. 研究问题',
    '',
    questions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
    '',
    '## 4. 核心指标',
    '',
    table(['指标', '口径', 'base'], project.kpis.map(kpi => [kpi.name, kpi.definition, kpi.base])),
    '',
    '## 5. 研究对象与样本',
    '',
    table(['项', '内容'], [
      ['品类 / 产品', b.category || '—'],
      ['主品牌', b.ownBrand || '—'],
      ['竞品', b.competitors.length ? b.competitors.join('、') : '—'],
      ['目标人群', b.audience || '—'],
      ['市场 / 区域', b.markets],
      ['调研方式', b.method],
      ['样本量', `${b.sampleSize}（有效样本约 ${project.stats.effectiveSample}）`],
      ['配额要求', b.quotas || '见 04-抽样与配额'],
    ]),
    '',
    '## 6. 时间与预算',
    '',
    table(['项', '内容'], [
      ['项目周期', b.timeline || '—'],
      ['预算', b.budget || `约 ${project.sampling.contact.cost.toLocaleString('zh-CN')} 元（按 ${project.sampling.contact.cpi} 元/样本估算）`],
      ['田野天数', `${project.sampling.contact.fieldDays} 天（按日均 ${project.sampling.contact.dailyCompletes} 份）`],
    ]),
    '',
    '## 7. 交付物',
    '',
    [
      '- 01-研究设计.md',
      '- 02-问卷.docx / 02-问卷.md / 02-问卷.csv',
      '- 03-分析框架.xlsx / 03-分析框架.md',
      '- 04-抽样与配额.md / 04-配额表.csv',
      '- 05-码表.csv',
      '- 06-执行与QC清单.md',
    ].join('\n'),
    '',
    '## 8. 前提与风险',
    '',
    '- 样本量按 95% 置信、设计效应 1.2 估算；如需检测更小差异，需加大样本。',
    '- 行业基准、竞品实测值未包含在生成稿中，需引用外部报告或上一波数据并标注来源。',
    '- 品牌列表、渠道清单、价盘需与客户实际口径核对后再编程。',
    '',
  ]
  if (b.notes) lines.push('## 9. 补充要求', '', b.notes, '')
  return lines.join('\n')
}

/** 01 研究设计 */
export function mdDesign(project) {
  const b = project.brief
  const modules = project.questionnaire.modules
  const s = project.sampling
  const lines = [
    `# 01 研究设计 · ${b.name}`,
    '',
    '## 1. 方法与依据',
    '',
    `- 调研类型：${project.playbook.name}`,
    `- 调研方式：${b.method}`,
    `- 目标人群：${b.audience}`,
    `- 覆盖市场：${b.markets}`,
    `- 样本量：${b.sampleSize}（有效样本约 ${s.contact.n / s.deff | 0}）`,
    `- 问卷长度：${project.stats.questions} 题，预计 ${project.questionnaire.minutes} 分钟`,
    '',
    '## 2. 筛选逻辑',
    '',
    '按「品类资格 → 行为资格 → 职业/调研排除」三层筛选，任一层不通过即终止：',
    '',
    table(['层', '题目', '规则'], [
      ['品类资格', modules[0]?.questions.find(q => q.type === 'single')?.id ?? '—', '过去 3 个月购买/使用过品类'],
      ['行为资格', modules[0]?.questions.filter(q => q.type === 'single')[1]?.id ?? '—', '对品牌选择有影响力 / 是目标品牌用户'],
      ['职业排除', 'B0.6 / C0.6', '市场研究、广告媒体、品类生产销售从业者排除'],
      ['调研排除', 'B0.7 / C0.7', '近 3 个月参加过市场调研者排除'],
    ]),
    '',
    '## 3. 样本设计',
    '',
    `- 总量：${b.sampleSize}；设计效应 ${s.deff}；有效样本约 ${Math.round(b.sampleSize / s.deff)}。`,
    `- 总样本 95% 置信下误差约 ±${(s.precision.find(p => p.n === nearestSize(s.precision, b.sampleSize))?.margin * 100 || 0).toFixed(1)} 个百分点（p=0.5）。`,
    '- 三种分配方案与推荐配额见 `04-抽样与配额.md`；推荐方案 C（比例 + 保底）。',
    `- 加权：${s.weighting}`,
    '',
    '## 4. 问卷结构',
    '',
    table(['模块', '内容', '题量'], modules.map(m => [`${m.code} ${m.name}`, m.purpose, m.questions.length])),
    '',
    '## 5. 数据采集与质量控制',
    '',
    '- 品牌列表、选项随机化（固定项除外）；网格题按认知/经历过滤，单独 base。',
    '- 每个账号/设备限答一次，IP + 设备指纹去重；答题时长低于中位数 1/3 的样本标记复核。',
    '- 直线作答、连续相同选项、开放题乱填由代理按规则标记，删样比例需在报告中披露。',
    '- 试访 5-10 份，确认题目理解、跳转与时长后再正式投放。',
    '',
    '## 6. 分析思路',
    '',
    '见 `03-分析框架.md`：先看总量与趋势，再看分群差异，最后用驱动分析解释原因。所有分析以 95% 双尾显著性为默认标准。',
    '',
    '## 7. 排期',
    '',
    table(['阶段', 'D+开始', 'D+结束', '说明'], s.schedule.rows.map(r => [r.name, r.start, r.end, r.note])),
    '',
    `合计约 ${s.schedule.totalDays} 天；正式访问从 D+${s.schedule.fieldworkStart} 开始。`,
    '',
    '## 8. 风险与应对',
    '',
    table(['风险', '影响', '应对'], [
      ['低线城市样本难招募', '配额不足、工期延后', '提前锁定 panel 供应商；必要时合并低线层级并加权'],
      ['目标人群过窄', 'incidence 低、成本上升', '把筛选题前置并缩短问卷；用配额抽样而非随机抽样'],
      ['品牌列表与客户口径不一致', '认知/考虑数据不可比', '编程前用客户最新品牌清单逐一确认'],
      ['问卷超长', '完成率下降、数据质量差', '按体检建议砍题；网格题优先压缩'],
    ]),
    '',
  ]
  return lines.join('\n')
}

function nearestSize(table, n) {
  return table.reduce((best, row) => Math.abs(row.n - n) < Math.abs(best - n) ? row.n : best, table[0].n)
}

/** 02 问卷 */
export function mdQuestionnaire(project) {
  const b = project.brief
  const lines = [
    `# 02 调研问卷 · ${b.name}`,
    '',
    table(['项', '内容'], [
      ['调研类型', project.playbook.name],
      ['目标人群', b.audience],
      ['覆盖市场', b.markets],
      ['样本量', b.sampleSize],
      ['题目数', project.stats.questions],
      ['预计时长', `${project.questionnaire.minutes} 分钟`],
      ['生成时间', dateText(project.createdAt)],
    ]),
    '',
    '## 访问说明（知情同意）',
    '',
    `您好！我们受委托开展一项关于${b.category}的使用习惯与看法研究。访问大约需要 ${Math.round(project.questionnaire.minutes)} 分钟，所有回答仅用于整体分析，不会单独披露您的个人信息，也不会用于推销。您可以随时中止访问。`,
    '',
    '如同意参加，请按真实想法作答；没有对错答案。',
    '',
  ]
  for (const module of project.questionnaire.modules) {
    lines.push(`## ${module.code} ${module.name}（${module.questions.length} 题）`, '')
    if (module.purpose) lines.push(`> ${module.purpose}`, '')
    for (const question of module.questions) lines.push(questionBlock(question, 0))
  }
  lines.push('## 附：题型与编码说明', '')
  lines.push('- 单选题只选一个；多选题按题目上限选择。')
  lines.push('- 量表题：1 = 最低，5/10 = 最高；数值越大越正面（价格感知除外，1 = 很便宜）。')
  lines.push('- 开放题保留原文，编码时按编码表归类，不改变原话。')
  return lines.join('\n')
}

/** 03 分析框架 */
export function mdAnalysis(project) {
  const a = project.analysis
  const lines = [
    `# 03 分析框架 · ${project.brief.name}`,
    '',
    '## 1. 决策—研究问题—指标—题目—产出',
    '',
    table(['业务决策', '研究问题', '指标', '对应题目', '产出'], a.trace.map(row => [row.decision, row.question, row.metric, (row.items || []).join('、'), row.output])),
    '',
    '## 2. 指标定义',
    '',
    table(['指标', '口径', 'base', '公式 / 来源', '对比规则'], project.kpis.map(kpi => [kpi.name, kpi.definition, kpi.base, kpi.formula, kpi.compare])),
    '',
    '## 3. 分组维度（banner）与样本',
    '',
    table(['维度', '水平', '本期样本', '说明'], a.banners.map(row => [row.name, row.levels, row.detail, row.note])),
    '',
    '## 4. 交叉表清单',
    '',
    table(['行', '列', '检验方法', '最小 base'], a.crosstabs.map(row => [row.rows, row.cols, row.test, row.minBase])),
    '',
    '## 5. 高级分析',
    '',
    table(['分析', '方法', '输入', '输出', '前提 / 说明'], a.models.map(row => [row.name, row.method, row.input, row.output, row.note])),
    '',
    '## 6. 图表清单',
    '',
    table(['图号', '图名', '类型', '数据源', 'base', '要说明什么'], a.charts.map(row => [row.no, row.title, row.type, row.source, row.base, row.takeaway])),
    '',
    '## 7. 报告大纲',
    '',
    table(['章节', '内容'], a.outline.map(row => [row.chapter, row.content])),
    '',
    '## 8. 数据交付规范',
    '',
    table(['项', '规则'], a.dataSpec.map(row => [row.item, row.rule])),
    '',
    '## 9. 本类调研的常见坑',
    '',
    project.pitfalls.map(p => `- ${p}`).join('\n'),
    '',
  ]
  return lines.join('\n')
}

/** 04 抽样与配额 */
export function mdSampling(project) {
  const s = project.sampling
  const b = project.brief
  const lines = [
    `# 04 抽样与配额 · ${b.name}`,
    '',
    '## 1. 一句话结论',
    '',
    `建议 ${b.sampleSize} 个样本：总样本误差约 ±${(s.precision.find(p => p.n === nearestSize(s.precision, b.sampleSize))?.margin * 100 || 0).toFixed(1)} 个百分点，` +
      `可支撑 ${s.recommended.marginals.map(m => `${m.name}分 ${m.levels.map(l => `${l.label} n=${l.n}`).join('、')}`).join('；')}。` +
      `推荐方案 C（比例 + 保底），最小交叉格 ${Math.min(...s.recommended.rows.map(r => r.n))}。`,
    '',
    '## 2. 样本量与精度',
    '',
    '按 95% 置信、p=0.5、设计效应 1.2 计算（`n = z²·p(1-p)·deff / e²`）：',
    '',
    table(['样本量', '误差（±百分点）', '有效样本'], s.precision.filter(row => [200, 300, 400, 500, 600, 800, 1000, 1200].includes(row.n)).map(row => [row.n, (row.margin * 100).toFixed(1), row.effective])),
    '',
    `本期：n = ${b.sampleSize}，误差 ±${(s.precision.find(p => p.n === nearestSize(s.precision, b.sampleSize))?.margin * 100 || 0).toFixed(1)} 个百分点，` +
      `有效样本约 ${Math.round(b.sampleSize / s.deff)}。`,
    '',
    '## 3. 三种分配方案',
    '',
    table(
      ['方案', '怎么分', '城市级别分布', '年龄分布', '最小格', '更适合'],
      s.plans.map(plan => [
        plan.name,
        plan.desc,
        plan.marginals.find(m => m.name === '城市级别')?.levels.map(l => `${l.label} ${l.n}`).join(' / ') ?? '—',
        plan.marginals.find(m => m.name === '年龄')?.levels.map(l => `${l.label} ${l.n}`).join(' / ') ?? '—',
        plan.minCell,
        plan.bestFor,
      ]),
    ),
    '',
    '**怎么选**：看全国大盘、希望加权最少 → A；要做人群之间比较、结论按人群给 → B；两者都要（大多数品牌追踪）→ C。',
    '',
    '## 4. 推荐方案（C · 比例 + 保底）完整配额',
    '',
    table(['城市级别', '性别', '年龄', '样本量', '样本占比', '总体占比', '权重'], s.recommended.rows.map(row => [
      row.labels[0], row.labels[1], row.labels[2], row.n, pct(row.sampleShare), pct(row.popShare), row.weight.toFixed(2),
    ])),
    '',
    `合计 ${s.recommended.rows.reduce((acc, row) => acc + row.n, 0)} 份；权重已截断在 0.3-3.0。`,
    '',
    '## 5. 各维度边际与加权',
    '',
    table(['维度', '水平', '样本量', '样本占比', '总体占比', '权重'], s.recommended.marginals.flatMap(m => m.levels.map(l => [m.name, l.label, l.n, pct(l.sampleShare), pct(l.popShare), l.weight.toFixed(2)]))),
    '',
    `加权口径：${s.weighting}`,
    '',
    '## 6. 接触量、时长与成本',
    '',
    table(['项', '数值', '说明'], [
      ['需接触人数', `${s.contact.invites.toLocaleString('zh-CN')} 人`, `按 incidence ${pct(s.contact.incidence)} × 回应率 ${pct(s.contact.responseRate)} 估算`],
      ['有效访谈', `${s.contact.n} 份`, `单份 ${s.contact.loi} 分钟`],
      ['总访谈时长', `${s.contact.hours} 小时`, '用于排班与督导配置'],
      ['田野天数', `${s.contact.fieldDays} 天`, `按日均 ${s.contact.dailyCompletes} 份`],
      ['单样本成本', `${s.contact.cpi} 元`, '按客户/代理报价填入，生成稿用默认值'],
      ['总成本', `${s.contact.cost.toLocaleString('zh-CN')} 元`, '不含编程、编码、报告费'],
    ]),
    '',
    '## 7. 排期',
    '',
    table(['阶段', 'D+开始', 'D+结束', '说明'], s.schedule.rows.map(r => [r.name, r.start, r.end, r.note])),
    '',
    `合计约 ${s.schedule.totalDays} 天。`,
    '',
    '## 8. 调整规则（执行中遇到问题时用）',
    '',
    '1. **某一格招不满**：先在同一城市级别内用相邻年龄补；仍不足则合并「31-35 / 36-45」为一格，并在报告中说明。',
    '2. **低线样本贵**：把三线及以下从 30% 降到 25%，缺口用二线补，但加权时保留总体结构，报告披露实际分布。',
    '3. **目标人群过窄**（incidence < 20%）：把筛选题前置、缩短问卷，或改用 panel 定向样本；成本按新 incidence 重算。',
    '4. **要检测更小差异**（如 2 个百分点）：n 需要约 2400（p=0.5，deff=1.2），或改成配对/追踪设计。',
    '5. **加权后有效样本过低**（< 0.7n）：说明配额偏离总体太多，需回看方案是否选错。',
    '',
    `> ${s.note}`,
    '',
  ]
  return lines.join('\n')
}

/** 06 执行与 QC 清单 */
export function mdQC(project) {
  const b = project.brief
  const lines = [
    `# 06 执行与 QC 清单 · ${b.name}`,
    '',
    '## 1. 编程前',
    '',
    '- [ ] 品牌清单、渠道清单、价盘与客户确认（版本号写进项目记录）',
    '- [ ] 筛选题终止页、终止原因编码确认',
    '- [ ] 配额表导入 panel 系统，设置每格上限',
    '- [ ] 随机化设置：品牌随机、选项随机（「其他/都不知道」固定末位）',
    '- [ ] 网格题按认知/经历过滤，base 单独设置',
    '- [ ] 跳转逻辑逐条走查（本问卷共 ' + project.stats.questions + ' 题）',
    '',
    '## 2. 试访',
    '',
    '- [ ] 5-10 份试访，覆盖一线/低线、男女、核心年龄段',
    '- [ ] 记录单份实际时长（目标 ' + project.questionnaire.minutes + ' 分钟，允许 ±20%）',
    '- [ ] 确认题意理解、选项无歧义、开放题不引导',
    '',
    '## 3. 正式访问',
    '',
    '- [ ] 每日回收量 ≥ ' + Math.round(project.sampling.contact.dailyCompletes * 0.8) + ' 份，按配额滚动检查',
    '- [ ] 单份时长低于中位数 1/3 的样本标记复核',
    '- [ ] 直线作答、全选同一选项、开放题乱填的样本标记',
    '- [ ] 开放题抽样 10% 人工抽检',
    '',
    '## 4. 数据回收',
    '',
    '- [ ] 去重：账号 + 设备指纹 + IP',
    '- [ ] 逻辑校验：跳转矛盾、多选题单选、量表越界',
    '- [ ] 加权变量生成（wgt），权重截断 0.3-3.0',
    '- [ ] 开放题编码（两人独立编码，分歧率 > 15% 时重新定义编码表）',
    '',
    '## 5. 交付前',
    '',
    '- [ ] 样本结构表与实际配额对照',
    '- [ ] 删样记录与原因（删样比例需在报告披露）',
    '- [ ] 数据表变量名与码表一致（05-码表.csv）',
    '- [ ] 报告中的每个数字可回溯到交叉表',
    '',
  ]
  return lines.join('\n')
}

export { dateText }
