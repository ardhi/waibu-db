import { prepCrud } from '../util.js'

async function createRecord ({ model, req, reply, body, options = {} }) {
  const { model: mdl, input, opts, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, body, options, args: ['model'] })
  const ret = await mdl.createRecord(input, opts)
  if (attachment) ret.data._attachment = await mdl.findAttachment(ret.data.id, { stats, mimeType })
  return ret
}

export default createRecord
