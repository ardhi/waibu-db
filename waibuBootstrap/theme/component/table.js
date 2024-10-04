async function table (params = {}) {
  const { attrToObject } = this.plugin.app.waibuMpa
  const { get, isEmpty, omit, set } = this.plugin.app.bajo.lib._
  const qsKey = this.plugin.app.waibu.config.qsKey
  let { count, limit, page, query, sort } = attrToObject(params.attr.options)
  count = count ?? get(this, 'locals.params.count', 0)
  page = page ?? get(this, 'locals.params.page', 1)
  limit = limit ?? get(this, 'locals.params.limit', 25)
  query = count ?? get(this, 'locals._meta.query.query', '')
  sort = sort ?? get(this, 'locals._meta.query.sort', '')
  let [sortCol, sortDir] = sort.split(':')
  if (!['-1', '1'].includes(sortDir)) sortDir = '1'

  const data = get(this, 'locals.data', [])
  const schema = get(this, 'locals.schema', {})
  let selection = params.attr.selection
  if (![undefined, 'single', 'multi'].includes(selection)) selection = 'multi'
  if (selection) params.attr.hover = true

  params.noTag = true
  const html = []
  let items = []
  // head
  for (const p of schema.properties) {
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
      const attr = { name: '_rtm', noWrapper: true, noLabel: true }
      item = await this.buildTag({ tag: 'formCheck', attr, prepend: '<th>', append: '</th>' })
    }
    items.unshift(item)
  }
  const header = await this.buildTag({ tag: 'tr', html: items.join('\n') })
  html.push(await this.buildTag({ tag: 'thead', html: header }))
  // body
  items = []
  for (const d of data) {
    const lines = []
    if (selection) {
      const tag = selection === 'single' ? 'formRadio' : 'formCheck'
      const attr = { name: '_rt', value: d.id, noLabel: true, noWrapper: true }
      lines.push(await this.buildTag({ tag, attr, prepend: '<td>', append: '</td>' }))
    }
    for (const p of schema.properties) {
      const value = this.req.format(d[p.name], p.type)
      const attr = {}
      if (['integer', 'smallint', 'float', 'double'].includes(p.type)) attr.text = 'end'
      lines.push(await this.buildTag({ tag: 'td', attr, html: value }))
    }
    const attr = { 'x-data': true, '@click': 'selected.push(\'x\'); console.log(selected)' }
    items.push(await this.buildTag({ tag: 'tr', attr, html: lines.join('\n') }))
  }
  const attr = { 'x-data': '{ selected: [] }' }
  html.push(await this.buildTag({ tag: 'tbody', attr, html: items.join('\n') }))
  params.attr = omit(params.attr, ['sortUpIcon', 'sortDownIcon', 'noSort', 'selection', 'headerNowrap'])
  params.html = await this.buildTag({ tag: 'table', attr: params.attr, html: html.join('\n') })
}

export default table
