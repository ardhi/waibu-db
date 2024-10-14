import prepCrud from '../../../lib/prep-crud.js'

async function get ({ model, req, reply, id, options = {} }) {
  const { recordGet, attachmentFind } = this.app.dobo
  const { parseFilter } = this.app.waibu
  const { name, recId, opts } = prepCrud.call(this, { model, req, id, options, args: ['model', 'id'] })
  opts.filter = parseFilter(req)
  const ret = await recordGet(name, recId, opts)
  if (name === 'SumbaUser') console.log('+++', typeof ret.data.updatedAt, ret.data.updatedAt)
  const { attachment, stats, mimeType } = req.query
  if (attachment) ret.data._attachment = await attachmentFind(name, id, { stats, mimeType })
  return ret
}

export default get
