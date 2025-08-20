async function create (req, reply) {
  return await this.recordCreate({ req, reply })
}

export default create
