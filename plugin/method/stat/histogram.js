import prepCrud from '../../../lib/prep-crud.js'

async function histogram ({ model, req, reply, options = {} }) {
  const { statHistogram } = this.app.dobo
  const { parseFilter } = this.app.waibu
  const { name, opts } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  for (const item of ['type', 'group', 'aggregate']) {
    opts[item] = options[item] ?? req.params[item] ?? req.query[item]
  }
  return await statHistogram(name, parseFilter(req), opts)
}

export default histogram
