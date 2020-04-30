import ajax from '@/config/ajax'
 // const BASE_URL = process.env.BASE_API
const BASE_URL = 'http://localhost:8008'

// 获取全部学生信息
export const reqGetStudentsList = () => ajax(BASE_URL + '/getStudentsList')
// 请求搜索学生信息
export const reqUpdateStudentInfo = (row) => ajax(BASE_URL + '/updateStudentInfo', row, 'POST')
// 请求更新学生登录状态
export const reqSearchStudentsList = (sno, stuName, stuSex) => ajax(BASE_URL + '/searchStudentInfo', { sno, stuName, stuSex })
// 请求添加学生信息
export const reqInsertStudentInfo = (temp) => ajax(BASE_URL + '/insertStudentInfo', temp, 'POST')

// 获取全部成绩信息
export const reqGetScoresList = () => ajax(BASE_URL + '/getScoresList')
// 请求删除成绩
export const reqDeleteScore = (row) => ajax(BASE_URL + '/deleteScore', row, 'POST')
// 请求搜索成绩信息
export const reqSearchScoresList = (sno, paperId) => ajax(BASE_URL + '/searchScoresList', { sno, paperId })

// 获取全部已发布试卷信息
export const reqGetPapersList = () => ajax(BASE_URL + '/getPapersList')
// 请求获取成绩图标数据
export const reqGetChartData = (paperId) => ajax(BASE_URL + '/getChartData', { paperId })

// 插入上传学生信息数据
export const reqInsertStudentInfoList = (studentList) => ajax(BASE_URL + '/insertStudentInfoList', { studentList }, 'POST')

// -----------------------------
//新增学生信息
export const insertStudent = (studentInfo) => ajax(BASE_URL + '/teacher/student',{'studentId':studentInfo.studentId,'name':studentInfo.name,
'password':studentInfo.password,'phoneNumber':studentInfo.phoneNumber,'sex':studentInfo.sex,'email':studentInfo.email},'POST')
//批量新增学生信息
export const insertStudentList = (studentList) => ajax(BASE_URL + '/teacher/student/list',{studentList},'POST')
//获取学生列表
export const getStudentList = (listQuery) => ajax(BASE_URL + '/teacher/student',{'page':listQuery.page,'limit':listQuery.limit,'studentId':listQuery.studentId,'name':listQuery.name})
//修改学生状态
export const updateStudent = (studentId,status) => ajax(BASE_URL + '/teacher/student/'+studentId,{'isDelete':status},'PUT')
//获取学生的考试结果
export const getExamResult = (listQuery) =>ajax(BASE_URL + '/teacher/examresult',{'studentId':listQuery.studentId,'paperId':listQuery.paperId,'page':listQuery.page,'limit':listQuery.limit})
//获取试卷simple列表
export const getPaperList = ()=>ajax(BASE_URL + '/teacher/paper/simple',{})
