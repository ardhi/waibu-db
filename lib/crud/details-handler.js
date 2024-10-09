async function detailsHandler ({ req, reply, model, params, template } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordGet, getSchemaExt } = this.app.waibuDb
  const { merge } = this.app.bajo.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'details', options)
  // req.query.attachment = true
  options.fields = schema.view.fields
  const data = await recordGet({ model, req, options })
  merge(params, { form: data.data, schema })
  return reply.view(template, params)
}

export default detailsHandler
