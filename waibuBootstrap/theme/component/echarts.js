const defOption = {
  grid: {
    top: 8,
    bottom: 20,
    left: 25,
    right: 0
  }
}

const chart = {
  scripts: [
    '^waibuDb.virtual:/echarts/echarts.min.js'
  ],
  handler: async function (params = {}) {
    const { defaultsDeep, generateId } = this.plugin.app.bajo
    const { base64JsonDecode } = this.plugin.app.waibuMpa
    const { cloneDeep } = this.plugin.app.bajo.lib._
    this._normalizeAttr(params, { tag: 'div' })
    params.attr.dim = params.attr.dim ?? 'width:100 height:100'
    params.attr.id = generateId('alpha')
    params.attr['x-data'] = `chart${params.attr.id}`
    params.attr['@resize.window.debounce.500ms'] = `
      if (chart) {
        chart.resize()
      }
    `
    let option = cloneDeep(defOption)
    if (params.attr.option === true) params.attr.option = 'e30='
    if (params.attr.option) option = defaultsDeep(base64JsonDecode(params.attr.option), defOption)
    params.attr['x-init'] = `
      $watch('option', val => {
        if (chart) chart.setOption(val)
      })
    `
    params.append = `
      <script>
        document.addEventListener('alpine:init', () => {
          Alpine.data('chart${params.attr.id}', () => {
            let chart
            return {
              init () {
                const el = document.getElementById('${params.attr.id}')
                chart = echarts.init(el, null, { renderer: 'canvas' })
                chart.setOption(this.option)
              },
              get chart () {
                return chart
              },
              option: ${JSON.stringify(option, null, 2)}
            }
          })
        })
      </script>
    `
  }
}

export default chart
