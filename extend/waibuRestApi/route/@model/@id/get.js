async function get (req, reply, options) {
  return await this.getRecord({ req, reply, options, transaction: true })
}

export default get
