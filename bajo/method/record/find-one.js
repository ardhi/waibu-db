import prepCrud from '../../../lib/prep-crud.js'

async function find ({ model, req, reply, options = {} }) {
  const { recordFindOne, attachmentFind } = this.app.dobo
  const { name, opts, filter } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await recordFindOne(name, filter, opts)
  const { attachment, stats, mimeType } = req.query
  if (attachment) {
    for (const d of ret.data) {
      d._attachment = await attachmentFind(name, d.id, { stats, mimeType })
    }
  }
  return ret
}

export default find
