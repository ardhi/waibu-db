import { prepCrud, getOneRecord } from '../util.js'

async function updateRecord ({ model, req, reply, id, body, options = {} }) {
  const { model: mdl, filter, input, opts, recId, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, body, id, options, args: ['model', 'id'] })
  opts._data = await getOneRecord.call(this, mdl, recId, filter, options)
  const ret = await mdl.updateRecord(recId, input, opts)
  if (attachment) ret.data._attachment = await mdl.findAttachment(id, { stats, mimeType })
  return ret
}

export default updateRecord
