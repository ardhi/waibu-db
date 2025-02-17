import wdbBase from '../wdb-base.js'

async function echarts () {
  const WdbBase = await wdbBase.call(this)

  return class WdbEcharts extends WdbBase {
    static scripts = [...super.scripts,
      '^waibuExtra.virtual:/echarts/echarts.min.js'
    ]

    constructor (options) {
      super(options)
      this.defOption = {
        grid: {
          top: 8,
          bottom: 20,
          left: 25,
          right: 0
        }
      }
    }

    async build () {
      const { defaultsDeep, generateId } = this.plugin.app.bajo
      const { base64JsonDecode, jsonStringify } = this.plugin.app.waibuMpa
      const { cloneDeep } = this.plugin.app.bajo.lib._
      this.params.attr.id = generateId('alpha')
      this.params.attr['x-data'] = `chart${this.params.attr.id}`
      this.params.attr['@resize.window.debounce.500ms'] = `
        if (chart) {
          chart.resize()
        }
      `
      let option = cloneDeep(this.defOption)
      if (this.params.attr.option === true) this.params.attr.option = 'e30='
      if (this.params.attr.option) option = defaultsDeep(base64JsonDecode(this.params.attr.option), this.defOption)
      this.params.attr['x-init'] = `
        $watch('option', val => {
          if (chart) chart.setOption(val)
        })
      `
      this.params.append = `
        <script>
          document.addEventListener('alpine:init', () => {
            Alpine.data('chart${this.params.attr.id}', () => {
              let chart
              return {
                init () {
                  const el = document.getElementById('${this.params.attr.id}')
                  chart = echarts.init(el, null, { renderer: 'canvas' })
                  chart.setOption(this.option)
                },
                get chart () {
                  return chart
                },
                option: ${jsonStringify(option, true)}
              }
            })
          })
        </script>
      `
    }
  }
}

export default echarts
