import { getFields } from './table.js'

async function btnColumns (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { get, isEmpty } = this.plugin.app.bajo.lib._
  const qsKey = this.plugin.app.waibu.config.qsKey
  const schema = get(this, 'locals.schema', {})
  const fields = getFields.call(this, params.attr.fields)
  const items = []
  params.attr.color = params.attr.color ?? 'secondary-outline'
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Columns')
  for (const f of schema.view.fields) {
    if (f === 'id') {
      items.push(await this.buildTag({ tag: 'formCheck', attr: { checked: true, label: this.req.t('ID'), value: f, disabled: true } }))
      continue
    }
    const attr = { 'x-model': 'selected', label: this.req.t(`field.${f}`), value: f }
    if (fields.includes(f)) attr.checked = true
    items.push(await this.buildTag({ tag: 'formCheck', attr }))
  }
  const applyId = generateId('alpha')
  const href = this._buildUrl({ exclude: [qsKey.fields] })
  const html = ['<form class="mt-1 mb-2 mx-3" ']
  html.push(`x-data="{
    selected: ${JSON.stringify(fields).replaceAll('"', "'")},
    all: ${JSON.stringify(schema.view.fields).replaceAll('"', "'")}
  }"`)
  html.push(`x-init="
    const el = document.getElementById('${applyId}')
    el.href = '${href}&${qsKey.fields}=' + selected.join(',')
    $watch('selected', v => {
      if (_.isEqual(all.sort(), selected.sort())) el.href = '${href}'
      else el.href = '${href}&${qsKey.fields}=' + v.join(',')
    })
  ">`)
  html.push(...items)
  const attr = { size: 'sm', id: applyId, margin: 'top-2', color: params.attr.applyColor ?? 'primary', icon: params.attr.applyIcon ?? 'arrowsStartEnd', href }
  html.push(await this.buildTag({ tag: 'btn', attr, html: this.req.t('Apply') }))
  html.push('</form>')
  params.attr.autoClose = 'outside'
  params.html = await this.buildTag({ tag: 'dropdown', attr: params.attr, html: html.join('\n') })
  params.noTag = true
}

export default btnColumns
