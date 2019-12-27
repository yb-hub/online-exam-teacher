<template>
  <div class="app-container">
    <div style="display: flex;justify-content: center;margin-bottom: 20px">
      <el-button v-waves :loading="downloadLoading" style="background-color: #4ab7bd;border-color: #4ab7bd" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        请先下载单选题上传模板
      </el-button>
    </div>
    <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
    <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
      <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
    </el-table>
  </div>
</template>

<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import waves from '@/directive/waves' // Waves directive
import { insertQuestionList } from '@/api/question'
export default {
  name: 'QuestionUpload',
  components: { UploadExcelComponent },
  directives: { waves },
  data() {
    return {
      downloadLoading: false,
      tableData: [],
      tableHeader: []
    }
  },
  methods: {
    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = [
            '题目标题',
            '题目类型(1为单选题，2为多选题，3为判断题)',
            '选项（选择题）',
            '正确答案（选择题）',
            '正确答案（判断题（1为T,2为F）',
            '题目分值',
            '是否组卷',
            '所属课程',
            '题目解析'
          ]
          excel.export_json_to_excel({
            header: tHeader,
            data: [],
            filename: '题目上传模板'
          })
          this.downloadLoading = false
        })
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1
      if (isLt1M) {
        return true
      }
      this.$message({
        message: '请上传小于1M的文件',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results, header }) {
      const questionList = []
      console.log('results:' + results)
      results.forEach((item, index) => {
        const question = {}
        console.log('item:' + item)
        Object.keys(item).forEach((key) => {
          if (key === '题目标题') {
            question.title = item[key]
          }
          if (key === '题目类型(1为单选题，2为多选题，3为判断题)') {
            question.type = item[key]
          }
          if (key === '选项（选择题）') {
            question.options = item[key]
          }
          if (key === '正确答案（选择题）') {
            question.rightOption = item[key]
          }
          if (key === '正确答案（判断题（1为T,2为F）') {
            question.judgeAnswer = item[key]
          }
          if (key === '题目分值') {
            question.score = item[key]
          }
          if (key === '是否组卷') {
            question.isPaper = item[key]
          }
          if (key === '题目解析') {
            question.analysis = item[key]
          }
          if (key === '所属课程') {
            question.courseId = item[key]
          }
        })
        questionList.push(question)
      })
      this.insertQuestionList(questionList)
      this.tableData = results
      this.tableHeader = header
    },
    // 插入数据库单选题表
    async insertQuestionList(questionList) {
      console.log(questionList)
      const result = await insertQuestionList(questionList)
      if (result.code === 200) {
        this.$message({
          message: result.msg,
          type: 'success'
        })
      } else {
        this.$message({
          message: result.msg,
          type: 'error'
        })
      }
    }
  }
}
</script>

<style lang="stylus" type="text/stylus" rel="stylesheet/stylus" scoped>

</style>
