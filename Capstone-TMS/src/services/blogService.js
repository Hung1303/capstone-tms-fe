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

export const createBlogPost = async (centerProfileId, blogData) => {
  try {
    const formData = new FormData()
    
    // Thêm các trường cơ bản
    formData.append('Title', blogData.title)
    formData.append('Content', blogData.content)
    
    if (blogData.courseId) {
      formData.append('CourseId', blogData.courseId)
    }
    
    const allFiles = []
    
    // Thêm các file ảnh
    if (blogData.images && Array.isArray(blogData.images)) {
      blogData.images.forEach((image) => {
        if (image instanceof File) {
          allFiles.push(image)
        }
      })
    }
    
    // Thêm các file video
    if (blogData.videos && Array.isArray(blogData.videos)) {
      blogData.videos.forEach((video) => {
        if (video instanceof File) {
          allFiles.push(video)
        }
      })
    }
    
    // Gửi tất cả file vào field Images
    allFiles.forEach((file) => {
      formData.append('Images', file)
    })
    
    const response = await api.post(`/BlogPost/${centerProfileId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Lỗi khi tạo blog:', error)
    throw error
  }
}

export const updateBlogPost = async (blogId, blogData) => {
  try {
    const formData = new FormData()
    
    // Thêm các trường cơ bản
    formData.append('Title', blogData.title)
    formData.append('Content', blogData.content)
    
    if (blogData.courseId) {
      formData.append('CourseId', blogData.courseId)
    }

    const allFiles = []
    
    // Thêm các file ảnh
    if (blogData.images && Array.isArray(blogData.images)) {
      blogData.images.forEach((image) => {
        if (image instanceof File) {
          allFiles.push(image)
        }
      })
    }
    
    // Thêm các file video
    if (blogData.videos && Array.isArray(blogData.videos)) {
      blogData.videos.forEach((video) => {
        if (video instanceof File) {
          allFiles.push(video)
        }
      })
    }
    
    // Gửi tất cả file vào field Images
    allFiles.forEach((file) => {
      formData.append('Images', file)
    })
    
    const response = await api.put(`/BlogPost/Update/${blogId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
    console.log(' likeBlogPost called with blogId:', blogId)
    const response = await api.post(`/BlogPost/${blogId}/like`)
    console.log(' Like response:', response.data)
    return response.data
  } catch (error) {
    console.error(' Lỗi khi like blog:', error.response?.data || error.message)
    throw error
  }
}

// Unlike blog post
export const unlikeBlogPost = async (blogId) => {
  try {
    console.log(' unlikeBlogPost called with blogId:', blogId)
    const response = await api.delete(`/BlogPost/${blogId}/like`)
    console.log(' Unlike response:', response.data)
    return response.data
  } catch (error) {
    console.error(' Lỗi khi unlike blog:', error.response?.data || error.message)
    throw error
  }
}

// Comment blog post
export const commentBlogPost = async (blogId, content) => {
  try {
    console.log(' commentBlogPost called with blogId:', blogId, 'content:', content)
    const response = await api.post(`/BlogPost/${blogId}/comment`, {
      content: content
    })
    console.log(' Comment response:', response.data)
    return response.data
  } catch (error) {
    console.error(' Lỗi khi comment blog:', error.response?.data || error.message)
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