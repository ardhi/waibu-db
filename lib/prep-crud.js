async function prepCrud ({ model, body, id, req, reply, options = {}, args }) {
  const { isSet } = this.app.lib.aneka
  const { parseFilter } = this.app.waibu
  const { pascalCase } = this.app.lib.aneka
  const { cloneDeep, has } = this.app.lib._
  const { parseObject } = this.app.lib
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

  let refs = []
  const headers = parseObject(req.headers, { parseValue: true })
  if (isSet(headers['x-count'])) options.count = headers['x-count']
  if (isSet(headers['x-refs'])) refs = headers['x-refs']
  if (typeof refs === 'string' && !['*', 'all'].includes(refs)) refs = [refs]
  if (refs.length > 0) options.refs = refs

  const recId = id ?? params.id ?? req.query.id
  model = model ?? pascalCase(params.model)
  const mdl = this.app.dobo.getModel(model)
  const input = await mdl.sanitizeBody({ body: body ?? params.body, partial: true, strict: true })

  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  const filter = parseFilter(req)
  if (options.query) filter.query = cloneDeep(options.query)
  if (options.limit) filter.limit = options.limit
  if (options.sort) filter.sort = options.sort
  if (options.page) filter.page = options.page
  return { model: mdl, recId, input, opts, filter, attachment, stats, mimeType }
}

export default prepCrud
