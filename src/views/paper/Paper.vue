<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyWord" placeholder="搜索试卷名称" clearable style="width: 200px;margin-right: 15px;"
                class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.courseId" placeholder="搜索科目" clearable style="width: 200px;margin-right: 15px;"
                 class="filter-item" @change="handleFilter">
        <el-option v-for="item in courseList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search"
                 @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 0;margin-right: 10px;" type="primary"
                 icon="el-icon-edit" @click="handleCreate">
        随机组卷
      </el-button>
      <div><span style="color: #FF0000"><i class="el-icon-warning" style="margin-right: 10px"/>鼠标右键单击选中行可查看试卷详情</span>
      </div>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="paperList"
      :default-sort="{prop: 'id', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @row-contextmenu="seePaperDetail"
    >
      <el-table-column label="序号" prop="id" sortable align="center" width="90">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="试卷名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="paperDuration" sortable label="考试时长" align="center" width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.limitTime }}分钟</span>
        </template>
      </el-table-column>
      <el-table-column prop="paperDifficulty" sortable label="难度系数" align="center" width="142">
        <template slot-scope="scope">
          <el-rate
            v-model="scope.row.difficultyDegree"
            disabled
            text-color="#ff9900"
            score-template="{value}"/>
        </template>
      </el-table-column>
      <el-table-column label="考试注意事项" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description || '暂无考试注意事项' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalScore" sortable label="试卷总分" align="center" width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.totalScore }}分</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="122">
        <template slot-scope="{row}">
          <el-button v-waves type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getPaperList"/>

    <!--查看试卷详情弹出框-->
    <el-dialog :visible.sync="paperDetailDialogFormVisible" :title="clickPaperTitle" style="margin-bottom: 20px">
      <div style="height: 50px;line-height: 50px;margin-top: -35px;color: #ff9e8c">{{ subPaperTitle }}</div>
      <div style="height: 50px;line-height: 50px;margin-top: -20px;color: #00d2c9">{{ minSubPaperTitle }}</div>
      <el-input v-model="filterText" placeholder="查找试卷问题关键字" style="margin-bottom:30px;"/>
      <el-tree
        ref="paperDataTree"
        :data="paperData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        class="filter-tree"
      />
    </el-dialog>

    <!--随机组卷弹出框-->
    <el-dialog :visible.sync="dialogFormVisible" title="随机组卷" style="margin-bottom: 20px">
      <el-form ref="dataForm" :rules="rules" :model="tempPaper" label-position="left" label-width="100px"
               style="width: 400px; margin-left:50px;">
        <el-form-item label="所属科目" prop="courseId">
          <el-select v-model="tempPaper.courseId" placeholder="选择科目" clearable style="width: 200px;margin-right: 15px;"
                     class="filter-item">
            <el-option v-for="item in courseList" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷名称" prop="title">
          <el-input v-model="tempPaper.title"/>
        </el-form-item>
        <el-form-item label="考试类型" prop="type">
          <el-select v-model="tempPaper.type" placeholder="选择考试类型" clearable style="width: 200px;margin-right: 15px;"
                     class="filter-item">
            <el-option v-for="item in paperTypeList " :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="考试年级" prop="grade">
          <el-input v-model="tempPaper.grade"/>
        </el-form-item>
        <el-form-item label="考试时长" prop="limitTime">
          <el-time-select
            v-model="tempPaper.limitTime"
            :picker-options="{
              start: '00:10',
              step: '00:10',
              end: '05:00'
            }"
            placeholder="选择时间(时:分)"/>
        </el-form-item>
        <el-form-item label="难度系数" prop="difficultyDegree">
          <el-rate v-model="tempPaper.difficultyDegree" style="margin-top: 10px"/>
        </el-form-item>
        <el-form-item label="注意事项" prop="description">
          <el-input v-model="tempPaper.description" type="textarea"/>
        </el-form-item>
        <el-form-item label="单选题分值" prop="singleScore">
          <el-input-number v-model="tempPaper.singleScore" :min="0" :max="200"/>
        </el-form-item>
        <el-form-item label="单选题数目" prop="totalSingleChoice">
          <el-input-number v-model="tempPaper.totalSingleChoice" :min="0" :max="200"/>
        </el-form-item>
        <el-form-item label="多选题分值" prop="multiScore">
          <el-input-number v-model="tempPaper.multiScore" :min="0" :max="200"/>
        </el-form-item>
        <el-form-item label="多选题数目" prop="totalMultiChoice">
          <el-input-number v-model="tempPaper.totalMultiChoice" :min="0" :max="200"/>
        </el-form-item>
        <el-form-item label="判断题分值" prop="judgeScore">
          <el-input-number v-model="tempPaper.judgeScore" :min="0" :max="200"/>
        </el-form-item>
        <el-form-item label="判断题数目" prop="totalJudgeChoice">
          <el-input-number v-model="tempPaper.totalJudgeChoice" :min="0" :max="200"/>
        </el-form-item>
        <el-form-item label="题目总数" prop="totalQuestion">
          <el-input v-model="tempPaper.totalQuestion" :readonly="true" :min="0" :max="200"
                    style="width: 200px;margin-right: 15px;"/>
        </el-form-item>
        <el-form-item label="试卷总分" prop="totalScore">
          <el-input v-model="tempPaper.totalScore" :readonly="true" :min="0" :max="200"
                    style="width: 200px;margin-right: 15px;"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="insertPaper">
          确认发布
        </el-button>
      </div>
    </el-dialog>

    <!--可自定义按钮的样式、show/hide临界点、返回的位置  -->
    <!--如需文字提示，可在外部添加element的<el-tooltip></el-tooltip>元素  -->
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="50"
                   transition-name="fade"/>
    </el-tooltip>
  </div>
