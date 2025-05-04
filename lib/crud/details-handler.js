async function detailsHandler ({ req, reply, model, params = {}, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordGet, getSchemaExt } = this.app.waibuDb
  const { merge } = this.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'details', { params })
  if (schema.disabled.includes('get')) return reply.view(templateDisabled, { action: 'details' })
  // req.query.attachment = true
  options.fields = schema.view.fields
  const resp = await recordGet({ model, req, options })
  const form = resp.data
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema }) : undefined
  merge(params, { form, schema, addOns })
  return reply.view(template, params)
}

export default detailsHandler
