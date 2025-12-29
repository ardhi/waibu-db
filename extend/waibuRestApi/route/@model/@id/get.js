async function get (req, reply) {
  return await this.getRecord({ req, reply })
}

export default get
