import attachmentHandler from './helper/attachment-handler.js'

async function detailsHandler ({ req, reply, model, params = {}, id, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html', options } = {}) {
  const { pascalCase } = this.lib.aneka
  const { recordGet, getSchemaExt } = this.app.waibuDb
  const { merge } = this.lib._
  const opts = { rels: '*' }
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'details', merge({}, { params }, options))
  if (schema.disabled.includes('get')) return await reply.view(templateDisabled, { action: 'details' })
  // req.query.attachment = true
  opts.fields = schema.view.fields
  id = id ?? req.params.id ?? req.query.id
  const resp = await recordGet({ model, req, id, options: opts })
  const form = resp.data
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, options }) : undefined
  const attachments = await attachmentHandler.call(this, { schema, id, options })
  merge(params, { form, schema, addOns, attachments })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default detailsHandler
