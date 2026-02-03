import wdbBase from '../wdb-base.js'

async function btnColumns () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnColumns extends WdbBase {
    build = async () => {
      const { find, get, isEmpty, without } = this.app.lib._
      const { jsonStringify } = this.app.waibuMpa
      const { req } = this.component
      const qsKey = this.app.waibu.config.qsKey
      const schema = get(this, 'component.locals.schema', {})
      const count = get(this, 'component.locals.list.count', 0)
      if (count === 0) this.params.attr.triggerDisabled = true
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      let fields = without(get(this, `component.locals._meta.query.${qsKey.fields}`, '').split(','), '')
      if (isEmpty(fields)) fields = schema.view.fields
      const items = []
      this.params.attr.color = this.params.attr.color ?? 'secondary-outline'
      if (isEmpty(this.params.attr.content)) this.params.attr.content = req.t('columns')
      for (const f of schema.view.fields) {
        if (!fields.includes(f)) continue
        let prop = find(schema.properties, { name: f })
        if (!prop) prop = find(schema.view.calcFields, { name: f })
        if (!prop) continue
        if (f === 'id') {
          items.push(await this.component.buildTag({ tag: 'formCheck', attr: { checked: true, label: req.t('ID'), value: f, disabled: true } }))
          continue
        }
        const attr = { 'x-model': 'selected', label: req.t(get(schema, `view.label.${f}`, `field.${f}`)), value: f }
        if (fields.includes(f)) attr.checked = true
        items.push(await this.component.buildTag({ tag: 'formCheck', attr }))
      }
      const href = this.component.buildUrl({ exclude: [qsKey.fields] })
      const menuPrepend = ['<form class="mt-2 mb-3 mx-3" ']
      menuPrepend.push(`x-data="{
        selected: ${jsonStringify(fields, true)},
        all: ${jsonStringify(schema.view.fields, true)}
      }"`)
      menuPrepend.push(`x-init="
        $refs.apply.href = '${href}&${qsKey.fields}=' + selected.join(',')
        $watch('selected', v => {
          $refs.apply.href = '${href}&${qsKey.fields}=' + v.join(',')
        })
      ">`)
      this.params.attr.menuPrepend = Buffer.from(menuPrepend.join('\n')).toString('base64')
      const attr = { size: 'sm', 'x-ref': 'apply', margin: 'top-2', color: this.params.attr.applyColor ?? 'primary', icon: this.params.attr.applyIcon ?? 'arrowsStartEnd', href }
      let menuAppend = await this.component.buildTag({ tag: 'btn', attr, html: req.t('apply') })
      menuAppend += '\n</form>'
      this.params.attr.menuAppend = Buffer.from(menuAppend).toString('base64')
      this.params.attr.autoClose = 'outside'
      this.params.attr.triggerColor = this.params.attr.color
      this.params.attr.menuDir = this.params.attr.menuDir ?? 'end'
      this.params.attr.menuMax = this.params.attr.menuMax ?? '10'
      const html = [...items]
      this.params.html = await this.component.buildTag({ tag: 'dropdown', attr: this.params.attr, html: html.join('\n') })
      this.params.noTag = true
    }
  }
}

export default btnColumns
