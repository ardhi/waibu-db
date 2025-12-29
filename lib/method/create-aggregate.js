import prepCrud from '../prep-crud.js'

async function createAggregate ({ model, req, reply, options = {} }) {
  const { model: mdl, opts, filter } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const params = {}
  for (const item of ['group', 'field', 'aggregates']) {
    params[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  params.aggregates = params.aggregates ?? ['count']
  return await mdl.createAggregate(filter, params, opts)
}

export default createAggregate
