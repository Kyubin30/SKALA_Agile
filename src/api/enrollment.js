import api from './index.js'

export const enrollmentApi = {
  getMyEnrollments(assetId) {
    return api.get('/api/enrollments/my', {
      params: assetId ? { assetId } : undefined
    })
  },
  enroll(courseId) {
    return api.post('/api/enrollments', { courseId })
  },
  cancel(enrollmentId) {
    return api.delete(`/api/enrollments/${enrollmentId}`)
  },
  getRecommendations(userId) {
    return api.get(`/api/recommend/${userId}`)
  }
}
