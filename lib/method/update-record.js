import { prepCrud, getOneRecord, processHandler } from '../util.js'

async function updateRecord ({ model, req, reply, id, body, options = {}, transaction } = {}) {
  const { isEmpty } = this.app.lib._
  const { model: mdl, filter, opts, recId, attachment } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction })
  const me = this

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    if (!opts._data) {
      const resp = await getOneRecord.call(me, mdl, recId, filter, { ...opts, dataOnly: false })
      opts._data = resp.data
    }
    const ret = await mdl.updateRecord(recId, body ?? req.body, { ...opts, dataOnly: false, partial: true, strict: true })
    if (!isEmpty(attachment)) ret.data._attachment = await mdl.findAttachment(recId, attachment)
    return ret
  }

  return await processHandler.call(this, { action: 'updateRecord', model: mdl, handler, options: opts })
}

export default updateRecord
