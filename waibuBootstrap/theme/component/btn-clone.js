async function btnClone (params = {}) {
  const { isEmpty, get } = this.plugin.app.bajo.lib._
  params.noTag = true
  const schema = get(this, 'locals.schema', {})
  if (schema.disabled.includes('create')) {
    params.html = ''
    return
  }
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Clone')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  if (!params.attr.href) params.attr.href = this._buildUrl({ base: 'add', exclude: ['id'] }) + '&mode=clone'
  if (params.attr.onList) {
    params.attr['x-ref'] = 'clone'
    params.attr.disabled = true
    params.attr['x-data'] = `{
      path: '${params.attr.href}'
    }`
    params.attr['@on-selection.window'] = `
      const recId = $event.detail[0] ?? ''
      if ($event.detail.length === 1) $refs.clone.classList.remove('disabled')
      else $refs.clone.classList.add('disabled')
      $refs.clone.href = path + '&id=' + recId
    `
  } else {
    params.attr.href += '&id=' + this.req.query.id
  }
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnClone
