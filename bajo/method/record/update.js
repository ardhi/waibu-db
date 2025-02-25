import prepCrud from '../../../lib/prep-crud.js'

async function update ({ model, req, reply, id, body, options = {} }) {
  const { recordUpdate, attachmentFind } = this.app.dobo
  const { name, input, opts, recId } = prepCrud.call(this, { model, req, reply, body, id, options, args: ['model', 'id'] })
  const ret = await recordUpdate(name, recId, input, opts)
  const { attachment, stats, mimeType } = req.query
  if (attachment) ret.data._attachment = await attachmentFind(name, id, { stats, mimeType })
  return ret
}

export default update
