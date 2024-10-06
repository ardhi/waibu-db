export function buildHref (path) {
  const parts = this.req.url.split('?')[0].split('/')
  parts.pop()
  parts.push(path)
  return parts.join('/')
}

async function btnAdd (params = {}) {
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Add')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  if (!params.attr.href) params.attr.href = buildHref.call(this, 'add')
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnAdd
