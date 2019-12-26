## 获取所有路由
$router.options.routes


## sync修饰符
vue 修饰符sync的功能是：当一个子组件改变了一个 prop 的值时，这个变化也会同步到父组件中所绑定。



## 表单
```html
 <el-form ref="dataForm" :model="subject" :rules="rules" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="科目名称" prop="subjectName">
          <el-input v-model="subject.subjectName" :rows="1" type="textarea" />
        </el-form-item>
      </el-form>
```  
表单中，一定要在form中使用 :model绑定一个对象，然后在表单中使用对象中的字段

## 表单验证
在form中绑定rule字段，然后在item中有prop指定的属性就会验证
```
 subject:{
          subjectName:""
        },
rules: {
          subjectName: [{ required: true, message: '科目名称不能为空', trigger: 'blur' }],
        },
```
```js
this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.insertSubject()
          }
        })
```

## element radio回显无效
要使用动态绑定赋值为label
```js
 <el-form-item label="题目类型" prop="type">
          <el-radio v-model="tempQuestion.type" :label="1">单选题</el-radio>
          <el-radio v-model="tempQuestion.type" :label="2">多选题</el-radio>
          <el-radio v-model="tempQuestion.type" :label="3">判断题</el-radio>
```