import prepCrud from '../prep-crud.js'

async function getRecord ({ model, req, reply, id, options = {} }) {
  const { model: mdl, recId, filter, opts } = prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  filter.query = { $and: [filter.query ?? {}, { id: recId }] }
  const ret = await mdl.findOneRecord(filter, opts)
  return ret
}

export default getRecord
