async function factory (pkgName) {
  const me = this

  class WaibuDb extends this.app.pluginClass.base {
    static alias = 'wdb'
    static dependencies = ['dobo', 'waibu', 'bajo-queue', 'dobo-extra']

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
        modelRestApi: false
      }
    }

    exportData = async (params) => {
      const { getPlugin } = this.app.bajo
      const { get } = this.app.lib._
      const { fs } = this.app.lib
      const { recordUpdate } = this.app.dobo
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
      const dmodel = 'SumbaDownload'
      try {
        await recordUpdate(dmodel, id, { status: 'PROCESSING' })
        await exportTo(model, dest, options)
        const { size } = fs.statSync(dest)
        await recordUpdate(dmodel, id, { size, status: 'COMPLETE' })
      } catch (err) {
        await recordUpdate(dmodel, id, { status: 'FAIL' })
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
  }

  return WaibuDb
}

export default factory
