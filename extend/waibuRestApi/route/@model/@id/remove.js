async function remove (req, reply) {
  return await this.removeRecord({ req, reply })
}

export default remove
