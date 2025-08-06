async function listHandler ({ req, reply, model, template, params = {}, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.lib.aneka
  const { recordFind, getSchemaExt } = this.app.waibuDb
  const { get, merge, isArray, upperFirst } = this.lib._
  const qsKey = this.app.waibu.config.qsKey
  const options = { count: true, rels: '*' }
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'list', { params })
  if (schema.disabled.includes('find')) return await reply.view(templateDisabled, { action: 'list' })
  for (const key of ['sort', 'limit', 'fields']) {
    const sessKey = `wdb${model}${upperFirst(key)}`
    if (!req.query[qsKey[key]]) req.query[qsKey[key]] = req.session[sessKey] ?? get(schema, `view.qs.${key}`)
    else req.session[sessKey] = req.query[qsKey[key]]
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
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default listHandler
