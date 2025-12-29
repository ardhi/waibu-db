import wdbBase from '../wdb-base.js'

async function query () {
  const WdbBase = await wdbBase.call(this)

  return class WdbQuery extends WdbBase {
    build = async () => {
      const { generateId } = this.app.lib.aneka
      const { jsonStringify } = this.app.waibuMpa
      const { find, get, without, isEmpty, filter, upperFirst } = this.app.lib._
      const qsKey = this.app.waibu.config.qsKey
      const schema = get(this, 'component.locals.schema', {})
      if (schema.view.disabled.includes('find')) {
        this.params.html = ''
        return
      }
      let fields = without(get(this, `component.locals._meta.query.${qsKey.fields}`, '').split(','), '')
      if (isEmpty(fields)) fields = schema.view.fields
      fields = filter(fields, f => schema.sortables.includes(f))
      const id = generateId('alpha')
      const columns = []
      const models = []
      for (const f of schema.view.fields) {
        if (!fields.includes(f)) continue
        const prop = find(schema.properties, { name: f })
        const ops = []
        if (['float', 'double', 'integer', 'smallint'].includes(prop.type)) ops.push('eq', 'neq', 'gt', 'gte', 'lt', 'lte')
        else if (['datetime', 'date', 'time'].includes(prop.type)) ops.push('eq', 'neq', 'gt', 'gte', 'lt', 'lte')
        else if (['boolean'].includes(prop.type)) ops.push('eq', 'neq')
        else ops.push('eq', 'neq', 'in', 'contains', 'starts', 'ends', '!in', '!contains', '!starts', '!ends')
        if (ops.length === 0) continue
        const sels = ops.map(o => `<c:option>${o}</c:option>`)
        models.push(`${f}Op: 'eq'`, `${f}Val: ''`)
        const label = this.component.req.t(get(schema, `view.label.${f}`, `field.${f}`))
        columns.push(`
          <c:grid-col col="4-md" flex="align-items:center">
            <c:form-check x-model="selected" t:label="${label}" value="${f}" />
          </c:grid-col>
          <c:grid-col col="3-md">
            <c:form-select x-model="${f}Op">
              ${sels.join('\n')}
            </c:form-select>
          </c:grid-col>
          <c:grid-col col="5-md">
            <c:form-input x-model="${f}Val" />
          </c:grid-col>
        `)
      }
      this.params.noTag = true
      const container = this.params.attr.modal ? 'modal' : 'drawer'
      this.params.html = await this.component.buildSentence(`
        <c:form-input type="search" t:placeholder="query" id="${id}" x-data="{ query: '' }" x-init="
          const url = new URL(window.location.href)
          query = url.searchParams.get('${qsKey.query}') ?? ''
        " x-model="query" @on-query.window="query = $event.detail ?? ''" @keyup.enter="$dispatch('on-submit')">
          <c:form-input-addon>
            <c:${container} trigger-icon="${this.params.attr.icon ?? 'dotsThree'}" trigger-on-end t:title="queryBuilder" x-ref="query" x-data="{
              fields: ${jsonStringify(fields, true)},
              builder: '',
              selected: [],
              ${models.join(',\n')},
              ops: { eq: ':', neq: ':-', gt: ':>', gte: ':>=', lt: ':<', lte: ':<=' },
              opsIn (v, neg) { return ':' + (neg ? '-' : '') + '[' + this.expandArray(v) + ']' },
              opsExt (v, neg, ext) {
                let prefix = (neg ? '-' : '') + '~'
                if (ext) prefix += ext
                return ':' + prefix + '\\'' + v + '\\''
              },
              initBuilder () {
                this.builder = document.getElementById('${id}').value
                if (!this.builder.includes(':')) this.builder = ''
                if (_.isEmpty(this.builder)) return
                const tokens = _.merge({}, this.ops, {
                  in: ':[',
                  contains: ':~',
                  starts: ':~^',
                  ends: ':~$$',
                  '!in': ':-[',
                  '!contains': ':-~',
                  '!starts': ':-~^',
                  '!ends': ':-~$$'
                })
                for (const part of this.builder.split('+')) {
                  let [f, opv] = part.split(':')
                  opv = ':' + opv
                  this.selected.push(f)
                  let op
                  let val
                  _.each(tokens, (v, k) => {
                    if (opv.slice(0, v.length) === v) {
                      op = k
                      val = opv.slice(v.length).replaceAll('[', '').replaceAll(']', '').replaceAll('\\'', '')
                    }
                  })
                  if (_.isEmpty(op)) continue
                  this[f + 'Op'] = op
                  this[f + 'Val'] = val
                }
              },
              expandArray (val = '') {
                return _.map(val.split(','), item => {
                  item = _.trim(item)
                  if (Number(item)) return item
                  return '\\'' + item + '\\''
                })
              },
              rebuild () {
                const items = []
                for (const sel of this.selected) {
                  const key = this[sel + 'Op']
                  let val = this[sel + 'Val']
                  if (_.isEmpty(val)) continue
                  let item
                  if (key === 'in') item = this.opsIn(val)
                  else if (key === '!in') item = this.opsIn(val, true)
                  else if (key === 'contains') item = this.opsExt(val)
                  else if (key === '!contains') item = this.opsExt(val, true)
                  else if (key === 'starts') item = this.opsExt(val, false, '^')
                  else if (key === '!starts') item = this.opsExt(val, true, '^')
                  else if (key === 'ends') item = this.opsExt(val, false, '$$')
                  else if (key === '!ends') item = this.opsExt(val, true, '$$')
                  else if (val.includes(' ')) item = this.ops[key] + '\\'' + val + '\\''
                  else item = this.ops[key] + val
                  items.push(sel + item)
                }
                this.builder = items.join('+')
              },
              submit (run) {
                if (run) {
                  const url = new URL(window.location.href)
                  const params = new URLSearchParams(url.search)
                  params.set('${qsKey.page}', 1)
                  params.set('${qsKey.query}', this.builder ?? '')
                  window.location.href = '?' + params.toString()
                } else $dispatch('on-query', this.builder)
                const instance = wbs.getInstance('${upperFirst(container)}', $refs.query)
                instance.hide()
              }
            }" x-init="
              initBuilder()
              const ops = _.map(fields, f => (f + 'Op'))
              const vals = _.map(fields, f => (f + 'Val'))
              const watcher = ['selected', ...ops, ...vals].join(',')
              $watch(watcher, v => rebuild())
            ">
              <c:grid-row gutter="2">
                <c:grid-col col="12">
                  <c:form-textarea x-model="builder" readonly rows="4"/>
                </c:grid-col>
                ${columns.join('\n')}
              </c:grid-row>
              <c:div flex="justify-content:end" margin="top-3">
                <c:btn color="secondary" t:content="close" dismiss="${container}" />
                <c:btn color="primary" t:content="apply" margin="start-2" @click="submit()" />
                <c:btn color="primary" t:content="submitQuery" margin="start-2" @click="submit(true)" />
              </c:div>
            </c:${container}>
          </c:form-input-addon>
          <c:form-input-addon>
            <c:btn t:content="submit" x-data="{
              submit () {
                const val = document.getElementById('${id}').value ?? ''
                const url = new URL(window.location.href)
                const params = new URLSearchParams(url.search)
                params.set('${qsKey.page}', 1)
                params.set('${qsKey.query}', val)
                window.location.href = '?' + params.toString()
              }
            }" @click="submit" @on-submit.window="submit()" />
          </c:form-input-addon>
        </c:form-input>
      `)
    }
  }
}

export default query
