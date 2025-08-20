async function afterInit () {
  if (!this.config.modelRestApi) {
    this.app.waibuRestApi.config.disabled.push(
      'waibuDb:/:model',
      'waibuDb:/:model/:id'
    )
  }
}

export default afterInit
