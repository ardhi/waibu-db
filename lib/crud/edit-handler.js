import attachmentHandler from './helper/attachment-handler.js'

async function editHandler ({ req, reply, model, id, params = {}, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html', options = {} } = {}) {
  const { pascalCase } = this.app.lib.aneka
  const { getPluginDataDir } = this.app.bajo
  const { updateRecord, getRecord, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { fs } = this.app.lib
  const { defaultsDeep } = this.app.lib.aneka
  const { merge, isEmpty, omit } = this.app.lib._
  const opts = {}
  let error
  let resp
  let form
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'edit', merge({}, { params }, options))
  if (schema.disabled.includes('update')) return await reply.view(templateDisabled, { action: 'edit' })
  // req.query.attachment = true
  opts.fields = schema.view.fields
  id = id ?? req.params.id ?? req.query.id
  if (req.method === 'GET') {
    const old = await getRecord({ model, req, id, options: opts })
    form = defaultsDeep(req.body, old.data)
  } else {
    form = omit(req.body, ['_action', '_value'])
    if (req.body._action === 'removeatt' && !isEmpty(req.body._value)) {
      const root = `${getPluginDataDir('dobo')}/attachment`
      for (const item of req.body._value) {
        try {
          const file = `${root}/${item}`
          await fs.unlink(file)
        } catch (err) {}
      }
      if (req && req.flash) req.flash('notify', req.t('attachmentRemoved'))
    } else {
      try {
        resp = await updateRecord({ model, req, id, reply, options: opts })
        form = resp.data
        return reply.redirectTo(buildUrl({ url: req.url, base: req.params.base ?? req.query.base ?? 'list', params: { page: 1 }, exclude: ['id'] }))
      } catch (err) {
        error = err
      }
    }
  }
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, error, options }) : undefined
  const attachments = await attachmentHandler.call(this, { schema, id, options })
  merge(params, { form, schema, error, addOns, attachments })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default editHandler
