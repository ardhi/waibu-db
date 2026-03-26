import { prepCrud, getOneRecord, processHandler } from '../util.js'

async function getRecord ({ model, req, reply, id, options = {}, transaction } = {}) {
  const { model: mdl, recId, filter, attachment, stats, mimeType, opts } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction })
  const me = this

  async function handler (trx) {
    opts.trx = opts.trx || trx
    const data = await getOneRecord.call(me, mdl, recId, filter, opts)
    if (attachment) data._attachment = await mdl.findAttachment(data.id, { stats, mimeType })
    return data
  }

  return await processHandler.call(this, { action: 'getRecord', model: mdl, handler, options: opts })
}

export default getRecord
