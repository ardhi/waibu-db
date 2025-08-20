import wdbBase from '../wdb-base.js'

async function btnClone () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnClone extends WdbBase {
    build = async () => {
      const { req } = this.component
      const { isEmpty, get } = this.plugin.app.bajo.lib._
      this.params.noTag = true
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('create')) {
        this.params.html = ''
        return
      }
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('clone')
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      if (!this.params.attr.href) this.params.attr.href = this.component.buildUrl({ base: 'add', exclude: ['id'] }) + '&mode=clone'
      if (this.params.attr.onList) {
        this.params.attr['x-ref'] = 'clone'
        this.params.attr.disabled = true
        this.params.attr['x-data'] = `{
          path: '${this.params.attr.href}'
        }`
        this.params.attr['@on-selection.window'] = `
          const recId = $event.detail[0] ?? ''
          if ($event.detail.length === 1) $refs.clone.classList.remove('disabled')
          else $refs.clone.classList.add('disabled')
          $refs.clone.href = path + '&id=' + recId
        `
      } else {
        this.params.attr.href += '&id=' + req.query.id
      }
      this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
    }
  }
}

export default btnClone
