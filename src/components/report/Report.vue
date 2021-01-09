<template>
  <div>
    <!-- 面包屑导航区 -->
    <!--  -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <div id="myCahrts" class="echarts"></div>
    </el-card>
  </div>
</template>
<script>
import echarts from "echarts";
import _ from "lodash";
export default {
  data() {
    return {
      option:{
            title: {
                text: 'ECharts 入门示例'
            },
            tooltip: {},
            legend: {
                data:['销量']
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        },
    };
  },
  created() {
    
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      var myChart = echarts.init(document.getElementById("myCahrts"));
      const { data: res } = await this.axios.get("reports/type/1");
      if (res.meta.status !== 200) {
        return this.$message("获取折线图数据失败");
      }
      const result = _.merge(res.data)
      myChart.setOption(result);
    },
  }
};
</script>
<style scoped lang='less'>
.echarts {
  width: 700px;
  height: 400px;
}
</style>