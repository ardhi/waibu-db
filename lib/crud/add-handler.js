async function addHandler ({ req, reply, model, params = {}, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordCreate, recordGet, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { map, merge, defaultsDeep, omit } = this.app.bajo.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', options)
  if (schema.disabled.includes('create')) return reply.view(templateDisabled, { action: 'add' })
  // req.query.attachment = true
  options.fields = schema.view.fields
  let def = {}
  if (req.query.mode === 'clone' && req.query.id) {
    const resp = await recordGet({ model, req, id: req.query.id, options: { fields: map(schema.properties, 'name') } })
    def = omit(resp.data, ['id', 'createdAt', 'updatedAt'])
  }
  let form = defaultsDeep(req.body, def)
  let error
  let resp
  if (req.method === 'POST') {
    try {
      resp = await recordCreate({ model, req, reply, options })
      form = resp.data
      return reply.redirectTo(buildUrl({ url: req.url, base: 'list', params: { page: 1 }, exclude: ['id', 'mode'] }))
    } catch (err) {
      error = err
    }
  }
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, dat: resp, schema, error }) : undefined
  merge(params, { form, schema, error, addOns })
  return reply.view(template, params)
}

export default addHandler
