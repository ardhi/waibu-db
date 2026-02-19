import path from 'path'

const defReadonly = ['id', 'createdAt', 'updatedAt']

const defFormatter = {}

function getCommons (action, schema, ext, options = {}) {
  const { defaultsDeep } = this.app.lib.aneka
  const { merge, map, get, set, without, uniq, pull } = this.app.lib._
  const calcFields = get(ext, `view.${action}.calcFields`, get(ext, 'common.calcFields', []))
  const forceVisible = get(ext, `view.${action}.forceVisible`, get(ext, 'common.forceVisible', []))
  const widget = defaultsDeep(get(ext, `view.${action}.widget`), get(ext, 'common.widget', {}))
  const noEscape = get(ext, `view.${action}.noEscape`, get(ext, 'common.noEscape', []))
  const control = defaultsDeep(get(ext, `view.${action}.control`), get(ext, 'common.control', {}))
  const valueFormatter = defaultsDeep(get(ext, `view.${action}.valueFormatter`), get(ext, 'common.valueFormatter', {}))
  const formatter = defaultsDeep(get(ext, `view.${action}.formatter`), get(ext, 'common.formatter', {}))
  const card = get(ext, `view.${action}.card`, get(ext, 'common.card', true))
  let hidden = get(ext, `view.${action}.hidden`, get(ext, 'common.hidden', []))
  const disabled = get(ext, `view.${action}.disabled`, get(ext, 'common.disabled', []))
  const x = defaultsDeep(get(ext, `view.${action}.x`), get(ext, 'common.x', {}))
  const aggregate = get(ext, `view.${action}.stat.aggregate`, get(ext, 'common.stat.aggregate', []))
  let attachment = get(ext, `view.${action}.attachment`, get(ext, 'common.attachment', false))
  if (!schema.attachment || action === 'list') attachment = false
  hidden.push('siteId', ...schema.hidden, ...(options.hidden ?? []))
  hidden = uniq(hidden)
  pull(hidden, ...forceVisible)
  const allFields = without(map(schema.properties, 'name'), ...hidden)
  const forFields = get(ext, `view.${action}.fields`, get(ext, 'common.fields', allFields))
  set(schema, 'view.attachment', attachment)
  set(schema, 'view.calcFields', calcFields)
  set(schema, 'view.noEscape', noEscape)
  set(schema, 'view.widget', widget)
  set(schema, 'view.valueFormatter', valueFormatter)
  set(schema, 'view.formatter', merge({}, defFormatter, formatter))
  set(schema, 'view.stat.aggregate', aggregate)
  set(schema, 'view.disabled', disabled)
  set(schema, 'view.control', control)
  set(schema, 'view.x', x)
  if (schema.disabled.length > 0) schema.view.disabled.push(...schema.disabled)
  let fields = []
  const calcFieldNames = map(calcFields, 'name')
  for (const f of forFields) {
    if (calcFieldNames.includes(f) || allFields.includes(f)) fields.push(f)
  }
  fields = uniq(without(fields, ...hidden))

  options.forceShowId = options.forceShowId ?? true
  if (options.forceShowId && action !== 'add' && !fields.includes('id')) fields.unshift('id')
  let noWrap = get(ext, `view.${action}.noWrap`, get(ext, 'common.noWrap', true))
  if (noWrap === true) noWrap = fields
  else if (noWrap === false) noWrap = []
  set(schema, 'view.noWrap', noWrap)
  return { fields, allFields, card, calcFields }
}

function autoLayout ({ action, schema, ext, layout }) {
  const { forOwn, keys } = this.app.lib._
  const matches = ['id', 'createdAt', 'updatedAt']
  const meta = []
  const general = []
  forOwn(schema.view.widget, (w, f) => {
    if (matches.includes(f)) meta.push(f)
    else general.push(f)
  })
  if (meta.length <= 1) layout.push({ name: '_common', fields: keys(schema.view.widget) })
  else {
    layout.push({ name: 'Meta', fields: meta })
    layout.push({ name: 'General', fields: general })
  }
}

