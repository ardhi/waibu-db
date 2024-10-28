async function addOnsHandler ({ req, reply, data, schema }) {
  const { base64JsonEncode } = this.app.waibuMpa
  const { statAggregate } = this.app.waibuDb
  const { get, map, pick, pullAt } = this.app.bajo.lib._
  const opts = map(get(schema, 'view.stat.aggregate', []), item => {
    const dbOpts = pick(item, ['fields', 'group', 'aggregate'])
    const name = item.name ?? `field.${item.fields[0]}`
    return { name, dbOpts }
  })
  if (opts.length === 0) return []
  const dropped = []
  for (const idx in opts) {
    const o = opts[idx]
    try {
      const resp = await statAggregate({ model: schema.name, req, reply, options: o.dbOpts })
      const data = []
      for (const d of resp.data) {
        const key = o.dbOpts.fields[0]
        data.push({
          name: d[key],
          value: d[key + 'Count']
        })
      }
      opts[idx].chartOpts = base64JsonEncode({
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          data
        }]
      })
    } catch (err) {
      dropped.push(idx)
    }
  }
  if (dropped.length > 0) pullAt(opts, dropped)
  return map(opts, o => {
    return {
      data: { option: o.chartOpts, name: o.name },
      resource: 'waibuDb.partial:/echarts-window.html'
    }
  })
}

export default addOnsHandler