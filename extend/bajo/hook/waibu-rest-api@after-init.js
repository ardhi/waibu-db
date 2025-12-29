async function afterInit () {
  if (!this.config.enableRestApiForModel) {
    this.app.waibuRestApi.config.disabled.push(
      'waibuDb:/:model',
      'waibuDb:/:model/:id',
      'waibuDb:/:model/stat/:stat'
    )
  }
}

export default afterInit
