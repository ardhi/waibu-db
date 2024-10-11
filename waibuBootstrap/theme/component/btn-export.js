async function btnExport (params = {}) {
  const { isEmpty } = this.plugin.app.bajo.lib._
  params.noTag = true
  if (isEmpty(params.attr.launch)) params.attr.launch = this.req.t('Export')
  params.attr.launchColor = params.attr.launchColor ?? 'secondary-outline'
  params.attr.title = this.req.t('Data Export')
  const html = await this.buildSentence(`
    <c:div x-data="{
      delivery: 'clipboard',
      options: [],
      ftype: 'json',
      toggle (val) {
        if (val === 'clipboard') {
          $refs.zip.setAttribute('disabled', '')
          $refs.xlsx.setAttribute('disabled', '')
          $refs.xml.setAttribute('disabled', '')
          _.pull(this.options, 'zip')
          if (!['json', 'csv'].includes(this.ftype)) this.ftype = 'json'
        } else {
          $refs.zip.removeAttribute('disabled')
          $refs.xlsx.removeAttribute('disabled')
          $refs.xml.removeAttribute('disabled')
        }
      },
      extractForm (selector) {
        let item = {}
        const els = document.querySelectorAll(selector + ' [data-value]')
        for (const el of els) {
          const value = this.options.includes('fvalue') ? el.getAttribute('value') : wmpa.parseValue(el.dataset.value, el.dataset.type)
          let key = el.getAttribute('name')
          if (this.options.includes('fkey')) {
            try {
              const elLabel = document.querySelector('label[for=' + el.getAttribute('id') + ']')
              key = elLabel.innerText
            } catch (err) {}
          }
          item[key] = value
        }
        return this.ftype === 'csv' ? CSVJSON.json2csv(item) : JSON.stringify(item)
      },
      extractTable (selector) {
        let items = []
        let checker = false
        const keys = []
        const types = []
        let els = document.querySelectorAll(selector + ' thead th')
        for (const el of els) {
          keys.push(this.options.includes('fkey') ? el.innerText : el.dataset.key)
          types.push(el.dataset.type)
        }
        if (_.isEmpty(keys[0])) {
          checker = true
          keys.shift()
          types.shift()
        }
        els = document.querySelectorAll(selector + ' tbody tr')
        for (const el of els) {
          let data = []
          _.each(el.children, (v, i) => {
            if ((i + '') === '0' && checker) return undefined
            data.push(this.options.includes('fvalue') ? v.innerText : wmpa.parseValue(v.dataset.value, types[parseInt(i - 1)]))
          })
          const item = {}
          for (const i in keys) {
            item[keys[i]] = data[i]
          }
          items.push(item)
        }
        return this.ftype === 'csv' ? CSVJSON.json2csv(items) : JSON.stringify(items)
      },
      async submit () {
        const instance = wbs.getInstance('Modal', $refs.export)
        const handler = '${params.attr.handler ?? ''}'
        if (this.delivery === 'clipboard') {
          const selector = '${params.attr.selector}'
          if (_.isEmpty(selector)) {
            await wbs.notify('Cant get data selector', { type: 'danger' })
          } else {
            const item = handler === 'list' ? this.extractTable(selector) : this.extractForm(selector)
            await wbs.copyToClipboard(item)
          }
          instance.hide()
          return
        }
        wmpa.postForm({ options: this.options.join(','), ftype: this.ftype, handler }, '${this._buildUrl({ base: 'export' })}')
        instance.hide()
      }
    }" x-init="
      toggle(delivery)
      $watch('delivery', val => toggle(val))
    ">
      <c:grid-row gutter="2">
        <c:grid-col col="6-md">
          <c:fieldset t:legend="Delivery" legend-type="6">
            <c:form-radio x-model="delivery" value="file" t:label="Save as File" />
            <c:form-radio x-model="delivery" value="clipboard" t:label="Copy to Clipboard" />
          </c:fieldset>
          <c:fieldset t:legend="Options" legend-type="6" margin="top-2">
            <c:form-check x-ref="fkey" x-model="options" value="fkey" t:label="Formatted Key" />
            <c:form-check x-ref="fvalue" x-model="options" value="fvalue" t:label="Formatted Value" />
            <c:form-check x-ref="zip" x-model="options" value="zip" t:label="Zipped" />
          </c:fieldset>
        </c:grid-col>
        <c:grid-col col="6-md">
          <c:fieldset t:legend="File Type" legend-type="6">
            <c:form-radio x-ref="xlsx" x-model="ftype" value="xlsx" t:label="Excel XLSX" />
            <c:form-radio x-ref="csv" x-model="ftype" value="csv" t:label="CSV" />
            <c:form-radio x-ref="xml" x-model="ftype" value="xml" t:label="XML" />
            <c:form-radio x-ref="json" x-model="ftype" value="json" t:label="JSON" />
          </c:fieldset />
        </c:grid-col>
      </c:grid-row>
      <c:div flex="justify-content:end" margin="top-3">
        <c:btn color="secondary" t:content="Close" dismiss />
        <c:btn color="primary" t:content="Submit" margin="start-2" @click="await submit()" />
      </c:div>
    </c:div>
  `)
  params.attr['x-data'] = true
  params.attr['x-ref'] = 'export'
  params.html = await this.buildTag({ tag: 'modal', attr: params.attr, html })
}

export default btnExport