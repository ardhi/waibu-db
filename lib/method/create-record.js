import { prepCrud, processHandler } from '../util.js'

async function createRecord ({ model, req, body, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, attachment } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    const ret = await mdl.createRecord(body ?? req.body, { ...opts, dataOnly: false, partial: true, strict: true })
    if (attachment && ret.data) {
      const { params, options: attachOpts } = attachment ?? {}
      ret.data._attachment = await mdl.findAttachment(ret.data.id, params, attachOpts)
    }
    return ret
  }

  return await processHandler.call(this, { action: 'createRecord', model: mdl, handler, options: opts })
}

export default createRecord
