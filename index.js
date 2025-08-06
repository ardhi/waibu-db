async function factory (pkgName) {
  const me = this

  return class WaibuDb extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'wdb'
      this.dependencies = ['dobo', 'waibu', 'bajo-queue', 'dobo-extra']
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
      const { get } = this.lib._
      const { fs } = this.lib
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
  }
}

export default factory
