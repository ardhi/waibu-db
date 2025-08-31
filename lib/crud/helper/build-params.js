function buildParams ({ model, req, reply, action, options = {} }) {
  const { camelCase, kebabCase, map, upperFirst, get } = this.app.lib._
  const { getSchema } = this.app.dobo
  const [, ...names] = map(kebabCase(model).split('-'), n => upperFirst(n))
  const schema = getSchema(camelCase(model), false)
  const modelTitle = this.app[schema.ns].title + ': ' + req.t(camelCase(names.join(' ')))
  const page = {
    title: req.t(get(req, 'routeOptions.config.title', this.app[schema.ns].title)),
    modelTitle
  }
  return { page }
}

export default buildParams
