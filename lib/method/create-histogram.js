import prepCrud from '../prep-crud.js'

async function createHistogram ({ model, req, reply, options = {} }) {
  const { model: mdl, opts, filter } = await prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const params = {}
  for (const item of ['type', 'group', 'field', 'aggregates']) {
    params[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  params.aggregates = params.aggregates ?? ['count']
  return await mdl.createHistogram(filter, params, opts)
}

export default createHistogram
