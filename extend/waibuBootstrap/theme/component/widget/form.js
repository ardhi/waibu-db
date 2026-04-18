import wdbBase from '../wdb-base.js'

async function form () {
  const WdbBase = await wdbBase.call(this)

  return class WdbForm extends WdbBase {
    static async handleRo ({ attr = {}, prop = {} } = {}) {
      return await this.component.buildTag({ tag: 'formPlaintext', attr, selfCosing: true, noEscape: true })
    }

    static async handleRw ({ attr = {}, prop = {}, widget = {} } = {}) {
      const { get, has } = this.app.lib._
      const { stringifyAttribs } = this.app.waibuMpa
      attr.dataType = prop.type
      const cmp = prop.ref ? 'wdb-lookup-select' : widget.component
      if (has(attr, 'name') && !has(attr, 'value')) {
        attr.value = cmp === 'form-plaintext' ? get(this, `oldData.${attr.name}`, attr.dataValue) : attr.dataValue
      }
      return `<c:${cmp} ${stringifyAttribs(attr)} />`
    }

    build = async () => {
      const { get, find, filter, forOwn, isEmpty } = this.app.lib._
      const { base64JsonEncode } = this.app.waibu
      const body = []
      const xModels = get(this.schema, 'view.x.model', [])
      const xOns = get(this.schema, 'view.x.on', [])
      for (const l of this.schema.view.layout) {
        const fields = filter(l.fields, f => this.schema.view.fields.includes(f))
        if (fields.length === 0) continue
        body.push(`<c:fieldset ${this.schema.view.card === false ? '' : 'card'} ${l.name[0] !== '_' ? ('t:legend="' + l.name + '"') : ''} grid-gutter="2">`)
        for (const f of fields) {
          const widget = this.schema.view.widget[f]
          let prop = find(this.schema.properties, { name: f })
          if (!prop) prop = find(this.schema.view.calcFields, { name: f })
          if (!prop) continue
          const attr = {
            'x-ref': widget.name,
            labelFloating: true,
            name: widget.name
          }
          if (xModels.includes(widget.name)) attr['x-model'] = widget.name
          forOwn(widget.attr, (v, k) => {
            if (v === true) attr[k] = true
            else attr[k] = v
          })
          attr.label = this.component.req.t(attr.label)
          const xon = filter(xOns, { field: widget.name })
          for (const o of xon) {
            attr[`@${o.bind}`] = o.handler
          }
          if (widget.componentOpts) attr['c-opts'] = base64JsonEncode(widget.componentOpts)
          if (widget.component === 'form-plaintext' || this.params.attr.method !== 'POST') {
            body.push(await WdbForm.handleRo.call(this, { attr, prop, widget }))
          } else {
            body.push(await WdbForm.handleRw.call(this, { attr, prop, widget }))
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
