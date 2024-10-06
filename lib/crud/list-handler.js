async function listHandler ({ req, reply, model, view = 'waibuDb.template:/list-handler.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordFind, recordRemove } = this.app.waibuDb
  const { isEmpty, omit, get, merge } = this.app.bajo.lib._
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
  if (!isEmpty(req.query.view)) req.session.adminView = req.query.view
  if (req.session.adminView === 'stat') req.session.adminView = 'table'
  if (!req.session.adminView || (req.params.stat && schema.histogram.length === 0)) req.session.adminView = 'table'
  const params = omit(data, ['data'])
  return reply.view(view, { data: data.data, params, view: req.session.adminView, schema })
}

export default listHandler
