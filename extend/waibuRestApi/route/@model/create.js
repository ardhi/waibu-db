async function create (req, reply) {
  return await this.createRecord({ req, reply })
}

export default create
