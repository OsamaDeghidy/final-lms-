import api from './api.service';

// Reviews API service
export const reviewsAPI = {
  // Get course reviews
  getCourseReviews: async (courseId, params = {}) => {
    try {
<<<<<<< HEAD
      const response = await api.get(`/api/reviews/courses/${courseId}/reviews/`, { params });
=======
      const response = await api.get(`/reviews/courses/${courseId}/reviews/`, { params });
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (courseId, reviewData) => {
    try {
      console.log('=== REVIEW SERVICE DEBUG ===');
      console.log('Course ID:', courseId);
      console.log('Review Data:', reviewData);
      console.log('API URL:', `/reviews/reviews/create/${courseId}/`);
      console.log('============================');
      
<<<<<<< HEAD
      const response = await api.post(`/api/reviews/reviews/create/${courseId}/`, reviewData, {
=======
      const response = await api.post(`/reviews/reviews/create/${courseId}/`, reviewData, {
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
<<<<<<< HEAD
      const response = await api.put(`/api/reviews/reviews/${reviewId}/`, reviewData);
=======
      const response = await api.put(`/reviews/reviews/${reviewId}/`, reviewData);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
<<<<<<< HEAD
      const response = await api.delete(`/api/reviews/reviews/${reviewId}/`);
=======
      const response = await api.delete(`/reviews/reviews/${reviewId}/`);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get review details
  getReview: async (reviewId) => {
    try {
<<<<<<< HEAD
      const response = await api.get(`/api/reviews/reviews/${reviewId}/`);
=======
      const response = await api.get(`/reviews/reviews/${reviewId}/`);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  // Get course rating statistics
  getCourseRating: async (courseId) => {
    try {
<<<<<<< HEAD
      const response = await api.get(`/api/reviews/courses/${courseId}/rating/`);
=======
      const response = await api.get(`/reviews/courses/${courseId}/rating/`);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error fetching course rating:', error);
      throw error;
    }
  },

  // Like a review
  likeReview: async (reviewId) => {
    try {
<<<<<<< HEAD
      const response = await api.post(`/api/reviews/reviews/${reviewId}/like/`);
=======
      const response = await api.post(`/reviews/reviews/${reviewId}/like/`);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error liking review:', error);
      throw error;
    }
  },

  // Report a review
  reportReview: async (reviewId, reportData) => {
    try {
<<<<<<< HEAD
      const response = await api.post(`/api/reviews/reviews/${reviewId}/report/`, reportData);
=======
      const response = await api.post(`/reviews/reviews/${reviewId}/report/`, reportData);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  },

  // Get user reviews
  getUserReviews: async (userId) => {
    try {
<<<<<<< HEAD
      const response = await api.get(`/api/reviews/users/${userId}/reviews/`);
=======
      const response = await api.get(`/reviews/users/${userId}/reviews/`);
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  // Get my reviews
  getMyReviews: async () => {
    try {
<<<<<<< HEAD
      const response = await api.get('/api/reviews/my-reviews/');
=======
      const response = await api.get('/reviews/my-reviews/');
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
      return response.data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error;
    }
  }
};
