function prepCrud ({ model, body, id, req, reply, options = {}, args }) {
  const { parseFilter } = this.app.waibu
  const { pascalCase } = this.app.bajo
  const { cloneDeep, has } = this.lib._
  const cfgWeb = this.app.waibu.config
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
  const name = pascalCase(model ?? params.model)
  const input = body ?? params.body
  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  const filter = parseFilter(req)
  if (options.query) filter.query = cloneDeep(options.query)
  if (options.limit) filter.limit = options.limit
  if (options.sort) filter.sort = options.sort
  return { name, recId, input, opts, filter, attachment, stats, mimeType }
}

export default prepCrud
