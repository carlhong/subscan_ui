<template>
  <div class="chart-wrapper">
    <div class="header-content space-between">
      <div class="header-left align-items-center">
        <icon-svg class="icon" icon-class="chart" />
        <span class="title">{{$t('transfer_history')}}</span>
      </div>
    </div>
    <div class="chart-content subscan-card" ref="chart"></div>
  </div>
</template>

<script>
let myChart;
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      dailyChart: state => state.polka.dailyChart,
      sourceSelected: state => state.global.sourceSelected
    })
  },
  data() {
    return {
      colorMap: {
        darwinia: "#5930DD",
        kusama: "#E90979",
        polkadot: "#E90979",
        edgeware: "#000000"
      }
    }
  },
  created() {
    GLOBAL.vbus.$on("CHANGE_SOURCE", source => {
      myChart.setOption({
        series: {
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: this.getColorStop(source)
            }
          },
          lineStyle: {
            width: 1,
            color: this.colorMap(source || 'darwinia')
          }
        }
      });
    });
  },
  beforeDestroy() {
    myChart = null;
    GLOBAL.vbus.$off("CHANGE_SOURCE");
  },
  watch: {
    dailyChart(nevV, oldV) {
      if (oldV.length === 0 || !myChart) {
        this.initChart();
      } else {
        const xAxisData = [];
        const data = [];
        this.dailyChart.forEach(item => {
          xAxisData.push(item.time);
          data.push(item.transfer_count);
        });
        myChart.setOption({
          xAxis: {
            data: xAxisData
          },
          series: {
            data
          }
        });
      }
    }
  },
  methods: {
    initChart() {
      const xAxisData = [];
      const data = [];
      this.dailyChart.forEach(item => {
        xAxisData.push(item.time);
        data.push(item.transfer_count);
      });
      myChart = window.echarts.init(this.$refs.chart);
      myChart.setOption({
        grid: {
          top: "5%",
          left: "0%",
          right: "0%",
          bottom: "0%",
          containLabel: false
        },
        tooltip: {
          trigger: "axis",
          formatter: `{b}<br />${this.$t('transfer_count')}：{c}`
        },
        xAxis: [
          {
            type: "category",
            show: false,
            boundaryGap: false,
            splitLine: {
              show: false
            },
            data: xAxisData
          }
        ],
        yAxis: [
          {
            type: "value",
            show: true,
            splitLine: {
              show: true,
              lineStyle: {
                color: '#F4F4F4'
              }
            },
            axisLine: {
              lineStyle: {
                color: '#F4F4F4'
              }
            }
          }
        ],
        series: [
          {
            type: "line",
            showSymbol: false,
            hoverAnimation: false,
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: this.getColorStop(this.sourceSelected)
              }
            },
            lineStyle: {
              width: 1,
              color: this.colorMap[this.sourceSelected || "darwinia"]
            },
            // itemStyle: {
            //   normal: {
            //     color: "rgba(88,160,253,1)"
            //   }
            // },
            data
          }
        ]
      });
    },
    getColorStop(source) {
      let sourceColor = this.colorMap[source || "darwinia"];
      return [
        {
          offset: 0,
          color: sourceColor + '99' // 透明度60%
        },
        {
          offset: 0.6,
          color: sourceColor + '4D' // 透明度30%
        },
        {
          offset: 0.8,
          color: sourceColor + '33' // 透明度20%
        },
        {
          offset: 1,
          color: sourceColor + '1A' // 透明度10%
        }
      ]
    }
  }
};
</script>

<style lang="scss" scoped>
.chart-wrapper {
  .header-content {
    display: none;
  }
  .chart-content {
    height: 100%;
  }
  @media screen and (max-width:$screen-xs) {
    .header-content {
      display: block;
      margin-bottom: 10px;
      .header-left {
        height: 30px;
        .icon {
          font-size: 30px;
        }
        .title {
          padding-left: 8px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(48, 43, 60, 1);
        }
      }
    }
    .chart-content {
      height: 156px;
    }
  }
}
</style>
