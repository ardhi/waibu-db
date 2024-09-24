async function virtual () {
  const items = [{
    prefix: 'bs-table',
    root: 'bootstrap-table:/dist'
  }]
  if (!this.app.waibuExtra) {
    items.push({
      prefix: 'jquery',
      root: 'jquery:/dist'
    })
  }
  return items
}

export default virtual
