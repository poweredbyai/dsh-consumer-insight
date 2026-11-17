/**
 * 无依赖 XLSX 生成器。
 *
 * 支持：多工作表、表头样式、列宽、冻结首行、自动换行、数字单元格、自动筛选。
 * 用 inlineStr 写字符串，省掉 sharedStrings 这一层。
 */

import { makeZip, xml } from './zip.js'

const CONTENT_TYPES = sheetCount => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${Array.from({ length: sheetCount }, (_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
</Types>`

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="4">
<font><sz val="10"/><color theme="1"/><name val="微软雅黑"/><charset val="134"/></font>
<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="微软雅黑"/><charset val="134"/></font>
<font><b/><sz val="12"/><color rgb="FF1F3864"/><name val="微软雅黑"/><charset val="134"/></font>
<font><sz val="9"/><color rgb="FF666666"/><name val="微软雅黑"/><charset val="134"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF2F5597"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF3F6FB"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border>
<left style="thin"><color rgb="FFD0D7E2"/></left>
<right style="thin"><color rgb="FFD0D7E2"/></right>
<top style="thin"><color rgb="FFD0D7E2"/></top>
<bottom style="thin"><color rgb="FFD0D7E2"/></bottom>
<diagonal/>
</border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="6">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

function columnName(index) {
  let name = ''
  let n = index
  while (n >= 0) {
    name = String.fromCharCode(65 + (n % 26)) + name
    n = Math.floor(n / 26) - 1
  }
  return name
}

function sanitizeSheetName(name, used) {
  let base = String(name || 'Sheet').replace(/[\[\]:*?/\\]/g, ' ').trim().slice(0, 28) || 'Sheet'
  let candidate = base
  let i = 2
  while (used.has(candidate)) {
    candidate = `${base.slice(0, 26)} ${i}`
    i += 1
  }
  used.add(candidate)
  return candidate
}

function cellXml(reference, value, style) {
  if (value === null || value === undefined || value === '') {
    return `<c r="${reference}" s="${style}"/>`
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${reference}" s="${style}"><v>${value}</v></c>`
  }
  const text = xml(String(value))
  return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`
}

function sheetXml(sheet) {
  const rows = sheet.rows ?? []
  const width = Math.max(1, ...rows.map(row => row.length))
  const last = `${columnName(width - 1)}${Math.max(1, rows.length)}`
  const cols = Array.from({ length: width }, (_, i) => {
    const colWidth = sheet.columns?.[i]?.width ?? sheet.width ?? 18
    return `<col min="${i + 1}" max="${i + 1}" width="${colWidth}" customWidth="1"/>`
  }).join('')
  const headerRows = new Set(sheet.headerRows ?? (sheet.header === false ? [] : [0]))
  const body = rows.map((row, rowIndex) => {
    const style = headerRows.has(rowIndex) ? 1 : (sheet.rowStyles?.[rowIndex] ?? 2)
    const cells = row.map((value, colIndex) => cellXml(`${columnName(colIndex)}${rowIndex + 1}`, value, style)).join('')
    const height = headerRows.has(rowIndex) ? ' ht="30" customHeight="1"' : ''
    return `<row r="${rowIndex + 1}"${height}>${cells}</row>`
  }).join('')
  const view = sheet.freeze === 0
    ? '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
    : `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${sheet.freeze ?? 1}" topLeftCell="A${(sheet.freeze ?? 1) + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
  const filter = sheet.filter === false || !headerRows.has(0) ? '' : `<autoFilter ref="A1:${last}"/>`
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${last}"/>
${view}
<sheetFormatPr defaultRowHeight="16"/>
<cols>${cols}</cols>
<sheetData>${body}</sheetData>
${filter}
<pageMargins left="0.5" right="0.5" top="0.7" bottom="0.7" header="0.3" footer="0.3"/>
</worksheet>`
}

function workbookXml(sheets) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheets.map((sheet, i) => `<sheet name="${xml(sheet.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
</workbook>`
}

function workbookRels(sheets) {
  const rels = sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
  rels.push(`<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`)
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`
}

/**
 * 生成 xlsx。
 * @param {{sheets: {name: string, rows: any[][], columns?: {width?: number}[], freeze?: number, header?: boolean}[], createdAt?: Date}} spec
 * @returns {Buffer}
 */
export function buildXlsx(spec) {
  const used = new Set()
  const sheets = (spec.sheets ?? []).map(sheet => ({ ...sheet, name: sanitizeSheetName(sheet.name, used) }))
  const entries = [
    { name: '[Content_Types].xml', data: CONTENT_TYPES(sheets.length) },
    { name: '_rels/.rels', data: ROOT_RELS },
    { name: 'xl/workbook.xml', data: workbookXml(sheets) },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRels(sheets) },
    { name: 'xl/styles.xml', data: STYLES },
  ]
  sheets.forEach((sheet, i) => {
    entries.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(sheet) })
  })
  return makeZip(entries, spec.createdAt ? new Date(spec.createdAt) : new Date())
}
