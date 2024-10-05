async function btnAdd (params = {}) {
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Add New')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  if (!params.attr.href) {
    const parts = this.req.url.split('?')[0].split('/')
    parts.pop()
    parts.push('add')
    params.attr.href = parts.join('/')
  }
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnAdd
