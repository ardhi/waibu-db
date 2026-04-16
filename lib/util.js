export const actions = ['countRecord', 'createAggregate', 'createHistogram', 'createRecord', 'findAllRecord', 'findOneRecord', 'findRecord', 'getRecord', 'removeRecord', 'updateRecord']

export async function prepCrud ({ model, id, req, reply, transaction, options = {}, args } = {}) {
  const { isSet } = this.app.lib.aneka
  const { importModule } = this.app.bajo
  const { parseFilter } = this.app.waibu
  const { pascalCase } = this.app.lib.aneka
  const { cloneDeep, has, isString, omit } = this.app.lib._
  const { parseObject } = this.app.lib
  const { buildFilterQuery, buildFilterSearch } = await importModule('dobo:/lib/factory/model/_util.js', { asDefaultImport: false })

  const cfgWeb = this.app.waibu.getConfig()
  const opts = cloneDeep(omit(options, ['trx']))
  if (opts.suppressError === true) opts.suppressError = actions
  else if (isString(opts.suppressError)) opts.suppressError = [opts.suppressError]
  else opts.suppressError = opts.suppressError ?? []
  const params = this.getParams(req, ...args)
  for (const k of ['count', 'fields']) {
    opts[k] = opts[k] ?? params[k]
  }
  if (has(options, 'count')) opts.count = options.count
  opts.dataOnly = opts.dataOnly ?? false
  opts.req = req
  opts.reply = reply
  opts.trx = opts.trx ?? options.trx ?? transaction ?? true

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
  return { model: mdl, recId, opts, filter, attachment, stats, mimeType }
}

export async function getOneRecord (model, id, filter, options) {
  const { cloneDeep, pick, isEmpty } = this.app.lib._
  let query = cloneDeep(filter.query || {})
  query = { $and: [query, { id }] }
  const opts = pick(options, ['forceNoHidden', 'trx', 'req', 'refs', 'formatValue', 'retainOriginalValue'])
  opts.dataOnly = false
  const data = await model.findOneRecord({ query }, opts)
  if (isEmpty(data.data) && options.throwNotFound) throw this.error('_notFound')
  return data
}

export async function processHandler ({ action, model, handler, options } = {}) {
  function suppressedReturn (err) {
    this.log.error(err)
    if (action === 'countRecord') return options.dataOnly ? 0 : { data: 0, warnings: [options.req.t('supppressedError')] }
    if (['createRecord', 'getRecord'].includes(action)) return options.dataOnly ? {} : { data: {}, warnings: [options.req.t('supppressedError')] }
    if (action === 'removeRecord') return options.dataOnly ? {} : { oldData: {}, warnings: [options.req.t('supppressedError')] }
    if (action === 'updateRecord') return options.dataOnly ? {} : { data: {}, oldData: {}, warnings: [options.req.t('supppressedError')] }
    return options.dataOnly ? [] : { data: [], count: 0, page: 1, warnings: [options.req.t('supppressedError')] }
  }

  try {
    if (options.trx === true) return await model.transaction(handler)
    return await handler()
  } catch (err) {
    if (options.suppressError.includes(action)) return suppressedReturn.call(this, err)
    throw err
  }
}
