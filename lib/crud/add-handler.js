async function addHandler ({ req, reply, model, params, template } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordCreate, recordGet, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { map, merge, defaultsDeep, omit } = this.app.bajo.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', options)
  // req.query.attachment = true
  options.fields = schema.view.fields
  let def = {}
  if (req.query.mode === 'clone' && req.query.id) {
    const resp = await recordGet({ model, req, id: req.query.id, options: { fields: map(schema.properties, 'name') } })
    def = omit(resp.data, ['id', 'createdAt', 'updatedAt'])
  }
  const form = defaultsDeep(req.body, def)
  let error
  if (req.method === 'POST') {
    try {
      await recordCreate({ model, req, reply, options })
      return reply.redirectTo(buildUrl({ url: req.url, base: 'list', params: { page: 1 }, exclude: ['id', 'mode'] }))
    } catch (err) {
      error = err
    }
  }
  merge(params, { form, schema, error })
  return reply.view(template, params)
}

export default addHandler
