import { attachmentHandler, notFoundTpl } from './helper.js'

/**
 * Handler for rendering the details view of a model.
 *
 * To use this handler, you must import it first and call it with the necessary parameters. For example:
 * ```javascript
 * const { importModule } = this.app.bajo
 * const detailsHandler = await importModule('waibuDb:/lib/crud/details-handler.js')
 * const result = await detailsHandler.call(this, { model: 'YourModelName', req, reply })
 * ```
 * @async
 * @memberof module:CRUDHandler
 * @method
 * @param {object} opts - Options object
 * @param {object} opts.req - Request object
 * @param {object} opts.reply - Reply object
 * @param {string} opts.model - Model name
 * @param {object} [opts.params={}] - Parameters for the template
 * @param {string} [opts.id] - Record ID
 * @param {string} [opts.template] - Template path
 * @param {Function} [opts.addOnsHandler] - Add-ons handler function
 * @param {string} [opts.templateDisabled='waibuDb.template:/disabled.html'] - Disabled template path
 * @param {object} [opts.options={}] - Additional options
 * @returns {Promise<string>} Renders the details view
 */
async function detailsHandler (opts = {}) {
  let { req, reply, model, params = {}, id, template, addOnsHandler, templateDisabled = 'waibuDb.template:/disabled.html', options = {} } = opts
  const { pascalCase } = this.app.lib.aneka
  const { getRecord, getSchemaExt } = this.app.waibuDb
  const { merge, isEmpty } = this.app.lib._
  const _opts = merge({ refs: '*' }, options.modelOpts)
  model = pascalCase(model ?? req.params.model)
  const mdl = this.app.dobo.getModel(model)
  const { schema } = await getSchemaExt(model, 'details', merge({ args: [{ req, model: mdl }] }, { params }, options))
  if (schema.disabled.includes('get')) return await reply.view(templateDisabled, { action: 'details' })
  // req.query.attachment = true
  _opts.fields = schema.view.fields
  id = id ?? req.params.id ?? req.query.id
  delete req.query.query
  const resp = await getRecord({ model, req, id, options: _opts })
  if (isEmpty(resp.data)) return await reply.view(notFoundTpl, params)
  const form = resp.data
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, options }) : undefined
  const attachments = await attachmentHandler.call(this, { schema, id, options })
  merge(params, { form, schema, addOns, attachments })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default detailsHandler
