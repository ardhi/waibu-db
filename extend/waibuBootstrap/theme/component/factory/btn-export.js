import wdbBase from '../wdb-base.js'

async function btnExport () {
  const WdbBase = await wdbBase.call(this)

  return class WdbBtnExport extends WdbBase {
    static scripts = [...super.scripts,
      'waibuMpa.virtual:/json2csv/json2csv.js'
    ]

    build = async () => {
      const { isEmpty, get } = this.app.lib._
      const { req } = this.component
      this.params.noTag = true
      const schema = get(this, 'component.locals.schema', {})
      const count = get(this, 'component.locals.list.count', 0)
      if (count === 0 && this.params.attr.handler === 'list') this.params.attr.triggerDisabled = true
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      if (isEmpty(this.params.attr.trigger)) this.params.attr.trigger = req.t('export')
      this.params.attr.triggerColor = this.params.attr.triggerColor ?? 'secondary-outline'
      this.params.attr.title = req.t('dataExport')
      const html = await this.component.buildSentence(`
        <c:div x-data="{
          delivery: 'clipboard',
          options: [],
          ftype: 'json',
          toggle (val) {
            if (val === 'clipboard') {
              $refs.fkey.removeAttribute('disabled')
              $refs.fvalue.removeAttribute('disabled')
              $refs.zip.setAttribute('disabled', '')
              $refs.xlsx.setAttribute('disabled', '')
              $refs.tsv.setAttribute('disabled', '')
              $refs.ndjson.setAttribute('disabled', '')
              _.pull(this.options, 'zip')
              if (!['json', 'csv'].includes(this.ftype)) this.ftype = 'json'
            } else {
              $refs.fkey.setAttribute('disabled', '')
              $refs.fvalue.setAttribute('disabled', '')
              $refs.zip.removeAttribute('disabled')
              $refs.xlsx.removeAttribute('disabled')
              $refs.tsv.removeAttribute('disabled')
              $refs.ndjson.removeAttribute('disabled')
              _.pull(this.options, 'fkey', 'fvalue')
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
                i = i + ''
                if (i === '0' && checker) return undefined
                if (this.options.includes('fvalue')) data.push(v.innerText)
                else {
                  const type = types[parseInt(i)]
                  let val = wmpa.parseValue(v.dataset.value, type)
                  if (['datetime', 'date', 'time'].includes(type)) val = val.toISOString()
                  data.push(val)
                }
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
            const handler = '${this.params.attr.handler ?? ''}'
            if (this.delivery === 'clipboard') {
              const selector = '${this.params.attr.selector}'
              if (_.isEmpty(selector)) {
                await wbs.notify('Cant get data selector', { type: 'danger' })
              } else {
                const item = handler === 'list' ? this.extractTable(selector) : this.extractForm(selector)
                await wbs.copyToClipboard(item)
              }
              instance.hide()
              return
            }
            wmpa.postForm({ options: this.options.join(','), ftype: this.ftype, handler }, '${this.component.buildUrl({ base: 'export' })}')
            instance.hide()
          }
        }" x-init="
          toggle(delivery)
          $watch('delivery', val => toggle(val))
        ">
          <c:grid-row gutter="2">
            <c:grid-col col="6-md">
              <c:fieldset t:legend="delivery" legend-type="6">
                <c:form-radio x-model="delivery" value="clipboard" t:label="copyClipboard" />
                <c:form-radio x-model="delivery" value="file" t:label="saveAsFile" ${this.params.attr.noSave ? 'disabled' : ''} />
              </c:fieldset>
              <c:fieldset t:legend="options" legend-type="6" margin="top-2">
                <c:form-check x-ref="fkey" x-model="options" value="fkey" t:label="formattedField" />
                <c:form-check x-ref="fvalue" x-model="options" value="fvalue" t:label="formattedValue" />
                <c:form-check x-ref="zip" x-model="options" value="zip" t:label="zipped" />
              </c:fieldset>
            </c:grid-col>
            <c:grid-col col="6-md">
              <c:fieldset t:legend="fileType" legend-type="6">
                <c:form-radio x-ref="xlsx" x-model="ftype" value="xlsx" t:label="excelXlsx" />
                <c:form-radio x-ref="csv" x-model="ftype" value="csv" t:label="csv" />
                <c:form-radio x-ref="tsv" x-model="ftype" value="tsv" t:label="tsv" />
                <c:form-radio x-ref="json" x-model="ftype" value="json" t:label="json" />
                <c:form-radio x-ref="ndjson" x-model="ftype" value="ndjson" t:label="ndjson" />
              </c:fieldset />
            </c:grid-col>
          </c:grid-row>
          <c:div flex="justify-content:end" margin="top-3">
            <c:btn color="secondary" t:content="close" dismiss />
            <c:btn color="primary" t:content="submit" margin="start-2" @click="await submit()" />
          </c:div>
        </c:div>
      `)
      this.params.attr['x-data'] = true
      this.params.attr['x-ref'] = 'export'
      this.params.html = await this.component.buildTag({ tag: 'modal', attr: this.params.attr, html })
    }
  }
}

export default btnExport
