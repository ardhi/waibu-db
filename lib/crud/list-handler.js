async function listHandler ({ req, reply, model, view = 'waibuDb.template:/list-handler.html', params } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordFind, recordRemove } = this.app.waibuDb
  const { get, merge } = this.app.bajo.lib._
  const options = { count: true }
  model = model ?? pascalCase(req.params.model)
  if (req.method === 'POST') {
    if (req.body.action !== 'remove') throw this.error('Unknown action \'%s\'', req.body.action)
    const ids = (req.body.ids ?? '').split(',')
    if (ids.length > 0) {
      const result = {}
      const options = { noResult: true, noFlash: true }
      for (const id of ids) {
        try {
          await recordRemove({ model, id, req, reply, options })
          result[id] = true
        } catch (err) {
          result[id] = err.message
        }
      }
      req.flash('notify', req.t('%d record(s) successfully removed', ids.length))
      req.query.page = 1
    }
  }
  const { schema, config } = await this.getSchemaExt(model, 'list')
  merge(options, get(config, 'methodOptions.find'))
  if (!req.query.sort) req.query.sort = get(schema, 'view.defSort')
  // req.query.attachment = true
  const data = await recordFind({ model, req, options })
  merge(params, { data, schema })
  return reply.view(view, params)
}

export default listHandler
