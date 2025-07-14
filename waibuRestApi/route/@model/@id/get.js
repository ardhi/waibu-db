async function get (req, reply) {
  return await this.recordGet({ req, reply })
}

export default get
