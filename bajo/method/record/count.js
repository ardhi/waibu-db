import prepCrud from '../../../lib/prep-crud.js'

async function count ({ model, req, reply, options = {} }) {
  const { recordCount } = this.app.dobo
  const { name, opts, filter } = prepCrud.call(this, { model, req, reply, options, args: ['model'] })
  const ret = await recordCount(name, filter, opts)
  return ret
}

export default count
