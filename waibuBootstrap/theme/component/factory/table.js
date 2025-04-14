import wdbBase from '../wdb-base.js'

async function table () {
  const WdbBase = await wdbBase.call(this)

  return class WdbTable extends WdbBase {
    isRightAligned = (field, schema) => {
      const { get, find } = this.plugin.app.bajo.lib._
      const prop = find(schema.properties, { name: field })
      if (!prop) return false
      let value = get(schema, 'view.alignEnd', []).includes(field)
      if (!value) value = ['smallint', 'integer', 'float', 'double'].includes(prop.type)
      return value
    }

    isNoWrap = (field, schema) => {
      const { get } = this.plugin.app.bajo.lib._
      return get(schema, 'view.noWrap', []).includes(field)
    }

    build = async () => {
      const { req } = this.component
      const { callHandler } = this.plugin.app.bajo
      const { escape } = this.plugin.app.waibu
      const { attrToArray, groupAttrs } = this.plugin.app.waibuMpa
      const { get, omit, set, find, isEmpty, without, isFunction, merge } = this.plugin.app.bajo.lib._
      const group = groupAttrs(this.params.attr, ['body', 'head', 'foot'])
      this.params.attr = group._
      const prettyUrl = this.params.attr.prettyUrl

      const data = get(this, 'component.locals.list.data', [])
      const filter = get(this, 'component.locals.list.filter', {})
      const count = get(this, 'component.locals.list.count', 0)
      if (count === 0) {
        const alert = '<c:alert color="warning" t:content="noRecordFound" margin="top-4"/>'
        this.params.noTag = true
        this.params.html = await this.component.buildSentence(alert)
        return
      }
      const schema = get(this, 'component.locals.schema', {})
      const disableds = get(schema, 'view.disabled', [])
      if (disableds.includes('find')) {
        this.params.html = ''
        return
      }
      const qsKey = this.plugin.app.waibu.config.qsKey
      let fields = without(get(this, `component.locals._meta.query.${qsKey.fields}`, '').split(','), '')
      if (isEmpty(fields)) fields = schema.view.fields
      let sort = this.params.attr.sort ? attrToArray(this.params.attr.sort) : get(this, `component.locals._meta.query.${qsKey.sort}`, '')
      if (isEmpty(sort)) {
        const keys = Object.keys(filter.sort)
        if (keys.length > 0) sort = `${keys[0]}:${filter.sort[keys[0]]}`
      }

      let [sortCol, sortDir] = sort.split(':')
      if (!['-1', '1'].includes(sortDir)) sortDir = '1'

      let selection
      const canDelete = !disableds.includes('remove')
      const canEdit = !disableds.includes('update')
      if (canEdit) selection = 'single'
      if (canDelete) selection = 'multi'
      if (selection) this.params.attr.hover = true

      this.params.noTag = true
      const html = []
      let items = []
      // head
      for (const f of schema.view.fields) {
        if (!fields.includes(f)) continue
        let prop = find(schema.properties, { name: f })
        if (!prop) prop = find(schema.view.calcFields, { name: f })
        if (!prop) continue
        let head = req.t(get(schema, `view.label.${f}`, `field.${f}`))
        if (!this.params.attr.noSort && (schema.sortables ?? []).includes(f)) {
          let sortItem = `${f}:-1`
          let icon = this.params.attr.sortUpIcon ?? 'caretUp'
          if (f === sortCol) {
            sortItem = `${f}:${sortDir === '1' ? '-1' : '1'}`
            icon = sortDir === '1' ? (this.params.attr.sortUpIcon ?? 'caretUp') : (this.params.attr.sortDownIcon ?? 'caretDown')
          }
          const item = set({ page: 1 }, qsKey.sort, sortItem)
          const href = this.component.buildUrl({ params: item })
          const attr = this.isRightAligned(f, schema) ? { text: 'align:end' } : {}
          const content = [
            await this.component.buildTag({ tag: 'div', attr, html: head }),
            await this.component.buildTag({ tag: 'a', attr: { icon, href }, prepend: '<div class="ms-1">', append: '</div>' })
          ]
          head = await this.component.buildTag({ tag: 'div', attr: { flex: 'justify-content:between align-items:end' }, html: content.join('\n') })
        }
        let text = this.params.attr.headerNowrap ? '' : 'nowrap'
        if (this.isRightAligned(f, schema)) text += ' align:end'
        const attr = { dataKey: f, dataType: prop.type, text }
        items.push(await this.component.buildTag({ tag: 'th', attr, html: head }))
      }
      if (items.length > 0 && selection) {
        let item = '<th></th>'
        if (selection === 'multi') {
          const attr = { 'x-model': 'toggleAll', name: '_rtm', noWrapper: true, noLabel: true }
          item = await this.component.buildTag({ tag: 'formCheck', attr, prepend: '<th>', append: '</th>' })
        } else {
          const attr = { name: 'remove', '@click': 'selected = \'\'', style: { cursor: 'pointer' } }
          item = await this.component.buildTag({ tag: 'icon', attr, prepend: '<th>', append: '</th>' })
        }
        items.unshift(item)
      }
      const header = await this.component.buildTag({ tag: 'tr', html: items.join('\n') })
      html.push(await this.component.buildTag({ tag: 'thead', attr: group.head, html: header }))
      // body
      items = []
      for (const d of data) {
        const lines = []
        if (selection) {
          const tag = selection === 'single' ? 'formRadio' : 'formCheck'
          const attr = { 'x-model': 'selected', name: '_rt', value: d.id, noLabel: true, noWrapper: true }
          const type = find(schema.properties, { name: 'id' }).type
          const prepend = `<td data-value="${d.id}" data-key="id" data-type="${type}">`
          lines.push(await this.component.buildTag({ tag, attr, prepend, append: '</td>' }))
        }
        for (const f of schema.view.fields) {
          if (!fields.includes(f)) continue
          let prop = find(schema.properties, { name: f })
          if (!prop) prop = find(schema.view.calcFields, { name: f })
          if (!prop) continue
          const opts = {}
          if (f === 'lng') opts.longitude = true
          else if (f === 'lat') opts.latitude = true
          let value = req.format(d[f], prop.type, opts)
          if (prop.type === 'boolean') {
            value = (await this.component.buildTag({ tag: 'icon', attr: { name: `circle${d[f] ? 'Check' : ''}` } })) +
              ' ' + (req.t(d[f] ? 'Yes' : 'No'))
          } else value = escape(value)
          let dataValue = d[f] ?? ''
          if (['datetime'].includes(prop.type)) dataValue = escape(dataValue.toISOString())
          if (['string', 'text'].includes(prop.type)) dataValue = escape(dataValue)
          if (['array', 'object'].includes(prop.type)) dataValue = escape(JSON.stringify(d[f]))
          const vf = get(schema, `view.valueFormatter.${f}`)
          if (vf) {
            if (isFunction(vf)) dataValue = escape(await vf(d[f], d))
            else dataValue = await callHandler(vf, req, d[f], d)
          }
          const attr = { dataValue, dataKey: prop.name, dataType: prop.type, style: { cursor: 'pointer' } }
          const cellFormatter = get(schema, `view.cellFormatter.${f}`)
          if (cellFormatter) merge(attr, await cellFormatter(dataValue, d))
          if (!['object', 'array'].includes(prop.type)) {
            const noWrap = this.isNoWrap(f, schema) ? 'nowrap' : ''
            if (this.isRightAligned(f, schema)) attr.text = `align:end ${noWrap}`
            else attr.text = noWrap
          }
          const lookup = get(schema, `view.lookup.${f}`)
          if (lookup) {
            const item = find(lookup.values, set({}, lookup.id ?? 'id', value))
            if (item) value = req.t(item[lookup.field ?? 'name'])
          }
          const formatter = get(schema, `view.formatter.${f}`)
          if (formatter) {
            if (isFunction(formatter)) value = await formatter(dataValue, d)
            else value = await callHandler(formatter, req, dataValue, d)
            value = await this.component.buildSentence(value)
          }
          const line = await this.component.buildTag({ tag: 'td', attr, html: value })
          lines.push(line)
        }
        const attr = { id: `rec-${d.id}` }
        if (!disableds.includes('update') || !disableds.includes('remove')) attr['@click'] = `toggle('${d.id}')`
        if (!disableds.includes('get')) attr['@dblclick'] = `goDetails('${d.id}')`
        items.push(await this.component.buildTag({ tag: 'tr', attr, html: lines.join('\n') }))
      }
      html.push(await this.component.buildTag({ tag: 'tbody', attr: group.body, html: items.join('\n') }))
      this.params.attr = omit(this.params.attr, ['sortUpIcon', 'sortDownIcon', 'noSort', 'selection', 'headerNowrap'])
      const goDetails = `
        goDetails (id) {
          let url = '${this.params.attr.detailsHref ?? this.component.buildUrl({ base: 'details', prettyUrl })}'
          if (url === '#') return
          if (url.indexOf('/:id') > -1) url = url.replace('/:id', '/' + id)
          else url += '&id=' + id
          window.location.href = url
        }
      `
      if (selection === 'multi') {
        this.params.attr['x-data'] = `{
          toggleAll: false,
          selected: [],
          toggle (id) {
            if (this.selected.includes(id)) {
              const idx = this.selected.indexOf(id)
              this.selected.splice(idx, 1)
            } else this.selected.push(id)
          },
          ${goDetails}
        }`
        this.params.attr['x-init'] = `
          $watch('toggleAll', val => {
            if (val) {
              const els = document.getElementsByName('_rt')
              const items = Array.from(els)
              selected = items.map(el => el.value)
            } else selected = []
          })
          $watch('selected', val => $dispatch('on-selection', val))
        `
      } else if (selection === 'single') {
        this.params.attr['x-data'] = `{
          selected: '',
          toggle (id) {
            this.selected = id
          },
          ${goDetails}
        }`
        this.params.attr['x-init'] = `
          $watch('selected', val => $dispatch('on-selection', [val]))
        `
      } else {
        this.params.attr['x-data'] = `{
          ${goDetails}
        }`
      }
      this.params.html = await this.component.buildTag({ tag: 'table', attr: this.params.attr, html: html.join('\n') })
    }
  }
}

export default table
