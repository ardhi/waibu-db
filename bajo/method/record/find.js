import prepCrud from '../../../lib/prep-crud.js'

async function find ({ model, req, reply, options = {} }) {
  const { recordFind, attachmentFind } = this.app.dobo
  const { name, opts } = prepCrud.call(this, { model, req, options, args: ['model'] })
  const { parseFilter } = this.app.waibu
  const cfgWeb = this.app.waibu.config
  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  const filter = parseFilter(req)
  const ret = await recordFind(name, filter, opts)
  const { attachment, stats, mimeType } = req.query
  if (attachment) {
    for (const d of ret.data) {
      d._attachment = await attachmentFind(name, d.id, { stats, mimeType })
    }
  }
  return ret
}

export default find
