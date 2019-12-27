import ajax from '@/config/ajax'
const BASE_URL = 'http://localhost:8008'

export const getQuestions = (queryList) => ajax(BASE_URL + '/questions', { 'keyWord': queryList.keyWord, 'courseId': queryList.courseId, 'page': queryList.page, 'pageSize': queryList.pageSize, 'sort': queryList.sort }, 'GET')

export const insertQuestions = (question) => ajax(BASE_URL + '/questions', question, 'POST')

export const updateQuestions = (id, question) => ajax(BASE_URL + '/questions/' + id, question, 'PUT')

export const deleteQuestions = (id) => ajax(BASE_URL + '/questions/' + id, {}, 'DELETE')

export const insertQuestionList = (questionList) => ajax(BASE_URL + '/questions/list', questionList, 'POST')
