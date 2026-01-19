import api from '../config/axios'

// Lấy tất cả blog posts
export const getAllBlogPosts = async () => {
  try {
    const response = await api.get('/BlogPost')
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách blog:', error)
    throw error
  }
}

// Lấy blog posts của một trung tâm
export const getCenterBlogPosts = async (centerProfileId) => {
  try {
    const response = await api.get(`/BlogPost/Center/${centerProfileId}`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy blog của trung tâm:', error)
    throw error
  }
}

// Lấy chi tiết một blog post
export const getBlogPostById = async (blogId) => {
  try {
    const response = await api.get(`/BlogPost/${blogId}`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết blog:', error)
    throw error
  }
}

// Tạo blog post mới
export const createBlogPost = async (centerProfileId, blogData) => {
  try {
    const response = await api.post(`/BlogPost/${centerProfileId}`, blogData)
    return response.data
  } catch (error) {
    console.error('Lỗi khi tạo blog:', error)
    throw error
  }
}

// Cập nhật blog post
export const updateBlogPost = async (blogId, blogData) => {
  try {
    const response = await api.put(`/BlogPost/Update/${blogId}`, blogData)
    return response.data
  } catch (error) {
    console.error('Lỗi khi cập nhật blog:', error)
    throw error
  }
}

// Duyệt blog post
export const approveBlogPost = async (blogId) => {
  try {
    const response = await api.put(`/BlogPost/Approve/${blogId}`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi duyệt blog:', error)
    throw error
  }
}

// Từ chối blog post
export const rejectBlogPost = async (blogId, rejectReason = '') => {
  try {
    const response = await api.put(`/BlogPost/Reject/${blogId}`, {
      reason: rejectReason
    })
    return response.data
  } catch (error) {
    console.error('Lỗi khi từ chối blog:', error)
    throw error
  }
}

// Xóa blog post
export const deleteBlogPost = async (blogId) => {
  try {
    const response = await api.delete(`/BlogPost/${blogId}`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi xóa blog:', error)
    throw error
  }
}

// Like blog post
export const likeBlogPost = async (blogId) => {
  try {
    const response = await api.post(`/BlogPost/${blogId}/like`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi like blog:', error)
    throw error
  }
}

// Unlike blog post
export const unlikeBlogPost = async (blogId) => {
  try {
    const response = await api.delete(`/BlogPost/${blogId}/like`)
    return response.data
  } catch (error) {
    console.error('Lỗi khi unlike blog:', error)
    throw error
  }
}

// Comment blog post
export const commentBlogPost = async (blogId, content) => {
  try {
    const response = await api.post(`/BlogPost/${blogId}/comment`, {
      content: content
    })
    return response.data
  } catch (error) {
    console.error('Lỗi khi comment blog:', error)
    throw error
  }
}

// Lấy danh sách comments của blog post
export const getBlogComments = async (blogId, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/BlogPost/${blogId}/comments`, {
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize
      }
    })
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy comments:', error)
    throw error
  }
}