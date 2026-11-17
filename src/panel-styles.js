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
