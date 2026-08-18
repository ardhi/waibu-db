import { prepCrud, processHandler } from '../util.js'

async function histogram ({ model, req, reply, options = {}, noAutoFilter, transaction } = {}) {
  const { model: mdl, opts, filter } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], noAutoFilter, transaction })
  const params = {}
  for (const item of ['type', 'group', 'field', 'aggregates']) {
    params[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  params.aggregates = params.aggregates ?? ['count']

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    return await mdl.histogram(filter, params, opts)
  }

  return await processHandler.call(this, { action: 'histogram', model: mdl, handler, options: opts })
}

export default histogram
