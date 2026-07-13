import { buildParams, addOnsHandler } from './helper.js'

import addHandler from './add-handler.js'
import deleteHandler from './delete-handler.js'
import detailsHandler from './details-handler.js'
import editHandler from './edit-handler.js'
import exportHandler from './export-handler.js'
import listHandler from './list-handler.js'

/**
 * Function handlers for CRUD operations.
 *
 * To use these handlers, you need to import them first and call them with the appropriate parameters.
 * @module CRUDHandler
 */

/**
 * Map of CRUD action names to their corresponding handler functions.
 * @memberof module:CRUDHandler
 * @typedef {Object} THandlerMap
 * @type {Object}
 * @property {Function} add - Handler for the {@link module:CRUDHandler~addHandler addHandler} action
 * @property {Function} delete - Handler for the {@link module:CRUDHandler~deleteHandler deleteHandler} action
 * @property {Function} details - Handler for the {@link module:CRUDHandler~detailsHandler detailsHandler} action
 * @property {Function} edit - Handler for the {@link module:CRUDHandler~editHandler editHandler} action
 * @property {Function} export - Handler for the {@link module:CRUDHandler~exportHandler exportHandler} action
 * @property {Function} list - Handler for the {@link module:CRUDHandler~listHandler listHandler} action
 */

const handler = {
  add: addHandler,
  delete: deleteHandler,
  details: detailsHandler,
  edit: editHandler,
  export: exportHandler,
  list: listHandler
}

/**
 * Handler for routing to the appropriate CRUD action based on the provided options.
 *
 * To use this handler, you must import it first and call it with the necessary parameters. For example:
 * ```javascript
 * const { importModule } = this.app.bajo
 * const allHandler = await importModule('waibuDb:/lib/crud/all-handler.js')
 * const result = await allHandler.call(this, { model: 'YourModelName', action: 'list', req, reply })
 * ```
 *
 * For more information on the available actions, see {@link module:CRUDHandler.THandlerMap THandlerMap}.
 * @async
 * @memberof module:CRUDHandler
 * @method
 * @param {object} opts - Options object
 * @param {string} opts.model - Model name
 * @param {string} opts.action - Action name
 * @param {object} opts.req - Request object
 * @param {object} opts.reply - Reply object
 * @param {string} [opts.template] - Template path
 * @param {object} [opts.params={}] - Parameters for the template
 * @param {object} [opts.options={}] - Additional options
 * @returns {Promise<any>} Result of the handler
 * @see {@link module:CRUDHandler.THandlerMap THandlerMap}
 */
async function allHandler (opts = {}) {
  const { model, action, req, reply, template, params = {}, options = {} } = opts
  const { upperFirst, merge, keys } = this.app.lib._
  if (!keys(handler).includes(action)) throw this.error('_notFound')
  options.modelOpts = options.modelOpts ?? {}
  options.modelOpts.fmt = true
  if (['delete', 'export'].includes(action)) {
    if (req.method === 'GET') throw this.error('_notFound')
    return await handler[action].call(this, { model, req, reply, options })
  }
  const allParams = merge(buildParams.call(this, { model, req, reply, action: upperFirst(action), options }), params)
  return await handler[action].call(this, { model, req, reply, params: allParams, template, addOnsHandler, options })
}

export default allHandler
