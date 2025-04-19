import prepCrud from '../../../lib/prep-crud.js'

async function get ({ model, req, reply, id, options = {} }) {
  const { recordFindOne } = this.app.dobo
  const { name, filter, opts } = prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  filter.query = { $and: [filter.query ?? {}, { id: id ?? req.params.id }] }
  const ret = await recordFindOne(name, filter, opts)
  return ret
}

export default get
