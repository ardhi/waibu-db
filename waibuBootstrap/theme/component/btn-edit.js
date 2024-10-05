async function btnEdit (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Edit')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  params.attr.id = generateId('alpha')
  params.attr.disabled = true
  params.attr['x-data'] = true
  params.attr['@on-selection.window'] = `
    const el = document.getElementById('${params.attr.id}')
    if ($event.detail.length === 1) el.classList.remove('disabled')
    else el.classList.add('disabled')
  `
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnEdit
