import { prepCrud, getOneRecord, processHandler } from '../util.js'

async function updateRecord ({ model, req, reply, id, body, options = {}, transaction } = {}) {
  const { model: mdl, filter, opts, recId, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction })
  const me = this

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    if (!opts._data) {
      const resp = await getOneRecord.call(me, mdl, recId, filter, opts)
      opts._data = resp.data
    }
    const ret = await mdl.updateRecord(recId, body ?? req.body, { ...opts, partial: true, strict: true })
    if (attachment) ret.data._attachment = await mdl.findAttachment(id, { stats, mimeType })
    return ret
  }

  return await processHandler.call(this, { action: 'updateRecord', model: mdl, handler, options: opts })
}

export default updateRecord
