async function getLookupData ({ model, req, data, id = 'id', field, query }) {
  const { set, map } = this.app.lib._
  const $in = map(data, id)
  const q = query ?? set({}, field, { $in })
  const options = {
    dataOnly: true,
    limit: -1,
    query: q
  }
  return await this.recordFind({ model, req, options })
}

export default getLookupData
