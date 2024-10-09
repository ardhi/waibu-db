async function addHandler ({ req, reply, model, params, template } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordCreate, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { merge, defaultsDeep } = this.app.bajo.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', options)
  // req.query.attachment = true
  options.fields = schema.view.fields
  const form = defaultsDeep(req.body, {})
  let error
  if (req.method === 'POST') {
    try {
      await recordCreate({ model, req, reply, options })
      return reply.redirectTo(buildUrl({ url: req.url, base: 'list', params: { page: 1 } }))
    } catch (err) {
      error = err
    }
  }
  merge(params, { form, schema, error })
  return reply.view(template, params)
}

export default addHandler
