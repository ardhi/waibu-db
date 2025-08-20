import { getUrlOpts } from './pagination.js'
import wdbBase from '../wdb-base.js'

async function recsInfo () {
  const WdbBase = await wdbBase.call(this)

  return class WdbRecsInfo extends WdbBase {
    build = async () => {
      const { req } = this.component
      const { attrToObject, groupAttrs, attrToArray } = this.plugin.app.waibuMpa
      const { get, isEmpty, omit, merge } = this.plugin.app.bajo.lib._
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      let { count, limit, page, pages } = attrToObject(this.params.attr.options)
      count = count ?? get(this, 'component.locals.list.count', 0)
      if (count === 0) {
        this.params.noTag = true
        this.params.html = ''
        return
      }
      page = page ?? get(this, 'component.locals.list.page', 1)
      limit = limit ?? get(this, 'component.locals.list.limit', 25)
      pages = pages ?? get(this, 'component.locals.list.pages', 0)

      this.params.tag = 'div'
      this.params.attr.flex = 'justify-center:start align-items:center'
      if (!this.params.attr.dropdown) this.params.attr.dropdown = true
      const group = groupAttrs(this.params.attr, ['dropdown'])
      const html = []
      if (this.params.attr.count) html.push(req.t('recsFound%s', req.format(count, 'integer')))
      if (this.params.attr.pages) {
        if (!isEmpty(html)) html[html.length - 1] += '.'
        html.push(req.t('pageOfPages%s%s', req.format(page, 'integer'), req.format(pages, 'integer')))
      }
      if (this.params.attr.recsPerPage) {
        this.params.attr.recsPerPageValues = this.params.attr.recsPerPageValues ?? '10 25 50'
        this.params.attr.recsPerPageValues = attrToArray(this.params.attr.recsPerPageValues)
        if (!isEmpty(html)) html[html.length - 1] += ','
        const items = []
        for (const i of this.params.attr.recsPerPageValues) {
          const attr = { href: this.component.buildUrl(merge(getUrlOpts.call(this), { params: { limit: i, page: 1 } })), disabled: i === limit }
          items.push(await this.component.buildTag({ tag: 'dropdownItem', attr, html: i + '' }))
        }
        const attr = group.dropdown
        attr.content = limit + ''
        attr.color = attr.color ?? 'secondary-outline'
        html.push(await this.component.buildTag({ tag: 'dropdown', attr, html: items.join('\n') }))
        html.push(' ', req.t('recsPerPage'))
      }
      this.params.attr = omit(this.params.attr, ['count', 'pages', 'recsPerPage', 'dropdown', 'recsPerPageValues'])
      this.params.html = html.map(h => `<div class="me-1">${h}</div>`).join('\n')
    }
  }
}

export default recsInfo
