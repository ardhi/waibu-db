import wdbBase from '../wdb-base.js'

async function form () {
  const WdbBase = await wdbBase.call(this)

  return class WdbForm extends WdbBase {
    build = async () => {
      const { get, find, filter, forOwn, isEmpty } = this.app.lib._
      const { base64JsonEncode } = this.app.waibu
      const { req } = this.component
      const schema = get(this, 'component.locals.schema', {})
      const data = get(this, 'component.locals.form', {})
      const body = []
      const xModels = get(schema, 'view.x.model', [])
      const xOns = get(schema, 'view.x.on', [])
      for (const l of schema.view.layout) {
        const fields = filter(l.fields, f => schema.view.fields.includes(f))
        if (fields.length === 0) continue
        body.push(`<c:fieldset ${schema.view.card === false ? '' : 'card'} ${l.name[0] !== '_' ? ('t:legend="' + l.name + '"') : ''} grid-gutter="2">`)
        for (const f of fields) {
          const w = schema.view.widget[f]
          let prop = find(schema.properties, { name: f })
          if (!prop) prop = find(schema.view.calcFields, { name: f })
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
            if (schema.view.valueFormatter[f]) value = await schema.view.valueFormatter[f].call(this, data[f], data, { req })
            else if (prop.ref) value = this.getRefValue({ field: f, labelField: w.attr.labelField })
            body.push(`<c:${w.component} ${attributes} data-type="${prop.type}" ${value ? `value="${value}"` : ''} />`)
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
      const xData = get(schema, 'view.x.data', '')
      this.params.attr['x-data'] = isEmpty(xData) ? '' : `{ ${xData} }`
      this.params.attr['x-init'] = get(schema, 'view.x.init', '')

      this.params.tag = this.params.attr.tag ?? 'form'
    }
  }
}

export default form
