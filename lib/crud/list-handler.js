async function listHandler ({ req, reply, model, template, params, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.app.bajo
  const { recordFind, getSchemaExt } = this.app.waibuDb
  const { get, merge, isArray } = this.app.bajo.lib._
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
  const list = await recordFind({ model, req, options })
  let addOns = []
  if (addOnsHandler) {
    addOns = await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: list, schema })
    if (!isArray(addOns)) addOns = [addOns]
  }
  merge(params, { list, schema, addOns })
  return reply.view(template, params)
}

export default listHandler
