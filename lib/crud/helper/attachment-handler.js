async function attachmentHandler ({ schema, id }) {
  const { listAttachments } = this.app.dobo
  if (!schema.view.attachment) return []
  return await listAttachments({ model: schema.name, id })
}

export default attachmentHandler
