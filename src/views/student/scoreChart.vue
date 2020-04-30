<template>
  <div v-loading="listLoading" class="chart-container">
    <div class="chart-select">
      <el-select v-model="paperId" class="filter-item">
        <el-option v-for="item in paperSimpleList" :key="item.paperId" :label="item.paperTitle" :value="item.paperId"/>
      </el-select>
    </div>
    <chart height="98%" width="100%"/>
  </div>
</template>

<script>
import Chart from '@/components/Charts/mixChart'
import { getPaperList } from '@/api/student'
import { setStore } from '@/utils/mUtils'
export default {
  name: 'ScoreChart',
  components: { Chart },
  data() {
    return {
      listLoading: true,
      paperId: this.$store.state.teacher.paperId,
      paperName: this.$store.state.teacher.paperName,
      paperSimpleList: []
    }
  },
  watch: {
    paperId(newValue) {
      if (newValue) {
        this.$store.dispatch('recordPaperId', newValue)
        setStore('paperId', newValue)
      }
    }
  },
  created() {
    this.getList()
  },
  // beforeDestroy() {
  //   //this.$store.dispatch('resetPaperId')
  //  setStore('paperId', this.paperSimpleList[0].paperTitle)
  // },
  methods: {
    async getList() {
      this.listLoading = true
      const result = await getPaperList()
      if (result.code === 200) {
        this.paperSimpleList = result.data
        this.paperId = this.paperSimpleList[0].paperId
      }
      // 延迟0秒等待请求数据
      setTimeout(() => {
        this.listLoading = false
      }, 0)
    }
  }
}
</script>

<style type="text/scss" rel="stylesheet/scss" lang="scss" scoped>
  .chart-container {
    position: relative;
    width: 100%;
    height: calc(100vh - 84px);
    .chart-select {
      display: flex;
      justify-content: center;
      padding: 10px
    }
  }
</style>

