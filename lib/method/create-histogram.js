import { prepCrud } from '../util.js'

async function createHistogram ({ model, req, reply, options = {}, transaction } = {}) {
  const { model: mdl, opts, filter } = await prepCrud.call(this, { model, req, reply, options, args: ['model'], transaction })
  const params = {}
  for (const item of ['type', 'group', 'field', 'aggregates']) {
    params[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  params.aggregates = params.aggregates ?? ['count']

  async function handler (trx) {
    opts.trx = opts.trx || trx
    return await mdl.createHistogram(filter, params, opts)
  }

  return opts.trx === true ? await mdl.transaction(handler) : await handler()
}

export default createHistogram
