import prepCrud from '../prep-crud.js'

async function updateRecord ({ model, req, reply, id, body, options = {} }) {
  const { model: mdl, input, opts, recId, attachment, stats, mimeType } = prepCrud.call(this, { model, req, reply, body, id, options, args: ['model', 'id'] })
  const model = this.app.dobo.getModel(name)
  const ret = await mdl.updateRecord(name, recId, input, opts)
  if (attachment) ret.data._attachment = await mdl.findAttachment(name, id, { stats, mimeType })
  return ret
}

export default updateRecord
