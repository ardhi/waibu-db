import prepCrud from '../prep-crud.js'

async function removeRecord ({ model, req, reply, id, options = {} }) {
  const { model: mdl, recId, opts } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  const result = await mdl.removeRecord(recId, opts)
  return result
}

export default removeRecord
