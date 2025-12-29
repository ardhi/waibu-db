function buildParams ({ model, req, reply, action, options = {} }) {
  const { camelCase, kebabCase, map, upperFirst, get } = this.lib._
  const [, ...names] = map(kebabCase(model).split('-'), n => upperFirst(n))
  const mdl = this.app.dobo.getModel(model)
  const modelTitle = this.app[mdl.plugin.ns].title + ': ' + req.t(camelCase(names.join(' ')))
  const page = {
    title: req.t(get(req, 'routeOptions.config.title', this.app[mdl.plugin.ns].title)),
    modelTitle
  }
  return { page }
}

export default buildParams
