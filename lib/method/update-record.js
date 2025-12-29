import prepCrud from '../prep-crud.js'

async function updateRecord ({ model, req, reply, id, body, options = {} }) {
  const { model: mdl, input, opts, recId, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, body, id, options, args: ['model', 'id'] })
  const ret = await mdl.updateRecord(recId, input, opts)
  if (attachment) ret.data._attachment = await mdl.findAttachment(id, { stats, mimeType })
  return ret
}

export default updateRecord
