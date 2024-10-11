import path from 'path'

const disableds = ['id', 'createdAt', 'updatedAt']

function getFields (action, schema, ext, { hidden = [] } = {}) {
  const { map, get, without, uniq } = this.app.bajo.lib._
  const allFields = map(schema.properties, p => {
    if (p.hidden) hidden.push(p.name)
    return p.name
  })
  const forFields = get(ext, `view.${action}.fields`, get(ext, 'common.fields', allFields))
  let fields = []
  for (const f of forFields) {
    if (allFields.includes(f)) fields.push(f)
  }
  fields = uniq(without(fields, ...hidden))
  if (!fields.includes('id')) fields.unshift('id')
  return { fields, allFields }
}

function applyLayout (action, schema, ext) {
  const { set, get, isEmpty, map, find } = this.app.bajo.lib._
  const { fields } = getFields.call(this, action, schema, ext)
  const layout = get(ext, `view.${action}.layout`, get(ext, 'common.layout', []))
  const allWidgets = map(fields, f => {
    const prop = find(schema.properties, { name: f })
    const result = { name: f, component: 'form-input', attr: { col: '4-md' } }
    if (action === 'details') {
      result.component = 'form-plaintext'
      return result
    }
    if (prop.type === 'boolean') result.component = 'form-check'
    if (['string', 'text'].includes(prop.type) && prop.maxLength) set(result, 'attr.maxlength', prop.maxLength)
    return result
  })
  if (isEmpty(layout)) {
    layout.push({ name: '_common', widgets: allWidgets })
  } else {
    const items = [...layout]
    layout.splice(0, layout.length)
    for (const item of items) {
      const widgets = []
      for (const f of item.fields) {
        let [name, col] = f.split(':')
        if (!col) col = '4-md'
        const widget = find(allWidgets, { name })
        if (!widget) continue
        widget.attr.col = col
        widgets.push(widget)
      }
      layout.push({ name: item.name, widgets })
    }
  }
  set(schema, 'view.layout', layout)
  set(schema, 'view.fields', fields)
  /*
  if ((schema.view.layouts ?? []).length === 0) {
    schema.view.layouts = [{
      fields: map(schema.properties, p => {
        const f = { name: p.name, col: ':12', type: p.type }
        if (plaintext || disableds.includes(p.name)) f.widget = 'formPlaintext'
        // if (disableds.includes(p.name)) f.placeholder = '- autocreate -'
        return f
      })
    }]
  } else {
    each(schema.view.layouts, (layout, i) => {
      const deleted = []
      each(layout.fields, (f, j) => {
        if (isString(f)) {
          const [name, col, widget, placeholder] = map(f.split(';'), m => trim(m))
          f = { name }
          f.col = col ?? ':12'
          if (widget) f.widget = widget
          if (placeholder) f.placeholder = placeholder
        }
        if (hidden.includes(f.name)) deleted.push(j)
        if (plaintext) f.widget = 'formPlaintext'
        if (!f.widget && disableds.includes(f.name)) f.widget = 'formPlaintext'
        const prop = find(schema.properties, { name: f.name })
        if (prop) {
          f.type = prop.type
          layout.fields[j] = f
        }
      })
      if (deleted.length > 0) pullAt(layout.fields, deleted)
    })
  }
  */
}

const handler = {
  list: async function (schema, ext, opts) {
    const { get, set } = this.app.bajo.lib._
    const { fields } = getFields.call(this, 'list', schema, ext, opts)
    const qsFields = []
    for (const f of get(schema, 'view.qs.fields', '').split(',')) {
      if (fields.includes(f)) qsFields.push(f)
    }
    let [col, dir] = get(schema, 'view.qs.sort', '').split(':')
    if (!fields.includes(col) || !col) col = 'id'
    if (!['1', '-1'].includes(dir)) dir = '1'
    set(schema, 'view.fields', fields)
    set(schema, 'view.qs.fields', qsFields.join(','))
    set(schema, 'view.qs.sort', `${col}:${dir}`)
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
  const { readConfig } = this.app.bajo
  const { getSchema } = this.app.dobo
  const { pick } = this.app.bajo.lib._

  let schema = getSchema(model)
  const base = path.basename(schema.file, path.extname(schema.file))
  const ext = await readConfig(`${schema.ns}:/waibuDb/model/${base}.*`, { ignoreError: true })
  schema = pick(schema, ['name', 'properties', 'indexes', 'disabled', 'attachment', 'sortables'])
  await handler[view].call(this, schema, ext, opts)
  return { schema, ext }
}

export default getSchemaExt
