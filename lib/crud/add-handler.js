async function addHandler ({ req, reply, model, params = {}, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html', options = {} } = {}) {
  const { pascalCase } = this.app.lib.aneka
  const { createRecord, getRecord, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { defaultsDeep } = this.app.lib.aneka
  const { pick, map, merge, omit } = this.app.lib._
  const opts = merge({}, options.modelOpts)
  model = pascalCase(model ?? req.params.model)
  const { schema } = await getSchemaExt(model, 'add', merge({}, { params }, options))
  if (schema.disabled.includes('create')) return await reply.view(templateDisabled, { action: 'add' })
  // req.query.attachment = true
  opts.fields = schema.view.fields
  let def = {}
  if (req.method === 'GET' && req.query.mode === 'clone' && req.query.id) {
    const resp = await getRecord({ model, req, id: req.query.id, options: { fields: map(schema.properties, 'name') } })
    def = omit(resp.data, ['id', 'createdAt', 'updatedAt'])
  }
  let form = defaultsDeep(req.body, def)
  let error
  let resp
  if (req.method === 'POST') {
    req.session[`wdb${model}AddMore`] = form._addmore
    req.session[`wdb${model}ClonePrev`] = form._cloneprev
    try {
      resp = await createRecord({ model, req, reply, options: opts })
      if (!form._addmore) return reply.redirectTo(buildUrl({ url: req.url, base: 'list', params: { page: 1 }, exclude: ['id', 'mode'] }))
      if (!form._cloneprev) form = pick(form, ['_addmore', '_cloneprev'])
    } catch (err) {
      error = err
    }
  } else {
    form._addmore = req.session[`wdb${model}AddMore`]
    form._cloneprev = req.session[`wdb${model}ClonePrev`]
  }
  console.log(form)
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, error, options }) : undefined
  merge(params, { form, schema, error, addOns })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default addHandler
