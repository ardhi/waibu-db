const action = {
  method: ['GET', 'POST'],
  title: 'Model Database',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const handler = await importModule('waibuDb:/lib/crud/all-handler.js')
    const { model, action } = req.params
    const template = `waibuDb.template:/crud/${action}.html`
    const params = { page: { layout: `waibuAdmin.layout:/crud/${action === 'list' ? 'wide' : 'default'}.html` } }
    return handler.call(this, { model, req, reply, action, params, template })
  }
}

export default action
