import { prepCrud } from '../util.js'

async function findOneRecord ({ model, req, reply, options = {} }) {
  const { model: mdl, opts, filter, attachment, stats, mimeType } = await prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await mdl.findOneRecord(filter, opts)
  if (attachment) {
    for (const d of ret.data) {
      d._attachment = await mdl.findAttachment(d.id, { stats, mimeType })
    }
  }
  return ret
}

export default findOneRecord
