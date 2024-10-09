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
  const { attrToArray, groupAttrs } = this.plugin.app.waibuMpa
  const { get, omit, set, find } = this.plugin.app.bajo.lib._
  const group = groupAttrs(params.attr, ['body', 'head', 'foot'])
  params.attr = group._

  const data = get(this, 'locals.data.data', [])
  const schema = get(this, 'locals.schema', {})
  const qsKey = this.plugin.app.waibu.config.qsKey
  const fields = getFields.call(this, params.attr.fields)
  const sort = params.attr.sort ? attrToArray(params.attr.sort) : get(this, `locals._meta.query.${qsKey.sort}`, '')

  let [sortCol, sortDir] = sort.split(':')
  if (!['-1', '1'].includes(sortDir)) sortDir = '1'

  let selection = params.attr.selection
  if (![undefined, 'single', 'multi'].includes(selection)) selection = 'multi'
  if (selection) params.attr.hover = true

  params.noTag = true
  const html = []
  let items = []
  // head
  for (const f of schema.view.fields) {
    if (!fields.includes(f)) continue
    let head = this.req.t(`field.${f}`)
    if (!params.attr.noSort && (schema.sortables ?? []).includes(f)) {
      let sortItem = `${f}:-1`
      let icon = params.attr.sortUpIcon ?? 'caretUp'
      if (f === sortCol) {
        sortItem = `${f}:${sortDir === '1' ? '-1' : '1'}`
        icon = sortDir === '1' ? (params.attr.sortUpIcon ?? 'caretUp') : (params.attr.sortDownIcon ?? 'caretDown')
      }
      const item = set({ page: 1 }, qsKey.sort, sortItem)
      const href = this._buildUrl({ params: item })
      const content = [
        await this.buildTag({ tag: 'div', html: this.req.t(`field.${f}`) }),
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
    for (const f of schema.view.fields) {
      const prop = find(schema.properties, { name: f })
      if (!fields.includes(f)) continue
      const value = this.req.format(d[f], prop.type)
      const attr = {}
      if (['integer', 'smallint', 'float', 'double'].includes(prop.type)) attr.text = 'end'
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
        window.location.href = '${this._buildUrl({ base: 'details' })}&id=' + id
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
