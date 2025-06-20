import prepCrud from '../../lib/prep-crud.js'

async function create ({ model, req, reply, body, options = {} }) {
  const { recordCreate, attachmentFind } = this.app.dobo
  const { name, input, opts, attachment, stats, mimeType } = prepCrud.call(this, { model, req, reply, body, options, args: ['model'] })
  const ret = await recordCreate(name, input, opts)
  if (attachment) ret.data._attachment = await attachmentFind(name, ret.data.id, { stats, mimeType })
  return ret
}

export default create