function customLayout ({ action, schema, ext, layout, readonly }) {
  const { defaultsDeep } = this.app.lib.aneka
  const { isEmpty } = this.app.lib._
  const items = [...layout]
  for (const item of items) {
    for (const idx in item.fields) {
      const f = item.fields[idx]
      const [name, col, label, component] = f.split(':')
      item.fields[idx] = name
      const w = { name, attr: {} }
      w.attr.label = isEmpty(label) ? `field.${name}` : label
      if (!isEmpty(col)) w.attr.col = col
      if (!isEmpty(component)) w.component = component
      schema.view.widget[name] = defaultsDeep(w, schema.view.widget[w.name])
    }
  }
}

function applyLayout (action, schema, ext) {
  const { defaultsDeep } = this.app.lib.aneka
  const { set, get, isEmpty, find, kebabCase } = this.app.lib._
  const { fields, card, calcFields } = getCommons.call(this, action, schema, ext)
  const layout = get(ext, `view.${action}.layout`, get(ext, 'common.layout', []))
  const readonly = get(ext, `view.${action}.readonly`, get(ext, 'common.readonly', defReadonly))
  const widget = {}
  for (const f of fields) {
    let prop = find(schema.properties, { name: f })
    if (!prop) prop = find(calcFields, { name: f })
    if (!prop) continue
    const result = schema.view.widget[f] ?? {}
    result.name = result.name ?? f
    result.attr = defaultsDeep(result.attr, { col: '4-md', label: `field.${f}` })
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
        result.attr.options = 'false:no;true:yes'
      }
      if (prop.values) {
        result.component = result.component ?? 'form-select'
        if (typeof prop.values === 'string') result.attr.options = prop.values
        else result.attr.options = prop.values.map(item => `${item.value}:${item.text}`).join(';')
      }
      if (['string', 'text'].includes(prop.type) && prop.maxLength) set(result, 'attr.maxlength', prop.maxLength)
      if (readonly.includes(f)) result.component = 'form-plaintext'
      if (!result.component) result.component = 'form-input'
    }
    for (const k in result.attr ?? {}) {
      const newKey = kebabCase(k)
      if (k !== newKey) {
        result.attr[newKey] = result.attr[k]
        delete result.attr[k]
      }
    }
    widget[f] = result
  }
  set(schema, 'view.widget', widget)
  if (isEmpty(layout)) autoLayout.call(this, { layout, schema, action, ext })
  else customLayout.call(this, { layout, schema, action, ext, readonly })
  set(schema, 'view.layout', layout)
  set(schema, 'view.fields', fields)
  set(schema, 'view.card', card)
}

const handler = {
  list: async function (schema, ext, options) {
    const { get, set } = this.app.lib._
    const { fields } = getCommons.call(this, 'list', schema, ext, options)
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
    set(schema, 'view.fields', fields)
    set(schema, 'view.qs.fields', qsFields.join(','))
  },
  details: async function (schema, ext, options) {
    applyLayout.call(this, 'details', schema, ext, options)
  },
  add: async function (schema, ext, options) {
    applyLayout.call(this, 'add', schema, ext, options)
  },
  edit: async function (schema, ext, options) {
    applyLayout.call(this, 'edit', schema, ext, options)
  }
}

async function getSchemaExt (modelName, view, options = {}) {
  const { readConfig } = this.app.bajo
  const { defaultsDeep } = this.app.lib.aneka
  const { pick, isString } = this.app.lib._

  const model = isString(modelName) ? this.app.dobo.getModel(modelName) : modelName
  const schema = pick(model, ['name', 'properties', 'indexes', 'disabled', 'attachment', 'sortables', 'view', 'hidden'])
  const base = path.basename(model.file, path.extname(model.file))
  let ext = await readConfig(`${model.plugin.ns}:/extend/waibuDb/schema/${base}.*`, { ignoreError: true, options })
  const over = await readConfig(`main:/extend/waibuDb/extend/${model.plugin.ns}/schema/${base}.*`, { ignoreError: true, options })
  ext = defaultsDeep(options.schema ?? {}, over, ext)
  await handler[view].call(this, schema, ext, options)
  return { schema, ext }
}

export default getSchemaExt
