async function create (req, reply, options) {
  return await this.createRecord({ req, reply, options, transaction: true })
}

export default create
