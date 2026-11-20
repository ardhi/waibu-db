import { prepCrud, getOneRecord, processHandler } from '../util.js'

async function getRecord ({ model, req, reply, id, options = {}, transaction, noAutoFilter } = {}) {
  const { model: mdl, recId, filter, attachment, opts } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction, noAutoFilter })
  const me = this

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const data = await getOneRecord.call(me, mdl, recId, filter, { ...opts, dataOnly: false })
    if (attachment) {
      const { params, options: attachOpts } = attachment ?? {}
      data._attachment = await mdl.findAttachment(data.id, params, attachOpts)
    }
    return data
  }

  return await processHandler.call(this, { action: 'getRecord', model: mdl, handler, options: opts })
}

export default getRecord
