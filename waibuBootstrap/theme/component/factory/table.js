import wdbBase from '../wdb-base.js'

async function table () {
  const WdbBase = await wdbBase.call(this)

  return class WdbTable extends WdbBase {
    isRightAligned (type) {
      return ['smallint', 'integer', 'float', 'double'].includes(type)
    }

    async build () {
      const { req } = this.component
      const { escape } = this.plugin.app.waibu
      const { attrToArray, groupAttrs } = this.plugin.app.waibuMpa
      const { get, omit, set, find, isEmpty, without } = this.plugin.app.bajo.lib._
      const group = groupAttrs(this.params.attr, ['body', 'head', 'foot'])
      this.params.attr = group._

      const data = get(this, 'component.locals.list.data', [])
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      const qsKey = this.plugin.app.waibu.config.qsKey
      let fields = without(get(this, `component.locals._meta.query.${qsKey.fields}`, '').split(','), '')
      if (isEmpty(fields)) fields = schema.view.fields
      const sort = this.params.attr.sort ? attrToArray(this.params.attr.sort) : get(this, `component.locals._meta.query.${qsKey.sort}`, '')

      let [sortCol, sortDir] = sort.split(':')
      if (!['-1', '1'].includes(sortDir)) sortDir = '1'

      let selection
      const canDelete = !schema.view.disabled.includes('remove')
      const canEdit = !schema.view.disabled.includes('update')
      if (canEdit) selection = 'single'
      if (canDelete) selection = 'multi'
      if (selection) this.params.attr.hover = true

      this.params.noTag = true
      const html = []
      let items = []
      // head
      for (const f of schema.view.fields) {
        if (!fields.includes(f)) continue
        const prop = find(schema.properties, { name: f })
        let head = req.t(`field.${f}`)
        if (!this.params.attr.noSort && (schema.sortables ?? []).includes(f)) {
          let sortItem = `${f}:-1`
          let icon = this.params.attr.sortUpIcon ?? 'caretUp'
          if (f === sortCol) {
            sortItem = `${f}:${sortDir === '1' ? '-1' : '1'}`
            icon = sortDir === '1' ? (this.params.attr.sortUpIcon ?? 'caretUp') : (this.params.attr.sortDownIcon ?? 'caretDown')
          }
          const item = set({ page: 1 }, qsKey.sort, sortItem)
          const href = this.component.buildUrl({ params: item })
          const attr = this.isRightAligned(prop.type) ? { text: 'align:end' } : {}
          const content = [
            await this.component.buildTag({ tag: 'div', attr, html: req.t(`field.${f}`) }),
            await this.component.buildTag({ tag: 'a', attr: { icon, href }, prepend: '<div class="ms-1">', append: '</div>' })
          ]
          head = await this.component.buildTag({ tag: 'div', attr: { flex: 'justify-content:between align-items:end' }, html: content.join('\n') })
        }
        let text = this.params.attr.headerNowrap ? '' : 'nowrap'
        if (this.isRightAligned(prop.type)) text += ' align:end'
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
          lines.push(await this.component.buildTag({ tag, attr, prepend: '<td>', append: '</td>' }))
        }
        for (const f of schema.view.fields) {
          const prop = find(schema.properties, { name: f })
          if (!fields.includes(f)) continue
          const opts = {}
          if (f === 'lng') opts.longitude = true
          else if (f === 'lat') opts.latitude = true
          let value = req.format(d[f], prop.type, opts)
          if (prop.type === 'boolean') {
            value = (await this.component.buildTag({ tag: 'icon', attr: { name: `circle${d[f] ? 'Check' : ''}` } })) +
              ' ' + (req.t(d[f] ? 'Yes' : 'No'))
          } else value = escape(value)
          let dataValue = d[f] ?? ''
          if (['string', 'text'].includes(prop.type)) dataValue = escape(dataValue)
          if (['array', 'object'].includes(prop.type)) dataValue = escape(JSON.stringify(d[f]))
          const attr = { dataValue }
          if (!['object', 'array'].includes(prop.type)) {
            if (this.isRightAligned(prop.type)) attr.text = 'align:end nowrap'
            else attr.text = 'nowrap'
          }
          const line = await this.component.buildTag({ tag: 'td', attr, html: value })
          lines.push(line)
        }
        const attr = {}
        if (!schema.view.disabled.includes('update') || !schema.view.disabled.includes('remove')) attr['@click'] = `toggle('${d.id}')`
        if (!schema.view.disabled.includes('get')) attr['@dblclick'] = `goDetails('${d.id}')`
        items.push(await this.component.buildTag({ tag: 'tr', attr, html: lines.join('\n') }))
      }
      html.push(await this.component.buildTag({ tag: 'tbody', attr: group.body, html: items.join('\n') }))
      this.params.attr = omit(this.params.attr, ['sortUpIcon', 'sortDownIcon', 'noSort', 'selection', 'headerNowrap'])
      const goDetails = `
        goDetails (id) {
          window.location.href = '${this.component.buildUrl({ base: 'details' })}&id=' + id
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
