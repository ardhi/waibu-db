export async function prepCrud ({ model, body, id, req, reply, transaction, options = {}, args } = {}) {
  const { isSet } = this.app.lib.aneka
  const { importModule } = this.app.bajo
  const { parseFilter } = this.app.waibu
  const { pascalCase } = this.app.lib.aneka
  const { cloneDeep, has, isString, omit } = this.app.lib._
  const { parseObject } = this.app.lib
  const { buildFilterQuery, buildFilterSearch } = await importModule('dobo:/lib/factory/model/_util.js', { asDefaultImport: false })

  const cfgWeb = this.app.waibu.getConfig()
  const opts = cloneDeep(omit(options, ['trx']))
  opts.trx = options.trx
  const params = this.getParams(req, ...args)
  for (const k of ['count', 'fields']) {
    opts[k] = opts[k] ?? params[k]
  }
  if (has(options, 'count')) opts.count = options.count
  opts.dataOnly = opts.dataOnly ?? false
  opts.req = req
  opts.reply = reply
  opts.trx = opts.trx || transaction

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
  let mdl = model
  if (isString(model)) {
    model = model ?? pascalCase(params.model)
    mdl = this.app.dobo.getModel(model)
  }
  const input = await mdl.sanitizeBody({ body: body ?? params.body, partial: true, strict: true })

  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  const filter = parseFilter(req)
  filter.query = buildFilterQuery.call(mdl, filter)
  filter.search = buildFilterSearch.call(mdl, filter)
  if (options.query) filter.query = cloneDeep(options.query)
  if (options.search) filter.search = cloneDeep(options.search)
  if (options.limit) filter.limit = options.limit
  if (options.sort) filter.sort = options.sort
  if (options.page) filter.page = options.page
  return { model: mdl, recId, input, opts, filter, attachment, stats, mimeType }
}

export async function getOneRecord (model, id, filter, options) {
  const { cloneDeep, pick, isEmpty } = this.app.lib._
  let query = cloneDeep(filter.query || {})
  query = { $and: [query, { id }] }
  const opts = pick(options, ['forceNoHidden', 'trx', 'req', 'refs'])
  opts.dataOnly = false
  const data = await model.findOneRecord({ query }, opts)
  if (isEmpty(data.data) && options.throwNotFound) throw this.error('_notFound')
  return data
}
