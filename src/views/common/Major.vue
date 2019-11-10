<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryList.keyWord" placeholder="搜索专业" clearable style="width: 200px;margin-right: 15px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="queryList.subjectId" clearable style="width: 200px;margin-right: 15px;" class="filter-item" placeholder="请选择">
        <el-option
          v-for="item in subjectList"
          :key="item.id"
          :label="item.name"
          :value="item.id"/>
      </el-select>
      <el-button v-waves class="filter-item" style="margin-right: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 0;margin-right: 10px;" type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">
        添加专业
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="majorList"
      :default-sort = "{prop: 'id', order: 'ascending'}"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" prop="id" sortable align="center" width="120"/>
      <el-table-column label="专业名称" prop="name" align="center" />
      <el-table-column label="所属科目" prop="subjectName" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" />
      <el-table-column label="更新时间" prop="updateTime" align="center" />
      <el-table-column label="操作" align="center" class-name="small-padding" width="220">
        <template slot-scope="{row}">
          <el-button v-waves type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)">
            编辑专业
          </el-button>
          <el-button v-waves type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="page" :limit.sync="pageSize" @pagination="getSubjectList(page,pageSize)" />

    <el-dialog :visible.sync="dialogFormVisible" :title="dialogStatus">
      <el-form ref="dataForm" :model="dataForm" :rules="rules" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="专业名称" prop="name">
          <el-input v-model="dataForm.name" :rows="1" type="textarea" />
        </el-form-item>
        <el-form-item label="所属科目" prop="subjectId">
          <el-select v-model="dataForm.subjectId" clearable placeholder="请选择">
            <el-option
              v-for="item in subjectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
          </el-select>
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
      <back-to-top :custom-style="myBackToTopStyle" :visibility-height="300" :back-position="50" transition-name="fade" />
    </el-tooltip>
  </div>
</template>

<script>
/* eslint-disable */
  import {getMajors, insertMajor,updateMajor,deleteMajor} from '@/api/major'
  import { getSubjectsSimple} from '@/api/subject'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import BackToTop from '@/components/BackToTop'

  export default {
    name: 'Major',
    components: { Pagination, BackToTop },
    directives: { waves },
    data() {
      return {
        subjectList:[
          {
            id:"",
            name:"",
          }
        ],
        majorList:[
          {
            id:"",
            subjectId:"",
            subjectName:"",
            name:"",
            createTime:"",
            updateTime:""
          }
        ],
        queryList:{
          subjectId:"",
          keyWord:"",
          page:1,
          pageSize:10,
        },
        dataForm:{
          majorId:"",
          subjectId:"",
          name:"",
        },
        total:"",
        pages:"",
        listLoading: true,

        rules: {
          name: [{ required: true, message: '专业名称不能为空', trigger: 'blur' }],
          subjectId:[{required:true,message:'科目不能为空',trigger: 'blur'}],
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
      this.getSubjects()
      this.getMajorList(this.queryList)

    },
    methods: {
      //获取subjectList(simple)
      async getSubjects(){
        let result = await  getSubjectsSimple()
        this.subjectList = result.data
      },
      //获取majorList
      async getMajorList(queryList){
        this.listLoading = true
        let result = await getMajors(queryList)
        console.log(result);
        this.majorList = result.data.data
        this.total = result.data.total
        this.pages = result.data.pages
        this.listLoading = false
      },
      //根据条件过滤
      handleFilter(){
        this.getMajorList(this.queryList)
      },
      //新增专业
      handleCreate(){
        this.dialogFormVisible = true;
        this.dialogStatus = "添加"
        this.dataForm = {}
      },
      insert(){
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.insertMajorApi()
          }
        })
      },
      async insertMajorApi(){
        let result = await insertMajor(this.dataForm)
        if (result.code === 200){
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '添加成功',
            type: 'success',
            duration: 2000
          })
          this.getMajorList(this.queryList)
        } else {
          this.$notify({
            title: '失败',
            message: result.message,
            type: 'error',
            duration: 2000
          })
        }
      },

      //删除专业
      handleDelete(row){
        this.$confirm('确定删除该科目吗?', '提示', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          console.log(row);
          this.handleDeleteMajor(row.id)
        }).catch(() => {
        })
      },
      async handleDeleteMajor(id){
        let result = await deleteMajor(id)
        if(result.code === 200){
          if (result.code === 200){
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getMajorList(this.queryList)
          } else {
            this.$notify({
              title: '失败',
              message: result.message,
              type: 'error',
              duration: 2000
            })
          }
        }
      },

      //修改专业
      handleUpdate(row){
        console.log("row:"+row);
        this.dataForm.majorId = row.id
        this.dataForm.name = row.name
        this.dataForm.subjectId = row.subjectId
        this.dialogFormVisible = true;
        this.dialogStatus = "编辑"
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      update(){
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.updateMajorApi()
          }
        })
      },
      async updateMajorApi(){
        console.log(this.dataForm);
        let result = await updateMajor(this.dataForm.majorId,this.dataForm)
        if (result.code === 200){
          this.dialogFormVisible = false
          this.$message({
            message: result.message,
            type: 'success'
          })
          this.getMajorList(this.queryList)
        } else {
          this.$message({
            message: result.message,
            type: 'error'
          })
        }
      },

    }

  }
</script>
