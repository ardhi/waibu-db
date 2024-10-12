async function deleteHandler ({ req, reply, model, params } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordRemove, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', options)
  options.fields = schema.view.fields
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

  const url = buildUrl({ url: req.url, base: 'list', params: { page: 1 } })
  return reply.redirectTo(url)
}

export default deleteHandler
