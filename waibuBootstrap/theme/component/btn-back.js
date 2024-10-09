async function btnBack (params = {}) {
  const { isEmpty } = this.plugin.app.bajo.lib._
  const { attrToArray } = this.plugin.app.waibuMpa
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Back')
  if (isEmpty(params.attr.icon)) params.attr.icon = 'arrowStart'
  params.attr.color = params.attr.color ?? 'secondary-outline'
  params.attr.excludeQs = params.attr.excludeQs ?? 'id'
  params.attr.excludeQs = attrToArray(params.attr.excludeQs)
  if (!params.attr.href) params.attr.href = this._buildUrl({ base: 'list', exclude: params.attr.excludeQs })
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnBack
