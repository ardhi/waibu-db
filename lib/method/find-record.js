import prepCrud from '../prep-crud.js'

async function findRecord ({ model, req, reply, options = {} }) {
  const { model: mdl, opts, filter, attachment, stats, mimeType } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await mdl.findRecord(filter, opts)
  if (attachment) {
    for (const d of ret.data) {
      d._attachment = await mdl.findAttachment(d.id, { stats, mimeType })
    }
  }
  return ret
}

export default findRecord
