const defOption = {
  grid: {
    top: 8,
    bottom: 20,
    left: 22,
    right: 0
  },
  xAxis: {
    type: 'category'
  },
  yAxis: {
    type: 'value'
  }
}

const chart = {
  scripts: [
    '^waibuDb.virtual:/echarts/echarts.min.js'
  ],
  handler: async function (params = {}) {
    const { defaultsDeep } = this.plugin.app.bajo
    const { base64JsonDecode } = this.plugin.app.waibuMpa
    const { cloneDeep } = this.plugin.app.bajo.lib._
    this._normalizeAttr(params, { tag: 'div' })
    params.attr.dim = params.attr.dim ?? 'width:100 height:100'
    params.attr['x-data'] = 'chart'
    params.attr['x-ref'] = 'chartc'
    params.attr['@resize.window.debounce.500ms'] = `
      if (chart) {
        chart.resize()
      }
    `
    let option = cloneDeep(defOption)
    if (params.attr.option) option = defaultsDeep(base64JsonDecode(params.attr.option), defOption)
    params.attr['x-init'] = `
      $watch('option', val => {
        if (chart) chart.setOption(val)
      })
    `
    params.append = `
      <script>
        document.addEventListener('alpine:init', () => {
          Alpine.data('chart', () => {
            let chart
            return {
              init () {
                chart = echarts.init(this.$refs.chartc, null, { renderer: 'canvas' })
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
