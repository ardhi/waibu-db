import echartsBase from './echarts.js'

async function echartsBar () {
  const WdbEcharts = await echartsBase.call(this)

  return class WdbEchartsBar extends WdbEcharts {
    build = async () => {
      const { jsonStringify } = this.app.waibuMpa
      const { merge } = this.app.lib._
      merge(this.setting, {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          containLabel: true,
          top: 8,
          bottom: 0,
          left: 0,
          right: 0
        },
        xAxis: {
          type: 'category',
          data: [],
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [],
          type: 'bar'
        }]
      })
      const onLoad = []
      const remote = this.params.attr.remote ? this._parseBase64Attr(this.params.attr.remote) : {}
      const data = [
        `async load (params) {
          this.chart.showLoading('default', { text: '' })
          const remote = params ?? ${jsonStringify(remote, true)}
          const agg = remote.filter.aggregate ?? 'count'
          const recs = await wmpa.fetchApi(remote.url, { fetching: false }, remote.filter)
          this.chart.hideLoading()
          this.option = {
            xAxis: { data: _.map(recs, remote.key.name) },
            series: [{ type: 'bar', data: _.map(recs, remote.key.value ?? agg ) }]
          }
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

export default echartsBar
