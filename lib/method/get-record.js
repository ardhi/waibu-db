import { prepCrud, getOneRecord } from '../util.js'

async function getRecord ({ model, req, reply, id, options = {} }) {
  const { model: mdl, recId, filter, opts } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  const data = await getOneRecord.call(this, mdl, recId, filter, opts)
  return options.dataOnly ? data : { data }
}

export default getRecord
