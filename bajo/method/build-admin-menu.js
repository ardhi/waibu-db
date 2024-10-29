function modelsMenu () {
  const { titleize, pascalCase } = this.app.bajo
  const { getAppTitle } = this.app.waibuMpa
  const { map, pick, groupBy, keys, kebabCase, filter, get } = this.app.bajo.lib._
  const schemas = filter(this.app.dobo.schemas, s => {
    const byModelFind = !s.disabled.includes('find')
    let modelDisabled = get(this, `app.${s.ns}.config.waibuAdmin.modelDisabled`)
    if (modelDisabled) {
      const allModels = map(filter(this.app.dobo.schemas, { ns: s.ns }), 'name')
      if (modelDisabled === 'all') modelDisabled = allModels
      else modelDisabled = map(modelDisabled, m => pascalCase(`${this.app[s.ns].alias} ${m}`))
    } else modelDisabled = []
    const byDbDisabled = !modelDisabled.includes(s.name)
    return byModelFind && byDbDisabled
  })
  const omenu = groupBy(map(schemas, s => {
    const item = pick(s, ['name', 'ns'])
    item.nsTitle = getAppTitle(s.ns)
    return item
  }), 'nsTitle')
  const menu = []
  for (const k of keys(omenu).sort()) {
    const items = omenu[k]
    const plugin = this.app[items[0].ns]
    menu.push({
      name: k,
      children: map(items, item => {
        return {
          name: titleize(item.name.slice(plugin.alias.length)),
          id: kebabCase(item.name)
        }
      })
    })
  }
  return menu
}

async function buildAdminMenu (locals, req) {
  const { getAppPrefix } = this.app.waibu
  const menus = modelsMenu.call(this)
  const dropdown = []
  dropdown.push('<div><c:accordion no-border text="nowrap" style="margin-top:-5px;margin-bottom:-5px;">')
  for (const menu of menus) {
    dropdown.push(`<c:accordion-item t:header="${menu.name}&nbsp;&nbsp;" no-padding narrow-header>`)
    dropdown.push('<c:list type="group" no-border hover>')
    for (const child of menu.children) {
      dropdown.push(`<c:list-item href="waibuAdmin:/${getAppPrefix(this.name)}/${child.id}/list" t:content="${child.name}" />`)
    }
    dropdown.push('</c:list></c:accordion-item>')
  }
  dropdown.push('</c:accordion></div>')
  return dropdown
}

export default buildAdminMenu
