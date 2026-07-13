/**
 * Handle the list view for a given model, rendering the appropriate template with the retrieved data.
 *
 * To use this handler, you must import it first and call it with the necessary parameters. For example:
 * ```javascript
 * const { importModule } = this.app.bajo
 * const listHandler = await importModule('waibuDb:/lib/crud/list-handler.js')
 * const result = await listHandler.call(this, { model: 'YourModelName', req, reply })
 * ```
 * @async
 * @memberof module:CRUDHandler
 * @method
 * @param {object} opts - Options object
 * @param {object} opts.req - Request object
 * @param {object} opts.reply - Reply object
 * @param {string} opts.model - Model name
 * @param {string} opts.template - Template path
 * @param {object} [opts.params={}] - Parameters for the template
 * @param {Function} [opts.addOnsHandler] - Add-ons handler function
 * @param {string} [opts.templateDisabled='waibuDb.template:/disabled.html'] - Disabled template path
 * @param {object} [opts.options={}] - Additional options
 * @returns {Promise<string>} Renders the list view
 */
async function listHandler (opts) {
  let {
    req, reply, model, template, params = {}, addOnsHandler,
    templateDisabled = 'waibuDb.template:/disabled.html', options = {}
  } = opts
  const { pascalCase } = this.app.lib.aneka
  const { findRecord, getSchemaExt } = this.app.waibuDb
  const { get, merge, isArray, upperFirst } = this.app.lib._
  const qsKey = this.app.waibu.config.qsKey

  const _opts = merge({}, { count: true, refs: '*' }, options.modelOpts)
  model = pascalCase(model ?? req.params.model)
  const mdl = this.app.dobo.getModel(model)
  const { schema } = await getSchemaExt(model, 'list', merge({ args: [{ req, model: mdl }] }, { params }, options))
  if (schema.disabled.includes('find')) return await reply.view(templateDisabled, { action: 'list' })
  for (const key of ['sort', 'limit', 'fields']) {
    const sessKey = `wdb${model}${upperFirst(key)}`
    if (!req.query[qsKey[key]]) req.query[qsKey[key]] = req.session[sessKey] ?? get(schema, `view.qs.${key}`)
    else req.session[sessKey] = req.query[qsKey[key]]
  }
  if (!req.query[qsKey.page]) req.query[qsKey.page] = 1
  // req.query.attachment = true
  const list = await findRecord({ model, req, options: _opts })
  let addOns = []
  if (addOnsHandler) {
    addOns = await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: list, schema, options })
    if (!isArray(addOns)) addOns = [addOns]
  }
  merge(params, { list, schema, addOns })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default listHandler
