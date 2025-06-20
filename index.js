async function factory (pkgName) {
  const me = this

  return class WaibuDb extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'wdb'
      this.dependencies = ['dobo', 'waibu']
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
        }
      }
    }
  }
}

export default factory
