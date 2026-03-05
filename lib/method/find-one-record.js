import { prepCrud } from '../util.js'

async function findOneRecord ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, filter, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })

  async function handler (trx) {
    opts.trx = opts.trx || trx
    const ret = await mdl.findOneRecord(filter, opts)
    if (attachment) ret.data._attachment = await mdl.findAttachment(ret.data.id, { stats, mimeType })
    return ret
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default findOneRecord
