<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="keyWord" placeholder="搜索科目" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 0;margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">
        添加科目
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="subjectList"
      :default-sort = "{prop: 'id', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="id" sortable align="center" width="120"/>
      <el-table-column label="科目名称" prop="name" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" />
      <el-table-column label="更新时间" prop="updateTime" align="center" />
      <el-table-column label="操作" align="center" class-name="small-padding" width="220">
        <template slot-scope="{row}">
          <el-button v-waves type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)">
            编辑科目
          </el-button>
          <el-button v-waves type="danger" icon="el-icon-delete" size="mini" @click="confirmDeleteNotice(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="pageSize" @pagination="getSubjectList(page,pageSize)" />

    <el-dialog :visible.sync="dialogFormVisible" :title="dialogStatus">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="公告内容" prop="noticeContent">
          <el-input v-model="temp.noticeContent" :rows="4" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='添加'?createData():updateData()">
          {{ dialogStatus==='添加'?'确认发布':'确认编辑' }}
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
/* eslint-disable */
  import { getSubjects, reqSearchNoticesList, reqInsertNoticeInfo, reqUpdateNoticeInfo, reqDeleteNotice } from '@/api/notice'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import BackToTop from '@/components/BackToTop'

  export default {
    name: 'Subject',
    components: { Pagination, BackToTop },
    directives: { waves },
    data() {
      return {
        subjectList:[
          {
            id:"",
            name:"",
            createTime:"",
            updateTime:""
          }
        ],
        keyWord: "",
        page:1,
        pageSize:1,
        total:"",
        pages:"",
        listLoading: true,

        temp: {
          noticeContent: '',
          teaName: this.$store.state.teacher.userInfo.teaName,
          tno: this.$store.state.teacher.userInfo.tno
        },
        dialogFormVisible: false,
        dialogStatus: '',
        rules: {
          noticeContent: [{ required: true, message: '公告内容为必填项', trigger: 'blur' }],
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
      this.getSubjectList(this.page,this.pageSize)
    },
    methods: {
      async getSubjectList(page,pageSize) {
        console.log("page:"+page);
        console.log("pageSize:"+pageSize);
        let result = await getSubjects(page,pageSize)
        this.subjectList = result.data.data
        console.log(result.data);
        this.pages = result.data.pages
        this.total = result.data.total
        this.listLoading = false
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // 复制对象
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.handleUpdateNotice()
          }
        })
      },
      async handleUpdateNotice() {
        let result = await reqUpdateNoticeInfo(this.temp)
        if (result.statu === 0){
          this.dialogFormVisible = false
          this.$message({
            message: result.msg,
            type: 'success'
          })
          this.getList()
        } else {
          this.$message({
            message: result.msg,
            type: 'error'
          })
        }
      },
      async handleFilter(){
        this.listQuery.page = 1
        this.listLoading = true
        let result = await reqSearchNoticesList(this.listQuery.noticeContent, this.listQuery.teaName)
        if (result.statu === 0){
          this.total = result.data.length
          this.list = result.data.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
        }
        this.listLoading = false
      },
      resetTemp(){
        this.temp = {
          noticeContent: '',
          teaName: this.$store.state.teacher.userInfo.teaName,
          tno: this.$store.state.teacher.userInfo.tno
        }
      },
      handleCreate(){
        this.resetTemp()
        this.dialogStatus = '添加'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData(){
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.insertNoticeInfo()
          }
        })
      },
      async insertNoticeInfo(){
        let result = await reqInsertNoticeInfo(this.temp)
        if (result.statu === 0){
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '添加成功',
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
      confirmDeleteNotice(row) {
        this.$confirm('确定删除该公告吗?', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleDeleteNotice(row)
        }).catch(() => {
        })
      },
      async handleDeleteNotice(row) {
        let noticeId = row.noticeId
        let result = await reqDeleteNotice(noticeId)
        if (result.statu === 0){
          this.$message({
            message: result.msg,
            type: 'success'
          })
          this.getList()
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