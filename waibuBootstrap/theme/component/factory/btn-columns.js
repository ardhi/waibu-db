import wdbBase from '../wdb-base.js'

async function btnColumns () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnColumns extends WdbBase {
    async build () {
      const { get, isEmpty, without } = this.plugin.app.bajo.lib._
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { req } = this.component
      const qsKey = this.plugin.app.waibu.config.qsKey
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      let fields = without(get(this, `component.locals._meta.query.${qsKey.fields}`, '').split(','), '')
      if (isEmpty(fields)) fields = schema.view.fields
      const items = []
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('Columns')
      for (const f of schema.view.fields) {
        if (f === 'id') {
          items.push(await this.component.buildTag({ tag: 'formCheck', attr: { checked: true, label: req.t('ID'), value: f, disabled: true } }))
          continue
        }
        const attr = { 'x-model': 'selected', label: req.t(`field.${f}`), value: f }
        if (fields.includes(f)) attr.checked = true
        items.push(await this.component.buildTag({ tag: 'formCheck', attr }))
      }
      const href = this.component.buildUrl({ exclude: [qsKey.fields] })
      const html = ['<form class="mt-1 mb-2 mx-3" ']
      html.push(`x-data="{
        selected: ${jsonStringify(fields, true)},
        all: ${jsonStringify(schema.view.fields, true)}
      }"`)
      html.push(`x-init="
        $refs.apply.href = '${href}&${qsKey.fields}=' + selected.join(',')
        $watch('selected', v => {
          $refs.apply.href = '${href}&${qsKey.fields}=' + v.join(',')
        })
      ">`)
      html.push(...items)
      const attr = { size: 'sm', 'x-ref': 'apply', margin: 'top-2', color: this.params.attr.applyColor ?? 'primary', icon: this.params.attr.applyIcon ?? 'arrowsStartEnd', href }
      html.push(await this.component.buildTag({ tag: 'btn', attr, html: req.t('Apply') }))
      html.push('</form>')
      this.params.attr.autoClose = 'outside'
      this.params.attr.triggerColor = this.params.attr.color
      this.params.html = await this.component.buildTag({ tag: 'dropdown', attr: this.params.attr, html: html.join('\n') })
      this.params.noTag = true
    }
  }
}

export default btnColumns
