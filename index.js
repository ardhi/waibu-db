import countRecord from './lib/method/count-record.js'
import aggregate from './lib/method/aggregate.js'
import histogram from './lib/method/histogram.js'
import createRecord from './lib/method/create-record.js'
import findOneRecord from './lib/method/find-one-record.js'
import findRecord from './lib/method/find-record.js'
import getSchemaExt from './lib/method/get-schema-ext.js'
import getRecord from './lib/method/get-record.js'
import removeRecord from './lib/method/remove-record.js'
import updateRecord from './lib/method/update-record.js'
import findAllRecord from './lib/method/find-all-record.js'
import config from './lib/config.js'

/**
 * Plugin factory.
 *
 * **Never** call this function directly!!! It's only-meant to be called by the {@link https://ardhi.github.io/bajo|Bajo framework} during plugin initialization.
 *
 * @param {string} pkgName - NPM package name
 * @returns {WaibuDb} WaibuDb class
 */
async function factory (pkgName) {
  const me = this

  /**
   * WaibuDb class definition.
   *
   * @class
   */
  class WaibuDb extends this.app.baseClass.Base {
    /**
     * Constructor.
     */
    constructor () {
      super(pkgName, me.app)

      /**
       * Configuration object.
       * @type {TConfig}
       */
      this.config = config

      /**
       * Method map for CRUD operations.
       * @type {object}
       * @property {string} [create='POST'] - HTTP method for create operation
       * @property {string} [find='GET'] - HTTP method for find operation
       * @property {string} [get='GET'] - HTTP method for get operation
       * @property {string} [update='PUT'] - HTTP method for update operation
       * @property {string} [remove='DELETE'] - HTTP method for remove operation
       */
      this.methodMap = {
        create: 'POST',
        find: 'GET',
        get: 'GET',
        update: 'PUT',
        remove: 'DELETE'
      }

      this.bindThis(
        countRecord,
        aggregate,
        histogram,
        createRecord,
        findOneRecord,
        findRecord,
        getSchemaExt,
        getRecord,
        removeRecord,
        updateRecord,
        findAllRecord
      )
    }

    /**
     * Export data and save it as a file you can download later.
     * This method is intended to be called by a worker process.
     *
     * If sumba is loaded, file download is handled by sumba download management which provides
     * you a slick UI to monitor the download progress and status.
     *
     * If not, file is saved in standard bajo download directory.
     * @async
     * @method
     * @param {object} params
     * @returns {string} Path to the exported file
     */
    exportData = async (params) => {
      const { get } = this.app.lib._
      const { exportTo } = this.app.doboExtra
      const model = get(params, 'payload.data.name')
      const fields = get(params, 'payload.data.opts.fields')
      const file = get(params, 'payload.data.file', {})
      const options = {
        filter: get(params, 'payload.data.filter', {}),
        exportOpts: get(params, 'payload.data.exportOpts', []),
        opts: get(params, 'payload.data.opts', {}),
        fields
      }
      return await exportTo(model, file, options)
    }

    /**
     * Get all models that will be automatically included in the WaibuAdmin menu.
     * @method
     * @returns {Array} List of models
     */
    getAutoModels = () => {
      const { filter, get, map, isArray } = this.app.lib._
      const { pascalCase } = this.app.lib.aneka
      const allModels = this.app.dobo.models
      const models = filter(allModels, s => {
        const byModelFind = !s.disabled.includes('find')
        const disabled = get(this, `app.${s.plugin.ns}.config.waibuAdmin.modelDisabled`, [])
        let modelDisabled = []
        if (['*', 'all'].includes(disabled)) modelDisabled = map(filter(allModels, m => m.plugin.ns === s.plugin.ns), 'name')
        else if (isArray(disabled)) modelDisabled = map(disabled, m => pascalCase(`${this.app[s.plugin.ns].alias} ${m}`))
        const byDbDisabled = !modelDisabled.includes(s.name)
        return byModelFind && byDbDisabled
      })
      return models
    }

    /**
     * Build menu for WaibuAdmin
     * @param {object} locals - Locals object
     * @param {object} req - Request object
     * @returns {Array<object>} Menu structure
     */
    adminMenu = async (locals, req) => {
      const { getPluginPrefix } = this.app.waibu
      const { getPluginTitle } = this.app.waibuMpa
      const { camelCase, map, groupBy, keys, kebabCase } = this.app.lib._

      const prefix = getPluginPrefix(this.ns)
      const models = this.getAutoModels()
      const omenu = groupBy(map(models, s => {
        const item = { name: s.name, ns: s.plugin.ns }
        item.nsTitle = getPluginTitle(s.plugin.ns, req)
        return item
      }), 'nsTitle')
      const menu = []
      for (const k of keys(omenu).sort()) {
        const items = omenu[k]
        const plugin = this.app[items[0].ns]
        menu.push({
          title: req.t(k),
          children: map(items, item => {
            const params = {
              model: kebabCase(item.name),
              action: 'list'
            }
            return {
              title: camelCase(item.name.slice(plugin.alias.length)),
              href: `waibuAdmin:/${prefix}/:model/:action`,
              params
            }
          })
        })
      }
      return menu
    }

    /**
     * Collect all available parameters from the request object.
     * @method
     * @param {object} req - Request object
     * @param  {...string} items - List of parameter names
     * @returns {object} Collected parameters
     */
    getParams = (req, ...items) => {
      const { map, trim, get } = this.app.lib._
      let fields
      req.query = req.query ?? {}
      req.params = req.params ?? {}
      if (req.query.fields) fields = map((req.query.fields ?? '').split(','), i => trim(i))
      const params = {
        fields,
        count: get(this, 'config.dbModel.count', false),
        body: req.body
      }
      items.forEach(i => {
        params[i] = req.params[i]
      })
      return params
    }

    /**
     * Get lookup data for a specific model and field based on provided options.
     * @method
     * @async
     * @param {object} opts - Options for the lookup
     * @param {string} opts.model - Model name
     * @param {object} opts.req - Request object
     * @param {Array<object>} opts.data - Data array
     * @param {string} [opts.id='id'] - ID field name
     * @param {string} opts.field - Field name to lookup
     * @param {object} [opts.query] - Optional query object
     * @returns {Promise<Array<object>>} Lookup results
     */
    getLookupData = async (opts = {}) => {
      const { model, req, data, id = 'id', field, query } = opts
      const { set, map } = this.app.lib._
      const $in = map(data, id)
      const q = query ?? set({}, field, { $in })
      const options = {
        dataOnly: true,
        query: q
      }
      return await this.findAllRecord({ model, req, options })
    }
  }

  return WaibuDb
}

export default factory
