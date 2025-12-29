import countRecord from './lib/method/count-record.js'
import createAggregate from './lib/method/create-aggregate.js'
import createHistogram from './lib/method/create-histogram.js'
import createRecord from './lib/method/create-record.js'
import findOneRecord from './lib/method/find-one-record.js'
import findRecord from './lib/method/find-record.js'
import getSchemaExt from './lib/method/get-schema-ext.js'
import getRecord from './lib/method/get-record.js'
import removeRecord from './lib/method/remove-record.js'
import updateRecord from './lib/method/update-record.js'

/**
 * Plugin factory
 *
 * @param {string} pkgName - NPM package name
 * @returns {class}
 */
async function factory (pkgName) {
  const me = this

  /**
   * WaibuDb class
   *
   * @class
   */
  class WaibuDb extends this.app.baseClass.Base {
    static alias = 'wdb'
    static dependencies = ['dobo', 'waibu', 'dobo-extra']

    constructor () {
      super(pkgName, me.app)
      this.config = {
        waibu: {
          prefix: 'db',
          title: 'dbModels'
        },
        waibuAdmin: {
          menuCollapsible: true,
          menuHandler: 'waibuDb:adminMenu'
        },
        waibuMpa: {
          icon: 'database'
        },
        dbModel: {
          count: false,
          patchEnabled: false
        },
        enableRestApiForModel: false
      }
      this.methodMap = {
        create: 'POST',
        find: 'GET',
        get: 'GET',
        update: 'PUT',
        remove: 'DELETE'
      }

      this.selfBind([
        'countRecord',
        'createAggregate',
        'createHistogram',
        'createRecord',
        'findOneRecord',
        'findRecord',
        'getSchemaExt',
        'getRecord',
        'removeRecord',
        'updateRecord'
      ])
    }

    exportData = async (params) => {
      const { getPlugin } = this.app.bajo
      const { get } = this.app.lib._
      const { fs } = this.app.lib
      const { exportTo } = this.app.doboExtra
      const { downloadDir } = getPlugin('sumba')
      const model = get(params, 'payload.data.name')
      const fields = get(params, 'payload.data.opts.fields')
      const { id, file } = get(params, 'payload.data.download', {})
      const dest = `${downloadDir}/${file}`
      const options = {
        filter: get(params, 'payload.data.filter', {}),
        ensureDir: true,
        fields
      }
      options.filter.sort = 'id:1'
      const dmodel = this.app.dobo.getModel('SumbaDownload')
      try {
        await dmodel.updateRecord(id, { status: 'PROCESSING' })
        await exportTo(model, dest, options)
        const { size } = fs.statSync(dest)
        await dmodel.updateRecord(id, { size, status: 'COMPLETE' })
      } catch (err) {
        await dmodel.updateRecord(id, { status: 'FAIL' })
      }
    }

    adminMenu = async (locals, req) => {
      const { getPluginPrefix } = this.app.waibu
      const { pascalCase } = this.app.lib.aneka
      const { getAppTitle } = this.app.waibuMpa
      const { camelCase, map, pick, groupBy, keys, kebabCase, filter, get } = this.app.lib._

      const prefix = getPluginPrefix(this.ns)
      const schemas = filter(this.app.dobo.schemas, s => {
        const byModelFind = !s.disabled.includes('find')
        let modelDisabled = get(this, `app.${s.ns}.config.waibuAdmin.modelDisabled`)
        if (modelDisabled) {
          const allModels = map(filter(this.app.dobo.schemas, { ns: s.ns }), 'name')
          if (modelDisabled === 'all') modelDisabled = allModels
          else modelDisabled = map(modelDisabled, m => pascalCase(`${this.app[s.ns].alias} ${m}`))
        } else modelDisabled = []
        const byDbDisabled = !modelDisabled.includes(s.name)
        return byModelFind && byDbDisabled
      })
      const omenu = groupBy(map(schemas, s => {
        const item = pick(s, ['name', 'ns'])
        item.nsTitle = getAppTitle(s.ns)
        return item
      }), 'nsTitle')
      const menu = []
      for (const k of keys(omenu).sort()) {
        const items = omenu[k]
        const plugin = this.app[items[0].ns]
        menu.push({
          title: k,
          children: map(items, item => {
            return {
              title: camelCase(item.name.slice(plugin.alias.length)),
              href: `waibuAdmin:/${prefix}/${kebabCase(item.name)}/list`
            }
          })
        })
      }
      return menu
    }

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

    getLookupData = async ({ model, req, data, id = 'id', field, query }) => {
      const { set, map } = this.app.lib._
      const $in = map(data, id)
      const q = query ?? set({}, field, { $in })
      const options = {
        dataOnly: true,
        limit: -1,
        query: q
      }
      return await this.findRecord({ model, req, options })
    }

    formatRecord = async ({ data, req, schema, options = {} }) => {
      const { isArray } = this.app.lib._
      if (!isArray(data)) return await this.formatRow({ data, req, schema, options })
      const items = []
      for (const d of data) {
        const item = await this.formatRow({ data: d, req, schema, options })
        items.push(item)
      }
      return items
    }

    formatRow = async ({ data, req, schema, options = {} }) => {
      const { get, find, isFunction, cloneDeep } = this.app.lib._
      const { format, callHandler } = this.app.bajo
      const { escape } = this.app.waibu
      const fields = get(schema, 'view.fields', Object.keys(schema.properties))
      const rec = cloneDeep(data)
      for (const f of fields) {
        if (f === '_rel') continue
        let prop = find(schema.properties, { name: f })
        if (!prop) prop = find(schema.view.calcFields, { name: f })
        if (!prop) continue
        const opts = {
          lang: options.lang ?? (req ? req.lang : undefined),
          longitude: ['lng', 'longitude'].includes(f),
          latitude: ['lat', 'latitude'].includes(f),
          speed: ['speed'].includes(f),
          degree: ['course', 'heading'].includes(f),
          distance: ['distance'].includes(f)
        }
        rec[f] = format(data[f], prop.type, opts)
        const vf = get(schema, `view.valueFormatter.${f}`)
        if (vf) {
          if (isFunction(vf)) rec[f] = await vf.call(this, data[f], data)
          else rec[f] = await callHandler(vf, { req, value: data[f], data })
        } else if (['string', 'text'].includes(prop.type)) rec[f] = escape(rec[f])
      }
      return rec
    }

    countRecord = countRecord
    createAggregate = createAggregate
    createHistogram = createHistogram
    createRecord = createRecord
    findOneRecord = findOneRecord
    findRecord = findRecord
    getSchemaExt = getSchemaExt
    getRecord = getRecord
    removeRecord = removeRecord
    updateRecord = updateRecord
  }

  return WaibuDb
}

export default factory
