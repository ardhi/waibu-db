async function find (req, reply, options) {
  return await this.findRecord({ req, reply, options, transaction: true })
}

export default find
