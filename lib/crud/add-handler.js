async function addHandler ({ req, reply, model, params = {}, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.lib.aneka
  const { recordCreate, recordGet, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { defaultsDeep } = this.lib.aneka
  const { pick, map, merge, omit, isEmpty } = this.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', { params })
  if (schema.disabled.includes('create')) return await reply.view(templateDisabled, { action: 'add' })
  // req.query.attachment = true
  options.fields = schema.view.fields
  let def = {}
  if (req.method === 'GET' && req.query.mode === 'clone' && req.query.id) {
    const resp = await recordGet({ model, req, id: req.query.id, options: { fields: map(schema.properties, 'name') } })
    def = omit(resp.data, ['id', 'createdAt', 'updatedAt'])
  }
  let form = defaultsDeep(req.body, def)
  let error
  let resp
  if (req.method === 'POST') {
    req.session[`wdb${model}AddMore`] = form._addmore
    req.session[`wdb${model}ClonePrev`] = form._cloneprev
    try {
      resp = await recordCreate({ model, req, reply, options })
      if (isEmpty(form._addmore)) return reply.redirectTo(buildUrl({ url: req.url, base: 'list', params: { page: 1 }, exclude: ['id', 'mode'] }))
      if (isEmpty(form._cloneprev)) form = pick(form, ['_addmore', '_cloneprev'])
    } catch (err) {
      error = err
    }
  } else {
    form._addmore = req.session[`wdb${model}AddMore`]
    form._cloneprev = req.session[`wdb${model}ClonePrev`]
  }
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, error }) : undefined
  merge(params, { form, schema, error, addOns })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default addHandler
