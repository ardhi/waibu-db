import wdbBase from '../wdb-base.js'

async function btnDetails () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnDetails extends WdbBase {
    build = async () => {
      const { req } = this.component
      const { generateId } = this.app.lib.aneka
      const { isEmpty, get } = this.app.lib._
      this.params.noTag = true
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('update')) {
        this.params.html = ''
        return
      }
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('details')
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      this.params.attr.id = generateId('alpha')
      if (!this.params.attr.href) this.params.attr.href = this.component.buildUrl({ base: 'details', exclude: ['id'] })
      if (this.params.attr.onList) {
        this.params.attr.disabled = true
        this.params.attr['x-ref'] = 'details'
        this.params.attr['x-data'] = `{
          path: '${this.params.attr.href}'
        }`
        this.params.attr['@on-selection.window'] = `
          const recId = $event.detail[0] ?? ''
          if ($event.detail.length === 1) $refs.details.classList.remove('disabled')
          else $refs.details.classList.add('disabled')
          $refs.details.href = path + '&id=' + recId
        `
      } else {
        const prefix = this.params.attr.href.includes('?') ? '' : '?'
        this.params.attr.href += prefix + '&id=' + req.query.id
      }
      this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
    }
  }
}

export default btnDetails
