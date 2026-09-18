import api from './api';

const getFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

// Create post with text + images + video
export const createPost = (data) => {
  const formData = getFormData(data);
  return api.post('/posts', formData);
};

export const getFeed = (page = 1, postType = 'all', courseCode = '') => 
  api.get(`/posts/feed?page=${page}&postType=${postType}&courseCode=${encodeURIComponent(courseCode)}`);

export const getAllPosts = (page = 1, postType = 'all', courseCode = '', search = '') => 
  api.get(`/posts/all?page=${page}&postType=${postType}&courseCode=${encodeURIComponent(courseCode)}&search=${encodeURIComponent(search)}`);

export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
export const getPost = (id) => api.get(`/posts/${id}`);
export const updatePost = (id, data) => {
  const formData = getFormData(data);
  return api.put(`/posts/${id}`, formData);
};
export const deletePost = (id) => api.delete(`/posts/${id}`);

export const toggleLike = (id) => api.put(`/posts/${id}/like`);
export const sharePost = (id) => api.put(`/posts/${id}/share`);
export const savePost = (id) => api.put(`/posts/${id}/save`);
export const getSavedPosts = () => api.get('/posts/saved/all');

export const addComment = (postId, comment) => api.post(`/posts/${postId}/comments`, { comment });
export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const markBestAnswer = (postId, commentId) => api.put(`/posts/${postId}/comments/${commentId}/best-answer`);
export const toggleCommentUpvote = (commentId) => api.put(`/posts/comments/${commentId}/upvote`);
