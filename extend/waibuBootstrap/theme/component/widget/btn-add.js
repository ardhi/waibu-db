import wdbBase from '../wdb-base.js'

async function btnAdd () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnAdd extends WdbBase {
    build = async () => {
      const { isEmpty, get } = this.app.lib._
      const { req } = this.component
      this.params.noTag = true
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('create')) {
        this.params.html = ''
        return
      }
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('add')
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      if (!this.params.attr.href) this.params.attr.href = this.component.buildUrl({ base: 'add' })
      this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
    }
  }
}

export default btnAdd
