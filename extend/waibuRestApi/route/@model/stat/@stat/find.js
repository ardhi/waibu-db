async function stat (req, reply, options) {
  const { camelCase } = this.app.lib._
  const method = camelCase(`create ${req.params.stat}`)
  if (!this[method]) throw this.error('_notFound')
  return await this[method]({ req, reply, options })
}

export default stat
