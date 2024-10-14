async function editHandler ({ req, reply, model, params, template, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordUpdate, recordGet, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { merge, defaultsDeep } = this.app.bajo.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'edit', options)
  if (schema.disabled.includes('update')) return reply.view(templateDisabled, { action: 'edit' })
  // req.query.attachment = true
  options.fields = schema.view.fields
  let form
  let error
  if (req.method === 'GET') {
    const old = await recordGet({ model, req, id: req.query.id, options })
    form = defaultsDeep(req.body, old.data)
  } else {
    form = req.body
    try {
      await recordUpdate({ model, req, id: req.query.id, reply, options })
      return reply.redirectTo(buildUrl({ url: req.url, base: 'list', params: { page: 1 }, exclude: ['id'] }))
    } catch (err) {
      error = err
    }
  }
  merge(params, { form, schema, error })
  return reply.view(template, params)
}

export default editHandler
