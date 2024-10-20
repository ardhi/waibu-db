async function query (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { find, get, without, isEmpty, filter } = this.plugin.app.bajo.lib._
  const qsKey = this.plugin.app.waibu.config.qsKey
  const schema = get(this, 'locals.schema', {})
  if (schema.view.disabled.includes('find')) {
    params.html = ''
    return
  }
  let fields = without(get(this, `locals._meta.query.${qsKey.fields}`, '').split(','), '')
  if (isEmpty(fields)) fields = schema.view.fields
  fields = filter(fields, f => schema.sortables.includes(f))
  const id = generateId('alpha')
  const columns = []
  const models = []
  const selects = {
    eq: this.req.t('op.equals'),
    neq: this.req.t('op.notEquals'),
    gt: this.req.t('op.greaterThan'),
    gte: this.req.t('op.greaterThanOrEquals'),
    lt: this.req.t('op.lessThan'),
    lte: this.req.t('op.lessThanOrEquals'),
    in: this.req.t('op.in'),
    nin: this.req.t('op.notIn'),
    contains: this.req.t('op.contains'),
    ncontains: this.req.t('op.notContains'),
    startsWith: this.req.t('op.startsWith'),
    nstartsWith: this.req.t('op.notStartsWith'),
    endsWith: this.req.t('op.endsWith'),
    nendsWith: this.req.t('op.notEndsWith')
  }
  for (const f of schema.view.fields) {
    if (!fields.includes(f)) continue
    const prop = find(schema.properties, { name: f })
    const ops = []
    if (['float', 'double', 'integer', 'smallint'].includes(prop.type)) ops.push('eq', 'neq', 'gt', 'gte', 'lt', 'lte')
    else if (['datetime', 'date', 'time'].includes(prop.type)) ops.push('eq', 'neq', 'gt', 'gte', 'lt', 'lte')
    else if (['boolean'].includes(prop.type)) ops.push('eq', 'neq')
    else ops.push(...Object.keys(selects))
    if (ops.length === 0) continue
    const sels = ops.map(o => `<c:option value="${o}">${selects[o]}</c:option>`)
    models.push(`${f}Op: 'eq'`, `${f}Val: ''`)
    columns.push(`
      <c:grid-col col="4-md" flex="align-items:center">
        <c:form-check x-model="selected" t:label="field.${f}" value="${f}" />
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
  params.noTag = true
  params.html = await this.buildSentence(`
    <c:form-input type="search" t:placeholder="Query" id="${id}" x-data="{ query: '' }" x-init="
      const url = new URL(window.location.href)
      query = url.searchParams.get('${qsKey.query}') ?? ''
    " x-model="query" @on-query.window="query = $event.detail ?? ''" @keyup.enter="$dispatch('on-submit')">
      <c:form-input-addon>
        <c:modal launch-icon="${params.attr.icon ?? 'dotsThree'}" launch-on-end t:title="Query Builder" x-ref="query" x-data="{
          fields: ${JSON.stringify(fields).replaceAll('"', "'")},
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
              else if (key === 'nin') item = this.opsIn(val, true)
              else if (key === 'contains') item = this.opsExt(val)
              else if (key === 'ncontains') item = this.opsExt(val, true)
              else if (key === 'startsWith') item = this.opsExt(val, false, '^')
              else if (key === 'nstartsWith') item = this.opsExt(val, true, '^')
              else if (key === 'endsWith') item = this.opsExt(val, false, '$$')
              else if (key === 'nendsWith') item = this.opsExt(val, true, '$$')
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
            const instance = wbs.getInstance('Modal', $refs.query)
            instance.hide()
          }
        }" x-init="
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
            <c:btn color="secondary" t:content="Close" dismiss />
            <c:btn color="primary" t:content="Apply" margin="start-2" @click="submit()" />
            <c:btn color="primary" t:content="Submit Query" margin="start-2" @click="submit(true)" />
          </c:div>
        </c:modal>
      </c:form-input-addon>
      <c:form-input-addon>
        <c:btn t:content="Submit" x-data="{
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

export default query
