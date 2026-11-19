import { prepCrud, processHandler } from '../util.js'

async function findAllRecord ({ model, req, reply, options = {}, noAutoFilter, transaction } = {}) {
  const { isEmpty } = this.app.lib._
  const { model: mdl, opts, filter, attachment } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], noAutoFilter, transaction })

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const ret = await mdl.findAllRecord(filter, { ...opts, dataOnly: false })
    if (!isEmpty(attachment)) {
      for (const d of ret.data) {
        d._attachment = await mdl.findAttachment(d.id, attachment)
      }
    }
    return ret
  }

  return await processHandler.call(this, { action: 'findAllRecord', model: mdl, handler, options: opts })
}

export default findAllRecord
