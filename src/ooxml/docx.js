/**
 * 无依赖 DOCX 生成器。
 *
 * 只实现问卷需要的排版本领：标题、段落、项目符号、表格、分页、页脚页码。
 * 输入是「块」数组，输出是可直接写盘的 Buffer。
 */

import { makeZip, xml } from './zip.js'

const PAGE_W = 11906
const PAGE_H = 16838
const MARGIN = 1134
const CONTENT_W = PAGE_W - MARGIN * 2

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults>
<w:rPrDefault><w:rPr><w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="Times New Roman"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="70" w:line="280" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="DocTitle"><w:name w:val="Doc Title"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
<w:rPr><w:rFonts w:ascii="微软雅黑" w:eastAsia="微软雅黑" w:hAnsi="微软雅黑"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="SubTitle"><w:name w:val="Sub Title"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:spacing w:before="0" w:after="200"/></w:pPr>
<w:rPr><w:color w:val="595959"/><w:sz w:val="20"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
<w:pPr><w:keepNext/><w:spacing w:before="300" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr>
<w:rPr><w:rFonts w:ascii="微软雅黑" w:eastAsia="微软雅黑" w:hAnsi="微软雅黑"/><w:b/><w:color w:val="1F3864"/><w:sz w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>
<w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr>
<w:rPr><w:rFonts w:ascii="微软雅黑" w:eastAsia="微软雅黑" w:hAnsi="微软雅黑"/><w:b/><w:color w:val="2F5597"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="QText"><w:name w:val="Question Text"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:keepNext/><w:spacing w:before="120" w:after="20"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Meta"/><w:basedOn w:val="Normal"/>
<w:pPr><w:keepNext/><w:spacing w:after="40"/></w:pPr>
<w:rPr><w:color w:val="7F7F7F"/><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Option"><w:name w:val="Option"/><w:basedOn w:val="Normal"/>
<w:pPr><w:ind w:left="400"/><w:spacing w:after="8" w:line="270" w:lineRule="auto"/></w:pPr>
<w:rPr><w:sz w:val="21"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/>
<w:pPr><w:ind w:left="420" w:hanging="220"/><w:spacing w:after="40"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Note"><w:name w:val="Note"/><w:basedOn w:val="Normal"/>
<w:pPr><w:ind w:left="240"/><w:spacing w:after="50"/></w:pPr>
<w:rPr><w:color w:val="808080"/><w:i/><w:sz w:val="18"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/>
<w:pPr><w:ind w:left="240" w:right="240"/><w:spacing w:after="120"/></w:pPr>
<w:rPr><w:color w:val="404040"/><w:i/><w:sz w:val="20"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="TableCell"><w:name w:val="Table Cell"/><w:basedOn w:val="Normal"/>
<w:pPr><w:spacing w:after="0" w:line="260" w:lineRule="auto"/></w:pPr>
<w:rPr><w:sz w:val="18"/></w:rPr></w:style>
</w:styles>`

function run(text, { bold = false, italic = false, color = null, size = null } = {}) {
  const props = []
  if (bold) props.push('<w:b/>')
  if (italic) props.push('<w:i/>')
  if (color) props.push(`<w:color w:val="${color}"/>`)
  if (size) props.push(`<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>`)
  const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : ''
  return `<w:r>${rPr}<w:t xml:space="preserve">${xml(text)}</w:t></w:r>`
}

function paragraph(text, style = 'Normal', { prefix = '', keepNext = false, keepLines = false } = {}) {
  const keep = `${keepNext ? '<w:keepNext/>' : ''}${keepLines ? '<w:keepLines/>' : ''}`
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/>${keep}</w:pPr>${prefix ? `<w:r><w:t xml:space="preserve">${xml(prefix)}</w:t></w:r>` : ''}${run(text)}</w:p>`
}

/** 一组选项写成一个段落，段内换行，保证整组不被分页切开。 */
function optionsParagraph(texts) {
  const runs = texts.map((text, index) => `${index > 0 ? '<w:r><w:br/></w:r>' : ''}${run(text)}`).join('')
  return `<w:p><w:pPr><w:pStyle w:val="Option"/><w:keepLines/></w:pPr>${runs}</w:p>`
}

