window.__ModuleLoader__.load({
  id: 'dsh-consumer-insight',
  factory(require) {
    const React = require('react')
    const h = React.createElement
// ---- src/panel-styles.js ----
/* ============================================================
 * src/panel-styles.js — 消费者洞察工作台样式
 * 与 panel-ui.js / panel.js / main.js 拼进同一个工厂作用域。
 * 只使用 DSH 主题 token，深浅色自动适配。
 * ============================================================ */

const ciCss = `
.ci-page{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
.ci-page *,.ci-page *::before,.ci-page *::after{box-sizing:border-box}
.ci-page button,.ci-page input,.ci-page select,.ci-page textarea{font-family:inherit}

.ci-head{flex:none;display:flex;align-items:center;gap:14px;padding:14px 24px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.ci-brand{display:flex;align-items:center;gap:10px;min-width:0}
.ci-mark{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary);flex:none}
.ci-title{margin:0;font-size:15px;font-weight:650;line-height:1.3}
.ci-sub{margin:1px 0 0;font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.ci-head-actions{margin-left:auto;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ci-head-dir{font-size:11.5px;color:var(--dsw-alias-label-secondary);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.ci-body{flex:1;min-height:0;display:grid;grid-template-columns:392px minmax(0,1fr)}
.ci-form{min-height:0;overflow:auto;padding:18px 18px 40px;border-right:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.ci-preview{min-height:0;overflow:auto;padding:18px 22px 56px}

.ci-sec{margin-top:14px;border:1px solid var(--dsw-alias-border-l2);border-radius:13px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.ci-sec:first-child{margin-top:0}
.ci-sec-head{display:flex;align-items:center;gap:9px;padding:11px 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.ci-step{flex:none;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);font-size:10.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.ci-sec-title{font-size:13px;font-weight:650;line-height:1.35}
.ci-sec-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);line-height:1.4}
.ci-sec-tools{margin-left:auto;display:flex;align-items:center;gap:6px}
.ci-sec-body{padding:12px 14px 14px}

.ci-field{display:flex;flex-direction:column;gap:5px;min-width:0;margin-top:11px}
.ci-field:first-child{margin-top:0}
.ci-label{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:11.5px;color:var(--dsw-alias-label-secondary);line-height:1.4}
.ci-label em{font-style:normal;font-size:10.5px;opacity:.7}
.ci-input,.ci-select,.ci-textarea{width:100%;padding:8px 10px;border-radius:9px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5;transition:border-color .15s ease,box-shadow .15s ease}
.ci-input,.ci-select{height:36px}
.ci-textarea{min-height:76px;resize:vertical}
.ci-input::placeholder,.ci-textarea::placeholder{color:var(--dsw-alias-label-secondary);opacity:.65}
.ci-input:focus,.ci-select:focus,.ci-textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}
.ci-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ci-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.ci-hint{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.5;margin-top:2px}

.ci-chips{display:flex;flex-wrap:wrap;gap:6px}
.ci-chip{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:6px 11px;font-size:12.5px;line-height:1.2;cursor:pointer;transition:all .15s ease;white-space:nowrap}
.ci-chip:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-secondary)}
.ci-chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.ci-chip[aria-pressed="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);color:var(--dsw-alias-brand-primary);font-weight:600}
.ci-chip-sm{padding:4px 9px;font-size:11.5px}

.ci-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;font-weight:550;line-height:1;border-radius:999px;padding:8px 14px;cursor:pointer;white-space:nowrap;transition:background .15s ease,border-color .15s ease,opacity .15s ease}
.ci-btn:not(:disabled):hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent)}
.ci-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.ci-btn:disabled{opacity:.42;cursor:not-allowed}
.ci-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font-weight:600;padding:9px 18px}
.ci-btn-primary:not(:disabled):hover{opacity:.88}
.ci-btn-ghost{border-color:transparent;color:var(--dsw-alias-label-secondary);padding:7px 9px}
.ci-btn-sm{font-size:11.5px;padding:6px 10px}
.ci-btn-block{width:100%}

.ci-form-actions{display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap}
.ci-form-msg{margin-top:8px;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}
.ci-form-msg-ok{color:var(--dsw-alias-label-secondary)}

.ci-tabs{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:14px}
.ci-tab{appearance:none;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:6px 11px;font-size:12.5px;cursor:pointer;transition:all .15s ease}
.ci-tab:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent)}
.ci-tab[aria-selected="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-brand-primary);font-weight:600}

.ci-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:14px}
.ci-stat{padding:11px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:11px;background:var(--dsw-alias-bg-layer-1)}
.ci-stat-label{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4}
.ci-stat-value{margin-top:3px;font-size:19px;font-weight:650;line-height:1.2;font-variant-numeric:tabular-nums}
.ci-stat-unit{font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary);margin-left:2px}

.ci-card{border:1px solid var(--dsw-alias-border-l2);border-radius:13px;background:var(--dsw-alias-bg-layer-1);padding:14px 16px;margin-bottom:12px}
.ci-card-head{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}
.ci-card-title{font-size:13.5px;font-weight:650}
.ci-card-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary)}
.ci-card-text{font-size:13px;line-height:1.7;color:var(--dsw-alias-label-primary);white-space:pre-wrap}
.ci-kv{display:grid;grid-template-columns:110px minmax(0,1fr);gap:6px 12px;font-size:12.5px;line-height:1.6}
.ci-kv dt{color:var(--dsw-alias-label-secondary)}
.ci-kv dd{margin:0;color:var(--dsw-alias-label-primary)}

.ci-table-wrap{overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:11px;margin-top:10px}
.ci-table{width:100%;border-collapse:collapse;font-size:12px;line-height:1.5}
.ci-table th{position:sticky;top:0;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);text-align:left;font-weight:650;padding:7px 9px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap}
.ci-table td{padding:6px 9px;border-bottom:1px solid var(--dsw-alias-border-l1);vertical-align:top}
.ci-table tr:last-child td{border-bottom:none}
.ci-table td.num{text-align:right;font-variant-numeric:tabular-nums}

.ci-mod{border:1px solid var(--dsw-alias-border-l1);border-radius:11px;margin-top:10px;overflow:hidden;background:var(--dsw-alias-bg-base)}
.ci-mod-head{display:flex;align-items:center;gap:9px;padding:9px 12px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent);cursor:pointer;user-select:none}
.ci-mod-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--dsw-alias-brand-primary);font-weight:650;letter-spacing:.04em}
.ci-mod-name{font-size:12.5px;font-weight:600}
.ci-mod-count{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary)}
.ci-mod-body{padding:6px 12px 12px}

.ci-q{padding:10px 0;border-top:1px dashed var(--dsw-alias-border-l1)}
.ci-q:first-child{border-top:none}
.ci-q-head{display:flex;gap:7px;align-items:baseline}
.ci-q-id{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--dsw-alias-brand-primary);font-weight:650}
.ci-q-text{font-size:13px;font-weight:550;line-height:1.55}
.ci-q-meta{margin:3px 0 0 34px;font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.5}
.ci-q-opts{margin:5px 0 0 34px;display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--dsw-alias-label-primary)}
.ci-q-opt{display:inline-flex;gap:5px;align-items:baseline}
.ci-q-opt b{font-weight:600;color:var(--dsw-alias-label-secondary);font-size:10.5px;font-variant-numeric:tabular-nums}
.ci-q-note{margin:5px 0 0 34px;font-size:11px;line-height:1.55;color:var(--dsw-alias-label-secondary);font-style:italic}

.ci-check{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--dsw-alias-border-l1);font-size:12px;line-height:1.5}
.ci-check:first-child{border-top:none}
.ci-check-icon{flex:none;width:16px;height:16px;border-radius:999px;display:grid;place-items:center;font-size:10px;font-weight:700;margin-top:1px}
.ci-check-error .ci-check-icon{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 18%,transparent);color:var(--dsw-alias-state-error-primary)}
.ci-check-warn .ci-check-icon{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 22%,transparent);color:var(--dsw-alias-state-warn-primary)}
.ci-check-info .ci-check-icon{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-secondary)}

.ci-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:320px;text-align:center;color:var(--dsw-alias-label-secondary)}
.ci-empty-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
.ci-empty-text{font-size:12.5px;line-height:1.6;max-width:360px}

.ci-files{display:flex;flex-direction:column;gap:6px}
.ci-file{display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);font-size:12.5px}
.ci-file-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}
.ci-file-badge{margin-left:auto;font-size:10.5px;color:var(--dsw-alias-label-secondary)}

.ci-projects{display:flex;flex-direction:column;gap:7px}
.ci-project{display:flex;align-items:center;gap:10px;padding:9px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base);cursor:pointer;transition:border-color .15s ease}
.ci-project:hover{border-color:var(--dsw-alias-border-l2)}
.ci-project-name{font-size:12.5px;font-weight:600}
.ci-project-meta{font-size:11px;color:var(--dsw-alias-label-secondary)}
.ci-project-actions{margin-left:auto;display:flex;gap:4px}

.ci-spinner{width:13px;height:13px;flex:none;border-radius:50%;border:2px solid color-mix(in srgb,var(--dsw-alias-label-primary) 30%,transparent);border-top-color:var(--dsw-alias-label-primary);animation:ci-spin .8s linear infinite}
.ci-spinner-light{border-color:color-mix(in srgb,var(--dsw-alias-bg-base) 35%,transparent);border-top-color:var(--dsw-alias-bg-base)}
@keyframes ci-spin{to{transform:rotate(360deg)}}

.ci-banner{display:flex;align-items:flex-start;gap:8px;padding:9px 12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);font-size:12px;line-height:1.55;margin-bottom:12px}
.ci-banner-error{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent)}
.ci-banner-ok{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,transparent)}
.ci-banner-info{border-color:var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 6%,transparent)}

@media (max-width:1080px){
  .ci-body{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
  .ci-form{border-right:none;border-bottom:1px solid var(--dsw-alias-border-l1);max-height:46vh}
  .ci-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`

// ---- src/panel-ui.js ----
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

// ---- src/panel.js ----
/* ============================================================
 * src/panel.js — 消费者洞察工作台主面板
 * 与 panel-styles.js / panel-ui.js / main.js 共用一个工厂作用域。
 * ============================================================ */

const ciExample = {
  name: '即饮咖啡品牌追踪 2026Q4',
  type: 'brand-tracker',
  objective: '判断是否把 A 品牌预算从商超转向校园渠道：需要知道 18-30 岁人群在认知、考虑、使用三个环节与竞品的差距，以及校园场景的增量空间。',
  decisions: '是否加大校园渠道投入\n本轮传播是否带来认知提升\n价格是否需要调整',
  category: '即饮咖啡',
  ownBrand: 'A',
  competitors: 'B, C, D',
  audience: '18-30 岁，一二线城市，近 3 个月购买或饮用过即饮咖啡',
  markets: '全国一至三线',
  method: '线上 panel',
  sampleSize: '800',
  quotas: '',
  timeline: '2026-12 至 2027-01',
  budget: '',
  notes: '需要和 2026Q2 同波对比；加一道校园场景题。',
}

const ciEmptyForm = {
  name: '',
  type: 'brand-tracker',
  objective: '',
  decisions: '',
  category: '',
  ownBrand: '',
  competitors: '',
  audience: '',
  markets: '全国一至三线',
  method: '线上 panel',
  sampleSize: '',
  quotas: '',
  timeline: '',
  budget: '',
  notes: '',
}

const ciMethods = ['线上 panel', '电话访问', '门店拦截', 'CLT 中心地点测试', 'HUT 家庭使用测试', '线上社区']

async function ciApi(path, body) {
  const options = body === undefined
    ? { method: 'GET' }
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
  const response = await fetch(`/consumer-insight/${path}`, options)
  let data = {}
  try {
    data = await response.json()
  } catch {
    data = { error: '服务器返回了无法解析的内容' }
  }
  if (!response.ok) {
    const error = new Error(data.error || `请求失败（${response.status}）`)
    error.data = data
    throw error
  }
  return data
}

function ciPayload(form) {
  return {
    name: form.name,
    type: form.type,
    objective: form.objective,
    decisions: form.decisions,
    category: form.category,
    ownBrand: form.ownBrand,
    competitors: form.competitors,
    audience: form.audience,
    markets: form.markets,
    method: form.method,
    sampleSize: form.sampleSize === '' ? undefined : Number(form.sampleSize),
    quotas: form.quotas,
    timeline: form.timeline,
    budget: form.budget,
    notes: form.notes,
  }
}

function ciBriefToForm(brief) {
  if (!brief) return ciEmptyForm
  return {
    name: brief.name || '',
    type: brief.type || 'brand-tracker',
    objective: brief.objective || '',
    decisions: (brief.decisions || []).join('\n'),
    category: brief.category || '',
    ownBrand: brief.ownBrand || '',
    competitors: (brief.competitors || []).join(', '),
    audience: brief.audience || '',
    markets: brief.markets || '全国一至三线',
    method: brief.method || '线上 panel',
    sampleSize: brief.sampleSize ? String(brief.sampleSize) : '',
    quotas: brief.quotas || '',
    timeline: brief.timeline || '',
    budget: brief.budget || '',
    notes: brief.notes || '',
  }
}

function ConsumerInsightPanel() {
  const [loading, setLoading] = ciUseState(true)
  const [types, setTypes] = ciUseState([])
  const [form, setForm] = ciUseState(ciEmptyForm)
  const [project, setProject] = ciUseState(null)
  const [saved, setSaved] = ciUseState(null)
  const [projects, setProjects] = ciUseState([])
  const [outputDir, setOutputDir] = ciUseState('')
  const [dirDraft, setDirDraft] = ciUseState('')
  const [dirEditing, setDirEditing] = ciUseState(false)
  const [busy, setBusy] = ciUseState('')
  const [message, setMessage] = ciUseState(null)
  const [tab, setTab] = ciUseState('brief')
  const [dirty, setDirty] = ciUseState(false)
  const [confirmId, setConfirmId] = ciUseState('')
  const [showLibrary, setShowLibrary] = ciUseState(false)

  const activeType = ciUseMemo(() => types.find(item => item.id === form.type), [types, form.type])

  ciUseEffect(() => {
    let alive = true
    ciApi('state')
      .then(data => {
        if (!alive) return
        setTypes(data.types || [])
        setProjects(data.projects || [])
        setOutputDir(data.outputDir || '')
        setDirDraft(data.outputDir || '')
        if (data.draft) {
          setForm(current => ({ ...current, ...(data.draft.brief ?? data.draft), competitors: Array.isArray(data.draft.competitors) ? data.draft.competitors.join(', ') : (data.draft.competitors ?? '') }))
        }
        setLoading(false)
      })
      .catch(error => {
        if (!alive) return
        setMessage({ level: 'error', text: error.message })
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  function patch(name, value) {
    setForm(current => ({ ...current, [name]: value }))
    setDirty(true)
  }

  function selectType(id) {
    const type = types.find(item => item.id === id)
    setForm(current => ({
      ...current,
      type: id,
      sampleSize: current.sampleSize || (type ? String(type.defaultN) : ''),
    }))
    setDirty(true)
  }

  async function generate() {
    if (!form.objective.trim() || !form.category.trim() || !form.ownBrand.trim() || !form.audience.trim()) {
      setMessage({ level: 'error', text: '项目目标、品类、主品牌、目标人群是必填项' })
      return
    }
    setBusy('generate')
    setMessage(null)
    try {
      const data = await ciApi('generate', ciPayload(form))
      setProject(data.project)
      setSaved(null)
      setDirty(false)
      setTab('brief')
      const checks = data.project.checks
      setMessage({
        level: checks.errors ? 'error' : 'ok',
        text: checks.errors
          ? `已生成，但有 ${checks.errors} 个错误需要先处理（见「简报 → 体检」）`
          : `已生成：${data.project.stats.questions} 题 / ${data.project.stats.minutes} 分钟${checks.warns ? `，${checks.warns} 条提醒` : ''}`,
      })
    } catch (error) {
      setMessage({ level: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  async function save() {
    setBusy('save')
    setMessage(null)
    try {
      const data = await ciApi('save', ciPayload(form))
      setProject(data.project)
      setSaved({ dir: data.dir, files: data.files })
      setDirty(false)
      setTab('files')
      setMessage({ level: 'ok', text: `已保存到 ${data.dir}` })
      ciApi('state').then(state => {
        setProjects(state.projects || [])
        setOutputDir(state.outputDir || '')
      }).catch(() => {})
    } catch (error) {
      if (error.data?.checks) setProject(current => current ? { ...current, checks: error.data.checks } : current)
      setMessage({ level: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  async function reveal(dir) {
    try {
      await ciApi('reveal', { dir })
    } catch (error) {
      setMessage({ level: 'error', text: error.message })
    }
  }

  async function saveDir() {
    try {
      const data = await ciApi('settings', { outputDir: dirDraft })
      setOutputDir(data.outputDir)
      setDirDraft(data.outputDir)
      setDirEditing(false)
      setMessage({ level: 'ok', text: `输出目录已改为 ${data.outputDir}` })
    } catch (error) {
      setMessage({ level: 'error', text: error.message })
    }
  }

  async function openProject(record) {
    setBusy(record.id)
    setMessage(null)
    try {
      const data = await ciApi('project/get', { id: record.id })
      setProject(data.project)
      setForm(ciBriefToForm(data.project?.brief))
      setSaved({ dir: data.record.dir, files: data.record.files || [] })
      setTab('brief')
      setDirty(false)
      setShowLibrary(false)
    } catch (error) {
      setMessage({ level: 'error', text: error.message })
    } finally {
      setBusy('')
    }
  }

  async function removeProject(id) {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    try {
      await ciApi('project/delete', { id })
      setProjects(current => current.filter(item => item.id !== id))
      setConfirmId('')
    } catch (error) {
      setMessage({ level: 'error', text: error.message })
    }
  }

  function fillExample() {
    setForm(ciExample)
    setProject(null)
    setSaved(null)
    setDirty(true)
    setMessage({ level: 'ok', text: '已填入示例，可直接点「生成方案」' })
  }

  function reset() {
    setForm(ciEmptyForm)
    setProject(null)
    setSaved(null)
    setDirty(false)
    setMessage(null)
  }

  const tabs = [
    { id: 'brief', label: '简报' },
    { id: 'questionnaire', label: '问卷' },
    { id: 'analysis', label: '分析框架' },
    { id: 'sampling', label: '抽样' },
    { id: 'files', label: '文件' },
  ]

  return h('div', { className: 'ci-page' },
    h('style', null, ciCss),
    h('header', { className: 'ci-head' },
      h('div', { className: 'ci-brand' },
        h('span', { className: 'ci-mark' }, h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' },
          h('circle', { cx: 10.5, cy: 10.5, r: 6.5 }),
          h('path', { d: 'M15.4 15.4 21 21' }),
          h('path', { d: 'M8 12v-2M10.5 12V8.5M13 12v-3' }))),
        h('div', null,
          h('h1', { className: 'ci-title' }, '消费者洞察工作台'),
          h('p', { className: 'ci-sub' }, '填目标与类型 → 生成问卷、分析框架与抽样配额'))),
      h('div', { className: 'ci-head-actions' },
        outputDir ? h('button', {
          type: 'button',
          className: 'ci-head-dir',
          title: '点击更改输出目录',
          style: { background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit' },
          onClick: () => setDirEditing(value => !value),
        }, `${outputDir} ▾`) : null,
        h(CiBtn, { size: 'sm', variant: 'ghost', onClick: () => setShowLibrary(value => !value) }, showLibrary ? '收起项目库' : `项目库${projects.length ? `（${projects.length}）` : ''}`),
        h(CiBtn, { size: 'sm', onClick: fillExample }, '填入示例'),
        h(CiBtn, { variant: 'primary', onClick: generate, loading: busy === 'generate' }, '生成方案'),
        h(CiBtn, { onClick: save, disabled: !project || busy === 'save', loading: busy === 'save' }, '保存到电脑'))),

    h('div', { className: 'ci-body' },
      h('div', { className: 'ci-form' },
        showLibrary
          ? h(CiSection, { title: '最近项目', sub: '点一条载入参数，可改完重新生成' },
            projects.length
              ? h('div', { className: 'ci-projects' }, projects.map(record => h('div', { className: 'ci-project', key: record.id, onClick: () => openProject(record) },
                h('div', { style: { minWidth: 0 } },
                  h('div', { className: 'ci-project-name' }, record.name),
                  h('div', { className: 'ci-project-meta' }, `${record.typeName}｜${record.createdAt?.slice(0, 10) ?? ''}｜${ciFmt(record.stats?.questions)} 题`)),
                h('div', { className: 'ci-project-actions' },
                  h(CiBtn, {
                    size: 'sm',
                    variant: 'ghost',
                    onClick: event => { event.stopPropagation(); removeProject(record.id) },
                  }, confirmId === record.id ? '确认删除' : '删除')))))
              : h('div', { className: 'ci-hint' }, '还没有保存过的项目'))
          : null,

        dirEditing
          ? h(CiSection, { title: '输出目录', sub: 'Word / Excel / 文稿的保存位置' },
            h(CiField, { label: '目录路径', hint: '留空使用默认' },
              h(CiInput, { value: dirDraft, onChange: value => setDirDraft(value), placeholder: 'D:\\消费者洞察' })),
            h('div', { className: 'ci-form-actions' },
              h(CiBtn, { variant: 'primary', onClick: saveDir }, '保存目录'),
              h(CiBtn, { variant: 'ghost', onClick: () => setDirEditing(false) }, '取消')))
          : null,

        h(CiSection, { step: 1, title: '项目目标', sub: '写清要做什么决策，题目才有取舍依据' },
          h(CiField, { label: '项目目标', hint: '必填' },
            h(CiTextarea, {
              value: form.objective,
              onChange: value => patch('objective', value),
              rows: 4,
              placeholder: '例：判断是否把 A 品牌预算从商超转向校园渠道，需要知道 18-30 岁人群的认知与考虑差距',
            })),
          h(CiField, { label: '业务决策', hint: '一行一条，选填' },
            h(CiTextarea, {
              value: form.decisions,
              onChange: value => patch('decisions', value),
              rows: 3,
              placeholder: '是否加大校园渠道投入\n本轮传播是否带来认知提升',
            })),
          h(CiField, { label: '项目名称', hint: '选填' },
            h(CiInput, { value: form.name, onChange: value => patch('name', value), placeholder: '留空自动命名' }))),

        h(CiSection, { step: 2, title: '调研类型', sub: activeType?.subtitle },
          h('div', { className: 'ci-chips' }, types.map(type => h(CiChip, {
            key: type.id,
            active: form.type === type.id,
            onClick: () => selectType(type.id),
          }, `${type.name}`))),
          activeType
            ? h('div', { className: 'ci-hint', style: { marginTop: 8 } },
              `${activeType.modules} 个模块 / ${activeType.questions} 题标准件，建议样本 ${activeType.defaultN}，约 ${activeType.loi} 分钟。`)
            : null),

        h(CiSection, { step: 3, title: '对象与样本' },
          h('div', { className: 'ci-row' },
            h(CiField, { label: '品类 / 产品', hint: '必填' },
              h(CiInput, { value: form.category, onChange: value => patch('category', value), placeholder: '即饮咖啡' })),
            h(CiField, { label: '主品牌', hint: '必填' },
              h(CiInput, { value: form.ownBrand, onChange: value => patch('ownBrand', value), placeholder: 'A' }))),
          h(CiField, { label: '竞品', hint: '逗号分隔' },
            h(CiInput, { value: form.competitors, onChange: value => patch('competitors', value), placeholder: 'B, C, D' })),
          h(CiField, { label: '目标人群', hint: '必填' },
            h(CiTextarea, { value: form.audience, onChange: value => patch('audience', value), rows: 2, placeholder: '18-30 岁，一二线城市，近 3 个月购买过即饮咖啡' })),
          h('div', { className: 'ci-row' },
            h(CiField, { label: '市场 / 区域' },
              h(CiInput, { value: form.markets, onChange: value => patch('markets', value), placeholder: '全国一至三线' })),
            h(CiField, { label: '调研方式' },
              h(CiSelect, { value: form.method, onChange: value => patch('method', value), options: ciMethods }))),
          h('div', { className: 'ci-row' },
            h(CiField, { label: '样本量', hint: activeType ? `默认 ${activeType.defaultN}` : '' },
              h(CiInput, { type: 'number', min: 50, max: 100000, value: form.sampleSize, onChange: value => patch('sampleSize', value), placeholder: activeType ? String(activeType.defaultN) : '800' })),
            h(CiField, { label: '配额要求', hint: '选填' },
              h(CiInput, { value: form.quotas, onChange: value => patch('quotas', value), placeholder: '一线 30% / 二线 40% / 三线 30%' }))),
          h('div', { className: 'ci-row' },
            h(CiField, { label: '项目周期', hint: '选填' },
              h(CiInput, { value: form.timeline, onChange: value => patch('timeline', value), placeholder: '2026-12 至 2027-01' })),
            h(CiField, { label: '预算', hint: '选填' },
              h(CiInput, { value: form.budget, onChange: value => patch('budget', value), placeholder: '8 万' })))),

        h(CiSection, { step: 4, title: '补充要求', sub: '选填；会影响题目与分析' },
          h(CiTextarea, {
            value: form.notes,
            onChange: value => patch('notes', value),
            rows: 3,
            placeholder: '例：需要和上一波对比；加一道校园场景题；去掉价格模块',
          })),

        h('div', { className: 'ci-form-actions' },
          h(CiBtn, { variant: 'primary', onClick: generate, loading: busy === 'generate' }, '生成方案'),
          h(CiBtn, { onClick: save, disabled: !project || busy === 'save', loading: busy === 'save' }, '保存到电脑'),
          h(CiBtn, { variant: 'ghost', onClick: reset }, '重置')),

        dirty && project ? h('div', { className: 'ci-form-msg ci-form-msg-ok' }, '参数已修改，重新生成后生效') : null,
        message ? h('div', { className: `ci-form-msg${message.level === 'ok' ? ' ci-form-msg-ok' : ''}` }, message.text) : null),

      h('div', { className: 'ci-preview' },
        loading
          ? h('div', { className: 'ci-empty' }, h('span', { className: 'ci-spinner' }), h('div', { className: 'ci-empty-text' }, '正在读取项目配置…'))
          : project
            ? h('div', null,
              h('div', { className: 'ci-tabs', role: 'tablist' }, tabs.map(item => h('button', {
                key: item.id,
                type: 'button',
                className: 'ci-tab',
                role: 'tab',
                'aria-selected': tab === item.id ? 'true' : 'false',
                onClick: () => setTab(item.id),
              }, item.label))),
              tab === 'brief' ? h(CiBriefView, { project }) : null,
              tab === 'questionnaire' ? h(CiQuestionnaireView, { project }) : null,
              tab === 'analysis' ? h(CiAnalysisView, { project }) : null,
              tab === 'sampling' ? h(CiSamplingView, { project }) : null,
              tab === 'files' ? h(CiFilesView, { project, saved, onSave: save, onReveal: reveal }) : null)
            : h('div', { className: 'ci-empty' },
              h('div', { className: 'ci-empty-title' }, '五分钟，把一次调研的骨架搭好'),
              h('div', { className: 'ci-empty-text' }, '左边填目标、类型、品类、品牌、人群与样本；点「生成方案」后，这里会出现问卷、分析框架和抽样配额。Word 与 Excel 在点「保存到电脑」后生成。'),
              h(CiBtn, { variant: 'primary', onClick: fillExample }, '先看一个示例')))))
}

/** 侧栏图标：放大镜 + 数据柱。 */
function PanelIcon(props) {
  const size = props?.size || 18
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    style: { display: 'block' },
  },
  h('circle', { cx: 10.5, cy: 10.5, r: 6.3 }),
  h('path', { d: 'M15.2 15.2 21 21' }),
  h('path', { d: 'M7.8 12.2v-1.6M10.5 12.2V8.4M13.2 12.2V9.8' }))
}

// ---- src/main.js ----
/* ============================================================
 * src/main.js — 客户端注册
 * 只做两件事：注册整页主面板（key 与侧栏 id 相同）和侧栏图标入口。
 * 与 panel-styles.js / panel-ui.js / panel.js 共用一个工厂作用域。
 * ============================================================ */

/** 需要的客户端服务。 */
const inject = ['slots']

/**
 * 注册主面板与侧栏入口。
 * @param {object} ctx 客户端根上下文
 * @returns {void}
 */
function ciApply(ctx) {
  ctx.slots.inject('main', function () {
    return ctx.slots.register(
      { name: 'main', key: 'consumer-insight' },
      ConsumerInsightPanel
    )
  })
  ctx.effect(function () {
    return ctx.slots.inject('sidebar.panellist', function () {
      return ctx.slots.register(
        {
          name: 'sidebar.panellist',
          id: 'consumer-insight',
          order: 8,
          label: function () { return '消费者洞察' },
        },
        PanelIcon
      )
    })
  }, 'consumer-insight: sidebar entry')
}

    return { inject, apply: ciApply, __test: { ConsumerInsightPanel, PanelIcon, CiBriefView, CiQuestionnaireView, CiAnalysisView, CiSamplingView, CiFilesView } }
  },
})
