import { attachmentHandler, notFoundTpl } from './helper.js'

/**
 * Handler for rendering the edit view of a model.
 *
 * To use this handler, you must import it first and call it with the necessary parameters. For example:
 * ```javascript
 * const { importModule } = this.app.bajo
 * const editHandler = await importModule('waibuDb:/lib/crud/edit-handler.js')
 * const result = await editHandler.call(this, { model: 'YourModelName', req, reply })
 * ```
 * @async
 * @memberof module:CRUDHandler
 * @method
 * @param {object} opts - Options object
 * @param {object} opts.req - Request object
 * @param {object} opts.reply - Reply object
 * @param {string} opts.model - Model name
 * @param {string} [opts.id] - Record ID
 * @param {object} [opts.params={}] - Parameters for the template
 * @param {string} [opts.template] - Template path
 * @param {Function} [opts.addOnsHandler] - Add-ons handler function
 * @param {string} [opts.templateDisabled='waibuDb.template:/disabled.html'] - Disabled template path
 * @param {object} [opts.options={}] - Additional options
 * @returns {Promise<string>} Renders the edit view
 */
async function editHandler (opts = {}) {
  let {
    req, reply, model, id, params = {}, template, addOnsHandler,
    templateDisabled = 'waibuDb.template:/disabled.html', options = {}
  } = opts
  const { pascalCase } = this.app.lib.aneka
  const { updateRecord, getRecord, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { defaultsDeep } = this.app.lib.aneka
  const { merge, isEmpty, omit, cloneDeep } = this.app.lib._
  const _opts = merge({}, options.modelOpts)
  let error
  let resp
  let form
  model = pascalCase(model ?? req.params.model)
  const mdl = this.app.dobo.getModel(model)
  const { schema } = await getSchemaExt(model, 'edit', merge({ args: [{ req, model: mdl }] }, { params }, options))
  if (schema.disabled.includes('update')) return await reply.view(templateDisabled, { action: 'edit' })
  // req.query.attachment = true
  _opts.fields = schema.view.fields
  id = id ?? req.params.id ?? req.query.id
  delete req.query.query
  const old = await getRecord({ model, req, id, options: _opts })
  if (isEmpty(old.data)) return await reply.view(notFoundTpl, params)
  _opts._data = old
  const def = cloneDeep(old.data)
  form = defaultsDeep({}, req.body, def)
  if (req.method !== 'GET') {
    form = omit(form, ['_action', '_value'])
    try {
      req.body._value = JSON.parse(req.body._value)
    } catch (err) {}
    if (req.body._action === 'removeatt' && !isEmpty(req.body._value)) {
      for (const item of req.body._value) {
        try {
          const [,,, field, fname] = item.split('/')
          await mdl.removeAttachment(id, field, fname)
        } catch (err) {
        }
      }
      if (req && req.flash) req.flash('notify', req.t('attachmentRemoved'))
    } else {
      try {
        resp = await updateRecord({ model, req, id, reply, options: _opts })
        form = resp.data
        return reply.redirectTo(buildUrl({ url: req.url, base: req.params.base ?? req.query.base ?? 'list', params: { page: 1 }, exclude: ['id'] }))
      } catch (err) {
        if (err.orgMessage === 'accessDenied') throw err
        error = err
      }
    }
  }
  const addOns = addOnsHandler ? await addOnsHandler.call(this.app[req.ns], { req, reply, params, data: resp, schema, error, options }) : undefined
  const attachments = await attachmentHandler.call(this, { schema, id, options })
  merge(params, { oldData: old.data, form, schema, error, addOns, attachments })
  if (schema.template) template = schema.template
  if (schema.layout) params.page.layout = schema.layout
  return await reply.view(template, params)
}

export default editHandler
