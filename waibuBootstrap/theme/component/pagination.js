export function getUrlOpts () {
  const { get } = this.plugin.app.bajo.lib._
  return {
    excludes: [
      get(this, 'plugin.app.waibu.config.qsKey.lang', 'lang'),
      get(this, 'plugin.app.waibuMpa.config.darkMode.qsKey', 'dark-mode')
    ]
  }
}

async function pagination (params = {}) {
  const { attrToObject, paginationLayout } = this.plugin.app.waibuMpa
  const { get } = this.plugin.app.bajo.lib._
  let { count, limit, page } = attrToObject(params.attr.options)
  count = count ?? get(this, 'locals.params.count', 0)
  limit = limit ?? get(this, 'locals.params.limit', 25)
  page = page ?? get(this, 'locals.params.page', 1)
  const pages = paginationLayout(count, limit, page)
  params.noTag = true
  const prevIcon = await this.buildTag({ tag: 'icon', attr: { name: 'playFastBackward' } })
  const nextIcon = await this.buildTag({ tag: 'icon', attr: { name: 'playFastForward' } })
  let attr = { disabled: page <= pages[0], href: this._buildUrl({ page: page - 1 }, getUrlOpts.call(this)) }
  const html = [await this.buildTag({ tag: 'paginationItem', attr, html: prevIcon })]
  for (const p of pages) {
    attr = { disabled: p === '...', href: this._buildUrl({ page: p }, getUrlOpts.call(this)), active: p === page }
    html.push(await this.buildTag({ tag: 'paginationItem', attr, html: p }))
  }
  attr = { disabled: page >= pages[pages.length - 1], href: this._buildUrl({ page: page + 1 }, getUrlOpts.call(this)) }
  html.push(await this.buildTag({ tag: 'paginationItem', attr, html: nextIcon }))
  delete params.attr.options
  params.html = await this.buildTag({ tag: 'pagination', attr: params.attr, html: html.join('\n') })
}

export default pagination
