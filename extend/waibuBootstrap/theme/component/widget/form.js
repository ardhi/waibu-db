import wdbBase from '../wdb-base.js'

async function handleRo (attr = {}, prop = {}, widget = {}) {
  const { get, camelCase, isEmpty, isString } = this.app.lib._
  const { callHandler } = this.app.bajo
  const { escape } = this.app.waibu
  const { req } = this.component
  const dataValue = get(this.formData, `_orig.${prop.name}`, prop.dataValue ?? '')
  let value = get(this.oldData, prop.name, get(this.formData, prop.name, prop.value ?? ''))
  const format = get(this.schema, `view.format.${prop.name}`)
  const formatValue = get(this.schema, `view.formatValue.${prop.name}`)
  const labelField = get(this.schema, `view.widget.${prop.name}.attr.labelField`)
  if (formatValue) value = await formatValue.call(this, value, this.formData, { req })
  else if (prop.ref) {
    value = this.getRefValue({ field: prop.name, labelField, refName: this.getRefName(prop.name) })
    if (format && !isEmpty(value)) attr.href = await format.call(this, value, this.formData, { linkOnly: true })
  } else if (prop.values) {
    const values = isString(prop.values) ? (await callHandler(prop.values)) : prop.values
    value = values.find(v => v.value === dataValue)
    if (value) {
      const key = camelCase(`${prop.name} ${value.text}`)
      value = req.te(key) ? req.t(key) : value.text
    }
  } else if (format && !isEmpty(value)) value = await format.call(this, value, this.formData)
  attr.dataValue = escape(dataValue)
  attr.value = escape(value)
  attr.dataType = prop.type

  if (['object', 'array', 'text'].includes(prop.type)) {
    attr.style = 'min-height: 100px'
    return await this.component.buildTag({ tag: 'formTextarea', attr, html: value })
  }
  return await this.component.buildTag({ tag: 'formPlaintext', attr, selfCosing: true, noEscape: true })
}

async function handleRw (attr = {}, prop = {}, widget = {}) {
  const { get, has, isPlainObject, isArray } = this.app.lib._
  const { escape } = this.app.waibu
  const { stringifyAttribs } = this.app.waibuMpa
  if (has(attr, 'name') && !has(attr, 'value')) {
    attr.dataType = attr.dataType ?? prop.type
    attr.dataValue = get(this, `formData.${attr.name}`)
    if (isPlainObject(attr.dataValue) || isArray(attr.dataValue)) attr.dataValue = JSON.stringify(attr.dataValue)
    attr.dataValue = escape(attr.dataValue)
    attr.value = widget.component === 'form-plaintext' ? get(this, `oldData.${attr.name}`, attr.dataValue) : attr.dataValue
  }

  const cmp = prop.ref ? 'wdb-lookup-select' : widget.component
  return `<c:${cmp} ${stringifyAttribs(attr)} data-type="${prop.type}" />`
}

async function form () {
  const WdbBase = await wdbBase.call(this)

  return class WdbForm extends WdbBase {
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
            body.push(await handleRo.call(this, attr, prop, widget))
          } else {
            body.push(await handleRw.call(this, attr, prop, widget))
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
