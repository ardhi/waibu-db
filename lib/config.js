/**
 * Configuration object
 * @typedef TConfig
 * @type {object}
 * @property {object} [waibu={}] - Waibu configuration
 * @property {string} [waibu.prefix='db'] - Waibu prefix
 * @property {string} [waibu.title='dbModels'] - Waibu title
 * @property {object} [waibuAdmin={}] - Waibu Admin configuration
 * @property {boolean} [waibuAdmin.menuCollapsible=true] - Whether the menu is collapsible
 * @property {string} [waibuAdmin.menuHandler='waibuDb:adminMenu'] - Menu handler
 * @property {object} [waibuMpa={}] - Waibu MPA configuration
 * @property {string} [waibuMpa.icon='database'] - Icon for the MPA
 * @property {object} [dbModel={}] - Database model configuration
 * @property {boolean} [dbModel.count=false] - Whether to count records
 * @property {boolean} [dbModel.patchEnabled=false] - Whether patching is enabled
 * @property {object} [control={}] - Control configuration
 * @property {object} [control.wdbBtnColumns={}] - Configuration for the WDB button columns
 * @property {number} [control.wdbBtnColumns.menuMax=10] - Maximum number of menu items
 * @property {boolean} [enableRestApiForModel=false] - Whether to enable REST API for the model
 */
const config = {
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
  control: {
    wdbBtnColumns: {
      menuMax: 10
    }
  },
  enableRestApiForModel: false
}

export default config
