import wdbBase from '../wdb-base.js'

async function form () {
  const WdbBase = await wdbBase.call(this)

  return class WdbForm extends WdbBase {
    build = async () => {
      const { get, find, filter, forOwn, isEmpty } = this.app.lib._
      const { base64JsonEncode } = this.app.waibu
      const { req } = this.component
      const data = get(this, 'component.locals.form', {})
      const body = []
      const xModels = get(this.schema, 'view.x.model', [])
      const xOns = get(this.schema, 'view.x.on', [])
      for (const l of this.schema.view.layout) {
        const fields = filter(l.fields, f => this.schema.view.fields.includes(f))
        if (fields.length === 0) continue
        body.push(`<c:fieldset ${this.schema.view.card === false ? '' : 'card'} ${l.name[0] !== '_' ? ('t:legend="' + l.name + '"') : ''} grid-gutter="2">`)
        for (const f of fields) {
          const w = this.schema.view.widget[f]
          let prop = find(this.schema.properties, { name: f })
          if (!prop) prop = find(this.schema.view.calcFields, { name: f })
          if (!prop) continue
          const attr = [`x-ref="${w.name}"`]
          if (xModels.includes(w.name)) attr.push(`x-model="${w.name}"`)
          forOwn(w.attr, (v, k) => {
            if (v === true) attr.push(k)
            else attr.push(`${k}="${v}"`)
          })
          const xon = filter(xOns, { field: w.name })
          for (const o of xon) {
            attr.push(`@${o.bind}="${o.handler}"`)
          }
          if (w.componentOpts) attr.push(`c-opts="${base64JsonEncode(w.componentOpts)}"`)
          const attributes = `${w.attr.label ? ('t:label="' + w.attr.label + '"') : ''} label-floating name="${w.name}" ${attr.join(' ')}`
          if (w.component === 'form-plaintext' || this.params.attr.method !== 'POST') {
            let value
            let link
            if (this.schema.view.formatValue[f]) value = await this.schema.view.formatValue[f].call(this, data[f], data, { req })
            else if (prop.ref) {
              value = this.getRefValue({ field: f, labelField: w.attr.labelField, refName: this.getRefName(f) })
              const format = get(this.schema, `view.format.${f}`)
              if (format && !isEmpty(value)) link = await format.call(this.model, value, data, { linkOnly: true })
            }
            body.push(`<c:${w.component} ${attributes} data-type="${prop.type}" ${value ? `value="${value}"` : ''} ${link ? `href="${link}"` : ''} />`)
          } else if (prop.ref) {
            body.push(`<c:wdb-lookup-select ${attributes} />`)
          } else {
            body.push(`<c:${w.component} ${attributes} data-type="${prop.type}" />`)
          }
        }
        body.push('</c:fieldset>')
      }
      const html = await this.component.buildSentence(body, this.component.locals)
      this.params.html = `${html}\n${this.params.html}`
      const xData = get(this.schema, 'view.x.data', '')
      this.params.attr['x-data'] = isEmpty(xData) ? '' : `{ ${xData} }`
      this.params.attr['x-init'] = get(this.schema, 'view.x.init', '')

      this.params.tag = this.params.attr.tag ?? 'form'
    }
  }
}

export default form
