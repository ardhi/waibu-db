import { prepCrud, getOneRecord, processHandler } from '../util.js'

async function removeRecord ({ model, req, reply, id, options = {}, transaction } = {}) {
  const { model: mdl, recId, opts, filter } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction })
  const me = this

  async function handler (trx) {
    opts.trx = opts.trx || trx
    const resp = await getOneRecord.call(me, mdl, recId, filter, opts)
    opts._data = resp.data
    return await mdl.removeRecord(recId, opts)
  }

  return await processHandler.call(this, { action: 'removeRecord', model: mdl, handler, options: opts })
}

export default removeRecord
