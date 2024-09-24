async function waibuMpaThemefterInjectCss ({ items, reply }) {
  items.push(`${this.name}.virtual:/bs-table/bootstrap-table.min.css`)
}

export default waibuMpaThemefterInjectCss
