import wdbBase from '../wdb-base.js'

async function btnDelete () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnDelete extends WdbBase {
    build = async () => {
      const { req } = this.component
      const { generateId } = this.plugin.app.bajo
      const { isEmpty, get } = this.plugin.app.bajo.lib._
      this.params.noTag = true
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('delete')) {
        this.params.html = ''
        return
      }
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('delete')
      this.params.attr.color = this.params.attr.color ?? 'danger-outline'
      this.params.attr.id = generateId('alpha')
      if (this.params.attr.onList) {
        this.params.attr.disabled = true
        this.params.attr['x-data'] = `{
          selected: [],
          remove (modalId, ids) {
            ids = JSON.parse(wmpa.fromBase64(ids)).join(',')
            wmpa.postForm({ ids }, '${this.component.buildUrl({ base: 'delete' })}')
          }
        }`
        this.params.attr['@on-selection.window'] = `
        const el = document.getElementById('${this.params.attr.id}')
        selected = $event.detail
        if (selected.length > 0) el.classList.remove('disabled')
        else el.classList.add('disabled')
      `
      } else {
        this.params.attr['x-data'] = `{
          selected: ['${req.query.id}'],
          remove (modalId, ids) {
            ids = JSON.parse(wmpa.fromBase64(ids)).join(',')
            wmpa.postForm({ ids }, '${this.component.buildUrl({ base: 'delete', exclude: ['id', 'page'] })}')
          }
        }`
      }
      const msg = 'aboutToRemoveRecord'
      this.params.attr['@click'] = `
        await wbs.confirmation(\`${req.t(msg)}\`, { ok: '${this.params.attr.id}:remove', close: 'y', opts: selected })
      `
      this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
    }
  }
}

export default btnDelete
