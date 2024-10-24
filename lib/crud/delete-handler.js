async function deleteHandler ({ req, reply, model, params, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordRemove, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { reduce } = this.app.bajo.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', options)
  if (schema.disabled.includes('remove')) return reply.view(templateDisabled, { action: 'delete' })
  options.fields = schema.view.fields
  const ids = (req.body.ids ?? '').split(',')
  if (ids.length > 0) {
    const result = []
    const options = { noResult: true, noFlash: true }
    for (const id of ids) {
      try {
        await recordRemove({ model, id, req, reply, options })
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
