import ajax from '@/config/ajax'
const BASE_URL = 'http://localhost:8008'

export const getSubjects = (name, page, pageSize) => ajax(BASE_URL + '/subjects', { name, page, pageSize })

export const insertSubject = (subject) => ajax(BASE_URL + '/subjects', subject, 'POST')

export const updateSubject = (subject) => ajax(BASE_URL + '/subjects/' + subject.id, subject, 'PUT')

export const deleteSubject = (subjectId) => ajax(BASE_URL + '/subjects/' + subjectId, {}, 'DELETE')
