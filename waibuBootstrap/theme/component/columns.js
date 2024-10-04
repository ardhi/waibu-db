import { getFields } from './table.js'

async function columns (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { get } = this.plugin.app.bajo.lib._
  const qsKey = this.plugin.app.waibu.config.qsKey
  const schema = get(this, 'locals.schema', {})
  const fields = getFields.call(this, params.attr.fields)
  const items = []
  for (const p of schema.properties) {
    const attr = { 'x-model': 'selected', label: this.req.t(`field.${p.name}`), value: p.name }
    if (fields.includes(p.name)) attr.checked = true
    items.push(await this.buildTag({ tag: 'formCheck', attr }))
  }
  const applyId = generateId('alpha')
  const href = this._buildUrl({}, { without: [qsKey.fields] })
  const html = [`<form class="my-2 mx-3" x-data="{ selected: ${JSON.stringify(fields).replaceAll('"', "'")} }" `]
  html.push(`x-init="
    $watch('selected', v => {
      const el = document.getElementById('${applyId}')
      el.href = '${href}&${qsKey.fields}=' + v.join(',')
    })
  ">`)
  html.push(...items)
  const attr = { id: applyId, margin: 'top-3', dim: 'width:100', color: params.attr.color, href }
  html.push(await this.buildTag({ tag: 'btn', attr, html: this.req.t('Apply') }))
  html.push('</form>')
  params.attr.autoClose = 'outside'
  params.html = await this.buildTag({ tag: 'dropdown', attr: params.attr, html: html.join('\n') })
  params.noTag = true
}

export default columns
