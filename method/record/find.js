import prepCrud from '../../lib/prep-crud.js'

async function find ({ model, req, reply, options = {} }) {
  const { recordFind, attachmentFind } = this.app.dobo
  const { name, opts, filter, attachment, stats, mimeType } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await recordFind(name, filter, opts)
  if (attachment) {
    for (const d of ret.data) {
      d._attachment = await attachmentFind(name, d.id, { stats, mimeType })
    }
  }
  return ret
}

export default find
