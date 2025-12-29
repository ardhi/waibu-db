import prepCrud from '../prep-crud.js'

async function countRecord ({ model, req, reply, options = {} }) {
  const { model: mdl, opts, filter } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await mdl.countRecord(filter, opts)
  return ret
}

export default countRecord
