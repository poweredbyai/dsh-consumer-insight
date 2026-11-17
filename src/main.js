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
