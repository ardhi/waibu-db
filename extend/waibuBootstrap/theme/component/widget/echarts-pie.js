import echartsBase from './echarts.js'

async function echartsPie () {
  const WdbEcharts = await echartsBase.call(this)

  return class WdbEchartsPie extends WdbEcharts {
    build = async () => {
      const { jsonStringify } = this.app.waibuMpa
      const { merge } = this.app.lib._
      merge(this.setting, {
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          data: []
        }]
      })
      const onLoad = []
      const remote = this.params.attr.remote ? this._parseBase64Attr(this.params.attr.remote) : {}
      const data = [
        `async load (params = {}) {
          this.chart.showLoading('default', { text: '' })
          const remote = params.remote ?? ${jsonStringify(remote, true)}
          const agg = remote.filter.aggregate ?? 'count'
          const keyName = remote.key.name ?? remote.filter.group
          const keyValue = remote.key.value ?? keyName + _.upperFirst(agg)
          const recs = await wmpa.fetchApi(remote.url, { fetching: false }, remote.filter)
          const data = recs.map(r => ({ name: r[keyName], value: r[keyValue] }))
          this.chart.hideLoading()
          this.option = params.option ?? { series: [{ type: 'pie', data }]}
        }`
      ]
      if (!this.params.attr.noAutoLoad) {
        onLoad.push(`
          this.load()
        `)
      }
      this._build({ onLoad, data })
    }
  }
}

export default echartsPie
