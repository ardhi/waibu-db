import prepCrud from '../../../lib/prep-crud.js'

async function find ({ model, req, reply, options = {} }) {
  const { recordFindOne, attachmentFind } = this.app.dobo
  const { name, opts } = prepCrud.call(this, { model, req, options, args: ['model'] })
  const cfgWeb = this.app.waibu.config
  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  const filter = this.parseFilter(req)
  const ret = await recordFindOne(name, filter, opts)
  ret.filter = filter
  const { attachment, stats, mimeType } = req.query
  if (attachment) {
    ret.data._attachment = await attachmentFind(name, ret.data.id, { stats, mimeType })
  }
  return ret
}

export default find
