async function btnClone (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Clone')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  params.attr.id = generateId('alpha')
  if (!params.attr.href) params.attr.href = this._wdbBuildHref('add', ['id']) + '&mode=clone'
  if (params.attr.auto) {
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
  } else {
    params.attr.href += '&id=' + this.req.query.id
  }
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnClone
