import api from './index.js'

export const courseApi = {
  getCourses(params) {
    return api.get('/api/courses', { params })
  },

  getAll(params) {
    return api.get('/api/courses', { params })
  },

  getById(id) {
    return api.get(`/api/courses/${id}`)
  },

  create(data) {
    return api.post('/api/courses', data)
  },

  // swagger에 존재하지 않음
  // update(id, data) {
  //   return api.put(`/api/courses/${id}`, data)
  // }
}