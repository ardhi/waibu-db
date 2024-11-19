async function btnDetails (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { isEmpty, get } = this.plugin.app.bajo.lib._
  params.noTag = true
  const schema = get(this, 'locals.schema', {})
  if (schema.view.disabled.includes('update')) {
    params.html = ''
    return
  }
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Details')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  params.attr.id = generateId('alpha')
  if (!params.attr.href) params.attr.href = this._buildUrl({ base: 'details', exclude: ['id'] })
  if (params.attr.onList) {
    params.attr.disabled = true
    params.attr['x-ref'] = 'details'
    params.attr['x-data'] = `{
      path: '${params.attr.href}'
    }`
    params.attr['@on-selection.window'] = `
      const recId = $event.detail[0] ?? ''
      if ($event.detail.length === 1) $refs.details.classList.remove('disabled')
      else $refs.details.classList.add('disabled')
      $refs.details.href = path + '&id=' + recId
    `
  } else {
    params.attr.href += '&id=' + this.req.query.id
  }
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnDetails
