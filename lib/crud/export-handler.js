import { prepCrud } from '../util.js'

/**
 * Handler for rendering the export view of a model.
 *
 * To use this handler, you must import it first and call it with the necessary parameters. For example:
 * ```javascript
 * const { importModule } = this.app.bajo
 * const exportHandler = await importModule('waibuDb:/lib/crud/export-handler.js')
 * await exportHandler.call(this, { model: 'YourModelName', req, reply })
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
 * @returns {Promise<void>} Redirect to the list view
 */
async function exportHandler (opts = {}) {
  let {
    req, reply, model, params = {}, templateDisabled = 'waibuDb.template:/disabled.html',
    options = {}
  } = opts
  // const { dayjs } = this.app.lib
  const { omit, kebabCase, get, merge, isEmpty } = this.app.lib._
  const { pascalCase } = this.app.lib.aneka
  const { getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { callHandler, importModule } = this.app.bajo
  model = pascalCase(model ?? req.params.model)
  const mdl = this.app.dobo.getModel(model)
  const { schema } = await getSchemaExt(model, 'add', merge({ args: [{ req, model: mdl }] }, { params }, options))
  if (schema.disabled.includes('find')) return await reply.view(templateDisabled, { action: 'list' })
  const crud = await prepCrud.call(this.app.getPlugin('waibuDb'), { model, req, reply, args: ['model'], options })
  const data = {
    name: model,
    filter: crud.filter,
    opts: omit(crud.opts, ['req', 'reply', 'model'])
  }
  data.opts.lang = req.lang
  data.opts.fields = isEmpty(req.query.fields) ? get(schema, 'view.fields', []) : req.query.fields.split(',')

  data.opts.datetime = get(opts, 'req.site.setting.bajo.intl.datetime', this.app.bajo.config.intl.datetime)
  data.opts.date = get(opts, 'req.site.setting.bajo.intl.date', this.app.bajo.config.intl.date)
  data.opts.time = get(opts, 'req.site.setting.bajo.intl.time', this.app.bajo.config.intl.time)
  data.opts.timeZone = get(opts, 'req.site.setting.bajo.intl.timeZone', this.app.bajo.config.intl.timeZone)

  const source = `${this.ns}:/export-handler`
  const worker = `${this.ns}:exportData`
  const type = get(crud, 'input.ftype', 'json')
  data.exportOpts = get(crud, 'input.options', '').split(',')
  const ext = data.exportOpts.includes('zip') ? `${type}.gz` : type
  const file = `${kebabCase(model)}.${ext}`
  if (this.app.sumba) {
    const description = kebabCase(model).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    await this.app.sumba.pushDownload({ file, description, type, worker, source, data, req })
    req.flash('notify', req.t('exportInQueue'))
  } else {
    const _opts = {
      payload: {
        data: {
          name: model,
          opts: data.opts,
          exportOpts: data.exportOpts,
          filter: data.filter,
          file
        }
      }
    }
    const destFile = await callHandler(worker, _opts)
    const { download } = await importModule('waibu:/lib/helper.js', { asDefaultImport: false })
    await download.call(this, destFile, req, reply, file)
  }
  const base = isEmpty(req.body.handler) ? undefined : req.body.handler
  const url = buildUrl({ url: req.url, base })
  return reply.redirectTo(url)
}

export default exportHandler
