import attachmentHandler from './helper/attachment-handler.js'

async function detailsHandler ({ req, reply, model, params = {}, id, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html' } = {}) {
  const { pascalCase } = this.lib.aneka
  const { recordGet, getSchemaExt } = this.app.waibuDb
  const { merge } = this.lib._
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'details', { params })
  if (schema.disabled.includes('get')) return reply.view(templateDisabled, { action: 'details' })
  // req.query.attachment = true
  options.fields = schema.view.fields
  id = id ?? req.params.id ?? req.query.id
  const resp = await recordGet({ model, req, id, options })
  const form = resp.data
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema }) : undefined
  const attachments = await attachmentHandler.call(this, { schema, id })
  merge(params, { form, schema, addOns, attachments })
  return reply.view(template, params)
}

export default detailsHandler
