function modelsMenu (locals, req) {
  const { getPluginPrefix } = this.app.waibu
  const { pascalCase } = this.app.bajo
  const { getAppTitle } = this.app.waibuMpa
  const { camelCase, map, pick, groupBy, keys, kebabCase, filter, get } = this.lib._

  const prefix = getPluginPrefix(this.name)
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
      title: k,
      children: map(items, item => {
        return {
          title: camelCase(item.name.slice(plugin.alias.length)),
          href: `waibuAdmin:/${prefix}/${kebabCase(item.name)}/list`
        }
      })
    })
  }
  return menu
}

async function adminMenu (locals, req) {
  const { buildAccordionMenu } = this.app.waibuAdmin
  return buildAccordionMenu(modelsMenu.call(this, locals, req), locals, req)
}

export default adminMenu
