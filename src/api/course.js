import ajax from '@/config/ajax'
const BASE_URL = 'http://localhost:8008'

export const getCourses = (queryList) => ajax(BASE_URL + '/courses', { 'name': queryList.keyWord, 'majorId': queryList.majorId, 'page': queryList.page, 'pageSize': queryList.pageSize }, 'GET')

export const insertCourse = (course) => ajax(BASE_URL + '/courses', course, 'POST')

export const deleteCourse = (id) => ajax(BASE_URL + '/courses/' + id, {}, 'DELETE')

export const updateCourse = (id, major) => ajax(BASE_URL + '/courses/' + id, major, 'PUT')
