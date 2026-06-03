async function index (req, reply) {
  const { kebabCase } = this.app.lib._
  const plugin = this.app.waibuDb
  const models = plugin.getAutoModels().map(m => m.name)
  const prefix = this.app.waibu.getPluginPrefix(plugin.ns)
  const params = { model: kebabCase(models[0]), action: 'list' }
  if (models.length > 0) return reply.redirectTo(`waibuAdmin:/${prefix}/:model/:action`, { params })
  throw this.error('_notFound')
}

export default index
