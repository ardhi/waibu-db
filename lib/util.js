/**
 * @module Helper
 */

/**
 * @external DoboModel
 * @see {@link https://ardhi.github.io/dobo/DoboModel.html|DoboModel}
 */

/**
 * @external TFilter
 * @see {@link https://ardhi.github.io/dobo/DoboModel.html#.TFilter|TFilter}
 */

/**
 * @external TOptions
 * @see {@link https://ardhi.github.io/dobo/DoboModel.html#.TOptions|TOptions}
 */

/**
 * Type of actions that can be performed on records in the database.
 * @typedef TActions
 * @type {Object}
 * @property {number} 0='countRecord' - Count the number of records
 * @property {number} 1='aggregate' - Create an aggregate record
 * @property {number} 2='histogram' - Create a histogram record
 * @property {number} 3='createRecord' - Create a new record
 * @property {number} 4='findAllRecord' - Find all records
 * @property {number} 5='findOneRecord' - Find one record
 * @property {number} 6='findRecord' - Find records
 * @property {number} 7='getRecord' - Get a record
 * @property {number} 8='removeRecord' - Remove a record
 * @property {number} 9='updateRecord' - Update a record
 */
export const actions = ['countRecord', 'aggregate', 'histogram', 'createRecord', 'findAllRecord', 'findOneRecord', 'findRecord', 'getRecord', 'removeRecord', 'updateRecord']

/**
 * Prepare CRUD operation parameters.
 * @async
 * @param {Object} [options={}] - Options for preparing CRUD operation
 * @param {string|external:DoboModel} options.model - The model to operate on
 * @param {string|number} [options.id] - The record ID
 * @param {Object} [options.req] - The request object
 * @param {Object} [options.reply] - The reply object
 * @param {Object} [options.transaction] - The transaction object
 * @param {boolean} [options.noAutoFilter] - Disable automatic filter parsing from `req.query`
 * @param {Object} [options.options] - Additional options
 * @param {Array} [options.args] - Additional arguments
 * @returns {Object} Prepared CRUD parameters
 */
export async function prepCrud (options = {}) {
  let { model, id, req, reply, transaction, options: _options = {}, args, noAutoFilter } = options
  const { isSet } = this.app.lib.aneka
  const { importModule } = this.app.bajo
  const { parseFilter } = this.app.waibu
  const { pascalCase } = this.app.lib.aneka
  const { cloneDeep, has, isString, omit } = this.app.lib._
  const { parseObject } = this.app.lib
  const { buildFilterQuery, buildFilterSearch } = await importModule('dobo:/lib/factory/model/helper.js', { asDefaultImport: false })

  const cfgWeb = this.app.waibu.getConfig()
  const opts = cloneDeep(omit(_options, ['trx']))
  opts.throwNotFound = true
  if (opts.suppressError === true) opts.suppressError = actions
  else if (isString(opts.suppressError)) opts.suppressError = [opts.suppressError]
  else opts.suppressError = opts.suppressError ?? []
  const params = this.getParams(req, ...args)
  for (const k of ['count', 'fields']) {
    opts[k] = opts[k] ?? params[k]
  }
  if (has(_options, 'count')) opts.count = _options.count
  opts.dataOnly = opts.dataOnly ?? false
  opts.req = req
  opts.reply = reply
  opts.trx = opts.trx ?? _options.trx ?? transaction ?? true

  let { attachment, stats, mimeType } = opts
  attachment = attachment ?? req.query.attachment
  stats = stats ?? req.query.stats
  mimeType = mimeType ?? req.query.mimeType

  let refs = []
  const headers = parseObject(req.headers, { parseValue: true })
  if (isSet(headers['x-count'])) _options.count = headers['x-count']
  if (isSet(headers['x-refs'])) refs = headers['x-refs']
  if (typeof refs === 'string' && !['*', 'all'].includes(refs)) refs = [refs]
  if (refs.length > 0) _options.refs = refs

  const recId = id ?? params.id ?? req.query.id
  let mdl = model
  if (!model || isString(model)) {
    model = model ?? pascalCase(params.model)
    mdl = this.app.dobo.getModel(model)
  }
  opts.bboxLatField = req.query[cfgWeb.qsKey.bboxLatField]
  opts.bboxLngField = req.query[cfgWeb.qsKey.bboxLngField]
  let filter = { query: {}, search: {} }
  if (!noAutoFilter) {
    filter = parseFilter(req)
    filter.query = buildFilterQuery.call(mdl, filter)
    filter.search = buildFilterSearch.call(mdl, filter)
  }
  if (_options.query) filter.query = cloneDeep(_options.query)
  if (_options.search) filter.search = cloneDeep(_options.search)
  if (_options.limit) filter.limit = _options.limit
  if (_options.sort) filter.sort = _options.sort
  if (_options.page) filter.page = _options.page
  if (opts.fields && opts.fields.length > 0 && mdl.hasProperty('_immutable')) opts.fields.push('_immutable')
  const input = cloneDeep(req.body) ?? {}
  return { model: mdl, input, recId, opts, filter, attachment, stats, mimeType }
}

