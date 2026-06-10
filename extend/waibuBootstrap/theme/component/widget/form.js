import wdbBase from '../wdb-base.js'

async function form () {
  const WdbBase = await wdbBase.call(this)

  return class WdbForm extends WdbBase {
    static async handleRo ({ attr = {}, prop = {}, widget = {} } = {}) {
      return await this.component.buildTag({ tag: 'formPlaintext', attr, addons: widget.addons, selfCosing: true, noEscape: true }, { prop, widget })
    }

    static async handleRw ({ attr = {}, prop = {}, widget = {} } = {}) {
      const { get, has, camelCase } = this.app.lib._
      // const { stringifyAttribs } = this.app.waibuMpa
      attr.dataType = prop.type
      if (has(attr, 'name') && !has(attr, 'value') && widget.component === 'form-plaintext') {
        attr.value = get(this, `oldData.${attr.name}`, attr.dataValue)
      }
      return await this.component.buildTag({ tag: camelCase(widget.component), attr, addons: widget.addons, selfCosing: true, noEscape: true }, { prop, widget })
      // return `<c:${widget.component} ${stringifyAttribs(attr)} />`
    }

    build = async () => {
      const { get, find, filter, forOwn, isEmpty, omit, isArray } = this.app.lib._
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
          const prop = find(this.schema.properties, { name: f })
          if (!prop) continue
          if (['dobo:image'].includes(prop.feature)) continue
          const attr = {
            'x-ref': widget.name,
            labelFloating: true,
            name: widget.name
          }
          if (xModels.includes(widget.name)) attr['x-model'] = widget.name
          forOwn(omit(widget.attr, ['url', 'refUrl', 'refName']), (v, k) => {
            if (v === true) attr[k] = true
            else attr[k] = v
          })
          if (['array', 'object'].includes(prop.type)) attr.col = '12-md'
          attr.label = this.component.req.t(attr.label)
          const xon = filter(xOns, { field: widget.name })
          for (const o of xon) {
            attr[`@${o.bind}`] = o.handler
          }
          if (widget.componentOpts) attr['c-opts'] = base64JsonEncode(widget.componentOpts)
          if (prop.virtual) widget.component = 'form-plaintext'
          const immutable = get(this, 'formData._immutable', [])
          if ((immutable.length === 1 && immutable[0] === '*') || immutable.includes(prop.name)) widget.component = 'form-plaintext'
          widget.addons = widget.addons ?? []
          if (!isArray(widget.addons)) widget.addons = [widget.addons]
          for (const ao of widget.addons) {
            const tag = ao.type === 'button' ? 'btn' : 'formInputAddon'
            ao.html = await this.component.buildTag({ tag, attr: ao.attr, html: ao.html })
            ao.position = ao.position ?? 'append'
          }
          let html
          if (widget.component === 'form-plaintext' || this.params.attr.method !== 'POST') {
            html = await WdbForm.handleRo.call(this, { attr, prop, widget })
          } else {
            html = await WdbForm.handleRw.call(this, { attr, prop, widget })
          }
          body.push(html)
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
