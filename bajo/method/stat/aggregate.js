import prepCrud from '../../../lib/prep-crud.js'

async function aggregate ({ model, req, reply, options = {} }) {
  const { statAggregate } = this.app.dobo
  const { name, opts } = prepCrud.call(this, { model, req, options, args: ['model'] })
  for (const item of ['group', 'aggregate']) {
    opts[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  return await statAggregate(name, this.parseFilter(req), opts)
}

export default aggregate