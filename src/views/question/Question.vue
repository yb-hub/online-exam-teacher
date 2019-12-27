<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.keyWord" placeholder="题目关键字" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.courseId" placeholder="题目所属课程" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in courseList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 0;margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">
        添加题目
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="questionList"
      :default-sort = "{prop: 'id', order: 'ascending'}"
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="">
              <span>{{ scope.row.title }}</span>
            </el-form-item>
            <el-form-item v-for="option in scope.row.options" :key="option.optionKey">
              <span>{{ option.optionKey }}:</span>
              <span>{{ option.optionValue }}</span>
            </el-form-item>
            <el-form-item label="题目答案：">
              <span>{{ scope.row.rightOption }}</span>
            </el-form-item>
            <el-form-item label="答案解析：">
              <span>{{ scope.row.analysis || '暂无解析' }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="序号" prop="id" sortable align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题目内容" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否被组成试卷" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.isPaper === '1' ? '是' : '否' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属科目" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.courseId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="240">
        <template slot-scope="{row}">
          <el-button v-waves type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)">
            编辑题目
          </el-button>
          <el-button v-waves type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getQuestions" />

    <el-dialog :visible.sync="dialogFormVisible" :title="dialogStatus">
      <el-form ref="dataForm" :rules="rules" :model="tempQuestion" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item v-show="dialogStatus=='编辑题目'" label="题目id" prop="id">
          <el-input v-model="tempQuestion.id" :disabled="true"/>
        </el-form-item>
        <el-form-item label="题目内容" prop="title">
          <el-input v-model="tempQuestion.title" :rows="5" type="textarea" />
        </el-form-item>
        <el-form-item label="题目类型" prop="type">
          <el-radio v-model="tempQuestion.type" :label="1">单选题</el-radio>
          <el-radio v-model="tempQuestion.type" :label="2">多选题</el-radio>
          <el-radio v-model="tempQuestion.type" :label="3">判断题</el-radio>
        </el-form-item>
        <el-form-item label="题目分值" prop="score">
          <el-input v-model="tempQuestion.score"/>
        </el-form-item>
        <el-form-item v-show="tempQuestion.type!=3" label="题目选项" prop="options" >
          <div v-for="(option) in tempQuestion.options" :key="option.optionKey">
            <span>{{ option.optionKey }}</span>
            <el-input v-model="option.optionValue"/>
            <el-button style="float:right;" @click.prevent="deleteOptions(option)">删除</el-button>
          </div>
          <el-button @click="addOptions">添加选项</el-button>
        </el-form-item>
        <el-form-item v-show="tempQuestion.type!=3" label="正确选项" prop="rightOptions">
          <el-checkbox-group v-model="tempQuestion.rightOption">
            <el-checkbox v-for="option in tempQuestion.options" :key="option.optionKey" :label="option.optionKey">
              {{ option.optionKey }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-show="tempQuestion.type==3" label="正确选项" prop="judgeAnswer">
          <el-radio v-model="tempQuestion.judgeAnswer" :label="1">T(正确)</el-radio>
          <el-radio v-model="tempQuestion.judgeAnswer" :label="0">F(错误)</el-radio>
        </el-form-item>
        <el-form-item label="答案解析" prop="analysis">
          <el-input v-model="tempQuestion.analysis" :rows="5" type="textarea" />
        </el-form-item>
        <el-form-item label="所属科目" prop="courseId">
          <el-select v-model="tempQuestion.courseId" placeholder="请选择科目" clearable style="width: 200px;margin-right: 15px;" class="filter-item" >
            <el-option v-for="item in courseList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否组卷" prop="isPaper">
          <el-radio v-model="tempQuestion.isPaper" :label="1">考试题</el-radio>
          <el-radio v-model="tempQuestion.isPaper" :label="0">测试题</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='添加题目'?insert():update()">
          {{ dialogStatus==='添加题目'?'确认添加':'确认编辑' }}
        </el-button>
      </div>
    </el-dialog>

    <!--可自定义按钮的样式、show/hide临界点、返回的位置  -->
    <!--如需文字提示，可在外部添加element的<el-tooltip></el-tooltip>元素  -->
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="50" transition-name="fade" />
    </el-tooltip>
  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import BackToTop from '@/components/BackToTop'

import { getQuestions, insertQuestions, updateQuestions, deleteQuestions } from '@/api/question'
import { getCoursesSimple } from '@/api/course'
export default {
  name: 'Question',
  components: { Pagination, BackToTop },
  directives: { waves },
  data() {
    return {
      courseList: [
        {
          id: '',
          name: ''
        }
      ],
      questionList: [
        {
          id: '',
          title: '',
          type: '',
          analysis: '',
          courseId: '',
          isPaper: '',
          options: [
            {
              optionKey: '',
              optionValue: ''
            }
          ],
          rightOption: [],
          score: '',
          judgeAnswer: '',
          createTime: '',
          updateTime: ''
        }
      ],
      listQuery: {
        page: 1,
        pageSize: 10,
        limit: 10,
        keyWord: '',
        courseId: '',
        sort: 'update_time'
      },
      tempQuestion: {
        id: '',
        title: '',
        type: '',
        analysis: '',
        courseId: '',
        isPaper: '',
        options: [
          // {
          //   optionKey: '',
          //   optionValue: ''
          // }
        ],
        rightOption: [],
        score: '',
        judgeAnswer: ''
      },
      tableKey: 0,
      total: 0,
      listLoading: true,
      // composeFlagOptions: [{ label: '是', key: '1' }, { label: '否', key: '0' }],
      // langOptions: [],
      temp: {
        content: '',
        pictureSrc: '',
        choiceA: '',
        choiceB: '',
        choiceC: '',
        choiceD: '',
        choiceE: '',
        choiceF: '',
        choiceG: '',
        singleAnswer: '',
        answerExplain: '',
        langId: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        title: [{ required: true, message: '题目内容为必填项', trigger: 'change' }],
        type: [{ required: true, message: '题目类型为必选项', trigger: 'change' }],
        analysis: [{ required: true, message: '题目答案为必填项', trigger: 'change' }],
        courseId: [{ required: true, message: '所属科目为必填项', trigger: 'change' }]
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
  created() {
    this.getQuestions()
    this.getCourseList()
  },
  methods: {
    // 获取所有的题目
    async getQuestions() {
      this.listLoading = true
      const result = await getQuestions(this.listQuery)
      console.log(result)
      if (result.code === 200) {
        this.questionList = result.data
        this.listLoading = false
      }
    },
    // 过滤获取所有的题目
    handleFilter() {
      this.getQuestions()
    },
    // 获取courseList
    async getCourseList() {
      const result = await getCoursesSimple()
      console.log(result)
      if (result.code === 200) {
        this.courseList = result.data
      }
    },
    // 新增题目
    handleCreate() {
      console.log('添加题目')
      // this.tempQuestion = {}
      this.dialogFormVisible = true
      this.dialogStatus = '添加题目'
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    // 新增选项
    addOptions() {
      console.log('新增选项')
      const length = this.tempQuestion.options.length
      var optionKey = ''
      switch (length) {
        case 0:
          optionKey = 'A'
          break
        case 1:
          optionKey = 'B'
          break
        case 2:
          optionKey = 'C'
          break
      }
      const option = {
        optionKey: optionKey,
        optionValue: ''
      }
      this.tempQuestion.options.push(option)
    },
    // 删除选项
    deleteOptions(option) {
      var index = this.tempQuestion.options.indexOf(option)
      if (index !== -1) {
        this.tempQuestion.options.splice(index, 1)
      }
      // 选项重新排序
      var optionKey = ''
      const optionValues = this.tempQuestion.options.values()
      const length = this.tempQuestion.options.length
      this.tempQuestion.options = []
      for (let i = 0; i < length; i++) {
        switch (i) {
          case 0:
            optionKey = 'A'
            break
          case 1:
            optionKey = 'B'
            break
          case 2:
            optionKey = 'C'
            break
        }
        const option = {
          optionKey: optionKey,
          optionValue: optionValues[i]
        }
        this.tempQuestion.options.push(option)
      }
    },
    // 新增问题
    insert() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.insertQuestions(this.tempQuestion)
        }
      })
    },
    async insertQuestions(question) {
      const result = await insertQuestions(question)
      if (result.code === 200) {
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '添加成功',
          type: 'success',
          duration: 2000
        })
        this.getQuestions()
      } else {
        this.$notify({
          title: '失败',
          message: result.message,
          type: 'error',
          duration: 2000
        })
      }
    },
    // 更新问题
    handleUpdate(row) {
      console.log(row)
      this.dialogStatus = '编辑题目'
      this.dialogFormVisible = true
      this.tempQuestion = Object.assign({}, row) // 复制对象
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.updateQuestions()
        }
      })
    },
    async updateQuestions() {
      const result = await updateQuestions(this.tempQuestion.id, this.tempQuestion)
      if (result.code === 200) {
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
        this.getQuestions()
      } else {
        this.$notify({
          title: '失败',
          message: result.message,
          type: 'error',
          duration: 2000
        })
      }
    },
    // 删除问题
    handleDelete(row) {
      this.$confirm('确定删除该题目吗?若题目已被组成试卷则无法删除', '提示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (row.isPaper === '1') {
          this.$message({
            message: '该题目已被组成试卷，无法删除',
            type: 'error'
          })
        } else {
          this.deleteQuestions(row)
        }
      }).catch(() => {
      })
    },
    async deleteQuestions(row) {
      const result = await deleteQuestions(row.id)
      if (result.code === 200) {
        this.$notify({
          title: '删除成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.getQuestions()
      } else {
        this.$notify({
          title: '删除失败',
          message: result.message,
          type: 'error',
          duration: 2000
        })
      }
    }
    // handleAvatarSuccess(res, file) {
    //   // this.temp.pictureSrc = URL.createObjectURL(file.raw)
    //   this.temp.pictureSrc = res.data
    // },
    // beforeAvatarUpload(file) {
    //   const isType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
    //   const isLt4M = file.size / 1024 / 1024 < 4
    //
    //   if (!isType) {
    //     this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
    //   }
    //   if (!isLt4M) {
    //     this.$message.error('上传头像图片大小不能超过 4MB!')
    //   }
    //   return isType && isLt4M
    // },
    // deletePictureSrc() {
    //   this.temp.pictureSrc = ''
    // }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" type="text/scss" scoped>
  .demo-table-expand {
    font-size: 0;
    label {
      width: 90px;
      color: #99a9bf;
    }
    .el-form-item {
      margin-right: 0;
      margin-bottom: 0;
      width: 100%;
    }
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 280px;
    height: 80px;
    line-height: 80px;
    text-align: center;
  }
  .avatar {
    width: 280px;
    height: 80px;
    display: block;
  }
</style>
