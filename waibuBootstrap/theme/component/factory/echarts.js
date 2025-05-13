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
      this.params.tag = 'div'
    }

    build = async () => {
      const { generateId } = this.plugin.app.bajo
      const { base64JsonDecode, jsonStringify } = this.plugin.app.waibuMpa
      const { merge, cloneDeep, omit } = this.plugin.app.bajo.lib._
      this.params.attr.id = generateId('alpha')
      this.params.attr['x-data'] = `chart${this.params.attr.id}`
      this.params.attr['x-bind'] = 'resize'
      let option = cloneDeep(this.defOption)
      if (this.params.attr.option === true) this.params.attr.option = 'e30='
      if (this.params.attr.option) option = merge(option, base64JsonDecode(this.params.attr.option))
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
                  this.$watch('option', val => {
                    chart.setOption(val)
                  })
                },
                get chart () {
                  return chart
                },
                resize: {
                  ['@resize.window.debounce.500ms']() {
                    if (chart) {
                      chart.resize()
                    }
                  }
                },
                option: ${jsonStringify(option, true)}
              }
            })
          })
        </script>
      `
      this.params.attr = omit(this.params.attr, ['option'])
    }
  }
}

export default echarts
