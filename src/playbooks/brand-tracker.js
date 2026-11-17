/**
 * 品牌追踪标准件（playbook）
 *
 * 一份 playbook = 该类型调研的「标准模块 + 问题库 + 指标口径 + 分析框架 + 抽样建议」。
 * 生成器只做三件事：把 {{占位符}} 换成项目参数、按规则补编程说明、按时长/单元格做体检。
 *
 * 字段约定：
 *  - type: single | multi | scale | grid | open | numeric | rank
 *  - randomize: none | options | brands | rows
 *  - base: 该题的统计分母（写给人看，也会进码表）
 *  - note: 编程说明（给代理/编程同学）
 */

export const brandTracker = {
  id: 'brand-tracker',
  name: '品牌追踪',
  subtitle: '品牌健康度、竞争格局与传播效果',
  whenToUse: [
    '按季度/半年固定波次，跟踪品牌认知、考虑、使用与形象的变化',
    '评估一轮传播/新品/渠道动作之后，品牌健康度是否改善',
    '需要和竞品放在同一把尺子上比较',
  ],
  notFor: [
    '只想问一次满意度、不打算做波次对比 → 用「用户满意度」',
    '要挖品类使用场景与需求缺口 → 用 U&A',
    '要判断单个概念/新品能不能上 → 用概念测试',
  ],
  defaultN: 800,
  loiMinutes: 22,
  durationLimit: 25,
  openLimit: 6,
  incidence: 0.55,
  responseRate: 0.15,
  cpi: 45,
  audienceBands: ['18-24', '25-30', '31-35', '36-45'],

  modules: [
    {
      code: 'B0',
      name: '筛选',
      purpose: '确认品类资格、行为资格，排除行业与近期调研参与者',
      questions: [
        {
          id: 'B0.1', type: 'single', required: true, base: '全部接触样本',
          text: '过去 3 个月，你本人是否购买或饮用过{{品类}}？',
          options: [{ code: 1, label: '是' }, { code: 2, label: '否' }],
          routing: '选 2 → 终止访问',
          note: '终止页需记录终止原因，用于计算 incidence',
        },
        {
          id: 'B0.2', type: 'single', required: true, base: '全部接触样本',
          text: '在{{品类}}的选择和购买上，你通常扮演什么角色？',
          options: [
            { code: 1, label: '我主要决定买哪个品牌' },
            { code: 2, label: '我和别人一起决定' },
            { code: 3, label: '我基本不参与决定' },
          ],
          routing: '选 3 → 终止访问',
          note: '只保留对品牌选择有影响力的人',
        },
        {
          id: 'B0.3', type: 'single', required: true, base: '全部接触样本',
          text: '你的年龄是？',
          options: [
            { code: 1, label: '18 岁以下' }, { code: 2, label: '18-24 岁' },
            { code: 3, label: '25-30 岁' }, { code: 4, label: '31-35 岁' },
            { code: 5, label: '36-45 岁' }, { code: 6, label: '46-55 岁' },
            { code: 7, label: '56 岁及以上' },
          ],
          routing: '18 岁以下、46 岁及以上 → 终止（按目标人群调整）',
          note: '配额按目标人群设定，超出目标年龄段直接终止',
        },
        {
          id: 'B0.4', type: 'single', required: true, base: '全部接触样本',
          text: '你的性别是？',
          options: [{ code: 1, label: '男' }, { code: 2, label: '女' }, { code: 3, label: '不便回答' }],
          note: '配额项；不便回答单列，不并入任一性别',
        },
        {
          id: 'B0.5', type: 'single', required: true, base: '全部接触样本',
          text: '你目前常住的城市属于？',
          options: [
            { code: 1, label: '一线城市（北上广深）' },
            { code: 2, label: '新一线 / 二线城市' },
            { code: 3, label: '三线及以下城市' },
          ],
          note: '配额项；与样本框的城市分级口径保持一致',
        },
        {
          id: 'B0.6', type: 'single', required: true, base: '全部接触样本',
          text: '你或你的直系亲属，是否在以下行业工作？',
          options: [
            { code: 1, label: '市场研究 / 咨询公司' },
            { code: 2, label: '广告 / 公关 / 媒体' },
            { code: 3, label: '{{品类}}的生产或销售企业' },
            { code: 4, label: '以上都没有' },
          ],
          routing: '选 1-3 → 终止访问',
          note: '行业排除是数据质量的第一道闸',
        },
        {
          id: 'B0.7', type: 'single', required: true, base: '全部接触样本',
          text: '过去 3 个月，你是否参加过任何形式的市场调研（电话、问卷、座谈、访问）？',
          options: [{ code: 1, label: '是' }, { code: 2, label: '否' }],
          routing: '选 1 → 终止访问',
          note: '近期调研参与者会带职业受访者偏差',
        },
      ],
    },
    {
      code: 'B1',
      name: '品类与购物行为',
      purpose: '建立品类的购买、渠道与场合基本盘，作为后续分群的分母',
      questions: [
        {
          id: 'B1.1', type: 'single', required: true, base: '全部合格受访者',
          text: '过去 3 个月，你购买{{品类}}的频率是？',
          options: [
            { code: 1, label: '每周 2 次及以上' }, { code: 2, label: '每周 1 次' },
            { code: 3, label: '每两周 1 次' }, { code: 4, label: '每月 1 次' },
            { code: 5, label: '少于每月 1 次' },
          ],
          note: '频次是后续分群与加权的重要变量',
        },
        {
          id: 'B1.2', type: 'multi', required: true, base: '全部合格受访者', randomize: 'options',
          text: '你通常在哪些渠道购买{{品类}}？（多选）',
          options: [
            { code: 1, label: '大型商超' }, { code: 2, label: '便利店' },
            { code: 3, label: '传统小店 / 夫妻店' }, { code: 4, label: '电商平台' },
            { code: 5, label: '即时零售 / 到家平台' }, { code: 6, label: '会员店 / 折扣店' },
            { code: 7, label: '自动售货机' }, { code: 98, label: '其他（请注明）' },
          ],
          note: '渠道列表要与客户实际铺货渠道一致；「其他」固定末位',
        },
        {
          id: 'B1.3', type: 'multi', required: true, base: '全部合格受访者', randomize: 'options',
          text: '你常买哪些规格 / 包装？',
          options: [
            { code: 1, label: '单份 / 小包装' }, { code: 2, label: '常规装' },
            { code: 3, label: '家庭装 / 多连包' }, { code: 4, label: '分享装 / 大瓶' },
            { code: 98, label: '其他（请注明）' },
          ],
        },
        {
          id: 'B1.4', type: 'single', required: true, base: '全部合格受访者',
          text: '你每次购买{{品类}}大概花多少钱？',
          options: [
            { code: 1, label: '10 元以内' }, { code: 2, label: '10-20 元' },
            { code: 3, label: '21-30 元' }, { code: 4, label: '31-50 元' },
            { code: 5, label: '50 元以上' },
          ],
          note: '价格段与客户价盘对齐，客户有价盘表时直接替换选项',
        },
        {
          id: 'B1.5', type: 'multi', required: true, base: '全部合格受访者', randomize: 'options',
          text: '你在哪些场合会喝 / 吃{{品类}}？（多选）',
          options: [
            { code: 1, label: '早餐' }, { code: 2, label: '上午工作 / 学习' },
            { code: 3, label: '午餐后' }, { code: 4, label: '下午提神' },
            { code: 5, label: '晚餐 / 夜宵' }, { code: 6, label: '出行 / 通勤路上' },
            { code: 7, label: '运动前后' }, { code: 8, label: '社交 / 聚会' },
            { code: 9, label: '宅家休闲' }, { code: 98, label: '其他（请注明）' },
          ],
          note: '场合列表是 U&A 式增量机会分析的基础，别只留三个',
        },
        {
          id: 'B1.6', type: 'grid', required: true, base: '全部合格受访者', randomize: 'rows',
          text: '购买{{品类}}时，以下因素对你有多重要？（1=完全不重要，5=非常重要）',
          rows: [
            '口味 / 口感', '提神 / 功能效果', '价格实惠', '品牌知名度',
            '包装好看 / 便携', '成分健康', '促销力度', '购买方便',
            '朋友推荐 / 口碑', '品牌形象与我相符',
          ],
          scale: { min: 1, max: 5, minLabel: '完全不重要', maxLabel: '非常重要' },
          note: '重要性题必须独立于表现题，不能放在同一张网格里',
        },
      ],
    },
    {
      code: 'B2',
      name: '品牌认知',
      purpose: '先开放后提示，测量认知漏斗的最上层',
      questions: [
        {
          id: 'B2.1', type: 'open', required: true, base: '全部合格受访者',
          text: '提到{{品类}}，你第一个想到的品牌是？',
          note: '不提示、不朗读品牌；记录原文，编码时取首位提及 → TOMA',
        },
        {
          id: 'B2.2', type: 'open', required: false, base: '全部合格受访者',
          text: '除了刚才提到的，你还想到哪些{{品类}}品牌？',
          note: '多提及开放题，最多记录 5 个；与 B2.1 合并算提示前认知',
        },
        {
          id: 'B2.3', type: 'multi', required: true, base: '全部合格受访者', randomize: 'brands',
          text: '下面这些品牌，你听说过哪些？（多选）',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '以上都没听说过' }],
          note: '品牌顺序随机；「都没听说过」固定末位且与其他选项互斥',
        },
        {
          id: 'B2.4', type: 'scale', required: true, base: '知道{{主品牌}}的受访者',
          text: '你对{{主品牌}}的熟悉程度是？（1=只听说过名字，5=非常熟悉）',
          scale: { min: 1, max: 5, minLabel: '只听说过名字', maxLabel: '非常熟悉' },
          routing: '仅当 B2.3 选中{{主品牌}}时显示',
          note: '单品牌熟悉度；如客户需要竞品对比，改为按认知品牌循环',
        },
      ],
    },
    {
      code: 'B3',
      name: '考虑与偏好',
      purpose: '认知到考虑、考虑到首选的转化，以及背后的原因',
      questions: [
        {
          id: 'B3.1', type: 'multi', required: true, base: '全部合格受访者', randomize: 'brands',
          text: '如果今天要买{{品类}}，你会考虑哪些品牌？（多选）',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '以上都不会考虑' }],
          note: '与 B2.3 同一品牌列表，才能算「认知→考虑」转化',
        },
        {
          id: 'B3.2', type: 'single', required: true, base: 'B3.1 至少选中 1 个品牌者', randomize: 'options',
          text: '在这些你会考虑的品牌里，你最可能买哪一个？',
          options: 'CONSIDERED_BRANDS',
          note: '选项只显示 B3.1 选中的品牌；用于计算偏好份额',
        },
        {
          id: 'B3.3', type: 'multi', required: true, base: 'B3.1 至少选中 1 个品牌者', randomize: 'options',
          text: '你选择{{首选品牌}}的主要原因是？（多选，最多 3 项）',
          options: [
            { code: 1, label: '口味 / 口感好' }, { code: 2, label: '提神 / 效果明显' },
            { code: 3, label: '价格合适' }, { code: 4, label: '品牌值得信赖' },
            { code: 5, label: '购买方便' }, { code: 6, label: '包装 / 颜值' },
            { code: 7, label: '健康 / 成分' }, { code: 8, label: '促销 / 优惠' },
            { code: 9, label: '身边人都在用' }, { code: 98, label: '其他（请注明）' },
          ],
          maxSelect: 3,
          note: '最多选 3 项；超过时提示，不静默截断',
        },
        {
          id: 'B3.4', type: 'multi', required: false, base: '知道{{主品牌}}但未考虑者', randomize: 'options',
          text: '你没有把{{主品牌}}列入考虑，主要原因是？（多选）',
          options: [
            { code: 1, label: '口味不合适' }, { code: 2, label: '价格偏高' },
            { code: 3, label: '买不到 / 不方便' }, { code: 4, label: '不了解这个品牌' },
            { code: 5, label: '形象不符合我' }, { code: 6, label: '有更习惯的品牌' },
            { code: 98, label: '其他（请注明）' },
          ],
          routing: '仅当 B2.3 选中{{主品牌}}且 B3.1 未选中{{主品牌}}时显示',
          note: '这是「认知高、考虑低」的核心诊断题',
        },
        {
          id: 'B3.5', type: 'single', required: true, base: '全部合格受访者',
          text: '未来 3 个月，你换{{品类}}品牌的意愿是？',
          options: [
            { code: 1, label: '一定会继续买现在的品牌' },
            { code: 2, label: '大概率继续' },
            { code: 3, label: '可能会换' },
            { code: 4, label: '大概率会换' },
            { code: 5, label: '不确定' },
          ],
          note: '与 B4.2 主用品牌交叉，可得各品牌的流失风险',
        },
      ],
    },
    {
      code: 'B4',
      name: '使用与购买',
      purpose: '用带时间窗的使用行为测量真实渗透，而不是「听说过」',
      questions: [
        {
          id: 'B4.1', type: 'multi', required: true, base: '全部合格受访者', randomize: 'brands',
          text: '过去 4 周，你使用过哪些品牌的{{品类}}？（多选）',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '以上都没有' }],
          note: '必须带时间窗；与 B2.3 同一品牌列表',
        },
        {
          id: 'B4.2', type: 'single', required: true, base: 'B4.1 至少选中 1 个品牌者', randomize: 'options',
          text: '过去 4 周，你使用最多的是哪个品牌？',
          options: 'USED_BRANDS',
          note: '选项只显示 B4.1 选中的品牌；这是「主用品牌」的定义',
        },
        {
          id: 'B4.3', type: 'single', required: true, base: '全部合格受访者',
          text: '过去 4 周，你平均多久使用一次{{品类}}？',
          options: [
            { code: 1, label: '每天 2 次及以上' }, { code: 2, label: '每天 1 次' },
            { code: 3, label: '每周 3-5 次' }, { code: 4, label: '每周 1-2 次' },
            { code: 5, label: '少于每周 1 次' },
          ],
        },
        {
          id: 'B4.4', type: 'multi', required: true, base: '全部合格受访者', randomize: 'options',
          text: '过去 4 周，你在哪些场合使用过{{品类}}？（多选）',
          options: 'OCCASIONS',
          note: '选项沿用 B1.5 的场合列表，保证前后可加总',
        },
        {
          id: 'B4.5', type: 'single', required: true, base: '全部合格受访者',
          text: '你每次使用{{品类}}的量大概是？',
          options: [
            { code: 1, label: '半份及以下' }, { code: 2, label: '1 份' },
            { code: 3, label: '2 份' }, { code: 4, label: '3 份及以上' },
          ],
          note: '「份」按客户标准规格定义，在访问说明里写清',
        },
        {
          id: 'B4.6', type: 'multi', required: false, base: '全部合格受访者', randomize: 'options',
          text: '你通常和谁一起使用{{品类}}？（多选）',
          options: [
            { code: 1, label: '一个人' }, { code: 2, label: '同事 / 同学' },
            { code: 3, label: '家人' }, { code: 4, label: '朋友' },
            { code: 5, label: '客户 / 商务场合' },
          ],
        },
      ],
    },
    {
      code: 'B5',
      name: '品牌资产与形象',
      purpose: '测品牌在功能、情感、社会三个层面的联想与差异化',
      questions: [
        {
          id: 'B5.1', type: 'grid', required: true, base: '知道对应品牌的受访者（按品牌单独 base）', randomize: 'rows',
          text: '请对以下品牌在各方面的表现打分（1=很差，5=很好）',
          brands: 'KNOWN_BRANDS',
          rows: [
            '口味 / 口感好', '提神 / 效果明显', '价格合理', '包装好看',
            '品牌年轻有活力', '值得信赖', '适合我这样的人', '购买方便',
            '成分健康', '有品质感', '广告印象深刻', '朋友常提起',
          ],
          scale: { min: 1, max: 5, minLabel: '很差', maxLabel: '很好' },
          routing: '每个品牌单独一屏；只显示 B2.3 中知道的品牌',
          note: '属性覆盖功能（口味/提神）、情感（适合我）、社会（朋友常提起）三层；属性顺序随机、品牌顺序固定（便于横向比较）',
        },
        {
          id: 'B5.2', type: 'multi', required: true, base: '知道{{主品牌}}的受访者', randomize: 'brands',
          text: '如果用一个词形容{{主品牌}}这个品牌，你会选？（多选，最多 3 项）',
          options: [
            { code: 1, label: '年轻' }, { code: 2, label: '专业' },
            { code: 3, label: '亲切' }, { code: 4, label: '高端' },
            { code: 5, label: '实惠' }, { code: 6, label: '有个性' },
            { code: 7, label: '可靠' }, { code: 8, label: '时尚' },
          ],
          routing: '仅当 B2.3 选中{{主品牌}}时显示',
          maxSelect: 3,
        },
        {
          id: 'B5.3', type: 'single', required: true, base: '全部合格受访者', randomize: 'brands',
          text: '在{{品类}}里，你觉得哪个品牌最不一样、最有自己的特色？',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '都差不多' }],
          note: '差异化指数：被选为该品类「最不同」的比例',
        },
      ],
    },
    {
      code: 'B6',
      name: '传播与触点',
      purpose: '广告与内容是否被看到、记住了什么、是否连到品牌',
      questions: [
        {
          id: 'B6.1', type: 'single', required: true, base: '全部合格受访者',
          text: '过去 4 周，你是否看到或听到过{{品类}}的广告？',
          options: [{ code: 1, label: '是' }, { code: 2, label: '否' }, { code: 3, label: '不确定' }],
          routing: '选 2/3 → 跳过 B6.2-B6.3',
        },
        {
          id: 'B6.2', type: 'multi', required: true, base: '过去 4 周看到/听到广告者', randomize: 'options',
          text: '你是在哪些地方看到或听到的？（多选）',
          options: [
            { code: 1, label: '短视频平台（抖音/快手）' }, { code: 2, label: '社交平台（小红书/微博/微信）' },
            { code: 3, label: '长视频平台（爱奇艺/腾讯/优酷）' }, { code: 4, label: '电视' },
            { code: 5, label: '电梯 / 楼宇广告' }, { code: 6, label: '公交 / 地铁' },
            { code: 7, label: '便利店 / 商超店内' }, { code: 8, label: '直播' },
            { code: 98, label: '其他（请注明）' },
          ],
          note: '渠道清单要与本期实际投放清单对齐，没投的渠道不要放',
        },
        {
          id: 'B6.3', type: 'multi', required: true, base: '过去 4 周看到/听到广告者', randomize: 'brands',
          text: '你记得是哪个品牌的广告？（多选）',
          options: 'BRANDS',
          extraOptions: [{ code: 99, label: '记不清是哪个品牌' }],
          note: '品牌连接率 = 正确连到{{主品牌}}的人数 / 记得广告的人数',
        },
        {
          id: 'B6.4', type: 'multi', required: true, base: '全部合格受访者', randomize: 'options',
          text: '过去 4 周，你在哪些内容里看到过{{品类}}相关的信息？（多选）',
          options: [
            { code: 1, label: '达人 / KOL 测评' }, { code: 2, label: '素人种草笔记' },
            { code: 3, label: '品牌官方账号内容' }, { code: 4, label: '直播带货' },
            { code: 5, label: '影视 / 综艺植入' }, { code: 6, label: '朋友转发 / 群聊' },
            { code: 7, label: '新闻 / 行业报道' }, { code: 99, label: '都没看到' },
          ],
          note: '「都没看到」固定末位且互斥',
        },
        {
          id: 'B6.5', type: 'scale', required: true, base: '全部合格受访者',
          text: '达人 / 博主对{{品类}}的推荐，对你的购买决定影响有多大？（1=完全没有，5=非常大）',
          scale: { min: 1, max: 5, minLabel: '完全没有', maxLabel: '非常大' },
        },
        {
          id: 'B6.6', type: 'open', required: false, base: '过去 4 周看到/听到广告者',
          text: '你记得这支{{主品牌}}广告讲了什么？',
          note: '开放题，编码后看信息传达率；不提示任何关键词',
        },
        {
          id: 'B6.7', type: 'scale', required: true, base: '过去 4 周看到/听到广告者',
          text: '这支广告让你对{{主品牌}}的好感有变化吗？（1=明显变差，3=没变化，5=明显变好）',
          scale: { min: 1, max: 5, minLabel: '明显变差', maxLabel: '明显变好' },
          note: '中点 3 = 没变化，分析时以 3 为基准做净提升',
        },
      ],
    },
    {
      code: 'B7',
      name: '满意与推荐',
      purpose: '主用品牌的满意度与 NPS，衔接满意度研究口径',
      questions: [
        {
          id: 'B7.1', type: 'scale', required: true, base: '有主用品牌者',
          text: '总体而言，你对{{主用品牌}}的满意程度是？（1=非常不满意，10=非常满意）',
          scale: { min: 1, max: 10, minLabel: '非常不满意', maxLabel: '非常满意' },
          note: 'CSAT 取 9-10（T2B）；与满意度研究使用同一口径',
        },
        {
          id: 'B7.2', type: 'scale', required: true, base: '有主用品牌者',
          text: '你有多大可能向朋友或同事推荐{{主用品牌}}？（0=完全不会，10=非常愿意）',
          scale: { min: 0, max: 10, minLabel: '完全不会', maxLabel: '非常愿意' },
          note: 'NPS = 推荐者(9-10)占比 − 贬损者(0-6)占比；7-8 为中立者',
        },
        {
          id: 'B7.3', type: 'open', required: false, base: '有主用品牌者',
          text: '你给出这个推荐分数的原因是？',
          note: '开放题，编码后进入改进清单',
        },
      ],
    },
    {
      code: 'B8',
      name: '价格与促销',
      purpose: '价格感知与促销依赖，判断价格压力',
      questions: [
        {
          id: 'B8.1', type: 'scale', required: true, base: '知道{{主品牌}}者',
          text: '你觉得{{主品牌}}的价格怎么样？（1=很便宜，5=很贵）',
          scale: { min: 1, max: 5, minLabel: '很便宜', maxLabel: '很贵' },
          note: '用相对感知，不问绝对值；与竞品同题比较',
        },
        {
          id: 'B8.2', type: 'single', required: true, base: '全部合格受访者',
          text: '如果{{主品牌}}不打折，你还会买吗？',
          options: [
            { code: 1, label: '一定会买' }, { code: 2, label: '大概率会买' },
            { code: 3, label: '可能会买，也可能不买' }, { code: 4, label: '大概率不买' },
            { code: 5, label: '一定不买' },
          ],
          note: '促销依赖度：3-5 的比例越高，价格弹性越大',
        },
      ],
    },
    {
      code: 'B9',
      name: '人群信息',
      purpose: '分群与加权所需的人口统计，放在最后减少流失',
      questions: [
        {
          id: 'B9.1', type: 'single', required: true, base: '全部合格受访者',
          text: '你的家庭结构是？',
          options: [
            { code: 1, label: '独居' }, { code: 2, label: '与伴侣同住（无子女）' },
            { code: 3, label: '有 12 岁以下子女' }, { code: 4, label: '子女已满 12 岁' },
            { code: 5, label: '与父母同住' }, { code: 98, label: '其他' },
          ],
        },
        {
          id: 'B9.2', type: 'single', required: false, base: '全部合格受访者',
          text: '你的个人月收入是？',
          options: [
            { code: 1, label: '3000 元以下' }, { code: 2, label: '3000-5999 元' },
            { code: 3, label: '6000-9999 元' }, { code: 4, label: '10000-14999 元' },
            { code: 5, label: '15000-19999 元' }, { code: 6, label: '20000 元及以上' },
            { code: 9, label: '不愿透露' },
          ],
          note: '收入题设为非必答，拒绝率过高会污染加权',
        },
        {
          id: 'B9.3', type: 'single', required: false, base: '全部合格受访者',
          text: '你的最高学历是？',
          options: [
            { code: 1, label: '高中及以下' }, { code: 2, label: '大专' },
            { code: 3, label: '本科' }, { code: 4, label: '硕士及以上' },
          ],
        },
        {
          id: 'B9.4', type: 'single', required: false, base: '全部合格受访者',
          text: '你的职业是？',
          options: [
            { code: 1, label: '企业职员' }, { code: 2, label: '公务员 / 事业单位' },
            { code: 3, label: '自由职业 / 个体' }, { code: 4, label: '学生' },
            { code: 5, label: '专业人士（医生/教师/律师等）' }, { code: 98, label: '其他' },
          ],
        },
        {
          id: 'B9.5', type: 'open', required: false, base: '全部合格受访者',
          text: '你常住的城市是？（请填写城市名）',
          note: '用于核对 B0.5 的城市分级，编码到城市库',
        },
        {
          id: 'B9.6', type: 'single', required: false, base: '全部合格受访者',
          text: '你平时关注{{品类}}的程度是？',
          options: [
            { code: 1, label: '非常关注，会主动了解新品' },
            { code: 2, label: '比较关注' },
            { code: 3, label: '一般' },
            { code: 4, label: '不太关注' },
          ],
          note: '品类关注度用于识别意见领袖型受访者',
        },
      ],
    },
  ],

  kpis: [
    {
      id: 'toma', name: '提示前首位认知（TOMA）', base: '全部合格受访者',
      definition: 'B2.1 第一个提到的品牌为指定品牌的受访者占比',
      formula: 'TOMA(品牌) = B2.1 首位提及该品牌人数 / 合格样本',
      compare: '与上波同题比较，95% 置信；竞品同口径',
    },
    {
      id: 'aided', name: '提示后认知', base: '全部合格受访者',
      definition: 'B2.3 中选中该品牌（听说过）的占比',
      formula: '提示后认知(品牌) = B2.3 选中该品牌人数 / 合格样本',
      compare: '与上波、竞品比较',
    },
    {
      id: 'consider', name: '考虑率', base: '知道该品牌的受访者',
      definition: '知道该品牌的人中，B3.1 会考虑的比例',
      formula: '考虑率 = B3.1 选中该品牌人数 / B2.3 选中该品牌人数',
      compare: '竞品同口径；分年龄/城市看',
    },
    {
      id: 'trial', name: '试用率', base: '全部合格受访者',
      definition: '过去 4 周使用过该品牌的比例',
      formula: '试用率 = B4.1 选中该品牌人数 / 合格样本',
      compare: '与上波比较',
    },
    {
      id: 'usage4w', name: '4 周使用率', base: '全部合格受访者',
      definition: '过去 4 周使用过该品类且使用过该品牌的比例（同 trial，用于品类基准）',
      formula: '使用率 = B4.1 选中该品牌人数 / 合格样本',
      compare: '与品类均值比较',
    },
    {
      id: 'prefshare', name: '偏好份额', base: 'B3.1 至少选中 1 个品牌者',
      definition: 'B3.2 首选该品牌的比例',
      formula: '偏好份额 = B3.2 首选该品牌人数 / 有考虑集人数',
      compare: '与上波、竞品比较',
    },
    {
      id: 'nps', name: 'NPS（净推荐值）', base: '有主用品牌者',
      definition: '推荐者（9-10）占比减贬损者（0-6）占比',
      formula: 'NPS = P(9-10) − P(0-6)；7-8 为中立者不计入',
      compare: '与上波、竞品比较；同时看推荐者/贬损者绝对占比',
    },
    {
      id: 'image', name: '形象属性 T2B', base: '知道该品牌的受访者',
      definition: 'B5.1 中打 4-5 分的比例',
      formula: '属性 T2B = B5.1 打 4-5 分人数 / 知道该品牌人数',
      compare: '竞品同属性比较；与上波比较',
    },
    {
      id: 'addiff', name: '差异化指数', base: '全部合格受访者',
      definition: 'B5.3 中被选为「最不一样」的比例',
      formula: '差异化指数 = B5.3 选中该品牌人数 / 合格样本',
      compare: '竞品比较；与属性联想结合看',
    },
    {
      id: 'adaware', name: '广告认知率', base: '全部合格受访者',
      definition: 'B6.1 回答「是」的占比；B6.3 用于算品牌连接率',
      formula: '广告认知率 = B6.1 选 1 人数 / 合格样本',
      compare: '与投放 GRP/预算对齐看效率',
    },
    {
      id: 'pricetop', name: '价格感知（均值）', base: '知道该品牌者',
      definition: 'B8.1 的 1-5 均值，3 为中性',
      formula: '价格感知 = mean(B8.1)',
      compare: '竞品均值比较；>3 偏贵',
    },
  ],

  analysis: {
    trace: [
      {
        decision: '这轮传播/活动之后，品牌健康度有没有变化',
        question: '认知、考虑、使用是否环比改善；改善集中在哪些人群',
        metric: 'TOMA、提示后认知、考虑率、4 周使用率',
        items: ['B2.1', 'B2.3', 'B3.1', 'B4.1'],
        output: '品牌漏斗图 + 波次趋势图（分年龄/城市）',
      },
      {
        decision: '预算要不要从 A 人群转向 B 人群',
        question: '不同人群的认知→考虑→使用转化差在哪一环',
        metric: '分群漏斗转化率',
        items: ['B2.1', 'B3.1', 'B4.1'],
        output: '分群漏斗对比图',
      },
      {
        decision: '竞品是不是在抢我们的用户',
        question: '主用品牌与转换意向的流向',
        metric: '主用品牌份额、转换意向、流失风险',
        items: ['B4.2', 'B3.5', 'B3.4'],
        output: '品牌转换矩阵 + 流失风险表',
      },
      {
        decision: '品牌形象要不要重定位',
        question: '哪些属性是我们的强项、哪些是短板，和竞品差多少',
        metric: '属性 T2B、差异化指数',
        items: ['B5.1', 'B5.3'],
        output: '感知图（对应分析）+ 属性差距条形图',
      },
      {
        decision: '广告还要不要继续投、投哪个渠道',
        question: '广告有没有被看到、记住、连到品牌',
        metric: '广告认知率、品牌连接率、好感净提升',
        items: ['B6.1', 'B6.2', 'B6.3', 'B6.7'],
        output: '触点覆盖热力图 + 品牌连接率',
      },
      {
        decision: '价格要不要调、促销要不要收',
        question: '价格感知与促销依赖有多强',
        metric: '价格感知均值、促销依赖度',
        items: ['B8.1', 'B8.2'],
        output: '价格感知分布 + 促销依赖分层',
      },
      {
        decision: '满意度问题是不是系统性的',
        question: '各品牌 NPS 与满意度差距',
        metric: 'NPS、CSAT T2B',
        items: ['B7.1', 'B7.2'],
        output: 'NPS 对比图 + 推荐原因词云/编码表',
      },
    ],
    banners: [
      { name: '城市级别', levels: '一线 / 新一线二线 / 三线及以下', note: '配额维度，重点看低线渗透' },
      { name: '性别', levels: '男 / 女', note: '配额维度' },
      { name: '年龄', levels: '18-24 / 25-30 / 31-35 / 36-45', note: '配额维度，核心人群单独看' },
      { name: '品类使用频次', levels: '高频（每周+）/ 中频（每月）/ 低频', note: '由 B1.1 合并' },
      { name: '主用品牌', levels: '{{主品牌}} / 各竞品 / 其他', note: '由 B4.2 生成，竞品少的品牌合并' },
      { name: '购买渠道', levels: '线上 / 线下 / 两者都有', note: '由 B1.2 合并' },
    ],
    crosstabs: [
      { rows: '品牌漏斗各指标', cols: '城市级别 × 波次', test: '比例 z 检验（95%，双尾）', minBase: 100 },
      { rows: '品牌漏斗各指标', cols: '年龄', test: '比例 z 检验', minBase: 50 },
      { rows: '属性 T2B', cols: '主用品牌', test: '均值 t 检验', minBase: 50 },
      { rows: 'NPS 分层', cols: '品类使用频次', test: '比例 z 检验', minBase: 50 },
      { rows: '广告认知率', cols: '购买渠道 / 年龄', test: '比例 z 检验', minBase: 50 },
      { rows: '价格感知均值', cols: '城市级别', test: '均值 t 检验', minBase: 50 },
    ],
    models: [
      {
        name: '偏好驱动分析', method: 'Logistic 回归 / Shapley 值分解',
        input: '因变量：B3.2 是否首选{{主品牌}}；自变量：B5.1 各属性评分、B8.1 价格感知、B1.1 使用频次',
        output: '各属性对偏好的相对贡献排序',
        note: '样本 ≥ 300 再做；属性间共线性高时先做相关矩阵剔除',
      },
      {
        name: '品牌感知图', method: '对应分析（Correspondence Analysis）',
        input: '品牌 × 属性 T2B 矩阵（B5.1）',
        output: '二维感知图，看品牌与属性的邻近关系',
        note: '前两维解释度建议 ≥ 60%；品牌数 ≤ 8 时最清晰',
      },
      {
        name: '使用频次驱动', method: '有序 Logistic 回归',
        input: '因变量：B4.3 频次；自变量：场合数（B4.4）、属性评分、渠道覆盖（B1.2）',
        output: '哪些因素把人推向高频',
        note: '频次档位合并到 3 档再做，避免空单元格',
      },
      {
        name: '人群分群（可选）', method: 'K-means / 潜类分析',
        input: 'B1.5 场合、B1.6 重要性、B5.1 属性偏好',
        output: '3-5 个需求人群及规模',
        note: '样本 ≥ 600 才做；分群结果需可命名、可落地',
      },
    ],
    charts: [
      { no: '图 1', title: '品牌漏斗', type: '漏斗图', source: 'B2.1 / B2.3 / B3.1 / B4.1', base: '全部合格受访者', takeaway: '认知到考虑、考虑到使用的转化断点' },
      { no: '图 2', title: '品牌漏斗波次对比', type: '分组条形图', source: '同上 × 波次', base: '同上', takeaway: '哪一环在改善/恶化' },
      { no: '图 3', title: '分年龄漏斗', type: '小多图（small multiples）', source: 'B2.1 / B3.1 / B4.1', base: '分年龄样本', takeaway: '核心人群是否落后' },
      { no: '图 4', title: '品牌感知图', type: '散点图（对应分析）', source: 'B5.1', base: '知道对应品牌者', takeaway: '品牌与属性的相对位置' },
      { no: '图 5', title: '属性 T2B 对比', type: '条形图 / 热力图', source: 'B5.1', base: '知道对应品牌者', takeaway: '强项与短板' },
      { no: '图 6', title: '触点覆盖与广告认知', type: '热力图', source: 'B6.1 / B6.2 / B6.4', base: '全部合格受访者', takeaway: '投了但没被看到的渠道' },
      { no: '图 7', title: 'NPS 对比', type: '堆叠条形图', source: 'B7.2', base: '有主用品牌者', takeaway: '推荐者/中立/贬损者结构' },
      { no: '图 8', title: '品牌转换意向', type: '桑基图 / 矩阵', source: 'B4.2 × B3.5', base: '有主用品牌者', takeaway: '谁最可能流失' },
      { no: '图 9', title: '价格感知分布', type: '100% 堆叠条形图', source: 'B8.1', base: '知道该品牌者', takeaway: '偏贵/适中的品牌' },
      { no: '图 10', title: '使用场合结构', type: '条形图', source: 'B4.4', base: '全部合格受访者', takeaway: '场合份额与增量机会' },
    ],
    outline: [
      { chapter: '执行摘要', content: '三句话结论 + 五张关键图 + 建议动作' },
      { chapter: '市场与品类背景', content: '品类规模/趋势（引用外部数据，需标注来源）、本期样本结构' },
      { chapter: '品牌健康度', content: '漏斗、波次趋势、分人群差异（图 1-3）' },
      { chapter: '竞争格局', content: '感知图、属性对比、差异化（图 4-5）' },
      { chapter: '传播与触点', content: '广告认知、渠道效率、内容触点（图 6）' },
      { chapter: '满意度与忠诚', content: 'NPS、转换意向（图 7-8）' },
      { chapter: '价格与促销', content: '价格感知、促销依赖（图 9）' },
      { chapter: '结论与建议', content: '按「立刻做 / 下季度做 / 需要更多数据」分层给建议' },
      { chapter: '附录', content: '问卷、样本结构、码表、开放题编码表' },
    ],
    dataSpec: [
      { item: '变量命名', rule: 'q_ + 题号去掉点，如 B2.1 → q_B2_1；多选拆成 q_B2_1_1 … q_B2_1_99' },
      { item: '缺失值', rule: '-9 未回答；-8 不适用（跳转未问）；-7 拒答' },
      { item: '加权变量', rule: 'wgt：按城市级别 × 性别 × 年龄 联合分布加权，单变量权重截断在 0.3-3.0' },
      { item: '开放题编码', rule: '每类开放题单独出编码表；保留原文列，编码列可多选' },
      { item: '显著性标记', rule: '95% 双尾；列间比较用 A/B/C 上标，与基准列比' },
      { item: '交付格式', rule: 'SPSS .sav + Excel 数据表 + 交叉表；变量标签与码表一致' },
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
        desc: '完全按市场结构分配，代表性最好',
        rule: '各城市级别按 30/40/30，年龄按 30/30/25/15',
        bestFor: '看全国大盘、需要加权最少',
        risk: '小人群（36-45、三线）样本偏少，单独下结论不稳',
      },
      {
        key: 'equal', name: '方案 B · 关键分组等分',
        desc: '每个城市级别、每个年龄段样本量尽量相等',
        rule: '城市级别等分，年龄等分，性别按 50/50',
        bestFor: '要做人群之间的比较（谁高谁低）',
        risk: '与市场结构不符，必须加权后才能讲大盘',
      },
      {
        key: 'mixed', name: '方案 C · 比例 + 保底（推荐）',
        desc: '以市场结构为主，给关键人群设最低样本',
        rule: '以比例分配为主，把每个交叉格抬到 20 以上，18-24 岁与三线不会被压到个位数',
        bestFor: '既要大盘、又要看核心人群（大多数品牌追踪）',
        risk: '加权系数略有波动，需在报告中说明',
      },
    ],
    weighting: '按城市级别 × 性别 × 年龄 联合分布做 rim weighting；单变量权重截断 0.3-3.0，加权后报告有效样本 n_eff = n / deff。',
  },

  pitfalls: [
    '认知题先提示后开放：一旦先给品牌列表，提示前认知就废了',
    '使用题不带时间窗：「使用过」会被理解成「这辈子用过」',
    '把「考虑」和「偏好」合并成一题：转化率算不出来',
    '形象属性只放功能词：情感/社会层缺失，感知图会挤成一团',
    '广告渠道问了没投的渠道：数据不可解释，还拉低整体认知率',
    'NPS 放在满意度之前问：顺序偏差会让 NPS 虚高',
    '样本只做总量不做分群：报告只能讲大盘，落不到动作',
  ],
}

