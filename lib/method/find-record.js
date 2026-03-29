import { prepCrud, processHandler } from '../util.js'

async function findRecord ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, filter, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const ret = await mdl.findRecord(filter, opts)
    if (attachment) {
      for (const d of ret.data) {
        d._attachment = await mdl.findAttachment(d.id, { stats, mimeType })
      }
    }
    return ret
  }

  return await processHandler.call(this, { action: 'findRecord', model: mdl, handler, options: opts })
}

export default findRecord
