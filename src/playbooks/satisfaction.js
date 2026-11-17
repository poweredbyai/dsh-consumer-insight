/**
 * 用户满意度标准件（playbook）
 *
 * 口径与品牌追踪的 B7 对齐：CSAT 取 9-10（10 级量表 T2B），NPS 用 0-10。
 * 适用于快消品的「现有用户满意度 / 客户体验」研究。
 */

export const satisfaction = {
  id: 'satisfaction',
  name: '用户满意度',
  subtitle: 'CSAT / NPS / 触点体验与驱动因素',
  whenToUse: [
    '满意度连续下滑，需要定位是产品、价格、渠道还是服务的问题',
    '要一份可执行的改进优先级（哪个维度先改、改到什么程度）',
    '要按客群/渠道/城市拆开看体验差异',
  ],
  notFor: [
    '要看品牌认知与竞争格局 → 用「品牌追踪」',
    '要挖品类使用场景与需求 → 用 U&A',
    '要测新品概念 → 用概念测试',
  ],
  defaultN: 600,
  loiMinutes: 16,
  durationLimit: 18,
  openLimit: 5,
  incidence: 0.35,
  responseRate: 0.15,
  cpi: 50,
  audienceBands: ['18-24', '25-30', '31-35', '36-45'],

  modules: [
    {
      code: 'C0',
      name: '筛选',
      purpose: '确认是{{主品牌}}的真实用户，并排除行业与近期调研参与者',
      questions: [
        {
          id: 'C0.1', type: 'single', required: true, base: '全部接触样本',
          text: '过去 3 个月，你是否购买或使用过{{品类}}？',
          options: [{ code: 1, label: '是' }, { code: 2, label: '否' }],
          routing: '选 2 → 终止访问',
          note: '终止原因要记录，用于算 incidence',
        },
        {
          id: 'C0.2', type: 'single', required: true, base: '过去 3 个月使用过品类者',
          text: '过去 3 个月，你使用最多的是哪个品牌？',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '记不清 / 其他品牌' }],
          routing: '未选{{主品牌}} → 终止访问',
          note: '满意度只测本品牌用户；如需竞品对标，另开竞品配额并单独报告',
        },
        {
          id: 'C0.3', type: 'single', required: true, base: '全部接触样本',
          text: '你的年龄是？',
          options: [
            { code: 1, label: '18 岁以下' }, { code: 2, label: '18-24 岁' },
            { code: 3, label: '25-30 岁' }, { code: 4, label: '31-35 岁' },
            { code: 5, label: '36-45 岁' }, { code: 6, label: '46-55 岁' },
            { code: 7, label: '56 岁及以上' },
          ],
          routing: '按目标人群设终止',
          note: '配额项',
        },
        {
          id: 'C0.4', type: 'single', required: true, base: '全部接触样本',
          text: '你的性别是？',
          options: [{ code: 1, label: '男' }, { code: 2, label: '女' }, { code: 3, label: '不便回答' }],
          note: '配额项',
        },
        {
          id: 'C0.5', type: 'single', required: true, base: '全部接触样本',
          text: '你目前常住的城市属于？',
          options: [
            { code: 1, label: '一线城市（北上广深）' },
            { code: 2, label: '新一线 / 二线城市' },
            { code: 3, label: '三线及以下城市' },
          ],
          note: '配额项；与样本框口径一致',
        },
        {
          id: 'C0.6', type: 'single', required: true, base: '全部接触样本',
          text: '你或你的直系亲属，是否在以下行业工作？',
          options: [
            { code: 1, label: '市场研究 / 咨询公司' },
            { code: 2, label: '广告 / 公关 / 媒体' },
            { code: 3, label: '{{品类}}的生产或销售企业' },
            { code: 4, label: '以上都没有' },
          ],
          routing: '选 1-3 → 终止访问',
        },
        {
          id: 'C0.7', type: 'single', required: true, base: '全部接触样本',
          text: '过去 3 个月，你是否参加过任何形式的市场调研？',
          options: [{ code: 1, label: '是' }, { code: 2, label: '否' }],
          routing: '选 1 → 终止访问',
        },
      ],
    },
    {
      code: 'C1',
      name: '使用背景',
      purpose: '为后续分群与触点差异化分析提供分母',
      questions: [
        {
          id: 'C1.1', type: 'single', required: true, base: '合格受访者',
          text: '你最近一次购买{{主品牌}}是什么时候？',
          options: [
            { code: 1, label: '1 周内' }, { code: 2, label: '2-4 周内' },
            { code: 3, label: '1-2 个月前' }, { code: 4, label: '2-3 个月前' },
          ],
          note: '最近一次锚点，后续触点题都以此为准',
        },
        {
          id: 'C1.2', type: 'multi', required: true, base: '合格受访者', randomize: 'options',
          text: '你最近一次是在哪里购买的？',
          options: [
            { code: 1, label: '大型商超' }, { code: 2, label: '便利店' },
            { code: 3, label: '传统小店' }, { code: 4, label: '电商平台' },
            { code: 5, label: '即时零售 / 到家' }, { code: 6, label: '会员店 / 折扣店' },
            { code: 7, label: '自动售货机' }, { code: 98, label: '其他（请注明）' },
          ],
          note: '与品牌追踪 B1.2 口径保持一致，便于跨研究对比',
        },
        {
          id: 'C1.3', type: 'single', required: true, base: '合格受访者',
          text: '你购买的是哪个规格 / 包装？',
          options: [
            { code: 1, label: '单份 / 小包装' }, { code: 2, label: '常规装' },
            { code: 3, label: '家庭装 / 多连包' }, { code: 4, label: '分享装 / 大瓶' },
            { code: 98, label: '其他（请注明）' },
          ],
        },
        {
          id: 'C1.4', type: 'single', required: true, base: '合格受访者',
          text: '过去 4 周，你使用{{主品牌}}的频率是？',
          options: [
            { code: 1, label: '每天 1 次及以上' }, { code: 2, label: '每周 3-5 次' },
            { code: 3, label: '每周 1-2 次' }, { code: 4, label: '少于每周 1 次' },
          ],
        },
        {
          id: 'C1.5', type: 'multi', required: true, base: '合格受访者', randomize: 'options',
          text: '你通常在什么场合使用{{主品牌}}？（多选）',
          options: [
            { code: 1, label: '早餐' }, { code: 2, label: '上午工作 / 学习' },
            { code: 3, label: '午餐后' }, { code: 4, label: '下午提神' },
            { code: 5, label: '晚餐 / 夜宵' }, { code: 6, label: '通勤 / 出行' },
            { code: 7, label: '运动前后' }, { code: 8, label: '社交 / 聚会' },
            { code: 9, label: '宅家休闲' }, { code: 98, label: '其他（请注明）' },
          ],
        },
      ],
    },
    {
      code: 'C2',
      name: '整体满意度',
      purpose: '总指标，以及和期望的对比',
      questions: [
        {
          id: 'C2.1', type: 'scale', required: true, base: '合格受访者',
          text: '总体而言，你对{{主品牌}}的满意程度是？（1=非常不满意，10=非常满意）',
          scale: { min: 1, max: 10, minLabel: '非常不满意', maxLabel: '非常满意' },
          note: 'CSAT T2B = 9-10 占比；同时保留 1-10 均值，便于做驱动分析',
        },
        {
          id: 'C2.2', type: 'single', required: true, base: '合格受访者',
          text: '和你的期望相比，{{主品牌}}的表现是？',
          options: [
            { code: 1, label: '远低于期望' }, { code: 2, label: '略低于期望' },
            { code: 3, label: '基本符合期望' }, { code: 4, label: '略高于期望' },
            { code: 5, label: '远高于期望' },
          ],
          note: '期望差（负值越多，说明承诺过高或交付不足）',
        },
        {
          id: 'C2.3', type: 'single', required: true, base: '合格受访者',
          text: '和 3 个月前相比，你觉得{{主品牌}}变好了还是变差了？',
          options: [
            { code: 1, label: '明显变差' }, { code: 2, label: '略有变差' },
            { code: 3, label: '没变化' }, { code: 4, label: '略有变好' },
            { code: 5, label: '明显变好' },
          ],
          note: '感知变化 × 实际满意度交叉，识别「感觉变差」的群体',
        },
      ],
    },
    {
      code: 'C3',
      name: '分维度满意度',
      purpose: '定位问题出在产品、包装、价格、还是可获得性',
      questions: [
        {
          id: 'C3.1', type: 'grid', required: true, base: '合格受访者', randomize: 'rows',
          text: '以下方面对你来说有多重要？（1=完全不重要，5=非常重要）',
          rows: [
            '口味 / 口感', '产品效果（提神/功能）', '成分与健康', '包装设计与便携',
            '价格是否合理', '促销力度', '购买是否方便', '货架/页面是否好找',
            '品牌是否值得信赖', '客服与售后',
          ],
          scale: { min: 1, max: 5, minLabel: '完全不重要', maxLabel: '非常重要' },
          note: '重要性题必须先问；与 C3.2 的表现题分开，才能做 IPA 矩阵',
        },
        {
          id: 'C3.2', type: 'grid', required: true, base: '合格受访者', randomize: 'rows',
          text: '{{主品牌}}在以下方面表现如何？（1=很差，5=很好）',
          rows: [
            '口味 / 口感', '产品效果（提神/功能）', '成分与健康', '包装设计与便携',
            '价格是否合理', '促销力度', '购买是否方便', '货架/页面是否好找',
            '品牌是否值得信赖', '客服与售后',
          ],
          scale: { min: 1, max: 5, minLabel: '很差', maxLabel: '很好' },
          note: '维度必须与 C3.1 一一对应，顺序一致',
        },
        {
          id: 'C3.3', type: 'single', required: true, base: '合格受访者',
          text: '以上方面中，你最满意的是哪一个？',
          options: 'C3_ROWS',
          note: '选项取自 C3.1 的维度；只显示受访者评过的维度',
        },
        {
          id: 'C3.4', type: 'single', required: true, base: '合格受访者',
          text: '以上方面中，你认为最需要改进的是哪一个？',
          options: 'C3_ROWS',
          note: '与 C3.3 互斥检查：不能同时选同一项（软提示即可）',
        },
        {
          id: 'C3.5', type: 'grid', required: true, base: '合格受访者', randomize: 'rows',
          text: '就产品本身，请评价以下方面（1=很差，5=很好）',
          rows: ['口味浓郁度', '口感顺滑度', '新鲜度 / 保质期', '份量是否合适'],
          scale: { min: 1, max: 5, minLabel: '很差', maxLabel: '很好' },
          note: '产品细项用于研发沟通，可按客户产品特性替换',
        },
        {
          id: 'C3.6', type: 'grid', required: true, base: '合格受访者', randomize: 'rows',
          text: '就包装，请评价以下方面（1=很差，5=很好）',
          rows: ['外观设计', '便携性', '密封 / 保鲜', '信息是否清晰'],
          scale: { min: 1, max: 5, minLabel: '很差', maxLabel: '很好' },
        },
        {
          id: 'C3.7', type: 'open', required: false, base: '合格受访者',
          text: '如果只能改一个地方，你最希望{{主品牌}}改什么？',
          note: '开放题，编码后与 C3.4 交叉验证',
        },
      ],
    },
    {
      code: 'C4',
      name: '触点体验',
      purpose: '把满意度落到具体触点上，找出最痛的一步',
      questions: [
        {
          id: 'C4.1', type: 'multi', required: true, base: '合格受访者', randomize: 'options',
          text: '最近一次购买{{主品牌}}的过程中，你接触过以下哪些环节？（多选）',
          options: [
            { code: 1, label: '看到广告 / 种草内容' }, { code: 2, label: '在货架或页面上找产品' },
            { code: 3, label: '比价 / 看评价' }, { code: 4, label: '下单 / 结账' },
            { code: 5, label: '收货 / 提货' }, { code: 6, label: '开箱 / 第一次使用' },
            { code: 7, label: '遇到问题找客服' }, { code: 8, label: '复购 / 再次购买' },
          ],
          note: '触点清单要与客户实际旅程一致；后续只对选中的触点提问',
        },
        {
          id: 'C4.2', type: 'grid', required: true, base: 'C4.1 选中的触点（按触点单独 base）', randomize: 'rows',
          text: '请评价以下环节的体验（1=非常差，5=非常好）',
          rows: 'C4_TOUCHPOINTS',
          scale: { min: 1, max: 5, minLabel: '非常差', maxLabel: '非常好' },
          routing: '只显示 C4.1 选中的环节',
          note: '每个触点单独 base；未经历的触点不显示',
        },
        {
          id: 'C4.3', type: 'grid', required: true, base: 'C4.1 选中的触点（按触点单独 base）', randomize: 'rows',
          text: '在这些环节上，你觉得费劲吗？（1=非常轻松，5=非常费劲）',
          rows: 'C4_TOUCHPOINTS',
          scale: { min: 1, max: 5, minLabel: '非常轻松', maxLabel: '非常费劲' },
          note: 'CES（客户费力度）；「非常费劲」比例是最直观的痛点指标',
        },
        {
          id: 'C4.4', type: 'single', required: true, base: 'C4.1 至少选中 1 个触点者',
          text: '整个过程中，最让你不舒服的是哪个环节？',
          options: 'C4_TOUCHPOINTS',
          note: '与 C4.2/C4.3 交叉验证：评分最低的触点是否被点名',
        },
        {
          id: 'C4.5', type: 'open', required: false, base: 'C4.4 有选择者',
          text: '能具体说说那个环节发生了什么吗？',
          note: '原话是改进清单里最有用的材料，编码前先保留原文',
        },
        {
          id: 'C4.6', type: 'single', required: true, base: '合格受访者',
          text: '最近一次购买过程中，你有没有遇到问题？',
          options: [{ code: 1, label: '遇到了，已解决' }, { code: 2, label: '遇到了，没解决' }, { code: 3, label: '没遇到问题' }],
          routing: '选 3 → 跳过 C4.7',
        },
        {
          id: 'C4.7', type: 'scale', required: false, base: '最近一次遇到问题者',
          text: '问题处理得怎么样？（1=非常不满意，5=非常满意）',
          scale: { min: 1, max: 5, minLabel: '非常不满意', maxLabel: '非常满意' },
        },
      ],
    },
    {
      code: 'C5',
      name: 'NPS',
      purpose: '推荐意愿与原因',
      questions: [
        {
          id: 'C5.1', type: 'scale', required: true, base: '合格受访者',
          text: '你有多大可能向朋友或同事推荐{{主品牌}}？（0=完全不会，10=非常愿意）',
          scale: { min: 0, max: 10, minLabel: '完全不会', maxLabel: '非常愿意' },
          note: 'NPS = 推荐者(9-10)% − 贬损者(0-6)%；7-8 为中立者',
        },
        {
          id: 'C5.2', type: 'open', required: false, base: '合格受访者',
          text: '你给出这个分数的原因是？',
          note: '必留；编码后按推荐者/中立/贬损者三组分别出词频',
        },
      ],
    },
    {
      code: 'C6',
      name: '忠诚与复购',
      purpose: '把满意度翻译成商业结果',
      questions: [
        {
          id: 'C6.1', type: 'single', required: true, base: '合格受访者',
          text: '未来 3 个月，你继续购买{{主品牌}}的可能性是？',
          options: [
            { code: 1, label: '一定会继续买' }, { code: 2, label: '大概率会' },
            { code: 3, label: '可能会，也可能不会' }, { code: 4, label: '大概率不会' },
            { code: 5, label: '一定不会' },
          ],
        },
        {
          id: 'C6.2', type: 'single', required: true, base: '合格受访者',
          text: '如果{{主品牌}}涨价 10%，你还会买吗？',
          options: [
            { code: 1, label: '照买不误' }, { code: 2, label: '会买，但会少买' },
            { code: 3, label: '会换别的品牌' }, { code: 4, label: '不买了' },
          ],
          note: '价格容忍度，配合 B8 类的价格感知一起看',
        },
        {
          id: 'C6.3', type: 'multi', required: true, base: '合格受访者', randomize: 'brands',
          text: '如果买不到{{主品牌}}，你会改买哪些品牌？（多选）',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '不买了 / 换品类' }],
          note: '替代品牌清单 = 竞争威胁排序',
        },
        {
          id: 'C6.4', type: 'single', required: true, base: '合格受访者',
          text: '过去 3 个月，你有没有向别人推荐过{{主品牌}}？',
          options: [
            { code: 1, label: '推荐过 3 次及以上' }, { code: 2, label: '推荐过 1-2 次' },
            { code: 3, label: '没有推荐过' }, { code: 4, label: '劝别人别买' },
          ],
          note: '行为题，与 C5.1 的意愿题对照，识别「高意愿低行为」',
        },
      ],
    },
    {
      code: 'C7',
      name: '问题与投诉',
      purpose: '把显性问题与沉默的不满分开',
      questions: [
        {
          id: 'C7.1', type: 'multi', required: true, base: '合格受访者', randomize: 'options',
          text: '过去 3 个月，使用{{主品牌}}时你遇到过以下哪些情况？（多选）',
          options: [
            { code: 1, label: '口味/口感不稳定' }, { code: 2, label: '包装破损 / 漏液' },
            { code: 3, label: '临近保质期' }, { code: 4, label: '份量变少' },
            { code: 5, label: '价格变动大' }, { code: 6, label: '买不到 / 缺货' },
            { code: 7, label: '客服响应慢' }, { code: 99, label: '都没遇到' },
          ],
          note: '「都没遇到」固定末位且互斥；选项来自客诉数据更佳',
        },
        {
          id: 'C7.2', type: 'single', required: false, base: 'C7.1 遇到问题者',
          text: '遇到问题后，你有没有向品牌反馈？',
          options: [
            { code: 1, label: '反馈了，问题解决' }, { code: 2, label: '反馈了，没解决' },
            { code: 3, label: '没反馈，自己忍了' }, { code: 4, label: '没反馈，直接换品牌' },
          ],
          note: '「没反馈」比例是沉默流失的先行指标',
        },
        {
          id: 'C7.3', type: 'open', required: false, base: 'C7.1 遇到问题者',
          text: '那次经历大概是怎样的？',
        },
      ],
    },
    {
      code: 'C8',
      name: '开放题',
      purpose: '收口：让受访者用自己的话说一遍',
      questions: [
        {
          id: 'C8.1', type: 'open', required: false, base: '合格受访者',
          text: '如果让你对{{主品牌}}说一句话，你会说什么？',
          note: '开放题控制在 3 道以内，否则完成率会掉',
        },
        {
          id: 'C8.2', type: 'single', required: true, base: '合格受访者',
          text: '你的个人月收入是？',
          options: [
            { code: 1, label: '3000 元以下' }, { code: 2, label: '3000-5999 元' },
            { code: 3, label: '6000-9999 元' }, { code: 4, label: '10000-14999 元' },
            { code: 5, label: '15000-19999 元' }, { code: 6, label: '20000 元及以上' },
            { code: 9, label: '不愿透露' },
          ],
          note: '放在最后，减少敏感题造成的流失',
        },
      ],
    },
  ],

  kpis: [
    {
      id: 'csat', name: 'CSAT（整体满意度 T2B）', base: '合格受访者',
      definition: 'C2.1 打 9-10 分的比例',
      formula: 'CSAT T2B = C2.1 中 9-10 分人数 / 合格样本',
      compare: '与上期、目标值比较；同时看 1-10 均值',
    },
    {
      id: 'csat_mean', name: '满意度均值', base: '合格受访者',
      definition: 'C2.1 的算术均值（1-10）',
      formula: 'mean(C2.1)',
      compare: '上期对比；驱动分析的因变量',
    },
    {
      id: 'nps', name: 'NPS', base: '合格受访者',
      definition: '推荐者（9-10）减贬损者（0-6）',
      formula: 'NPS = P(9-10) − P(0-6)',
      compare: '与上期、竞品、行业基准（需标注来源）比较',
    },
    {
      id: 'ces', name: 'CES（费力度）', base: '经历对应触点者',
      definition: 'C4.3 各触点打 4-5 分（费劲）的比例',
      formula: 'CES 高费力比例 = C4.3 ≥4 分人数 / 该触点 base',
      compare: '触点之间横向比较，找出最费劲的一步',
    },
    {
      id: 'dim_score', name: '分维度满意度', base: '合格受访者',
      definition: 'C3.2 各维度 4-5 分比例与均值',
      formula: '维度 T2B = C3.2 该维度 ≥4 分人数 / 合格样本',
      compare: '与上期比较；维度之间比较',
    },
    {
      id: 'gap', name: '期望差', base: '合格受访者',
      definition: 'C2.2 中「低于期望」的比例',
      formula: '期望差 = C2.2 选 1-2 人数 / 合格样本',
      compare: '>30% 说明承诺与交付脱节',
    },
    {
      id: 'repurchase', name: '复购意向', base: '合格受访者',
      definition: 'C6.1 选 1-2（会继续买）的比例',
      formula: '复购意向 = C6.1 选 1-2 人数 / 合格样本',
      compare: '与 CSAT/NPS 对照，看满意度是否转化为生意',
    },
    {
      id: 'silent', name: '沉默不满率', base: '遇到问题者',
      definition: 'C7.2 中「没反馈」的比例',
      formula: '沉默不满 = C7.2 选 3-4 人数 / 遇到问题人数',
      compare: '与客诉量对照，识别未被听见的问题',
    },
  ],

  analysis: {
    trace: [
      {
        decision: '满意度下滑是全局还是局部',
        question: '整体满意度、NPS、复购意向是否同步下滑；下滑集中在哪些人群',
        metric: 'CSAT、NPS、复购意向',
        items: ['C2.1', 'C5.1', 'C6.1'],
        output: '满意度趋势图 + 分群对比',
      },
      {
        decision: '先改产品、包装、价格还是渠道',
        question: '各维度的表现与重要性，哪些是「重要但没做好」',
        metric: '维度表现 T2B、重要性均值、IPA 象限',
        items: ['C3.1', 'C3.2'],
        output: '重要性-表现矩阵（IPA）',
      },
      {
        decision: '哪个触点最该投入',
        question: '各触点的满意度与费力度，问题集中在哪一步',
        metric: '触点满意度、CES、最不适触点提及率',
        items: ['C4.2', 'C4.3', 'C4.4'],
        output: '触点热力图 + 痛点 Pareto',
      },
      {
        decision: '满意度对复购的驱动有多强',
        question: '分维度满意度中，哪些真正影响复购/NPS',
        metric: '驱动因子相对重要性',
        items: ['C3.2', 'C6.1', 'C5.1'],
        output: 'Shapley 驱动排序图',
      },
      {
        decision: '流失风险有多大',
        question: '哪些人可能换品牌、会换到谁',
        metric: '换牌意向、替代品牌分布',
        items: ['C6.2', 'C6.3', 'C3.4'],
        output: '流失风险分层 + 替代品牌排序',
      },
      {
        decision: '客诉处理是否有效',
        question: '遇到问题的人是否反馈、是否解决',
        metric: '问题发生率、反馈率、解决率、沉默不满率',
        items: ['C7.1', 'C7.2'],
        output: '问题漏斗 + 问题类型 Pareto',
      },
      {
        decision: '开放题里有没有没被结构化题覆盖的问题',
        question: '受访者主动提到的高频词与场景',
        metric: '开放题编码频次',
        items: ['C3.7', 'C4.5', 'C8.1'],
        output: '开放题编码表 + 词频图',
      },
    ],
    banners: [
      { name: '城市级别', levels: '一线 / 新一线二线 / 三线及以下', note: '配额维度' },
      { name: '性别', levels: '男 / 女', note: '配额维度' },
      { name: '年龄', levels: '18-24 / 25-30 / 31-35 / 36-45', note: '配额维度' },
      { name: '使用频次', levels: '高频 / 中频 / 低频', note: '由 C1.4 合并' },
      { name: '购买渠道', levels: '线上 / 线下 / 两者都有', note: '由 C1.2 合并' },
      { name: '主用规格', levels: '小包装 / 常规 / 家庭装', note: '由 C1.3 合并' },
    ],
    crosstabs: [
      { rows: 'CSAT / NPS / 复购意向', cols: '城市级别 × 使用频次', test: '比例 z 检验（95%，双尾）', minBase: 100 },
      { rows: '分维度满意度', cols: '购买渠道', test: '均值 t 检验', minBase: 50 },
      { rows: '触点满意度 & CES', cols: '年龄', test: '均值 t 检验', minBase: 50 },
      { rows: '问题发生率', cols: '主用规格 / 渠道', test: '比例 z 检验', minBase: 50 },
      { rows: 'NPS 三组结构', cols: '满意度分层', test: '交叉分布', minBase: 50 },
    ],
    models: [
      {
        name: '满意度驱动（Key Driver）', method: 'Shapley 值分解 / 相对权重分析',
        input: '因变量：C2.1 整体满意度；自变量：C3.2 各维度评分',
        output: '各维度对整体满意度的贡献占比',
        note: '维度间相关高时用 Shapley 比回归系数稳；样本 ≥ 300',
      },
      {
        name: '复购/NPS 驱动', method: 'Logistic 回归',
        input: '因变量：C6.1 是否高复购意向 / C5.1 是否推荐者；自变量：维度评分 + 触点评分',
        output: '哪些因素把人推向高忠诚',
        note: '与满意度驱动结果对照，找出「满意但不复购」的断点',
      },
      {
        name: '重要性-表现矩阵（IPA）', method: '象限分析',
        input: 'C3.1 重要性均值 × C3.2 表现均值',
        output: '四象限：优先改进 / 保持 / 过度投入 / 低优先',
        note: '象限分界线用整体均值，不用固定 3 分',
      },
      {
        name: '触点旅程图', method: '阶段均值 + 情绪曲线',
        input: 'C4.2 / C4.3 各触点均值',
        output: '旅程满意度曲线与费力度曲线',
        note: '触点顺序按客户实际旅程排列，不按问卷顺序',
      },
    ],
    charts: [
      { no: '图 1', title: '满意度与 NPS 趋势', type: '折线图 + 柱状图', source: 'C2.1 / C5.1 × 期次', base: '合格受访者', takeaway: '整体是否在恶化' },
      { no: '图 2', title: '分维度表现', type: '条形图', source: 'C3.2', base: '合格受访者', takeaway: '最弱的三项' },
      { no: '图 3', title: '重要性-表现矩阵', type: '四象限散点图', source: 'C3.1 × C3.2', base: '合格受访者', takeaway: '优先改进项' },
      { no: '图 4', title: '触点满意度与费力度', type: '双轴条形图', source: 'C4.2 / C4.3', base: '经历该触点者', takeaway: '最痛的一步' },
      { no: '图 5', title: 'NPS 三组结构', type: '堆叠条形图', source: 'C5.1', base: '合格受访者', takeaway: '贬损者占比与原因' },
      { no: '图 6', title: '驱动因子排序', type: '横向条形图（Shapley）', source: 'C3.2 → C2.1', base: '合格受访者', takeaway: '改哪个维度收益最大' },
      { no: '图 7', title: '问题 Pareto', type: '帕累托图', source: 'C7.1', base: '合格受访者', takeaway: '前 3 类问题' },
      { no: '图 8', title: '开放题词频', type: '词云 / 条形图', source: 'C3.7 / C4.5 / C8.1', base: '答题者', takeaway: '未被结构化题覆盖的议题' },
    ],
    outline: [
      { chapter: '执行摘要', content: '一句话结论 + 三个优先动作 + 关键数字' },
      { chapter: '研究说明', content: '样本结构、方法、口径（CSAT/NPS/CES 定义）' },
      { chapter: '整体满意度', content: 'CSAT、NPS、期望差、趋势（图 1、图 5）' },
      { chapter: '问题出在哪', content: '分维度表现、IPA、驱动排序（图 2-3、图 6）' },
      { chapter: '触点体验', content: '触点满意度、费力度、最痛环节（图 4）' },
      { chapter: '流失风险', content: '换牌意向、替代品牌、涨价容忍' },
      { chapter: '问题与客诉', content: '问题发生率、反馈与解决、沉默不满（图 7）' },
      { chapter: '改进建议', content: '按「马上改 / 一个季度内 / 需要更多验证」分层，每条带预期影响' },
      { chapter: '附录', content: '问卷、样本结构、码表、开放题编码表' },
    ],
    dataSpec: [
      { item: '变量命名', rule: 'q_ + 题号去掉点，如 C2.1 → q_C2_1；网格题按维度拆列 q_C3_2_1…' },
      { item: '缺失值', rule: '-9 未回答；-8 不适用（跳转未问）；-7 拒答' },
      { item: '加权变量', rule: 'wgt：按城市 × 性别 × 年龄 联合分布加权；权重截断 0.3-3.0' },
      { item: '开放题编码', rule: '按问题类型/原因/建议三套编码表；保留原文' },
      { item: '显著性标记', rule: '95% 双尾；与整体或上期比，用 A/B/C 上标' },
      { item: '交付格式', rule: 'SPSS .sav + Excel 交叉表 + 原始码表' },
    ],
  },

  sampling: {
    strategy: 'mixed',
    minCell: 15,
    minMarginal: { tier: 100, gender: 150, age: 100 },
    dims: [
      {
        key: 'tier', name: '城市级别',
        levels: [
          { code: 'T1', label: '一线城市', share: 0.30 },
          { code: 'T2', label: '新一线 / 二线', share: 0.40 },
          { code: 'T3', label: '三线及以下', share: 0.30 },
        ],
      },
      {
        key: 'gender', name: '性别', levels: [
          { code: 'M', label: '男', share: 0.45 },
          { code: 'F', label: '女', share: 0.55 },
        ],
      },
      {
        key: 'age', name: '年龄', levels: [
          { code: 'A1', label: '18-24 岁', share: 0.30 },
          { code: 'A2', label: '25-30 岁', share: 0.30 },
          { code: 'A3', label: '31-35 岁', share: 0.25 },
          { code: 'A4', label: '36-45 岁', share: 0.15 },
        ],
      },
    ],
    alternatives: [
      {
        key: 'proportional', name: '方案 A · 比例分配',
        desc: '完全按用户结构分配，代表性最好',
        rule: '城市 30/40/30，年龄 30/30/25/15',
        bestFor: '看整体满意度水平、和上期对比',
        risk: '36-45 岁、三线样本偏少，单独下结论不稳',
      },
      {
        key: 'equal', name: '方案 B · 关键分组等分',
        desc: '各城市级别、各年龄段样本尽量相等',
        rule: '城市等分、年龄等分，性别 50/50',
        bestFor: '要做人群之间的体验比较',
        risk: '与用户结构不符，必须加权',
      },
      {
        key: 'mixed', name: '方案 C · 比例 + 保底（推荐）',
        desc: '按用户结构为主，给核心人群与关键触点设最低样本',
        rule: '以比例分配为主，把每个交叉格抬到 20 以上，核心人群与低线不会被压到个位数',
        bestFor: '大多数满意度项目',
        risk: '加权系数波动，报告中说明',
      },
    ],
    weighting: '按城市级别 × 性别 × 年龄 联合分布做 rim weighting；权重截断 0.3-3.0，报告有效样本。',
  },

  pitfalls: [
    '只问表现不问重要性：无法判断「该先改哪个」',
    '10 级量表算 CSAT 却用 T3B：口径要和历史数据一致，改口径必须说明',
    'NPS 原因题缺失：只剩一个数字，没有改进线索',
    '触点题问受访者没经历过的环节：base 混乱、数据不可用',
    '开放题超过 3 道：完成率下降，且编码成本高',
    '把「满意」当「忠诚」：满意度高但复购低，是两件事',
    '样本只覆盖单一渠道：线上用户的满意度不代表全渠道',
  ],
}

