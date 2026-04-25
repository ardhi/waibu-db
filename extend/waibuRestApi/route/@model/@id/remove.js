async function remove (req, reply, options) {
  return await this.removeRecord({ req, reply, options, transaction: true })
}

export default remove
