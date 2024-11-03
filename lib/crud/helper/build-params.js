function buildParams ({ model, req, reply, action }) {
  const { camelCase, kebabCase, map, upperFirst, get } = this.app.bajo.lib._
  const { getSchema } = this.app.dobo
  const [alias, ...names] = map(kebabCase(model).split('-'), n => upperFirst(n))
  const schema = getSchema(camelCase(model), false)
  const modelTitle = this.app[schema.ns].title + ': ' + names.join(' ')
  const page = {
    title: req.t(get(req, 'routeOptions.config.title', alias)),
    modelTitle
  }
  return { page }
}

export default buildParams
