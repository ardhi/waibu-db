async function exportHandler ({ req, reply, model, params } = {}) {
  const { pascalCase } = this.app.bajo
  const { getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const options = {}
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', options)
  options.fields = schema.view.fields
  const url = buildUrl({ url: req.url, base: req.body.handler })
  req.flash('notify', req.t('Data export in queue. You\'ll be notified once completed'))
  return reply.redirectTo(url)
}

export default exportHandler
