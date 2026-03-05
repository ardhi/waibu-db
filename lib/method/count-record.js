import { prepCrud } from '../util.js'

async function countRecord ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, filter } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })

  async function handler (trx) {
    opts.trx = opts.trx || trx
    return await mdl.countRecord(filter, opts)
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default countRecord
