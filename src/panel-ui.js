/* ============================================================
 * src/panel-ui.js — 组件与预览视图
 * 与 panel-styles.js / panel.js / main.js 共用一个工厂作用域。
 * ============================================================ */

const CiReact = React
const ciUseState = CiReact.useState
const ciUseEffect = CiReact.useEffect
const ciUseMemo = CiReact.useMemo

const ciTypeName = {
  single: '单选', multi: '多选', scale: '量表', grid: '网格', open: '开放题',
  numeric: '数值', rank: '排序',
}

function ciFmt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return Number(value).toLocaleString('zh-CN')
}

function ciPct(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${(value * 100).toFixed(digits)}%`
}

function CiBtn(props) {
  const className = [
    'ci-btn',
    props.variant === 'primary' ? 'ci-btn-primary' : '',
    props.variant === 'ghost' ? 'ci-btn-ghost' : '',
    props.size === 'sm' ? 'ci-btn-sm' : '',
    props.block ? 'ci-btn-block' : '',
  ].filter(Boolean).join(' ')
  return h('button', {
    type: 'button',
    className,
    onClick: props.onClick,
    disabled: props.disabled || props.loading,
    title: props.title,
  }, props.loading ? h('span', { className: `ci-spinner${props.variant === 'primary' ? ' ci-spinner-light' : ''}` }) : null, props.children)
}

function CiField(props) {
  return h('label', { className: 'ci-field' },
    h('span', { className: 'ci-label' }, h('span', null, props.label), props.hint ? h('em', null, props.hint) : null),
    props.children)
}

function CiInput(props) {
  return h('input', {
    className: 'ci-input',
    type: props.type || 'text',
    value: props.value ?? '',
    placeholder: props.placeholder,
    min: props.min,
    max: props.max,
    onChange: event => props.onChange?.(event.target.value),
  })
}

function CiTextarea(props) {
  return h('textarea', {
    className: 'ci-textarea',
    value: props.value ?? '',
    placeholder: props.placeholder,
    rows: props.rows || 4,
    onChange: event => props.onChange?.(event.target.value),
  })
}

function CiSelect(props) {
  return h('select', {
    className: 'ci-select',
    value: props.value,
    onChange: event => props.onChange?.(event.target.value),
  }, props.options.map(option => h('option', { key: option.value ?? option, value: option.value ?? option }, option.label ?? option)))
}

function CiChip(props) {
  return h('button', {
    type: 'button',
    className: `ci-chip${props.small ? ' ci-chip-sm' : ''}`,
    'aria-pressed': props.active ? 'true' : 'false',
    onClick: props.onClick,
  }, props.children)
}

function CiSection(props) {
  return h('section', { className: 'ci-sec' },
    h('div', { className: 'ci-sec-head' },
      props.step ? h('span', { className: 'ci-step' }, props.step) : null,
      h('div', { style: { minWidth: 0 } },
        h('div', { className: 'ci-sec-title' }, props.title),
        props.sub ? h('div', { className: 'ci-sec-sub' }, props.sub) : null),
      props.tools ? h('div', { className: 'ci-sec-tools' }, props.tools) : null),
    h('div', { className: 'ci-sec-body' }, props.children))
}

function CiTable(props) {
  return h('div', { className: 'ci-table-wrap' },
    h('table', { className: 'ci-table' },
      h('thead', null, h('tr', null, props.headers.map((header, index) => h('th', { key: index }, header)))),
      h('tbody', null, props.rows.map((row, rowIndex) => h('tr', { key: rowIndex },
        row.map((cell, cellIndex) => h('td', {
          key: cellIndex,
          className: props.numeric?.includes(cellIndex) ? 'num' : undefined,
        }, cell ?? '')))))))
}

function CiStat(props) {
  return h('div', { className: 'ci-stat' },
    h('div', { className: 'ci-stat-label' }, props.label),
    h('div', { className: 'ci-stat-value' }, props.value, props.unit ? h('span', { className: 'ci-stat-unit' }, props.unit) : null))
}

function CiChecks(props) {
  const list = props.checks ?? []
  if (!list.length) {
    return h('div', { className: 'ci-check ci-check-info' },
      h('span', { className: 'ci-check-icon' }, '✓'),
      h('span', null, '体检通过：模块完整、时长可控、跳转闭环'))
  }
  const order = { error: 0, warn: 1, info: 2 }
  const sorted = [...list].sort((a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3))
  return h('div', null, sorted.slice(0, 24).map((check, index) => h('div', {
    key: index,
    className: `ci-check ci-check-${check.level}`,
  },
  h('span', { className: 'ci-check-icon' }, check.level === 'error' ? '!' : check.level === 'warn' ? '!' : 'i'),
  h('span', null, check.text))))
}

function CiBanner(props) {
  return h('div', { className: `ci-banner ci-banner-${props.kind || 'info'}` }, h('span', null, props.children))
}

/* ------------------------------ 简报 ------------------------------ */

function CiBriefView(props) {
  const project = props.project
  const b = project.brief
  const decisions = b.decisions.length ? b.decisions : ['（未填：建议补充 1-3 条要支撑的业务决策）']
  const questions = [...new Set(project.analysis.trace.map(row => row.question))]
  return h('div', null,
    h('div', { className: 'ci-stats' },
      h(CiStat, { label: '题目数', value: project.stats.questions, unit: '题' }),
      h(CiStat, { label: '预计时长', value: project.stats.minutes, unit: '分钟' }),
      h(CiStat, { label: '样本量', value: ciFmt(project.stats.sample) }),
      h(CiStat, { label: '总误差', value: `±${(project.stats.marginTotal * 100).toFixed(1)}`, unit: '%' }),
      h(CiStat, { label: '田野', value: project.stats.fieldDays, unit: '天' })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '项目目标')),
      h('div', { className: 'ci-card-text' }, b.objective || '（未填）')),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '要支撑的业务决策')),
      h('ol', { style: { margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 } },
        decisions.map((decision, index) => h('li', { key: index }, decision)))),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '研究问题')),
      h('ol', { style: { margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 } },
        questions.map((question, index) => h('li', { key: index }, question)))),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '研究对象与样本')),
      h('dl', { className: 'ci-kv' },
        h('dt', null, '品类'), h('dd', null, b.category || '—'),
        h('dt', null, '主品牌'), h('dd', null, b.ownBrand || '—'),
        h('dt', null, '竞品'), h('dd', null, b.competitors.length ? b.competitors.join('、') : '—'),
        h('dt', null, '目标人群'), h('dd', null, b.audience || '—'),
        h('dt', null, '市场'), h('dd', null, b.markets),
        h('dt', null, '方式'), h('dd', null, b.method),
        h('dt', null, '样本'), h('dd', null, `${ciFmt(b.sampleSize)}（有效样本约 ${ciFmt(project.stats.effectiveSample)}）`),
        h('dt', null, '配额'), h('dd', null, b.quotas || '见「抽样」页'))),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '核心指标')),
      h(CiTable, {
        headers: ['指标', '口径', 'base'],
        rows: project.kpis.map(kpi => [kpi.name, kpi.definition, kpi.base]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '体检结果')),
      h(CiChecks, { checks: project.checks.checks })))
}

/* ------------------------------ 问卷 ------------------------------ */

function CiQuestionnaireView(props) {
  const project = props.project
  const [open, setOpen] = ciUseState(() => {
    const map = {}
    project.questionnaire.modules.forEach((module, index) => { map[module.code] = index === 0 })
    return map
  })
  ciUseEffect(() => {
    const map = {}
    project.questionnaire.modules.forEach((module, index) => { map[module.code] = index === 0 })
    setOpen(map)
  }, [project.id])

  return h('div', null,
    h('div', { className: 'ci-stats' },
      h(CiStat, { label: '模块', value: project.questionnaire.modules.length }),
      h(CiStat, { label: '题目', value: project.stats.questions, unit: '题' }),
      h(CiStat, { label: '预计时长', value: project.stats.minutes, unit: '分钟' }),
      h(CiStat, { label: '开放题', value: project.questionnaire.questions.filter(q => q.type === 'open').length }),
      h(CiStat, { label: '品牌数', value: project.stats.brands })),
    project.questionnaire.modules.map(module => h('div', { className: 'ci-mod', key: module.code },
      h('div', {
        className: 'ci-mod-head',
        onClick: () => setOpen(current => ({ ...current, [module.code]: !current[module.code] })),
      },
      h('span', { className: 'ci-mod-code' }, module.code),
      h('span', { className: 'ci-mod-name' }, module.name),
      h('span', { className: 'ci-mod-count' }, `${module.questions.length} 题 ${open[module.code] ? '▾' : '▸'}`)),
      open[module.code] ? h('div', { className: 'ci-mod-body' },
        module.purpose ? h('div', { className: 'ci-hint', style: { marginBottom: 6 } }, module.purpose) : null,
        module.questions.map(question => h('div', { className: 'ci-q', key: question.id },
          h('div', { className: 'ci-q-head' },
            h('span', { className: 'ci-q-id' }, question.id),
            h('span', { className: 'ci-q-text' }, question.text)),
          h('div', { className: 'ci-q-meta' },
            `${ciTypeName[question.type] || question.type}｜base：${question.base || '未填'}｜${question.required ? '必答' : '选答'}`),
          question.type === 'grid'
            ? h('div', { className: 'ci-q-opts' }, (question.rows || []).map((row, index) => h('span', { className: 'ci-q-opt', key: index },
              h('b', null, String(index + 1)), row)))
            : question.options?.length
              ? h('div', { className: 'ci-q-opts' }, question.options.map(option => h('span', { className: 'ci-q-opt', key: option.code },
                h('b', null, `[${option.code}]`), option.label)))
              : question.type === 'scale'
                ? h('div', { className: 'ci-q-opts' }, h('span', null, `${question.scale?.min}（${question.scale?.minLabel}）— ${question.scale?.max}（${question.scale?.maxLabel}）`))
                : null,
          question.routing ? h('div', { className: 'ci-q-note' }, `跳转：${question.routing}`) : null,
          question.note ? h('div', { className: 'ci-q-note' }, `编程：${question.note}`) : null))
      ) : null)))
}

/* ------------------------------ 分析框架 ------------------------------ */

function CiAnalysisView(props) {
  const a = props.project.analysis
  return h('div', null,
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' },
        h('span', { className: 'ci-card-title' }, '1. 决策—研究问题—指标—题目—产出'),
        h('span', { className: 'ci-card-sub' }, '没有「问了不分析」的题')),
      h(CiTable, {
        headers: ['业务决策', '研究问题', '指标', '对应题目', '产出'],
        rows: a.trace.map(row => [row.decision, row.question, row.metric, (row.items || []).join('、'), row.output]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '2. 指标定义')),
      h(CiTable, {
        headers: ['指标', '口径', 'base', '公式 / 来源', '对比规则'],
        rows: props.project.kpis.map(kpi => [kpi.name, kpi.definition, kpi.base, kpi.formula, kpi.compare]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '3. 分组维度与样本')),
      h(CiTable, {
        headers: ['维度', '水平', '本期样本', '说明'],
        rows: a.banners.map(row => [row.name, row.levels, row.detail, row.note]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '4. 交叉表清单')),
      h(CiTable, {
        headers: ['行', '列', '检验', '最小 base'],
        numeric: [3],
        rows: a.crosstabs.map(row => [row.rows, row.cols, row.test, row.minBase]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '5. 高级分析')),
      h(CiTable, {
        headers: ['分析', '方法', '输入', '输出', '前提'],
        rows: a.models.map(row => [row.name, row.method, row.input, row.output, row.note]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '6. 图表清单')),
      h(CiTable, {
        headers: ['图号', '图名', '类型', '数据源', 'base', '要说明什么'],
        rows: a.charts.map(row => [row.no, row.title, row.type, row.source, row.base, row.takeaway]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '7. 报告大纲')),
      h(CiTable, { headers: ['章节', '内容'], rows: a.outline.map(row => [row.chapter, row.content]) })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '8. 数据交付规范')),
      h(CiTable, { headers: ['项', '规则'], rows: a.dataSpec.map(row => [row.item, row.rule]) })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '9. 这类调研的常见坑')),
      h('ul', { style: { margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.8 } },
        props.project.pitfalls.map((pitfall, index) => h('li', { key: index }, pitfall)))))
}

/* ------------------------------ 抽样 ------------------------------ */

function CiSamplingView(props) {
  const s = props.project.sampling
  const precisionRows = s.precision.filter(row => [200, 400, 600, 800, 1000, 1200].includes(row.n))
  const tierMarginal = plan => {
    const marginal = plan.marginals.find(item => item.name === '城市级别')
    return marginal ? marginal.levels.map(level => `${level.label} ${level.n}`).join(' / ') : '—'
  }
  const ageMarginal = plan => {
    const marginal = plan.marginals.find(item => item.name === '年龄')
    return marginal ? marginal.levels.map(level => `${level.label} ${level.n}`).join(' / ') : '—'
  }
  return h('div', null,
    h('div', { className: 'ci-stats' },
      h(CiStat, { label: '总样本', value: ciFmt(s.n) }),
      h(CiStat, { label: '设计效应', value: s.deff }),
      h(CiStat, { label: '有效样本', value: ciFmt(Math.round(s.n / s.deff)) }),
      h(CiStat, { label: '总误差', value: `±${(s.precision.find(row => row.n === 800)?.margin * 100 || 0).toFixed(1)}`, unit: '%' }),
      h(CiStat, { label: '需接触', value: ciFmt(s.contact.invites) })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' },
        h('span', { className: 'ci-card-title' }, '样本量与精度'),
        h('span', { className: 'ci-card-sub' }, '95% 置信、p=0.5、设计效应 1.2')),
      h(CiTable, {
        headers: ['样本量', '误差（±百分点）', '有效样本'],
        numeric: [0, 1, 2],
        rows: precisionRows.map(row => [row.n, (row.margin * 100).toFixed(1), row.effective]),
      }),
      h('div', { className: 'ci-hint', style: { marginTop: 8 } },
        `公式：n = z² · p(1-p) · deff / e²；本期 n=${s.n}，误差 ±${(s.precision.find(row => row.n === Math.round(s.n))?.margin * 100 || s.precision.reduce((best, row) => Math.abs(row.n - s.n) < Math.abs(best.n - s.n) ? row : best, s.precision[0]).margin * 100).toFixed(1)}。`)),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' },
        h('span', { className: 'ci-card-title' }, '三种样本分配方案'),
        h('span', { className: 'ci-card-sub' }, '推荐方案 C')),
      h(CiTable, {
        headers: ['方案', '城市级别分布', '年龄分布', '最小格', '更适合'],
        numeric: [3],
        rows: s.plans.map(plan => [h('div', { key: plan.key },
          h('div', { style: { fontWeight: 600 } }, plan.name),
          h('div', { style: { fontSize: 11, color: 'var(--dsw-alias-label-secondary)' } }, plan.desc)),
        tierMarginal(plan), ageMarginal(plan), plan.minCell, plan.bestFor]),
      }),
      h('div', { className: 'ci-hint', style: { marginTop: 8 } },
        'A 看大盘、加权最少；B 做人群比较；C 两者都要（推荐）。')),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' },
        h('span', { className: 'ci-card-title' }, '推荐方案完整配额'),
        h('span', { className: 'ci-card-sub' }, `${s.recommended.rows.length} 个交叉格`)),
      h(CiTable, {
        headers: ['城市级别', '性别', '年龄', '样本量', '样本占比', '总体占比', '权重'],
        numeric: [3, 4, 5, 6],
        rows: s.recommended.rows.map(row => [
          row.labels[0], row.labels[1], row.labels[2], row.n, ciPct(row.sampleShare), ciPct(row.popShare), row.weight.toFixed(2),
        ]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '接触量、时长与成本')),
      h(CiTable, {
        headers: ['项', '数值', '说明'],
        rows: [
          ['需接触人数', `${ciFmt(s.contact.invites)} 人`, `incidence ${ciPct(s.contact.incidence)} × 回应率 ${ciPct(s.contact.responseRate)}`],
          ['总访谈时长', `${s.contact.hours} 小时`, `单份 ${s.contact.loi} 分钟`],
          ['田野天数', `${s.contact.fieldDays} 天`, `日均 ${s.contact.dailyCompletes} 份`],
          ['总成本', `${ciFmt(s.contact.cost)} 元`, `${s.contact.cpi} 元/样本，不含编程与报告`],
        ],
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '排期')),
      h(CiTable, {
        headers: ['阶段', 'D+开始', 'D+结束', '说明'],
        numeric: [1, 2],
        rows: s.schedule.rows.map(row => [row.name, row.start, row.end, row.note]),
      })),
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' }, h('span', { className: 'ci-card-title' }, '怎么调')),
      h('ol', { style: { margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.8 } },
        h('li', null, '某一格招不满：先在同一城市级别内用相邻年龄补，仍不足则合并年龄组。'),
        h('li', null, '低线样本贵：三线从 30% 降到 25%，缺口用二线补，加权保留总体结构。'),
        h('li', null, '目标人群过窄：筛选题前置、缩短问卷，或改用定向样本面板。'),
        h('li', null, '要检测 2 个百分点差异：n 需约 2400，或改成追踪设计。'))))
}

/* ------------------------------ 文件 ------------------------------ */

function CiFilesView(props) {
  const files = props.saved?.files ?? props.project?.record?.files ?? []
  const dir = props.saved?.dir ?? props.project?.record?.dir
  if (!dir) {
    return h('div', { className: 'ci-empty' },
      h('div', { className: 'ci-empty-title' }, '还没有保存到电脑'),
      h('div', { className: 'ci-empty-text' }, '点右上角「保存到电脑」，会生成 Word 问卷、Excel 分析框架和配套文件。'),
      h(CiBtn, { variant: 'primary', onClick: props.onSave }, '保存到电脑'))
  }
  return h('div', null,
    h('div', { className: 'ci-card' },
      h('div', { className: 'ci-card-head' },
        h('span', { className: 'ci-card-title' }, '已保存'),
        h('span', { className: 'ci-card-sub' }, dir)),
      h('div', { className: 'ci-files' },
        files.map(name => h('div', { className: 'ci-file', key: name },
          h('span', null, /\.docx$/.test(name) ? '📄' : /\.xlsx$/.test(name) ? '📊' : '📝'),
          h('span', { className: 'ci-file-name' }, name),
          h('span', { className: 'ci-file-badge' }, /\.(docx|xlsx)$/.test(name) ? 'Office' : /\.csv$/.test(name) ? 'CSV' : 'Markdown')))),
      h('div', { className: 'ci-form-actions' },
        h(CiBtn, { variant: 'primary', onClick: () => props.onReveal(dir) }, '打开文件夹'),
        h(CiBtn, { onClick: () => props.onSave?.() }, '重新生成并覆盖'))))
}