function cellXml(text, width, { header = false, bold = false } = {}) {
  const fill = header ? '<w:shd w:val="clear" w:color="auto" w:fill="E8EEF7"/>' : ''
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${fill}<w:vAlign w:val="center"/></w:tcPr>`
    + `<w:p><w:pPr><w:pStyle w:val="TableCell"/></w:pPr>${run(text, { bold: header || bold })}</w:p></w:tc>`
}

function tableXml(header, rows, widths) {
  const cols = header?.length || rows?.[0]?.length || 1
  const width = Math.floor(CONTENT_W / cols)
  const grid = Array.from({ length: cols }, () => `<w:gridCol w:w="${width}"/>`).join('')
  const border = '<w:tblBorders>'
    + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
      .map(side => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="D0D7E2"/>`)
      .join('')
    + '</w:tblBorders>'
  const headerRow = header
    ? `<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>${header.map(h => cellXml(h, width, { header: true })).join('')}</w:tr>`
    : ''
  const body = rows.map(row => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${row.map((text, i) => cellXml(String(text ?? ''), widths?.[i] ?? width)).join('')}</w:tr>`).join('')
  return `<w:tbl><w:tblPr><w:tblW w:w="${CONTENT_W}" w:type="dxa"/><w:tblLayout w:type="fixed"/>${border}</w:tblPr>`
    + `<w:tblGrid>${grid}</w:tblGrid>${headerRow}${body}</w:tbl>`
}

function blockXml(block) {
  switch (block.type) {
    case 'title': return paragraph(block.text, 'DocTitle')
    case 'subtitle': return paragraph(block.text, 'SubTitle')
    case 'h1': return paragraph(block.text, 'Heading1')
    case 'h2': return paragraph(block.text, 'Heading2')
    case 'q': return paragraph(block.text, 'QText')
    case 'meta': return paragraph(block.text, 'Meta')
    case 'note': return paragraph(block.text, 'Note')
    case 'quote': return paragraph(block.text, 'Quote')
    case 'option': return paragraph(block.text, 'Option')
    case 'options': return optionsParagraph(block.texts ?? [])
    case 'bullet': return paragraph(block.text, 'Bullet', { prefix: '•  ' })
    case 'p': return paragraph(block.text, block.style || 'Normal')
    case 'spacer': return `<w:p><w:pPr><w:spacing w:after="0" w:line="120" w:lineRule="auto"/></w:pPr></w:p>`
    case 'pagebreak': return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
    case 'table': {
      const body = tableXml(block.header, block.rows, block.widths)
      return `${body}<w:p><w:pPr><w:spacing w:after="0" w:line="120" w:lineRule="auto"/></w:pPr></w:p>`
    }
    default: return ''
  }
}

function footerXml(footerText) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0"/></w:pPr>
<w:r><w:rPr><w:color w:val="999999"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">${xml(footerText)} · 第 </w:t></w:r>
<w:fldSimple w:instr=" PAGE "><w:r><w:rPr><w:color w:val="999999"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>
<w:r><w:rPr><w:color w:val="999999"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve"> 页</w:t></w:r>
</w:p>
</w:ftr>`
}

function documentXml(blocks, footerText) {
  const body = blocks.map(blockXml).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${body}
<w:sectPr>
<w:footerReference w:type="default" r:id="rId1"/>
<w:pgSz w:w="${PAGE_W}" w:h="${PAGE_H}"/>
<w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="720" w:footer="720" w:gutter="0"/>
<w:cols w:space="720"/>
<w:docGrid w:linePitch="312"/>
</w:sectPr>
</w:body></w:document>`
}

/**
 * 生成 docx。
 * @param {{blocks: object[], footer?: string, createdAt?: Date}} spec
 * @returns {Buffer}
 */
export function buildDocx(spec) {
  const footer = footerXml(spec.footer || '')
  const document = documentXml(spec.blocks ?? [], spec.footer || '')
  return makeZip([
    { name: '[Content_Types].xml', data: CONTENT_TYPES },
    { name: '_rels/.rels', data: ROOT_RELS },
    { name: 'word/document.xml', data: document },
    { name: 'word/styles.xml', data: STYLES },
    { name: 'word/footer1.xml', data: footer },
    { name: 'word/_rels/document.xml.rels', data: DOC_RELS },
  ], spec.createdAt ? new Date(spec.createdAt) : new Date())
}

