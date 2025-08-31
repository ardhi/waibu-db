async function deleteHandler ({ req, reply, model, params = {}, templateDisabled = 'waibuDb.template:/disabled.html', options = {} } = {}) {
  const { pascalCase } = this.app.lib.aneka
  const { recordRemove, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { reduce, merge } = this.app.lib._
  const opts = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', merge({}, { params }, options))
  if (schema.disabled.includes('remove')) return await reply.view(templateDisabled, { action: 'delete' })
  opts.fields = schema.view.fields
  const ids = (req.body.ids ?? '').split(',')
  if (ids.length > 0) {
    const result = []
    opts.noResult = true
    opts.noFlash = true
    for (const id of ids) {
      try {
        await recordRemove({ model, id, req, reply, options: opts })
        result.push(true)
      } catch (err) {
        result.push(err.message)
      }
    }
    const success = reduce(result, (sum, n) => {
      return n === true ? (sum + 1) : sum
    }, 0)
    let type = 'danger'
    if (success > 0) type = 'warning'
    if (success === ids.length) type = 'info'
    req.flash('notify', req.t('%d of %d record(s) successfully removed', success, ids.length) + '\t' + type)
    req.query.page = 1
  }

  const url = buildUrl({ url: req.url, base: 'list', params: { page: 1 } })
  return reply.redirectTo(url)
}

export default deleteHandler
