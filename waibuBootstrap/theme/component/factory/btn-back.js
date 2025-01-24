import wdbBase from '../wdb-base.js'

async function btnBack () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnBack extends WdbBase {
    async build () {
      const { isEmpty } = this.plugin.app.bajo.lib._
      const { attrToArray } = this.plugin.app.waibuMpa
      const { req } = this.component
      this.params.noTag = true
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('Back')
      if (isEmpty(this.params.attr.icon)) this.params.attr.icon = 'arrowStart'
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      this.params.attr.excludeQs = ['mode', 'id', ...attrToArray(this.params.attr.excludeQs ?? '')]
      if (!this.params.attr.href) this.params.attr.href = this.component.buildUrl({ base: 'list', exclude: this.params.attr.excludeQs })
      this.params.html = await this.component.buildTag({ tag: 'btn', attr: this.params.attr, html: this.params.html })
    }
  }
}

export default btnBack
