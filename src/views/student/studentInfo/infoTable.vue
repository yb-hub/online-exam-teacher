<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.studentId" placeholder="搜索学号" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.name" placeholder="搜索姓名" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
<!--      <el-select v-model="listQuery.stuSex" placeholder="搜索性别" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @change="handleFilter">-->
<!--        <el-option v-for="item in stuSexOptions" :key="item.key" :label="item.label" :value="item.key" />-->
<!--      </el-select>-->
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 0;margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" style="margin-left: 0;margin-right: 10px;" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出当前页学生信息
      </el-button>
<!--      <el-button v-waves :loading="downloadLoading" style="margin-left: 0;" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownloadAll">-->
<!--        导出全部学生信息-->
<!--      </el-button>-->
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort = "{prop: 'studentId', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="学号" prop="sno" sortable align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.studentId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center">
        <template slot-scope="scope">
          <viewer>
            <img :src="scope.row.remark || require('@/assets/images/profile.jpg')" style="width: 40px;height: 40px;border-radius: 5px">
          </viewer>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sex == '1' ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.email || '暂无绑定邮箱' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.phoneNumber || '暂无绑定手机号' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="stuCreateTime" sortable label="注册时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | date-format }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="操作" align="center" class-name="small-padding" width="120">-->
<!--        <template slot-scope="{row}">-->
<!--          <el-button v-waves type="primary" icon="el-icon-setting" size="mini" @click="confirmUpdatePsw(row)">-->
<!--            重置密码-->
<!--          </el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="登录权限" align="center" class-name="small-padding" width="120">
        <template slot-scope="{row}">
          <!--<el-switch
            v-if="row.stuStatus == '1'"
            value="row.stuStatus == '1'"
            active-color="#13ce66"
            inactive-color="#ff4949"/>
          <span :style="{ color: row.stuStatus === '1' ? 'green' : 'red', fontWeight:'bold' }">{{ row.stuStatus === '1'?'已启用':'已禁用' }}</span>-->
          <el-button v-waves v-if="row.isDelete==0" size="mini" icon="el-icon-success" type="success" @click="handleModifyStatus(row,1)">
            启用状态
          </el-button>
          <el-button v-waves v-if="row.isDelete==1" size="mini" icon="el-icon-error" type="danger" @click="handleModifyStatus(row,0)">
            禁用状态
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :visible.sync="dialogFormVisible" title="添加">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="temp.studentId" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="电话" prop="phoneNumber">
          <el-input v-model="temp.phoneNumber" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="temp.sex" class="filter-item">
            <el-option v-for="item in stuSexOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确认添加
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
import { getStudentList, updateStudent, reqSearchStudentsList, insertStudent } from '@/api/student'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import BackToTop from '@/components/BackToTop'

export default {
  name: 'InfoTable',
  components: { Pagination, BackToTop },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        studentId: '',
        name: '',
      },
      stuSexOptions: [{ label: '男', key: '1' }, { label: '女', key: '0' }],
      temp: {
        studentId: '',
        password: '123456',
        name: '',
        sex: '1',
        phoneNumber: '',
        email: ''
      },
      dialogFormVisible: false,
      rules: {
        studentId: [{ required: true, message: '学号为必填项', trigger: 'blur' },{ min: 8, max: 12, message: '学号必须为8-12位数字', trigger: 'blur' }],
        password: [{ required: true, message: '密码为必填项，默认设置密码为123456', trigger: 'blur' }],
        name: [{ required: true, message: '姓名为必填项', trigger: 'blur' }],
        sex: [{ required: true, message: '性别为必填项，默认选择男', trigger: 'blur' }]
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
    this.getList()
  },
  methods: {
    //获取学生列表
    async getList() {
      this.listLoading = true
      let result = await getStudentList(this.listQuery)
      if (result.code === 200){
        this.total = result.data.total
        // this.list = result.data.filter((item, index) => index < this.listQuery.limit * this.listQuery.page && index >= this.listQuery.limit * (this.listQuery.page - 1))
        this.list = result.data.data
      }
      // 延迟0.5秒等待请求数据
      setTimeout(() => {
        this.listLoading = false
      }, 500)
    },
    async handleModifyStatus(row, status) {
      let result = await updateStudent(row.studentId,status)
      if (result.code === 200){
        if (status === '0'){
          this.$message({
            message: '启用成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '禁用成功',
            type: 'error'
          })
        }
        this.getList()
      }
      else {
        this.$message({
          message: result.message,
          type: 'error'
        })
      }
    },
    confirmUpdatePsw(row) {
      this.$confirm('确定重置密码吗?重置后默认密码为123456', '提示', {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleUpdatePsw(row)
      }).catch(() => {
      })
    },
    async handleUpdatePsw(row) {
      row.stuPsw = '123456'
      let result = await reqUpdateStudentInfo(row)
      if (result.statu === 0){
        this.$message({
          message: '重置密码成功，默认密码为123456',
          type: 'success'
        })
      } else {
        this.$message({
          message: result.msg,
          type: 'error'
        })
      }
    },
    async handleFilter(){
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp(){
      this.temp = {
        studentId: '',
        password: '123456',
        name: '',
        sex: '1',
        phoneNumber: '',
        email: ''
      }
    },
    //新增考生
    handleCreate(){
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData(){
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.insertStudentInfo()
        }
      })
    },
    async insertStudentInfo(){
      let result = await insertStudent(this.temp)
      if (result.code === 200){
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
          message: result.message,
          type: 'error',
          duration: 2000
        })
      }
    },

    handleDownload(){
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['学号', '姓名', '性别', '邮箱', '手机号', '注册时间','登录权限']
        const filterVal = ['studentId', 'name', 'sex', 'email', 'phoneNumber', 'createTime', 'isDelete']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '当前页学生信息表'
        })
        this.downloadLoading = false
      })
    },
    // async handleDownloadAll(){
    //   this.downloadLoading = true
    //   let result = await getStudentList()
    //   let list = result.data
    //   import('@/vendor/Export2Excel').then(excel => {
    //     const tHeader = ['学号', '姓名', '性别', '邮箱', '手机号', '注册时间','登录权限']
    //     const filterVal = ['studentId', 'name', 'sex', 'email', 'phoneNumber', 'createTime', 'isDelete']
    //     const data = this.formatJson(filterVal, list)
    //     excel.export_json_to_excel({
    //       header: tHeader,
    //       data,
    //       filename: '全部学生信息表'
    //     })
    //     this.downloadLoading = false
    //   })
    // },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'stuCreateTime' || j === 'stuLastLoginTime') {
          if (v[j] !== null) {
            return parseTime(v[j])
          }
          else {
            return '暂无最近登录记录'
          }
        } else if (j === 'stuStatus') {
          return v[j] === '1' ? '启用状态' : '禁用状态'
        } else if (j === 'stuEmail') {
          return v[j] || '暂无绑定邮箱'
        } else if (j === 'stuPhone') {
          return v[j] || '暂无绑定手机号'
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
