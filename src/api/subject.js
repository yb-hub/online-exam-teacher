import ajax from '@/config/ajax'
const BASE_URL = 'http://localhost:8008'

export const getSubjects = (page, pageSize) => ajax(BASE_URL + '/subjects', { page, pageSize })

export const insertSubject = (subject) => ajax(BASE_URL + '/subjects', subject, 'POST')

export const updateSubject = (subject) => ajax(BASE_URL + '/subjects/' + subject.id, subject, 'PUT')

