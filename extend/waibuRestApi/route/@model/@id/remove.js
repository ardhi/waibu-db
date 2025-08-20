async function remove (req, reply) {
  return await this.recordRemove({ req, reply })
}

export default remove
