import echartsBase from './echarts.js'

async function echartsBar () {
  const WdbEcharts = await echartsBase.call(this)

  return class WdbEchartsBar extends WdbEcharts {
    build = async () => {
      const { jsonStringify } = this.plugin.app.waibuMpa
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
      if (this.params.attr.remote) {
        const remote = this._parseBase64Attr(this.params.attr.remote)
        onLoad.push(`
          this.chart.showLoading('default', { text: '' })
          const remote = ${jsonStringify(remote, true)}
          const agg = remote.filter.aggregate ?? 'count'
          const recs = await wmpa.fetchApi(remote.url, { fetching: false }, remote.filter)
          this.chart.hideLoading()
          this.option = {
            xAxis: { data: _.map(recs, remote.key.name) },
            series: [{ type: 'bar', data: _.map(recs, remote.key.value ?? agg ) }]
          }
        `)
      }
      this._build({ onLoad })
    }
  }
}

export default echartsBar
