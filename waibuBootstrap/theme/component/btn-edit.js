async function btnEdit (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.content)) params.attr.content = this.req.t('Edit')
  params.attr.color = params.attr.color ?? 'secondary-outline'
  params.attr.id = generateId('alpha')
  if (!params.attr.href) params.attr.href = this._buildUrl({ base: 'edit', exclude: ['id'] })
  if (params.attr.auto) {
    params.attr.split = true
    params.attr.disabled = true
    params.attr['x-data'] = `{
      path: '${params.attr.href}'
    }`
    if (params.attr.noClone) {
      params.attr['@on-selection.window'] = `
        const recId = $event.detail[0] ?? ''
        const el = document.getElementById('${params.attr.id}')
        if ($event.detail.length === 1) el.classList.remove('disabled')
        else el.classList.add('disabled')
        el.href = path + '&id=' + recId
      `
      params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
    } else {
      params.attr['@on-selection.window'] = `
        const recId = $event.detail[0] ?? ''
        const elId = '${params.attr.id}'
        for (const id of [elId, elId + '-split']) {
          const el = document.getElementById(id)
          if ($event.detail.length === 1) el.classList.remove('disabled')
          else el.classList.add('disabled')
          const href = path + '&id=' + recId
          if (id.slice(-6) === '-split') {
            const selector = '#' + id.replace('-split', '-menu') + ' a.dropdown-item'
            const item = document.querySelector(selector)
            item.href = href.replace('/edit', '/add') + '&mode=clone'
          } else el.href = href
        }
      `
      const html = [
        await this.buildTag({ tag: 'dropdownItem', attr: { content: this.req.t('Add as New Clone') } })
      ]
      params.html = await this.buildTag({ tag: 'dropdown', attr: params.attr, html: html.join('\n') })
    }
  } else {
    params.attr.href += '&id=' + this.req.query.id
    params.html = await this.buildTag({ tag: 'btn', attr: params.attr, html: params.html })
  }
}

export default btnEdit
