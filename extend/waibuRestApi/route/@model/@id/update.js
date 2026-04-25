async function update (req, reply, options) {
  return await this.updateRecord({ req, reply, options, transaction: true })
}

export default update
