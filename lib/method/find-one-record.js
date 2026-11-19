import { prepCrud, processHandler } from '../util.js'

async function findOneRecord ({ model, req, reply, options = {}, noAutoFilter, transaction } = {}) {
  const { isEmpty } = this.app.lib._
  const { model: mdl, opts, filter, attachment } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], noAutoFilter, transaction })

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const ret = await mdl.findOneRecord(filter, { ...opts, dataOnly: false })
    if (!isEmpty(attachment)) ret.data._attachment = await mdl.findAttachment(ret.data.id, attachment)
    return ret
  }

  return await processHandler.call(this, { action: 'findOneRecord', model: mdl, handler, options: opts })
}

export default findOneRecord
