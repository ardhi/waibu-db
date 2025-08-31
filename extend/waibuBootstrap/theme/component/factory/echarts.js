import wdbBase from '../wdb-base.js'

async function echarts () {
  const WdbBase = await wdbBase.call(this)

  return class WdbEcharts extends WdbBase {
    static scripts = [...super.scripts,
      '^waibuExtra.virtual:/echarts/echarts.min.js'
    ]

    constructor (options) {
      super(options)
      const { generateId } = this.plugin.app.bajo
      this.defSetting = {
        grid: {
          top: 8,
          bottom: 20,
          left: 25,
          right: 0
        }
      }
      this.params.tag = 'div'
      this.params.attr.id = this.params.attr.id ?? generateId('alpha')
      this.params.attr['x-data'] = `chart${this.params.attr.id}`
      this.params.attr['@resize.window.debounce.500ms'] = 'resize()'
      this.params.attr['@load.window'] = 'await windowLoad()'
    }

    _build = ({ setting = {}, onLoad = [] } = {}) => {
      const { jsonStringify } = this.plugin.app.waibuMpa
      const { merge, isArray } = this.app.lib._
      if (!isArray(onLoad)) onLoad = [onLoad]
      const option = merge({}, this.defSetting, this.setting, setting)
      this.component.addScriptBlock('alpineInit', `
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
            resize () {
              if (chart) {
                chart.resize()
              }
            },
            async windowLoad () {
              ${onLoad.join('\n')}
            },
            option: ${jsonStringify(option, true)}
          }
        })
      `)
    }

    build = async () => {
      this._build()
    }
  }
}

export default echarts
