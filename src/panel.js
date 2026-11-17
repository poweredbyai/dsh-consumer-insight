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
