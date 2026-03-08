export async function addOnsHandler ({ req, reply, data, schema, options = {} }) {
  const { escape } = this.app.waibu
  const { base64JsonEncode } = this.app.waibu
  const { createAggregate } = this.app.waibuDb
  const { get, map, pick, pullAt } = this.app.lib._
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
      const resp = await createAggregate({ model: schema.name, req, reply, options: o.dbOpts })
      const data = []
      for (const d of resp.data) {
        const key = o.dbOpts.fields[0]
        data.push({
          name: escape(d[key]),
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
      data: { setting: o.chartOpts, name: o.name },
      resource: 'waibuDb.partial:/crud/~echarts-window.html'
    }
  })
}

export async function attachmentHandler ({ schema, id, options = {} }) {
  if (!schema.view.attachment) return []
  const model = this.app.dobo.getModel(schema.name)
  return await model.listAttachment({ id })
}

export function buildParams ({ model, req, reply, action, options = {} }) {
  const { camelCase, kebabCase, map, upperFirst, get } = this.app.lib._
  const [, ...names] = map(kebabCase(model).split('-'), n => upperFirst(n))
  const mdl = this.app.dobo.getModel(model)
  const prefix = this.app.waibuMpa ? this.app.waibuMpa.getPluginTitle(mdl.plugin.ns, req) : mdl.plugin.ns
  const modelTitle = req.t(prefix) + ': ' + req.t(camelCase(names.join(' ')))
  const page = {
    title: req.t(get(req, 'routeOptions.config.title', this.app[mdl.plugin.ns].title)),
    modelTitle
  }
  return { page }
}

export const notFoundTpl = 'waibuDb.template:/crud/not-found.html'
