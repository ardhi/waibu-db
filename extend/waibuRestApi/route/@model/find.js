async function find (req, reply) {
  return await this.findRecord({ req, reply })
}

export default find
