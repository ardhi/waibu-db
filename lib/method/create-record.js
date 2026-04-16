import { prepCrud, processHandler } from '../util.js'

async function createRecord ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const ret = await mdl.createRecord(req.body, { ...opts, partial: true, strict: true })
    if (attachment) ret.data._attachment = await mdl.findAttachment(ret.data.id, { stats, mimeType })
    return ret
  }

  return await processHandler.call(this, { action: 'createRecord', model: mdl, handler, options: opts })
}

export default createRecord
