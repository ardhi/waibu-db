/**
 * @module CRUDHandler/Helper
 */

/**
 * Add-ons handler for generating chart options based on the schema's aggregate settings.
 *
 * This function retrieves the aggregate settings from the schema and generates chart options for each setting.
 * The generated chart options are encoded in base64 and returned as an array of add-ons.
 *
 * @async
 * @memberof module:CRUDHandler/Helper
 * @method
 * @name addOnsHandler
 * @param {object} opts - Options object
 * @param {object} opts.req - Request object
 * @param {object} opts.reply - Reply object
 * @param {object} opts.schema - Schema object
 * @returns {Promise<Array>} Array of add-ons with chart options
 */
export async function addOnsHandler (opts = {}) {
  const { req, reply, schema } = opts
  const { escape } = this.app.waibu
  const { base64JsonEncode } = this.app.waibu
  const { createAggregate } = this.app.waibuDb
  const { get, map, pick, pullAt } = this.app.lib._
  const _opts = map(get(schema, 'view.stat.aggregate', []), item => {
    const dbOpts = pick(item, ['fields', 'group', 'aggregate'])
    const name = item.name ?? `field.${item.fields[0]}`
    return { name, dbOpts }
  })
  if (_opts.length === 0) return []
  const dropped = []
  for (const idx in _opts) {
    const o = _opts[idx]
    try {
      const resp = await createAggregate({ model: schema.name, req, reply, options: o.dbOpts })
      const data = []
      for (const d of resp.data) {
        const key = o.dbOpts.fields[0]
        data.push({
          name: escape(d[key]),
          value: d[key + 'Count']
        })
      }
      _opts[idx].chartOpts = base64JsonEncode({
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          data
        }]
      })
    } catch (err) {
      dropped.push(idx)
    }
  }
  if (dropped.length > 0) pullAt(_opts, dropped)
  return map(_opts, o => {
    return {
      data: { setting: o.chartOpts, name: o.name },
      resource: 'waibuDb.partial:/crud/~echarts-window.html'
    }
  })
}

/**
 * Handles attachments for a given schema and ID.
 * @async
 * @memberof module:CRUDHandler/Helper
 * @method
 * @name attachmentHandler
 * @param {object} opts - Options object
 * @param {object} opts.schema - Schema object
 * @param {string|number} opts.id - ID of the record
 * @returns {Promise<Array>} Array of attachments
 */
export async function attachmentHandler (opts = {}) {
  const { schema, id } = opts
  if (!schema.view.attachment) return []
  const model = this.app.dobo.getModel(schema.name)
  return await model.listAttachment({ id })
}

/**
 * Builds parameters for a given model and request.
 *
 * @param {object} opts - Options object
 * @param {string} opts.model - Model name
 * @param {object} opts.req - Request object
 * @returns {object} Parameters including page information
 */
export function buildParams (opts = {}) {
  const { model, req } = opts
  const { camelCase, kebabCase, map, upperFirst, get } = this.app.lib._
  const [, ...names] = map(kebabCase(model).split('-'), n => upperFirst(n))
  const mdl = this.app.dobo.getModel(model)
  const prefix = this.app.waibuMpa ? this.app.waibuMpa.getPluginTitle(mdl.plugin.ns, req) : mdl.plugin.ns
  const modelTitle = req.t(prefix) + ': ' + req.t(camelCase(names.join(' ')))
  const page = {
    title: req.t(get(req, 'routeOptions.config.title', this.app[mdl.plugin.ns].title)),
    modelTitle
  }
  return { page }
}

/**
 * Template path for the "not found" page.
 * @name notFoundTpl
 * @constant {string}
 * @default 'waibuDb.template:/crud/not-found.html'
 * @memberof module:CRUDHandler/Helper
 */
export const notFoundTpl = 'waibuDb.template:/crud/not-found.html'
