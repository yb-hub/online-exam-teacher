import ajax from '@/config/ajax'
const BASE_URL = 'http://localhost:8008'

export const getMajors = (queryList) => ajax(BASE_URL + '/majors', { 'name': queryList.keyWord, 'subjectId': queryList.subjectId, 'page': queryList.page, 'pageSize': queryList.pageSize }, 'GET')

export const insertMajor = (major) => ajax(BASE_URL + '/majors', major, 'POST')

export const deleteMajor = (id) => ajax(BASE_URL + '/majors/' + id, {}, 'DELETE')

export const updateMajor = (id, major) => ajax(BASE_URL + '/majors/' + id, major, 'PUT')
