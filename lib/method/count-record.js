import { prepCrud } from '../util.js'

async function countRecord ({ model, req, reply, options = {} }) {
  const { model: mdl, opts, filter } = await prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await mdl.countRecord(filter, opts)
  return ret
}

export default countRecord
