import wdbBase from '../wdb-base.js'

async function table () {
  const WdbBase = await wdbBase.call(this)

  return class WdbDataTable extends WdbBase {
    isRightAligned = (field, schema) => {
      const { get, find } = this.app.lib._
      const prop = find(schema.properties, { name: field })
      if (!prop) return false
      let value = get(schema, 'view.alignEnd', []).includes(field)
      if (!value) value = ['smallint', 'integer', 'float', 'double'].includes(prop.type)
      return value
    }

    isNoWrap = (field, schema, bodyNowrap) => {
      if (bodyNowrap) return true
      const { get } = this.app.lib._
      return get(schema, 'view.noWrap', []).includes(field)
    }

    build = async () => {
      const { req, buildTag, buildSentence, buildUrl, locals = {} } = this.component
      const { escape, attrToArray } = this.app.waibu
      const { groupAttrs } = this.app.waibuMpa
      const { isHtmlLink } = this.app.bajoExtra
      const { getTruncated } = this.app.bajoTemplate
      const { get, omit, set, find, isEmpty, without, merge, intersection, isPlainObject } = this.app.lib._
      const { isSet } = this.app.lib.aneka
      const group = groupAttrs(this.params.attr, ['body', 'head', 'foot'])
      this.params.attr = group._
      const prettyUrl = this.params.attr.prettyUrl

      const schema = get(locals, 'schema', {})
      const data = get(locals, 'list.data', [])
      const filter = get(locals, 'list.filter', {})
      const count = get(locals, 'list.count', 0)
      if (count === 0 || data.length === 0) {
        const alert = '<c:alert color="warning" t:content="noRecordFound" margin="top-4"/>'
        this.params.noTag = true
        this.params.html = await buildSentence(alert)
        return
      }
      const disableds = get(schema, 'view.disabled', [])
      if (disableds.includes('find')) {
        this.params.html = ''
        return
      }
      const qsKey = this.app.waibu.config.qsKey
      let fields = without(get(locals, `_meta.query.${qsKey.fields}`, '').split(','), '')
      if (isEmpty(fields)) fields = without(schema.view.fields, 'id')
      if (data.length > 0) {
        fields = intersection(fields, Object.keys(data[0]))
      }
      let sort = this.params.attr.sort ? attrToArray(this.params.attr.sort) : get(locals, `_meta.query.${qsKey.sort}`, '')
      if (isEmpty(sort) && filter.sort) {
        const keys = Object.keys(filter.sort)
        if (keys.length > 0) sort = `${keys[0]}:${filter.sort[keys[0]]}`
      }

      let [sortCol, sortDir] = sort.split(':')
      if (!['-1', '1'].includes(sortDir)) sortDir = '1'

      let selection = this.params.attr.selection
      if (!isSet(selection)) {
        const canDelete = !disableds.includes('remove')
        const canEdit = !disableds.includes('update')
        const canDetails = !disableds.includes('get')
        if (canEdit || canDetails) selection = 'single'
        if (canDelete) selection = 'multi'
        if (selection) this.params.attr.hover = true
      } else if (!['single', 'multi'].includes(selection)) selection = false

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
          const href = buildUrl({ params: item })
          const attr = this.isRightAligned(f, schema) ? { text: 'align:end' } : {}
          const content = [
            await buildTag({ tag: 'div', attr, html: head }),
            await buildTag({ tag: 'a', attr: { icon, href, noIconLink: true }, prepend: '<div class="ms-1">', append: '</div>' })
          ]
          head = await buildTag({ tag: 'div', attr: { flex: 'justify-content:between align-items:end' }, html: content.join('\n') })
        }
        let text = this.params.attr.headerNowrap ? '' : 'nowrap'
        if (text === '' && this.isNoWrap(f, schema, group.body.nowrap)) text = 'nowrap'
        if (this.isRightAligned(f, schema)) text += ' align:end'
        const attr = { dataKey: f, dataType: prop.type, text }
        items.push(await buildTag({ tag: 'th', attr, html: head }))
      }
      if (items.length > 0 && selection) {
        let item = '<th></th>'
        if (selection === 'multi') {
          const attr = { 'x-model': 'toggleAll', name: '_rtm', noWrapper: true, noLabel: true }
          item = await buildTag({ tag: 'formCheck', attr, prepend: '<th>', append: '</th>' })
        } else {
          const attr = { name: 'remove', '@click': 'selected = \'\'' }
          if (!disableds.includes('get')) attr.style = { cursor: 'pointer' }
          item = await buildTag({ tag: 'icon', attr, prepend: '<th>', append: '</th>' })
        }
        items.unshift(item)
      }
      const header = await buildTag({ tag: 'tr', html: items.join('\n') })
      html.push(await buildTag({ tag: 'thead', attr: group.head, html: header }))
      // body
      items = []
      for (const idx in data) {
        const d = data[idx]
        const lines = []
        if (selection) {
          const tag = selection === 'single' ? 'formRadio' : 'formCheck'
          const attr = { 'x-model': 'selected', name: '_rt', value: d.id, noLabel: true, noWrapper: true }
          const type = find(schema.properties, { name: 'id' }).type
          const prepend = `<td data-value="${d.id}" data-key="id" data-type="${type}">`
          lines.push(await buildTag({ tag, attr, prepend, append: '</td>' }))
        }
        for (const f of schema.view.fields) {
          if (!fields.includes(f)) continue
          const prop = find(schema.properties, { name: f })
          if (!prop) continue
          let dataValue = d[f]
          if (['datetime'].includes(prop.type) && dataValue instanceof Date && !isNaN(dataValue)) dataValue = escape(dataValue.toISOString())
          else if (['string', 'text', 'array', 'object'].includes(prop.type)) dataValue = escape(dataValue)
          let value = this.getRefValue({ field: f, data: d, refName: this.getRefName(f) }) ?? get(d, `_fmt.${f}`, d[f])
          const attr = { dataValue, dataKey: prop.name, dataType: prop.type }
          if (!disableds.includes('get')) attr.style = { cursor: 'pointer' }
          const formatCell = get(schema, `view.formatCell.${f}`)
          if (formatCell) merge(attr, await formatCell.call(this, value, d, { params: this.params, req }))
          const noWrap = this.isNoWrap(f, schema, group.body.nowrap) ? 'nowrap' : ''
          if (this.isRightAligned(f, schema)) attr.text = `align:end ${noWrap}`
          else attr.text = `${noWrap}`
          if (d._immutable && d._immutable.length > 0) {
            if (d._immutable[0] === '*' || d._immutable.includes(f)) attr.text += ' color:body-tertiary'
          }
          if (f === 'id') attr.text += ' color:body-tertiary'
          const format = get(schema, `view.format.${f}`)
          if (format) {
            const formatted = await format.call(this, value, d, { params: this.params, req })
            if (isPlainObject(formatted) && formatted.href) {
              const text = await buildTag({ tag: 'div', attr: {}, html: formatted.value })
              const link = await buildTag({ tag: 'a', attr: { text: 'color:white', icon: 'link', href: formatted.href, noIconLink: true } })
              const badge = await buildTag({ tag: 'badge', attr: { text: 'background:primary', rounded: 'type:pill' }, html: link, prepend: '<div class="ms-2">', append: '</div>' })
              const line = await buildTag({ tag: 'div', attr: { flex: 'justify-content:between align-items:end' }, html: `${text}\n${badge}` })
              lines.push(await buildTag({ tag: 'td', attr, html: line }))
              continue
            }
            value = formatted
          }
          if (['object', 'array'].includes(prop.type) && !isHtmlLink(value)) value = getTruncated(value, 20) // TODO: should be handle by css instead
          if (!get(schema, 'view.noEscape', []).includes(f) && !isHtmlLink(value)) value = escape(value)
          const line = await buildTag({ tag: 'td', attr, html: value })
          lines.push(line)
        }
        const attr = { id: `rec-${d.id}` }
        if (!disableds.includes('update') || !disableds.includes('remove') || !disableds.includes('get')) attr['@click'] = `toggle('${d.id}')`
        if (!disableds.includes('get')) attr['@dblclick'] = `goDetails('${d.id}')`
        items.push(await buildTag({ tag: 'tr', attr, html: lines.join('\n') }))
      }
      html.push(await buildTag({ tag: 'tbody', attr: group.body, html: items.join('\n') }))
      this.params.attr = omit(this.params.attr, ['sortUpIcon', 'sortDownIcon', 'noSort', 'selection', 'headerNowrap'])
      let xData = `
        goDetails (id) {
          let url = '${this.params.attr.detailsHref ?? buildUrl({ base: 'details', prettyUrl })}'
          if (url === '#') return
          if (url.indexOf('/:id') > -1) url = url.replace('/:id', '/' + id)
          else url += '&id=' + id
          window.location.href = url
        }
      `
      const xDataView = get(schema, 'view.x.data', '')
      if (!isEmpty(xDataView)) xData += `, ${xDataView}`
      let xInit = ''
      const xInitView = get(schema, 'view.x.init', '')
      if (!isEmpty(xInitView)) xInit += `${xInitView}\n`

      if (selection === 'multi') {
        xData = `{
          ${xData},
          toggleAll: false,
          selected: [],
          toggle (id) {
            if (this.selected.includes(id)) {
              const idx = this.selected.indexOf(id)
              this.selected.splice(idx, 1)
            } else this.selected.push(id)
          }
        }`
        xInit = `
          ${xInit}
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
        xData = `{
          ${xData},
          selected: '',
          toggle (id) {
            this.selected = id
          }
        }`
        xInit = `
          ${xInit}
          $watch('selected', val => $dispatch('on-selection', _.isEmpty(val) ? [] : [val]))
        `
      } else {
        xData = `{
          ${xData}
        }`
      }
      this.params.attr['x-data'] = xData
      this.params.attr['x-init'] = xInit
      this.params.attr.responsive = true
      this.params.html = await buildTag({ tag: 'table', attr: this.params.attr, html: html.join('\n') })
    }
  }
}

export default table
