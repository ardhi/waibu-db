function buildParams ({ model, req, reply, action, options = {} }) {
  const { camelCase, kebabCase, map, upperFirst, get } = this.app.lib._
  const [, ...names] = map(kebabCase(model).split('-'), n => upperFirst(n))
  const mdl = this.app.dobo.getModel(model)
  const prefix = this.app.waibuMpa ? this.app.waibuMpa.getAppTitle(mdl.plugin.ns) : mdl.plugin.ns
  const modelTitle = req.t(prefix) + ': ' + req.t(camelCase(names.join(' ')))
  const page = {
    title: req.t(get(req, 'routeOptions.config.title', this.app[mdl.plugin.ns].title)),
    modelTitle
  }
  return { page }
}

export default buildParams
