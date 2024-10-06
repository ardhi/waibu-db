function _buildHref (base, excluded = []) {
  const { trimEnd, omit } = this.plugin.app.bajo.lib._
  const { qs } = this.plugin.app.waibu
  let [path, query = ''] = this.req.url.split('?')
  query = qs.parse(query)
  const parts = path.split('/')
  parts.pop()
  parts.push(base)
  return trimEnd(`${parts.join('/')}?${qs.stringify(omit(query, excluded))}`, '?')
}

export default _buildHref
