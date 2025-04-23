import prepCrud from '../../../lib/prep-crud.js'

async function get ({ model, req, reply, id, options = {} }) {
  const { recordFindOne } = this.app.dobo
  const { name, recId, filter, opts } = prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  filter.query = { $and: [filter.query ?? {}, { id: recId }] }
  const ret = await recordFindOne(name, filter, opts)
  return ret
}

export default get
