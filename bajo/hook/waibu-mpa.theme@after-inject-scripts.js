async function waibuMpaThemefterInjectScripts ({ items }) {
  items.push(`${this.name}.virtual:/bs-table/bootstrap-table.min.js`)
  if (this.app.waibuExtra) items.push('^waibuExtra.virtual:/jquery/jquery.min.js')
  else items.push(`^${this.name}.virtual:/jquery/jquery.min.js`)
}

export default waibuMpaThemefterInjectScripts
