function prepCrud ({ model, body, id, req, options, args }) {
  const { pascalCase } = this.app.bajo
  const { cloneDeep, get } = this.app.bajo.lib._
  const opts = cloneDeep(options)
  const params = this.getParams(req, ...args)
  for (const k of ['count', 'fields']) {
    opts[k] = opts[k] ?? params[k]
  }
  opts.dataOnly = get(this, 'config.dbModel.dataOnly', false)
  opts.req = req
  const recId = id ?? params.id ?? req.query.id
  const name = pascalCase(model ?? params.model)
  const input = body ?? params.body
  return { name, recId, input, opts }
}

export default prepCrud
