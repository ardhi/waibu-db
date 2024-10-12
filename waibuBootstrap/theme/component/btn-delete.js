async function btnDelete (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Delete')
  params.attr.color = params.attr.color ?? 'danger-outline'
  params.attr.id = generateId('alpha')
  if (params.attr.onList) {
    params.attr.disabled = true
    params.attr['x-data'] = `{
      selected: [],
      remove (ids) {
        wmpa.postForm({ ids }, '${this._buildUrl({ base: 'delete' })}')
      }
    }`
    params.attr['@on-selection.window'] = `
    const el = document.getElementById('${params.attr.id}')
    selected = $event.detail
    if (selected.length > 0) el.classList.remove('disabled')
    else el.classList.add('disabled')
  `
  } else {
    params.attr['x-data'] = `{
      selected: ['${this.req.query.id}'],
      remove (ids) {
        wmpa.postForm({ ids }, '${this._buildUrl({ base: 'delete', exclude: ['id', 'page'] })}')
      }
    }`
  }
  const msg = 'You\'re about to remove one or more records. Are you really sure to do this?'
  params.attr['@click'] = `
    const opts = selected.join(',')
    const id = await wbs.confirmation(\`${this.req.t(msg)}\`, { ok: '${params.attr.id}:remove', close: 'y', opts })
  `
  params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
}

export default btnDelete
