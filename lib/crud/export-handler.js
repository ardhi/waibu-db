import prepCrud from '../prep-crud.js'

async function exportHandler ({ req, reply, model, params = {}, templateDisabled = 'waibuDb.template:/disabled.html', options = {} } = {}) {
  const { getPlugin } = this.app.bajo
  const { dayjs } = this.lib
  const { omit, kebabCase, get, merge } = this.lib._
  const { pascalCase } = this.lib.aneka
  const { getSchemaExt } = this.app.waibuDb
  const { buildUrl } = this.app.waibuMpa
  const { pushDownload } = getPlugin('sumba')
  model = model ?? pascalCase(req.params.model)
  const { schema } = await getSchemaExt(model, 'add', merge({}, { params }, options))
  if (schema.disabled.includes('find')) return await reply.view(templateDisabled, { action: 'list' })
  const data = prepCrud.call(getPlugin('waibuDb'), { model, req, reply, args: ['model'] })
  data.opts = omit(data.opts, ['req', 'reply'])
  const source = `${this.name}:/export-handler`
  const worker = 'waibuDb:exportData'
  const type = get(data, 'input.ftype', 'json')
  const settings = get(data, 'input.options', '').split(',')
  const ext = settings.includes('zip') ? `${type}.gz` : type
  const file = `${kebabCase(model)}_${dayjs().format('YYYYMMDDhhmmss')}.${ext}`
  await pushDownload({ file, type, worker, source, data, req })
  req.flash('notify', req.t('exportInQueue'))
  const url = buildUrl({ url: req.url, base: req.body.handler })
  return reply.redirectTo(url)
}

export default exportHandler
