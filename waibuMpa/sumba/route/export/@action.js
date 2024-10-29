const action = {
  method: ['GET', 'POST'],
  title: 'Database Export',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const handler = await importModule('waibuDb:/lib/crud/all-handler.js')
    const model = 'SumbaUser'
    const { action } = req.params
    const template = `sumba.template:/crud/${action}.html`
    return handler.call(this, { model, req, reply, action, template })
  }
}

export default action
