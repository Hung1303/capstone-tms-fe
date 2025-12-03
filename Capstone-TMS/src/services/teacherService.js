import api from '../config/axios'

// Lấy danh sách giáo viên của trung tâm
export const getTeachersByCenter = async (centerId, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/Users/${centerId}/Teachers?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    return response.data
  } catch (error) {
    console.error('Error fetching teachers:', error)
    throw error
  }
}

// Lấy chi tiết giáo viên
export const getTeacherById = async (teacherId) => {
  try {
    const response = await api.get(`/Teachers/${teacherId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching teacher:', error)
    throw error
  }
}

// Thêm giáo viên mới
export const createTeacher = async (teacherData) => {
  try {
    const response = await api.post('/Teachers', teacherData)
    return response.data
  } catch (error) {
    console.error('Error creating teacher:', error)
    throw error
  }
}

// Cập nhật thông tin giáo viên
export const updateTeacher = async (teacherId, teacherData) => {
  try {
    const response = await api.put(`/Teachers/${teacherId}`, teacherData)
    return response.data
  } catch (error) {
    console.error('Error updating teacher:', error)
    throw error
  }
}

// Xóa giáo viên
export const deleteTeacher = async (teacherId) => {
  try {
    const response = await api.delete(`/Teachers/${teacherId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting teacher:', error)
    throw error
  }
}

// Lấy danh sách môn học
export const getSubjects = async () => {
  try {
    const response = await api.get('/Subject')
    return response.data
  } catch (error) {
    console.error('Error fetching subjects:', error)
    throw error
  }
}