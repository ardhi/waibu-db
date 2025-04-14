import prepCrud from '../../../lib/prep-crud.js'

async function get ({ model, req, reply, id, options = {} }) {
  const { recordFindOne, attachmentFind } = this.app.dobo
  const { name, filter, opts, attachment, stats, mimeType } = prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  filter.query = { $and: [filter.query ?? {}, { id: id ?? req.params.id }] }
  opts.dataOnly = true
  const ret = await recordFindOne(name, filter, opts)
  if (attachment) ret.data._attachment = await attachmentFind(name, ret.id, { stats, mimeType })
  return ret
}

export default get
