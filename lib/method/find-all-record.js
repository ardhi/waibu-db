import { prepCrud } from '../util.js'

async function findAllRecord ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, filter, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })

  async function handler (trx) {
    opts.trx = opts.trx || trx
    const ret = await mdl.findAllRecord(filter, opts)
    if (attachment) {
      for (const d of ret.data) {
        d._attachment = await mdl.findAttachment(d.id, { stats, mimeType })
      }
    }
    return ret
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default findAllRecord
