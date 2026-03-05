import { prepCrud } from '../util.js'

async function createRecord ({ model, req, reply, body, options = {}, transaction } = {}) {
  const { model: mdl, input, opts, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, body, options, args: ['model'], transaction })

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const ret = await mdl.createRecord(input, opts)
    if (attachment) ret.data._attachment = await mdl.findAttachment(ret.data.id, { stats, mimeType })
    return ret
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default createRecord
