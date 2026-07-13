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
  const { omit, kebabCase, get, merge } = this.app.lib._
  const { pascalCase } = this.app.lib.aneka
  const { getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  model = pascalCase(model ?? req.params.model)
  const mdl = this.app.dobo.getModel(model)
  const { schema } = await getSchemaExt(model, 'add', merge({ args: [{ req, model: mdl }] }, { params }, options))
  if (schema.disabled.includes('find')) return await reply.view(templateDisabled, { action: 'list' })
  const data = await prepCrud.call(this.app.getPlugin('waibuDb'), { model, req, reply, args: ['model'] })
  data.opts = omit(data.opts, ['req', 'reply'])
  const source = `${this.name}:/export-handler`
  const worker = 'waibuDb:exportData'
  const type = get(data, 'input.ftype', 'json')
  const settings = get(data, 'input.options', '').split(',')
  const ext = settings.includes('zip') ? `${type}.gz` : type
  // const file = `${kebabCase(model)}_${dayjs().format('YYYYMMDDhhmmss')}.${ext}`
  const file = `${kebabCase(model)}.${ext}`
  if (this.app.masohi && this.app.sumba) {
    await this.app.sumba.pushDownload({ file, type, worker, source, data, req })
    req.flash('notify', req.t('exportInQueue'))
  } else {
    const _opts = {
      payload: {
        data: {
          name: model,
          opts: data.opts,
          filter: data.filter,
          download: { id: null, file }
        }
      }
    }
    const destFile = await this.exportData(_opts)
    const { importModule } = this.app.bajo
    const { download } = await importModule('waibu:/lib/helper.js', { asDefaultImport: false })
    await download.call(this, destFile, req, reply, true)
  }
  const url = buildUrl({ url: req.url, base: req.body.handler })
  return reply.redirectTo(url)
}

export default exportHandler
