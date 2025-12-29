import prepCrud from '../prep-crud.js'

async function removeRecord ({ model, req, reply, id, options = {} }) {
  const { model: mdl, recId, opts } = prepCrud.call(this, { model, req, reply, id, options, args: ['model', 'id'] })
  const model = this.app.dobo.getModel(name)
  const result = await mdl.removeRecord(recId, opts)
  return result
}

export default removeRecord
