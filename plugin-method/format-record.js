async function formatRow ({ data, req, schema, options = {} }) {
  const { get, find, isFunction, cloneDeep } = this.lib._
  const { format, callHandler } = this.app.bajo
  const fields = get(schema, 'view.fields', Object.keys(schema.properties))
  const rec = cloneDeep(data)
  for (const f of fields) {
    if (f === '_rel') continue
    let prop = find(schema.properties, { name: f })
    if (!prop) prop = find(schema.view.calcFields, { name: f })
    if (!prop) continue
    const opts = {
      lang: options.lang ?? (req ? req.lang : undefined),
      longitude: ['lng', 'longitude'].includes(f),
      latitude: ['lat', 'latitude'].includes(f),
      speed: ['speed'].includes(f),
      degree: ['course', 'heading'].includes(f),
      distance: ['distance'].includes(f)
    }
    rec[f] = format(data[f], prop.type, opts)
    const vf = get(schema, `view.valueFormatter.${f}`)
    if (vf) {
      if (isFunction(vf)) rec[f] = await vf.call(this, data[f], data)
      else rec[f] = await callHandler(vf, { req, value: data[f], data })
    }
  }
  return rec
}

async function formatRecord ({ data, req, schema, options = {} }) {
  const { isArray } = this.lib._
  if (!isArray(data)) return await formatRow.call(this, { data, req, schema, options })
  const items = []
  for (const d of data) {
    const item = await formatRow.call(this, { data: d, req, schema, options })
    items.push(item)
  }
  return items
}

export default formatRecord
