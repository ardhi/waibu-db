async function listHandler ({ req, reply, model, params, view = 'waibuDb.template:/details-handler.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordGet } = this.app.waibuDb
  const { get, merge } = this.app.bajo.lib._
  const options = { count: true }
  model = model ?? pascalCase(req.params.model)
  const { schema, config } = await this.getSchemaExt(model, 'details')
  merge(options, get(config, 'methodOptions.get'))
  // req.query.attachment = true
  const data = await recordGet({ model, req, options })
  merge(params, { form: data.data, schema })
  return reply.view(view, params)
}

export default listHandler
