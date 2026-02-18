import wdbBase from '../wdb-base.js'

export function getUrlOpts (params = {}) {
  const { get } = this.app.lib._
  return {
    params,
    excludes: [
      get(this, 'plugin.app.waibu.config.qsKey.lang', 'lang'),
      get(this, 'plugin.app.waibuMpa.config.darkMode.qsKey', 'dark-mode')
    ]
  }
}

async function pagination () {
  const WdbBase = await wdbBase.call(this)

  return class WdbPagination extends WdbBase {
    build = async () => {
      const { req } = this.component
      const { paginationLayout, groupAttrs } = this.app.waibuMpa
      const { attrToObject } = this.app.waibu
      const { get, isNumber } = this.app.lib._
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      let { count, limit, page } = attrToObject(this.params.attr.options)
      count = count ?? get(this, 'component.locals.list.count', 0)
      if (count === 0) {
        this.params.noTag = true
        this.params.html = ''
        return
      }
      limit = limit ?? get(this, 'component.locals.list.limit', 25)
      page = page ?? get(this, 'component.locals.list.page', 1)
      const pages = paginationLayout(count, limit, page) ?? []
      this.params.noTag = true
      const group = groupAttrs(this.params.attr, ['pagination'])
      const html = []
      let icon
      let attr
      if (this.params.attr.first) {
        icon = await this.component.buildTag({ tag: 'icon', attr: { name: this.params.attr.firstIcon ?? 'playSkipStart' } })
        attr = { disabled: page <= pages[0], href: this.component.buildUrl(getUrlOpts.call(this, { page: 1 })) }
        html.push(await this.component.buildTag({ tag: 'paginationItem', attr, html: icon }))
      }
      if (this.params.attr.prev) {
        icon = await this.component.buildTag({ tag: 'icon', attr: { name: this.params.attr.prevIcon ?? 'playFastBackward' } })
        attr = { disabled: page <= pages[0], href: this.component.buildUrl(getUrlOpts.call(this, { page: page - 1 })) }
        html.push(await this.component.buildTag({ tag: 'paginationItem', attr, html: icon }))
      }
      if (!this.params.attr.noPages) {
        for (const p of pages) {
          attr = { disabled: p === '...', href: this.component.buildUrl(getUrlOpts.call(this, { page: p })), active: p === page }
          html.push(await this.component.buildTag({ tag: 'paginationItem', attr, html: isNumber(p) ? req.format(p, 'integer') : p }))
        }
      }
      if (this.params.attr.next) {
        icon = await this.component.buildTag({ tag: 'icon', attr: { name: this.params.attr.nextIcon ?? 'playFastForward' } })
        attr = { disabled: page >= pages[pages.length - 1], href: this.component.buildUrl(getUrlOpts.call(this, { page: page + 1 })) }
        html.push(await this.component.buildTag({ tag: 'paginationItem', attr, html: icon }))
      }
      if (this.params.attr.last) {
        icon = await this.component.buildTag({ tag: 'icon', attr: { name: this.params.attr.lastIcon ?? 'playSkipEnd' } })
        attr = { disabled: page >= pages[pages.length - 1], href: this.component.buildUrl(getUrlOpts.call(this, { page: pages[pages.length - 1] })) }
        html.push(await this.component.buildTag({ tag: 'paginationItem', attr, html: icon }))
      }
      this.params.attr = group.pagination
      this.params.html = await this.component.buildTag({ tag: 'pagination', attr: this.params.attr, html: html.join('\n') })
    }
  }
}

export default pagination
