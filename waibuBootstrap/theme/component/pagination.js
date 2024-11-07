export function getUrlOpts (params = {}) {
  const { get } = this.plugin.app.bajo.lib._
  return {
    params,
    excludes: [
      get(this, 'plugin.app.waibu.config.qsKey.lang', 'lang'),
      get(this, 'plugin.app.waibuMpa.config.darkMode.qsKey', 'dark-mode')
    ]
  }
}

async function pagination (params = {}) {
  const { attrToObject, paginationLayout, groupAttrs } = this.plugin.app.waibuMpa
  const { get, isNumber } = this.plugin.app.bajo.lib._
  const schema = get(this, 'locals.schema', {})
  if (schema.view.disabled.includes('find')) {
    params.html = ''
    return
  }
  let { count, limit, page } = attrToObject(params.attr.options)
  count = count ?? get(this, 'locals.list.count', 0)
  limit = limit ?? get(this, 'locals.list.limit', 25)
  page = page ?? get(this, 'locals.list.page', 1)
  const pages = paginationLayout(count, limit, page) ?? []
  params.noTag = true
  const group = groupAttrs(params.attr, ['pagination'])
  const html = []
  let icon
  let attr
  if (params.attr.first) {
    icon = await this.buildTag({ tag: 'icon', attr: { name: params.attr.firstIcon ?? 'playSkipStart' } })
    attr = { disabled: page <= pages[0], href: this._buildUrl(getUrlOpts.call(this, { page: 1 })) }
    html.push(await this.buildTag({ tag: 'paginationItem', attr, html: icon }))
  }
  if (params.attr.prev) {
    icon = await this.buildTag({ tag: 'icon', attr: { name: params.attr.prevIcon ?? 'playFastBackward' } })
    attr = { disabled: page <= pages[0], href: this._buildUrl(getUrlOpts.call(this, { page: page - 1 })) }
    html.push(await this.buildTag({ tag: 'paginationItem', attr, html: icon }))
  }
  if (!params.attr.noPages) {
    for (const p of pages) {
      attr = { disabled: p === '...', href: this._buildUrl(getUrlOpts.call(this, { page: p })), active: p === page }
      html.push(await this.buildTag({ tag: 'paginationItem', attr, html: isNumber(p) ? this.req.format(p, 'integer') : p }))
    }
  }
  if (params.attr.next) {
    icon = await this.buildTag({ tag: 'icon', attr: { name: params.attr.nextIcon ?? 'playFastForward' } })
    attr = { disabled: page >= pages[pages.length - 1], href: this._buildUrl(getUrlOpts.call(this, { page: page + 1 })) }
    html.push(await this.buildTag({ tag: 'paginationItem', attr, html: icon }))
  }
  if (params.attr.last) {
    icon = await this.buildTag({ tag: 'icon', attr: { name: params.attr.lastIcon ?? 'playSkipEnd' } })
    attr = { disabled: page >= pages[pages.length - 1], href: this._buildUrl(getUrlOpts.call(this, { page: pages[pages.length - 1] })) }
    html.push(await this.buildTag({ tag: 'paginationItem', attr, html: icon }))
  }
  params.attr = group.pagination
  params.html = await this.buildTag({ tag: 'pagination', attr: params.attr, html: html.join('\n') })
}

export default pagination
