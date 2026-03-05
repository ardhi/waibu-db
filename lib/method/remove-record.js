import { prepCrud, getOneRecord } from '../util.js'

async function removeRecord ({ model, req, reply, id, options = {}, transaction } = {}) {
  const { model: mdl, recId, opts, filter } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction })
  const me = this

  async function handler (trx) {
    opts.trx = opts.trx || trx
    opts._data = await getOneRecord.call(me, mdl, recId, filter, opts)
    return await mdl.removeRecord(recId, opts)
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default removeRecord
