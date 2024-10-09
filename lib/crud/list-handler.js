async function listHandler ({ req, reply, model, template, params } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordFind, recordRemove, getSchemaExt } = this.app.waibuDb
  const { get, merge } = this.app.bajo.lib._
  const qsKey = this.app.waibu.config.qsKey
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
  const { schema } = await getSchemaExt(model, 'list')
  for (const key of ['sort', 'fields', 'limit']) {
    if (!req.query[qsKey[key]]) req.query[qsKey[key]] = get(schema, `view.qs.${key}`)
  }
  if (!req.query[qsKey.page]) req.query[qsKey.page] = 1
  // req.query.attachment = true
  const data = await recordFind({ model, req, options })
  merge(params, { data, schema })
  return reply.view(template, params)
}

export default listHandler
