import { prepCrud, getOneRecord } from '../util.js'

async function getRecord ({ model, req, reply, id, options = {}, transaction } = {}) {
  const { model: mdl, recId, filter, attachment, stats, mimeType, opts } = await prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'], transaction })
  const me = this

  async function handler (trx) {
    opts.trx = opts.trx || trx
    const data = await getOneRecord.call(me, mdl, recId, filter, opts)
    if (attachment) data._attachment = await mdl.findAttachment(data.id, { stats, mimeType })
    return { data }
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default getRecord
