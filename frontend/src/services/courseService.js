import api from './api.service';

// Course API methods
export const courseAPI = {
  // Get all courses with filtering and pagination
  getCourses: async (params = {}) => {
    const response = await api.get('/courses/public/', { params });
    return response.data;
  },

  // Get a specific course by ID
  getCourseById: async (courseId) => {
    const response = await api.get(`/courses/courses/${courseId}/`);
    return response.data;
  },

  // Search courses
  searchCourses: async (query, params = {}) => {
    const response = await api.get('/courses/search/', { 
      params: { query, ...params } 
    });
    return response.data;
  },

  // Get featured courses
  getFeaturedCourses: async () => {
    const response = await api.get('/courses/featured/');
    return response.data;
  },

  // Get popular courses
  getPopularCourses: async () => {
    const response = await api.get('/courses/popular/');
    return response.data;
  },

  // Get recent courses
  getRecentCourses: async () => {
    const response = await api.get('/courses/recent/');
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/courses/categories/');
    return response.data;
  },

  // Get tags
  getTags: async () => {
    const response = await api.get('/courses/tags/');
    return response.data;
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/courses/${courseId}/enroll/`);
    return response.data;
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId) => {
    const response = await api.post(`/courses/courses/${courseId}/unenroll/`);
    return response.data;
  },

  // Get course modules
  getCourseModules: async (courseId) => {
    const response = await api.get(`/courses/courses/${courseId}/modules/`);
    return response.data;
  },

  // Get my courses (enrolled courses)
  getMyCourses: async () => {
    const response = await api.get('/courses/courses/my_courses/');
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/courses/dashboard/stats/');
    return response.data;
  },

  // Get general stats
  getGeneralStats: async () => {
    const response = await api.get('/courses/general/stats/');
    return response.data;
  },

  // Get related courses
  getRelatedCourses: async (courseId) => {
    const response = await api.get(`/courses/courses/${courseId}/related/`);
    return response.data;
  },
};

// Cart API methods (moved from api.service.js)
export const cartAPI = {
  // Get cart items
  getCart: async () => {
    const response = await api.get('/store/cart/');
    return response.data;
  },

  // Add course to cart
  addToCart: async (courseId) => {
    const response = await api.post('/store/cart/items/', { course_id: courseId });
    return response.data;
  },

  // Remove course from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/store/cart/items/${itemId}/`);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const response = await api.patch(`/store/cart/items/${itemId}/`, { quantity });
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/store/cart/');
    return response.data;
  },
};

export default courseAPI; 