/**
 * Get a single record from the database based on the provided model, ID, filter, and options.
 * @async
 * @param {external:DoboModel} model - The model to query
 * @param {string|number} id - The ID of the record to retrieve
 * @param {external:TFilter} [filter={}] - The filter criteria for the query
 * @param {external:TOptions} [options={}] - Additional options for the query
 * @returns {Promise<Object>} The retrieved record
 */
export async function getOneRecord (model, id, filter = {}, options = {}) {
  const { cloneDeep, pick, isEmpty } = this.app.lib._
  let query = cloneDeep(filter.query || {})
  query = { $and: [query, { id }] }
  const opts = pick(options, ['forceNoHidden', 'trx', 'req', 'refs', 'fmt'])
  opts.dataOnly = false
  const data = await model.findOneRecord({ query }, opts)
  if (isEmpty(data.data) && options.throwNotFound) throw this.error('_notFound')
  return data
}

/**
 * Process a database operation with error suppression and transaction handling.
 * @async
 * @param {Object} [opts={}] - Options for processing the handler
 * @param {string} opts.action - The action to perform (e.g., 'createRecord', 'updateRecord')
 * @param {external:DoboModel} opts.model - The model to operate on
 * @param {Function} opts.handler - The handler function to execute
 * @param {external:TOptions} [opts.options] - Additional options for the handler
 */
export async function processHandler (opts = {}) {
  const { action, model, handler, options } = opts
  const { req, reply } = options

  const handleExport = async () => {
    if (!(req.method === 'POST' && req.body._action === 'export' && options.allowExport)) return
    const { importModule } = this.app.bajo
    const exportHandler = await importModule('waibuDb:/lib/crud/export-handler.js')
    await exportHandler.call(this, { model: model.name, req, reply, options })
  }

  function suppressedReturn (err) {
    this.log.error(err)
    if (action === 'countRecord') return options.dataOnly ? 0 : { data: 0, warnings: [req.t('supppressedError')] }
    if (['createRecord', 'getRecord'].includes(action)) return options.dataOnly ? {} : { data: {}, warnings: [req.t('supppressedError')] }
    if (action === 'removeRecord') return options.dataOnly ? {} : { oldData: {}, warnings: [req.t('supppressedError')] }
    if (action === 'updateRecord') return options.dataOnly ? {} : { data: {}, oldData: {}, warnings: [req.t('supppressedError')] }
    return options.dataOnly ? [] : { data: [], count: 0, page: 1, warnings: [req.t('supppressedError')] }
  }

  try {
    await handleExport()
    if (options.trx === true && ['createRecord', 'updateRecord', 'upsertRecord', 'removeRecord'].includes(action)) {
      return await model.transaction(handler, action, options)
    }
    return await handler()
  } catch (err) {
    if (options.suppressError.includes(action)) return suppressedReturn.call(this, err)
    throw err
  }
}
