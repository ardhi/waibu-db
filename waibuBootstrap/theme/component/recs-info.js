import { getUrlOpts } from './pagination.js'

async function recordsInfo (params = {}) {
  const { attrToObject } = this.plugin.app.waibuMpa
  const { get, isEmpty } = this.plugin.app.bajo.lib._
  let { count, limit, page, pages } = attrToObject(params.attr.options)
  count = count ?? get(this, 'locals.params.count', 0)
  page = page ?? get(this, 'locals.params.page', 1)
  limit = limit ?? get(this, 'locals.params.limit', 25)
  pages = pages ?? get(this, 'locals.params.pages', 0)

  params.tag = 'div'
  params.attr.flex = 'justify-center:start align-items:center'
  if (count === 0) {
    params.html = this.req.t('No record found')
    return
  }
  const html = []
  if (params.attr.showTotal) html.push(this.req.t('%d records found', count))
  if (params.attr.showPages) {
    if (!isEmpty(html)) html[html.length - 1] += '.'
    html.push(this.req.t('Page %d of %d pages', page, pages))
  }
  if (params.attr.showLimits) {
    if (!isEmpty(html)) html[html.length - 1] += ','
    const items = []
    for (const i of [10, 25, 50]) {
      const attr = { href: this._buildUrl({ limit: i, page: 1 }, getUrlOpts.call(this)), disabled: i === limit }
      items.push(await this.buildTag({ tag: 'dropdownItem', attr, html: i + '' }))
    }
    const attr = { content: limit + '', color: 'primary' }
    html.push(await this.buildTag({ tag: 'dropdown', attr, html: items.join('\n') }))
    html.push(' recs per page')
  }
  params.html = html.map(h => `<div class="me-1">${h}</div>`).join('\n')
}

export default recordsInfo
