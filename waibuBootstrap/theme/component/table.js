export function getFields (fields) {
  const qsKey = this.plugin.app.waibu.config.qsKey
  const { get, isEmpty, isString, pull } = this.plugin.app.bajo.lib._
  const schema = get(this, 'locals.schema', {})
  fields = fields ?? get(this, `locals._meta.query.${qsKey.fields}`, '')
  if (isEmpty(fields)) fields = schema.properties.map(p => p.name)
  if (isString(fields)) fields = fields.split(',')
  pull(fields, 'id')
  fields.unshift('id')
  return fields
}

async function table (params = {}) {
  const { attrToObject, groupAttrs } = this.plugin.app.waibuMpa
  const { get, omit, set } = this.plugin.app.bajo.lib._
  const group = groupAttrs(params.attr, ['body', 'head', 'foot'])
  params.attr = group._

  const data = get(this, 'locals.data.data', [])
  const schema = get(this, 'locals.schema', {})
  const qsKey = this.plugin.app.waibu.config.qsKey
  let { sort, fields } = attrToObject(params.attr.options)
  sort = sort ?? get(this, `locals._meta.query.${qsKey.sort}`, '')
  fields = getFields.call(this, fields)

  let [sortCol, sortDir] = sort.split(':')
  if (!['-1', '1'].includes(sortDir)) sortDir = '1'

  let selection = params.attr.selection
  if (![undefined, 'single', 'multi'].includes(selection)) selection = 'multi'
  if (selection) params.attr.hover = true

  params.noTag = true
  const html = []
  let items = []
  // head
  for (const p of schema.properties) {
    if (!fields.includes(p.name)) continue
    let head = this.req.t(`field.${p.name}`)
    if (!params.attr.noSort && (schema.sortables ?? []).includes(p.name)) {
      let sortItem = `${p.name}:-1`
      let icon = params.attr.sortUpIcon ?? 'caretUp'
      if (p.name === sortCol) {
        sortItem = `${p.name}:${sortDir === '1' ? '-1' : '1'}`
        icon = sortDir === '1' ? (params.attr.sortUpIcon ?? 'caretUp') : (params.attr.sortDownIcon ?? 'caretDown')
      }
      const item = set({ page: 1 }, qsKey.sort, sortItem)
      const href = this._buildUrl(item)
      const content = [
        await this.buildTag({ tag: 'div', html: this.req.t(`field.${p.name}`) }),
        await this.buildTag({ tag: 'a', attr: { icon, href }, prepend: '<div class="ms-1">', append: '</div>' })
      ]
      head = await this.buildTag({ tag: 'div', attr: { flex: 'justify-content:between align-items:end' }, html: content.join('\n') })
    }
    items.push(await this.buildTag({ tag: 'th', attr: { text: params.attr.headerNowrap ? '' : 'nowrap' }, html: head }))
  }
  if (items.length > 0 && selection) {
    let item = '<th></th>'
    if (selection === 'multi') {
      const attr = { 'x-model': 'toggleAll', name: '_rtm', noWrapper: true, noLabel: true }
      item = await this.buildTag({ tag: 'formCheck', attr, prepend: '<th>', append: '</th>' })
    } else {
      const attr = { name: 'remove', '@click': 'selected = \'\'', style: { cursor: 'pointer' } }
      item = await this.buildTag({ tag: 'icon', attr, prepend: '<th>', append: '</th>' })
    }
    items.unshift(item)
  }
  const header = await this.buildTag({ tag: 'tr', html: items.join('\n') })
  html.push(await this.buildTag({ tag: 'thead', attr: group.head, html: header }))
  // body
  items = []
  for (const d of data) {
    const lines = []
    if (selection) {
      const tag = selection === 'single' ? 'formRadio' : 'formCheck'
      const attr = { 'x-model': 'selected', name: '_rt', value: d.id, noLabel: true, noWrapper: true }
      lines.push(await this.buildTag({ tag, attr, prepend: '<td>', append: '</td>' }))
    }
    for (const p of schema.properties) {
      if (!fields.includes(p.name)) continue
      const value = this.req.format(d[p.name], p.type)
      const attr = {}
      if (['integer', 'smallint', 'float', 'double'].includes(p.type)) attr.text = 'end'
      lines.push(await this.buildTag({ tag: 'td', attr, html: value }))
    }
    const attr = { '@click': `toggle('${d.id}')`, '@dblclick': `goDetails('${d.id}')` }
    items.push(await this.buildTag({ tag: 'tr', attr, html: lines.join('\n') }))
  }
  html.push(await this.buildTag({ tag: 'tbody', attr: group.body, html: items.join('\n') }))
  params.attr = omit(params.attr, ['sortUpIcon', 'sortDownIcon', 'noSort', 'selection', 'headerNowrap'])
  if (selection === 'multi') {
    params.attr['x-data'] = `{
      toggleAll: false,
      selected: [],
      toggle (id) {
        if (this.selected.includes(id)) {
          const idx = this.selected.indexOf(id)
          this.selected.splice(idx, 1)
        } else this.selected.push(id)
      },
      goDetails (id) {
        window.location.href = '${this._wdbBuildHref('details')}&id=' + id
      }
    }`
    params.attr['x-init'] = `
      $watch('toggleAll', val => {
        if (val) {
          const els = document.getElementsByName('_rt')
          const items = Array.from(els)
          selected = items.map(el => el.value)
        } else selected = []
      })
      $watch('selected', val => $dispatch('on-selection', val))
    `
  } else if (selection === 'single') {
    params.attr['x-data'] = `{
      selected: '',
      toggle (id) {
        this.selected = id
      }
    }`
    params.attr['x-init'] = `
      $watch('selected', val => $dispatch('on-selection', [val]))
    `
  }
  params.html = await this.buildTag({ tag: 'table', attr: params.attr, html: html.join('\n') })
}

export default table
