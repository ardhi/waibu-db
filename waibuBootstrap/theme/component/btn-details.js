async function btnDetails (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Details')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  params.attr.id = generateId('alpha')
  if (!params.attr.href) params.attr.href = this._buildUrl({ base: 'details' })
  params.attr.split = true
  params.attr.disabled = true
  params.attr['x-data'] = `{
    path: '${params.attr.href}'
  }`
  params.attr['@on-selection.window'] = `
    const recId = $event.detail[0] ?? ''
    const el = document.getElementById('${params.attr.id}')
    if ($event.detail.length === 1) el.classList.remove('disabled')
    else el.classList.add('disabled')
    el.href = path + '&id=' + recId
  `
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnDetails
