import buildParams from './helper/build-params.js'
import addOnsHandler from './helper/add-ons-handler.js'

import addHandler from './add-handler.js'
import deleteHandler from './delete-handler.js'
import detailsHandler from './details-handler.js'
import editHandler from './edit-handler.js'
import exportHandler from './export-handler.js'
import listHandler from './list-handler.js'

const handler = {
  add: addHandler,
  delete: deleteHandler,
  details: detailsHandler,
  edit: editHandler,
  export: exportHandler,
  list: listHandler
}

async function allHandler ({ model, action, req, reply, template, params = {} }) {
  const { upperFirst, merge } = this.app.bajo.lib._
  if (['delete', 'export'].includes(action)) {
    if (req.method === 'GET') throw this.error('notFound')
    return await handler[action].call(this, { model, req, reply })
  }
  const allParams = merge(buildParams.call(this, { model, req, reply, action: upperFirst(action) }), params)
  return await handler[action].call(this, { model, req, reply, params: allParams, template, addOnsHandler })
}

export default allHandler
