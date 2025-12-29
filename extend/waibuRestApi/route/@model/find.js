async function find (req, reply) {
  const { isSet } = this.app.lib.aneka
  const { parseObject } = this.app.lib
  let { fields, count } = this.getParams(req)
  let rels = []
  const headers = parseObject(req.headers, { parseValue: true })
  if (isSet(headers['x-count'])) count = headers['x-count']
  if (isSet(headers['x-rels'])) rels = headers['x-rels']
  if (typeof rels === 'string' && !['*', 'all'].includes(rels)) rels = [rels]
  const options = { fields, count, rels }
  return await this.findRecord({ req, reply, options })
}

export default find
