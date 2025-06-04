import attachmentHandler from './helper/attachment-handler.js'

async function editHandler ({ req, reply, model, id, params = {}, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase, getPluginDataDir } = this.app.bajo
  const { recordUpdate, recordGet, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { fs } = this.lib
  const { merge, defaultsDeep, isEmpty, omit } = this.lib._
  const options = {}
  let error
  let resp
  let form
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'edit', options, { params })
  if (schema.disabled.includes('update')) return reply.view(templateDisabled, { action: 'edit' })
  // req.query.attachment = true
  options.fields = schema.view.fields
  id = id ?? req.params.id ?? req.query.id
  if (req.method === 'GET') {
    const old = await recordGet({ model, req, id, options })
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
        resp = await recordUpdate({ model, req, id, reply, options })
        form = resp.data
        return reply.redirectTo(buildUrl({ url: req.url, base: req.params.base ?? req.query.base ?? 'list', params: { page: 1 }, exclude: ['id'] }))
      } catch (err) {
        error = err
      }
    }
  }
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, error }) : undefined
  const attachments = await attachmentHandler.call(this, { schema, id })
  merge(params, { form, schema, error, addOns, attachments })
  return reply.view(template, params)
}

export default editHandler
