import { prepCrud, processHandler } from '../util.js'

async function createHistogram ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, filter } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })
  const params = {}
  for (const item of ['type', 'group', 'field', 'aggregates']) {
    params[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  params.aggregates = params.aggregates ?? ['count']

  async function handler (trx) {
    if (opts.trx === true) opts.trx = trx
    return await mdl.createHistogram(filter, params, opts)
  }

  return await processHandler.call(this, { action: 'createHistogram', model: mdl, handler, options: opts })
}

export default createHistogram