</template>

<script>
  /* eslint-disable */
  import {
    reqGetPapersList,
    reqSearchPapersList,
    reqDeletePaper,
    reqPaperQueDetailByPaperId,
    reqRandomInsertPaperInfo,
    reqFixedInsertPaperInfo,
    reqPaperQueDetailByLangId
  } from '@/api/paper'
  import waves from '@/directive/waves' // Waves directive
  import {parseTime} from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import BackToTop from '@/components/BackToTop'
  import {getCoursesSimple} from '@/api/course'
  import {insertPaper,getPaperList,deletePaper} from '@/api/paper'

  export default {
    name: 'Paper',
    components: {Pagination, BackToTop},
    directives: {waves},
    data() {
      return {
        tempPaper: {
          title: '',
          type: '',
          grade: '',
          courseId: '',
          limitTime: '',
          difficultyDegree: '',
          description: '',
          singleScore: 1,
          totalSingleChoice: 0,
          multiScore: 1,
          totalMultiChoice: 0,
          judgeScore: 1,
          totalJudgeChoice: 0,
          totalQuestion: 0,
          totalScore: 0
        },
        courseList: [],
        paperTypeList: [
          {id: 1, name: "小测试"},
          {id: 2, name: "期中考试"},
          {id: 3, name: "期末考试"}
        ],
        listQuery: {
          page: 1,
          limit: 10,
          keyWord: '',
          courseId: '',
          sort: 'create_time'
        },
        paperList: [],
        listLoading: true,
        total: 0,
        dialogFormVisible: false,

        tableKey: 0,
        list: null,
        langOptions: [],
        paperTypeOptions: [{label: '随机组卷', key: '1'}, {label: '固定组卷', key: '2'}],
        temp: {
          paperName: '',
          paperDuration: '',
          paperDifficulty: undefined,
          paperAttention: '',
          singleScore: undefined,
          singleNum: undefined,
          multipleScore: undefined,
          multipleNum: undefined,
          judgeScore: undefined,
          judgeNum: undefined,
          fillScore: undefined,
          fillNum: undefined,
          langId: undefined
        },
        fixedDialogFormVisible: false,
        paperDetailDialogFormVisible: false,
        clickPaperTitle: '',
        subPaperTitle: '',
        minSubPaperTitle: '',
        filterText: '',
        fixedFilterText: '',
        paperData: [],
        fixedPaperData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        fixRules: {
          langId: [{required: true, message: '试卷名称为必填项', trigger: 'change'}],
          paperName: [{required: true, message: '试卷名称为必填项', trigger: 'change'}],
          paperDuration: [{required: true, message: '考试时长为必填项', trigger: 'change'}],
          paperDifficulty: [{required: true, message: '难度系数为必填项', trigger: 'change'}],
          singleScore: [{required: true, message: '单选题分数为必填项', trigger: 'change'}],
          multipleScore: [{required: true, message: '多选题分数为必填项', trigger: 'change'}],
          judgeScore: [{required: true, message: '判断题分数为必填项', trigger: 'change'}],
          fillScore: [{required: true, message: '填空题分数为必填项', trigger: 'change'}],
        },
        rules: {
          langId: [{required: true, message: '试卷名称为必填项', trigger: 'change'}],
          paperName: [{required: true, message: '试卷名称为必填项', trigger: 'change'}],
          paperDuration: [{required: true, message: '考试时长为必填项', trigger: 'change'}],
          paperDifficulty: [{required: true, message: '难度系数为必填项', trigger: 'change'}],
          singleScore: [{required: true, message: '单选题分数为必填项', trigger: 'change'}],
          singleNum: [{required: true, message: '单选题数目为必填项', trigger: 'change'}],
          multipleScore: [{required: true, message: '多选题分数为必填项', trigger: 'change'}],
          multipleNum: [{required: true, message: '多选题数目为必填项', trigger: 'change'}],
          judgeScore: [{required: true, message: '判断题分数为必填项', trigger: 'change'}],
          judgeNum: [{required: true, message: '判断题数目为必填项', trigger: 'change'}],
          fillScore: [{required: true, message: '填空题分数为必填项', trigger: 'change'}],
          fillNum: [{required: true, message: '填空题数目为必填项', trigger: 'change'}],
        },
        downloadLoading: false,

        myBackToTopStyle: {
          right: '50px',
          bottom: '50px',
          width: '40px',
          height: '40px',
          'border-radius': '4px',
          'line-height': '45px', // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
          background: '#e7eaf1'// 按钮的背景颜色 The background color of the button
        }
      }
    },
    watch: {
      tempPaper: {
        deep: true,
        handler: function () {
          console.log("tempPaper变化。。。")
          let paper = this.tempPaper
          this.tempPaper.totalQuestion = paper.totalSingleChoice + paper.totalMultiChoice + paper.totalJudgeChoice
          this.tempPaper.totalScore = paper.totalSingleChoice * paper.singleScore + paper.totalMultiChoice * paper.multiScore + paper.totalJudgeChoice * paper.judgeScore
        }
      },
      filterText(val) {
        this.$refs.paperDataTree.filter(val)
      },
      fixedFilterText(val) {
        this.$refs.fixedPaperDataTree.filter(val)
      }
    },
    created() {
      this.getPaperList()
      this.getCourseList()
    },
    methods: {
      //获取课程列表
      async getCourseList() {
        let result = await getCoursesSimple()
        if (result.code === 200) {
          this.courseList = result.data
        }
      },
      //生成试卷
      insert() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.insertPaper()
          }
        })
      },
      async insertPaper() {
        const result = await insertPaper(this.tempPaper)
        if (result.code === 200) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
          this.getPaperList()
        } else {
          this.$notify({
            title: '失败',
            message: '添加失败',
            type: 'error',
            duration: 2000
          })
        }
      },
      //获取试卷列表
      async getPaperList() {
        this.listLoading = true
        let result = await getPaperList(this.listQuery)
        this.paperList = result.data.data
        this.total = result.data.total
        this.listLoading = false
      },
      //搜索试卷
      handleFilter(){
        this.getPaperList()
      },
      //删除试卷
      handleDelete(row){
        this.$confirm("确定要删除此试卷？",'提示',{
          confirmButtonText:'确定删除',
          cancelButtonText:'取消',
          type:'warning'
        }).then(()=>{
          this.deletePaper(row.id)
        }).catch(()=>{})
      },
      async deletePaper(id){
        const result = await deletePaper(id)
        if(result.code === 200){
          this.$message({
            message:'删除成功',
            type:'success'
          })
          this.getPaperList()
        }else{
          this.$message({
            message:result.message,
            type:'error'
          })
        }
      },

      async seePaperDetail(row, column, event) {
        // 阻止鼠标右键默认事件
        event.preventDefault()
        let result = await reqPaperQueDetailByPaperId(row.paperId, row.totalNum)
        let singleData = result.data.singleData
        let multipleData = result.data.multipleData
        let judgeData = result.data.judgeData
        let fillData = result.data.fillData
        //初始化数据
        this.filterText = ''
        this.clickPaperTitle = `试卷详情：${row.paperName}`
        this.subPaperTitle = `试卷总分：${row.totalScore}分，试卷总题数：${row.totalNum}道。`
        this.minSubPaperTitle = `单选题${row.singleNum}道（每道${row.singleScore}分），多选题${row.multipleNum}道（每道${row.multipleScore}分），判断题${row.judgeNum}道（每道${row.judgeScore}分），填空题${row.fillNum}道（每道${row.fillScore}分）。`
        this.paperData = [{
          id: 1,
          label: '单选题列表',
          children: singleData
        }, {
          id: 2,
          label: '多选题列表',
          children: multipleData
        }, {
          id: 3,
          label: '判断题列表',
          children: judgeData
        }, {
          id: 4,
          label: '填空题列表',
          children: fillData
        }]
        // 显示弹出对话框
        this.paperDetailDialogFormVisible = true
      },

      resetTemp() {
        this.temp = {
          paperName: '',
          paperDuration: '',
          paperDifficulty: undefined,
          paperAttention: '',
          singleScore: undefined,
          singleNum: undefined,
          multipleScore: undefined,
          multipleNum: undefined,
          judgeScore: undefined,
          judgeNum: undefined,
          fillScore: undefined,
          fillNum: undefined,
          langId: undefined
        }
      },
      handleFixedCreate() {
        this.fixedFilterText = ''
        this.fixedPaperData = []
        this.resetTemp()
        this.fixedDialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['fixedDataForm'].clearValidate()
        })
      },
      async fixedLangIdChange() {
        this.fixedPaperData = []
        if (this.temp.langId !== null) {
          let result = await reqPaperQueDetailByLangId(this.temp.langId)
          let singleData = result.data.singleData
          let multipleData = result.data.multipleData
          let judgeData = result.data.judgeData
          let fillData = result.data.fillData
          //初始化数据
          this.fixedFilterText = ''
          this.fixedPaperData = [{
            id: 1,
            label: '单选题列表',
            children: singleData
          }, {
            id: 2,
            label: '多选题列表',
            children: multipleData
          }, {
            id: 3,
            label: '判断题列表',
            children: judgeData
          }, {
            id: 4,
            label: '填空题列表',
            children: fillData
          }]
        }
      },
      fixedCreateData() {
        this.$refs['fixedDataForm'].validate((valid) => {
          if (valid) {
            let checkedData = this.$refs.fixedPaperDataTree.getCheckedNodes()
            // 过滤掉单选题列表多选题列表判断题列表填空题列表四个id值
            let filtercheckedData = checkedData.filter(item => {
              return item.id > 4
            })
            if (filtercheckedData.length > 0) {
              let singleNum = []
              let multipleNum = []
              let judgeNum = []
              let fillNum = []
              filtercheckedData.forEach((item, index) => {
                let firstStr = (String)(item.id).substring(0, 1)
                let restStr = (String)(item.id).substring(1)
                if (firstStr === '1') {
                  singleNum.push((Number)(restStr))
                }
                if (firstStr === '2') {
                  multipleNum.push((Number)(restStr))
                }
                if (firstStr === '3') {
                  judgeNum.push((Number)(restStr))
                }
                if (firstStr === '4') {
                  fillNum.push((Number)(restStr))
                }
              })
              if (!singleNum.length) {
                this.$message({
                  message: '请选择至少一道单选题',
                  type: 'error'
                })
              } else if (!multipleNum.length) {
                this.$message({
                  message: '请选择至少一道多选题',
                  type: 'error'
                })
              } else if (!judgeNum.length) {
                this.$message({
                  message: '请选择至少一道判断题',
                  type: 'error'
                })
              } else if (!fillNum.length) {
                this.$message({
                  message: '请选择至少一道填空题',
                  type: 'error'
                })
              } else {
                this.temp.singleNum = singleNum
                this.temp.multipleNum = multipleNum
                this.temp.judgeNum = judgeNum
                this.temp.fillNum = fillNum
                this.fixedInsertPaperInfo()
              }
            } else {
              this.$message({
                message: '请勾选题目，如果该科目题目紧缺请选择其他科目组卷',
                type: 'error'
              })
            }
          }
        })
      },
      async fixedInsertPaperInfo() {
        let arr = this.temp.paperDuration.split(":")
        this.temp.paperDuration = parseInt(arr[0]) * 60 * 60 + parseInt(arr[1]) * 60
        let result = await reqFixedInsertPaperInfo(this.temp)
        if (result.statu === 0) {
          this.fixedDialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '试卷发布成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: result.msg,
            type: 'error',
            duration: 2000
          })
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      async randomInsertPaperInfo() {
        let arr = this.temp.paperDuration.split(":")
        this.temp.paperDuration = parseInt(arr[0]) * 60 * 60 + parseInt(arr[1]) * 60
        let result = await reqRandomInsertPaperInfo(this.temp)
        if (result.statu === 0) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '试卷发布成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        } else {
          this.$notify({
            title: '失败',
            message: result.msg,
            type: 'error',
            duration: 2000
          })
        }
      },
      filterNode(value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== -1
      }
    }
  }
</script>
