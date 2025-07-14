async function update (req, reply) {
  return await this.recordUpdate({ req, reply })
}

export default update
