import wdbBase from '../wdb-base.js'

async function form () {
  const WdbBase = await wdbBase.call(this)

  return class WdbForm extends WdbBase {
    build = async () => {
      const { get, find, filter, forOwn, isEmpty } = this.plugin.lib._
      const { base64JsonEncode } = this.plugin.app.waibuMpa
      const schema = get(this, 'component.locals.schema', {})
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
          body.push(`<c:${w.component} ${w.attr.label ? ('t:label="' + w.attr.label + '"') : ''} data-type="${prop.type}" label-floating name="${w.name}" ${attr.join(' ')} />`)
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
