import path from 'path'

const defReadonly = ['id', 'createdAt', 'updatedAt']

function getCommons (action, schema, ext, opts = {}) {
  const { map, get, set, without, uniq } = this.lib._
  const label = get(ext, `view.${action}.label`, get(ext, 'common.label', {}))
  const card = get(ext, `view.${action}.card`, get(ext, 'common.card', true))
  const hidden = get(ext, `view.${action}.hidden`, get(ext, 'common.hidden', []))
  const disabled = get(ext, `view.${action}.disabled`, get(ext, 'common.disabled', []))
  const x = get(ext, `view.${action}.x`, get(ext, 'common.x', {}))
  const aggregate = get(ext, `view.${action}.stat.aggregate`, get(ext, 'common.stat.aggregate', []))
  hidden.push(...schema.hidden, ...(opts.hidden ?? []))
  const allFields = without(map(schema.properties, 'name'), ...hidden)
  const forFields = get(ext, `view.${action}.fields`, get(ext, 'common.fields', allFields))
  set(schema, 'view.stat.aggregate', aggregate)
  set(schema, 'view.disabled', disabled)
  set(schema, 'view.x', x)
  if (schema.disabled.length > 0) schema.view.disabled.push(...schema.disabled)
  let fields = []
  for (const f of forFields) {
    if (allFields.includes(f)) fields.push(f)
  }
  fields = uniq(without(fields, ...hidden))
  if (action !== 'add' && !fields.includes('id')) fields.unshift('id')
  let noWrap = get(ext, `view.${action}.noWrap`, get(ext, 'common.noWrap', true))
  if (noWrap === true) noWrap = fields
  else if (noWrap === false) noWrap = []
  set(schema, 'view.noWrap', noWrap)
  return { fields, allFields, label, card }
}

function autoLayout ({ action, schema, ext, layout, allWidgets }) {
  const matches = ['id', 'createdAt', 'updatedAt']
  const meta = []
  const general = []
  for (const w of allWidgets) {
    if (matches.includes(w.name)) meta.push(w)
    else general.push(w)
  }
  if (meta.length <= 1) layout.push({ name: '_common', widgets: allWidgets })
  else {
    layout.push({ name: 'Meta', widgets: meta })
    layout.push({ name: 'General', widgets: general })
  }
}

function customLayout ({ action, schema, ext, layout, allWidgets, readonly }) {
  const { find, omit, merge, isString, isEmpty } = this.lib._
  const items = [...layout]
  layout.splice(0, layout.length)
  for (const item of items) {
    const widgets = []
    for (let f of item.fields) {
      if (isString(f)) {
        const [name, col, label, component] = f.split(':')
        f = { name }
        f.label = isEmpty(label) ? `field.${name}` : label
        if (!isEmpty(col)) f.col = col
        if (!isEmpty(component)) f.component = component
      }
      const widget = find(allWidgets, { name: f.name })
      if (!widget && !f.component) continue
      widget.attr = merge({}, widget.attr, omit(f, ['component', 'componentOpts']))
      if (f.component && !readonly.includes(f.name) && action !== 'details') {
        widget.component = f.component
        widget.componentOpts = f.componentOpts
      }
      widgets.push(widget)
    }
    if (widgets.length > 0) layout.push({ name: item.name, widgets })
  }
}

function applyLayout (action, schema, ext) {
  const { set, get, isEmpty, map, find } = this.lib._
  const { fields, label, card } = getCommons.call(this, action, schema, ext)
  const layout = get(ext, `view.${action}.layout`, get(ext, 'common.layout', []))
  const readonly = get(ext, `view.${action}.readonly`, get(ext, 'common.readonly', defReadonly))
  const allWidgets = map(fields, f => {
    const prop = find(schema.properties, { name: f })
    const result = { name: f, component: 'form-input', attr: { col: '4-md' } }
    if (['array', 'object', 'text'].includes(prop.type)) {
      result.attr.col = '12'
      result.component = 'form-textarea'
      result.attr.rows = '3'
    }
    if (action === 'details') {
      result.component = 'form-plaintext'
    } else {
      if (prop.type === 'boolean') {
        result.component = 'form-select'
        result.attr.options = 'false|No true|Yes'
      }
      if (prop.values) {
        result.component = 'form-select'
        result.attr.options = prop.values.join(' ')
      }
      if (['string', 'text'].includes(prop.type) && prop.maxLength) set(result, 'attr.maxlength', prop.maxLength)
      if (readonly.includes(f)) result.component = 'form-plaintext'
    }
    return result
  })
  if (isEmpty(layout)) autoLayout.call(this, { layout, allWidgets, schema, action, ext })
  else customLayout.call(this, { layout, allWidgets, schema, action, ext, readonly })
  set(schema, 'view.layout', layout)
  set(schema, 'view.fields', fields)
  set(schema, 'view.label', label)
  set(schema, 'view.card', card)
}

const handler = {
  list: async function (schema, ext, opts) {
    const { get, set } = this.lib._
    const { fields, label } = getCommons.call(this, 'list', schema, ext, opts)
    const qsFields = []
    for (const f of get(schema, 'view.qs.fields', '').split(',')) {
      if (fields.includes(f)) qsFields.push(f)
    }
    const sort = get(schema, 'view.qs.sort')
    if (sort) {
      let [col, dir] = get(schema, 'view.qs.sort', '').split(':')
      if (!fields.includes(col) || !col) col = 'id'
      if (!['1', '-1'].includes(dir)) dir = '1'
      set(schema, 'view.qs.sort', `${col}:${dir}`)
    }
    set(schema, 'view.label', label)
    set(schema, 'view.fields', fields)
    set(schema, 'view.qs.fields', qsFields.join(','))
  },
  details: async function (schema, ext, opts) {
    applyLayout.call(this, 'details', schema, ext, opts)
  },
  add: async function (schema, ext, opts) {
    applyLayout.call(this, 'add', schema, ext, opts)
  },
  edit: async function (schema, ext, opts) {
    applyLayout.call(this, 'edit', schema, ext, opts)
  }
}

async function getSchemaExt (model, view, opts) {
  const { readConfig, defaultsDeep } = this.app.bajo
  const { getSchema } = this.app.dobo
  const { pick } = this.lib._

  let schema = getSchema(model)
  const base = path.basename(schema.file, path.extname(schema.file))
  let ext = await readConfig(`${schema.ns}:/waibuDb/schema/${base}.*`, { ignoreError: true, opts })
  const over = await readConfig(`main:/waibuDb/extend/${schema.ns}/schema/${base}.*`, { ignoreError: true, opts })
  ext = defaultsDeep(over, ext)
  await handler[view].call(this, schema, ext, opts)
  schema = pick(schema, ['name', 'properties', 'indexes', 'disabled', 'attachment', 'sortables', 'view'])
  return { schema, ext }
}

export default getSchemaExt
