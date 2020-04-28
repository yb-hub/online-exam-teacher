<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryList.keyWord"
        placeholder="课程名称"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-select
        v-model="queryList.majorId"
        clearable
        style="width: 200px;margin-right: 15px;"
        class="filter-item"
        placeholder="请选择">
        <el-option
          v-for="item in majorList"
          :key="item.id"
          :label="item.name"
          :value="item.id"/>
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        style="margin-right: 10px;"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter">
        搜索
      </el-button>
      <el-button
        v-waves
        class="filter-item"
        style="margin-left: 0;margin-right: 10px;"
        type="primary"
        icon="el-icon-circle-plus-outline"
        @click="handleCreate">
        添加课程
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="courseList"
      :default-sort="{prop: 'id', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="id" sortable align="center" width="120"/>
      <el-table-column label="课程名称" prop="name" align="center"/>
      <el-table-column label="所属专业" prop="majorName" align="center"/>
      <el-table-column label="课程学分" prop="credit" align="center"/>
      <el-table-column label="创建时间" prop="createTime" align="center"/>
      <el-table-column label="更新时间" prop="updateTime" align="center"/>
      <el-table-column label="操作" align="center" class-name="small-padding" width="220">
        <template slot-scope="{row}">
          <el-button v-waves type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)">
            编辑课程
          </el-button>
          <el-button v-waves type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryList.page"
      :limit.sync="queryList.pageSize"
      @pagination="getCourses()"/>

    <el-dialog :visible.sync="dialogFormVisible" :title="dialogStatus">
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="rules"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:50px;">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="dataForm.name" type="input"/>
        </el-form-item>
        <el-form-item label="课程学分" prop="credit">
          <el-input v-model="dataForm.credit" type="input"/>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select v-model="dataForm.majorId" clearable placeholder="请选择">
            <el-option
              v-for="item in majorList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="课程图片" prop="remark">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8008/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="dataForm.remark" :src="dataForm.remark" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='添加'?insert():update()">
          {{ dialogStatus==='添加'?'确认添加':'确认编辑' }}
        </el-button>
      </div>
    </el-dialog>

    <!--可自定义按钮的样式、show/hide临界点、返回的位置  -->
    <!--如需文字提示，可在外部添加element的<el-tooltip></el-tooltip>元素  -->
    <el-tooltip placement="top" content="返回顶部">
      <back-to-top
        :custom-style="myBackToTopStyle"
        :visibility-height="300"
        :back-position="50"
        transition-name="fade"/>
    </el-tooltip>
  </div>
</template>

<script>
/* eslint-disable */
  import { getCourses, insertCourse, updateCourse, deleteCourse } from '@/api/course'
  import { getMajorsSimple } from '@/api/major'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import BackToTop from '@/components/BackToTop'

  export default {
    name: 'Course',
    components: { Pagination, BackToTop },
    directives: { waves },
    data() {
      return {
        courseList: [
          {
            id: '',
            name: '',
            credit: '',
            remark: '',
            majorId: '',
            majorName: '',
            createTime: '',
            updateTime: ''
          }
        ],
        majorList: [
          {
            id: '',
            name: ''
          }
        ],
        queryList: {
          majorId: '',
          keyWord: '',
          page: 1,
          pageSize: 10
        },
        dataForm: {
          courseId: '',
          majorId: '',
          name: '',
          credit: '',
          remark: ''
        },
        total: '',
        pages: '',
        listLoading: true,

        rules: {
          name: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
          credit: [{ required: true, message: '课程学分不能为空', trigger: 'blur' }],
          majorId: [{ required: true, message: '专业不能为空', trigger: 'blur' }]
        },
        dialogFormVisible: false,
        dialogStatus: '',

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
      this.getCourses()
      this.getMajors()
    },
    methods: {
      //获取专业列表
      async getMajors() {
        let result = await getMajorsSimple()
        console.log(result)
        this.majorList = result.data
      },
      //获取课程列表
      async getCourses() {
        this.listLoading = true
        let result = await getCourses(this.queryList)
        console.log(result)
        this.courseList = result.data.data
        this.total = result.data.total
        this.pages = result.data.pages
        this.listLoading = false
      },

      //根据条件获取课程列表
      handleFilter(){
        this.getCourses()
      },

      //新增课程
      handleCreate() {
        this.dataForm = {}
        this.dialogFormVisible = true
        this.dialogStatus = '添加'
      },
      insert() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.insertCourse()
          }
        })
      },
      async insertCourse() {
        const course = {
          majorId: this.dataForm.majorId,
          credit: this.dataForm.credit,
          name: this.dataForm.name,
          remark: this.dataForm.remark
        }
        let result = await insertCourse(course)
        if (result.code === 200) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
          this.getCourses(this.queryList)
        } else {
          this.$notify({
            title: '失败',
            message: result.message,
            type: 'error',
            duration: 2000
          })
        }
      },
      //上传课程图片
      handleAvatarSuccess(res, file) {
        this.$set(this.dataForm,'remark',res.data)
      },
      beforeAvatarUpload(file) {
        const fileType = ['image/jpeg','image/png']
        const isJPG = fileType.indexOf(file.type);
        const isLt2M = file.size / 1024 / 1024 < 10;

        if (isJPG === -1) {
          this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 10MB!');
        }
        return isJPG && isLt2M;
      },
      //编辑课程
      handleUpdate(row) {
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.dataForm.courseId = row.id
        this.dataForm.name = row.name
        this.dataForm.credit = row.credit
        this.dataForm.majorId = row.majorId
        this.dataForm.remark = row.remark
      },
      update() {
        this.updateCourse()
      },
      async updateCourse() {
        const course = { name: this.dataForm.name, majorId: this.dataForm.majorId, credit: this.dataForm.credit,remark: this.dataForm.remark }
        let result = await updateCourse(this.dataForm.courseId, course)
        console.log(result)
        if (result.code === 200) {
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.getCourses(this.queryList)
        } else {
          this.$notify({
            title: '失败',
            message: result.message,
            type: 'error',
            duration: 2000
          })
        }
      },

      //删除课程
      handleDelete(row) {
        this.$confirm(
          '确定要删除该课程嘛？',
          '提示', {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
          console.log(row)
          this.deleteCourse(row.id)
        }).catch(() => {
        })
      },
      async deleteCourse(id){
        let result = await deleteCourse(id)
        if(result.code === 200){
          this.$notify({
            title:"成功",
            message:"删除成功",
            type:'success',
            duration:2000
          })
          this.getCourses()
        }else{
          this.$notify({
            title:"失败",
            message:result.message,
            type:"error",
            duration:2000
          })
        }
      },
    }

  }
</script>

<style>
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
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
