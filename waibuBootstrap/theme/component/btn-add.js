async function btnAdd (params = {}) {
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Add')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  if (!params.attr.href) params.attr.href = this._buildUrl({ base: 'add' })
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnAdd
