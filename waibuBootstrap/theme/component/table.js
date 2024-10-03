async function table (params = {}) {
  const { attrToObject } = this.plugin.app.waibuMpa
  const { get, isEmpty, omit } = this.plugin.app.bajo.lib._
  const qsKey = this.plugin.app.waibu.config.qsKey
  let { count, limit, page, query, sort } = attrToObject(params.attr.options)
  count = count ?? get(this, 'locals.params.count', 0)
  page = page ?? get(this, 'locals.params.page', 1)
  limit = limit ?? get(this, 'locals.params.limit', 25)
  query = count ?? get(this, 'locals.params.query', '')
  sort = count ?? get(this, 'locals.params.sort', '')
  const data = get(this, 'locals.data', [])
  const schema = get(this, 'locals.schema', {})

  params.noTag = true
  const html = []
  let items = []
  // head
  for (const p of schema.properties) {
    items.push(await this.buildTag({ tag: 'th', html: this.req.t(`field.${p.name}`) }))
  }
  const header = await this.buildTag({ tag: 'tr', html: items.join('\n') })
  html.push(await this.buildTag({ tag: 'thead', html: header }))
  // body
  items = []
  for (const d of data) {
    const lines = []
    for (const p of schema.properties) {
      const value = this.req.format(d[p.name], p.type)
      lines.push(await this.buildTag({ tag: 'td', html: value }))
    }
    items.push(await this.buildTag({ tag: 'tr', html: lines.join('\n') }))
  }
  html.push(await this.buildTag({ tag: 'tbody', html: items.join('\n') }))
  params.attr = omit(params.attr, [])
  params.html = await this.buildTag({ tag: 'table', attr: params.attr, html: html.join('\n') })
}

export default table
