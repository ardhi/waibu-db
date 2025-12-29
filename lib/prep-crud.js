function prepCrud (modelName, { body, id, req, reply, options = {}, args }) {
  const { parseFilter } = this.app.waibu
  const { pascalCase } = this.app.lib.aneka
  const { cloneDeep, has } = this.app.lib._
  const cfgWeb = this.app.waibu.getConfig()
  const opts = cloneDeep(options)
  const params = this.getParams(req, ...args)
  for (const k of ['count', 'fields']) {
    opts[k] = opts[k] ?? params[k]
  }
  if (has(options, 'count')) opts.count = options.count
  opts.dataOnly = opts.dataOnly ?? false
  opts.req = req
  opts.reply = reply

  let { attachment, stats, mimeType } = opts
  attachment = attachment ?? req.query.attachment
  stats = stats ?? req.query.stats
  mimeType = mimeType ?? req.query.mimeType

  const recId = id ?? params.id ?? req.query.id
  modelName = modelName ?? pascalCase(params.model)
  const model = this.app.dobo.getModel(modelName)
  const input = body ?? params.body
  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  const filter = parseFilter(req)
  if (options.query) filter.query = cloneDeep(options.query)
  if (options.limit) filter.limit = options.limit
  if (options.sort) filter.sort = options.sort
  if (options.page) filter.page = options.page
  return { model, recId, input, opts, filter, attachment, stats, mimeType }
}

export default prepCrud
