import { getUrlOpts } from './pagination.js'

async function recordsInfo (params = {}) {
  const { attrToObject, groupAttrs, attrToArray } = this.plugin.app.waibuMpa
  const { get, isEmpty, omit } = this.plugin.app.bajo.lib._
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
  if (!params.attr.dropdown) params.attr.dropdown = true
  const group = groupAttrs(params.attr, ['dropdown'])
  const html = []
  if (params.attr.count) html.push(this.req.t('%d records found', count))
  if (params.attr.pages) {
    if (!isEmpty(html)) html[html.length - 1] += '.'
    html.push(this.req.t('Page %d of %d pages', page, pages))
  }
  if (params.attr.recsPerPage) {
    params.attr.recsPerPageValues = params.attr.recsPerPageValues ?? '10 25 50'
    params.attr.recsPerPageValues = attrToArray(params.attr.recsPerPageValues)
    if (!isEmpty(html)) html[html.length - 1] += ','
    const items = []
    for (const i of params.attr.recsPerPageValues) {
      const attr = { href: this._buildUrl({ limit: i, page: 1 }, getUrlOpts.call(this)), disabled: i === limit }
      items.push(await this.buildTag({ tag: 'dropdownItem', attr, html: i + '' }))
    }
    const attr = group.dropdown
    attr.content = limit + ''
    attr.color = attr.color ?? 'primary'
    html.push(await this.buildTag({ tag: 'dropdown', attr, html: items.join('\n') }))
    html.push(' recs per page')
  }
  params.attr = omit(params.attr, ['count', 'pages', 'recsPerPage', 'dropdown', 'recsPerPageValues'])
  params.html = html.map(h => `<div class="me-1">${h}</div>`).join('\n')
}

export default recordsInfo