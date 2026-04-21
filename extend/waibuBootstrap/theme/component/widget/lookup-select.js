import wdbBase from '../wdb-base.js'

async function lookupSelect () {
  const WdbBase = await wdbBase.call(this)

  return class WdbLookupSelect extends WdbBase {
    constructor (options) {
      super(options)
      this.params.noTag = true
    }

    build = async () => {
      const { isEmpty, get, omit, set, camelCase, kebabCase } = this.app.lib._
      const { parseQuery } = this.app.dobo
      const { base64JsonEncode } = this.app.waibu
      const ref = this.getRef({ field: this.params.attr.name, refName: this.getRefName(this.params.attr.name) })
      if (isEmpty(ref)) {
        const sentence = `<c:form-input ${Object.entries(this.params.attr).map(([k, v]) => `${kebabCase(k)}="${v}"`).join(' ')} />`
        this.params.html = await this.component.buildSentence(sentence, this.component.locals)
        return
      }

      this.params.attr.url = this.params.attr.url ?? `waibuDb.restapi:/lookup/${kebabCase(ref.model)}`
      const omitted = ['url', 'searchField', 'labelField', 'valueField']
      const attr = omit(this.params.attr, omitted)
      for (const k of omitted) {
        attr[camelCase(`remote ${k}`)] = this.params.attr[k] ?? ref[k]
      }
      const q = set({}, this.params.attr.searchField ?? get(ref, 'searchField', 'id'), ['__REGEXP__', '{searchItem}', 'i'])
      attr.remoteQuery = base64JsonEncode({ $and: [parseQuery(get(ref, 'query', {})), q] })
      attr.remoteApiKey = true
      attr.clearBtn = true
      const sentence = `<c:form-select-ext ${Object.entries(attr).map(([k, v]) => `${kebabCase(k)}="${v}"`).join(' ')} />`
      this.params.html = await this.component.buildSentence(sentence, this.component.locals)
      this.params.attr = omit(this.params.attr, ['model', 'field', ...omitted])
    }
  }
}

export default lookupSelect
