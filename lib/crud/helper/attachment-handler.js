async function attachmentHandler ({ schema, id, options = {} }) {
  if (!schema.view.attachment) return []
  const model = this.app.dobo.getModel(schema.name)
  return await model.listAttachment({ id })
}

export default attachmentHandler
