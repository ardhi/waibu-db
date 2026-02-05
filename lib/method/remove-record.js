import { prepCrud, getOneRecord } from '../util.js'

async function removeRecord ({ model, req, reply, id, options = {} }) {
  const { model: mdl, recId, opts, filter } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  opts._data = await getOneRecord.call(this, mdl, recId, filter, options)
  const result = await mdl.removeRecord(recId, opts)
  return result
}

export default removeRecord
