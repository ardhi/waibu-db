/**
 * Handler for deleting records of a model.
 *
 * To use this handler, you must import it first and call it with the necessary parameters. For example:
 * ```javascript
 * const { importModule } = this.app.bajo
 * const deleteHandler = await importModule('waibuDb:/lib/crud/delete-handler.js')
 * await deleteHandler.call(this, { model: 'YourModelName', req, reply })
 * ```
 * @async
 * @memberof module:CRUDHandler
 * @method
 * @param {object} opts - Options object
 * @param {object} opts.req - Request object
 * @param {object} opts.reply - Reply object
 * @param {string} opts.model - Model name
 * @param {object} [opts.params={}] - Parameters for the template
 * @param {string} [opts.templateDisabled='waibuDb.template:/disabled.html'] - Disabled template path
 * @param {object} [opts.options={}] - Additional options
 * @returns {Promise<void>} Redirects to the list view
 */
async function deleteHandler (opts = {}) {
  let { req, reply, model, params = {}, templateDisabled = 'waibuDb.template:/disabled.html', options = {} } = opts
  const { pascalCase } = this.app.lib.aneka
  const { removeRecord, getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { reduce, merge } = this.app.lib._
  const _opts = merge({}, options.modelOpts)
  model = pascalCase(model ?? req.params.model)
  const mdl = this.app.dobo.getModel(model)
  const { schema } = await getSchemaExt(model, 'delete', merge({ args: [{ req, model: mdl }] }, { params }, options))
  if (schema.disabled.includes('remove')) return await reply.view(templateDisabled, { action: 'delete' })
  _opts.fields = schema.view.fields
  delete req.query.query
  const ids = (req.body.ids ?? '').split(',')
  if (ids.length > 0) {
    const result = []
    // _opts.noResult = true
    _opts.noFlash = true
    for (const id of ids) {
      try {
        await removeRecord({ model, id, req, reply, options: _opts })
        result.push(true)
      } catch (err) {
        if (err.orgMessage === 'accessDenied') throw err
        console.log(err)
        result.push(err.message)
      }
    }
    const success = reduce(result, (sum, n) => {
      return n === true ? (sum + 1) : sum
    }, 0)
    let type = 'danger'
    if (success > 0) type = 'warning'
    if (success === ids.length) type = 'info'
    req.flash('notify', req.t('%d of %d record(s) successfully removed', success, ids.length) + '\t' + type)
    req.query.page = 1
  }

  const url = buildUrl({ url: req.url, base: 'list', params: { page: 1 } })
  return reply.redirectTo(url)
}

export default deleteHandler
