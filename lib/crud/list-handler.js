async function listHandler ({ req, reply, model, template, params, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordFind, getSchemaExt } = this.app.waibuDb
  const { get, merge } = this.app.bajo.lib._
  const qsKey = this.app.waibu.config.qsKey
  const options = { count: true }
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'list')
  if (schema.disabled.includes('find')) return reply.view(templateDisabled, { action: 'list' })
  for (const key of ['sort', 'fields', 'limit']) {
    if (!req.query[qsKey[key]]) req.query[qsKey[key]] = get(schema, `view.qs.${key}`)
  }
  if (!req.query[qsKey.page]) req.query[qsKey.page] = 1
  // req.query.attachment = true
  const data = await recordFind({ model, req, options })
  merge(params, { data, schema })
  return reply.view(template, params)
}

export default listHandler
