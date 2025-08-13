import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create(API_CONFIG);

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile/update/', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password/', passwordData);
    return response.data;
  },

  // Check email exists
  checkEmail: async (email) => {
    const response = await api.get(`/auth/check-email/?email=${email}`);
    return response.data;
  },
};

// Course API methods
export const courseAPI = {
  // Get all courses
  getCourses: async (params = {}) => {
    const response = await api.get('/courses/courses/', { params });
    return response.data;
  },

  // Get course by ID
  getCourse: async (id) => {
    try {
      const response = await api.get(`/courses/courses/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(courseData).forEach(key => {
      if (key === 'tags' && Array.isArray(courseData[key])) {
        courseData[key].forEach(tag => formData.append('tags', tag));
      } else if (key === 'image' && courseData[key] instanceof File) {
        formData.append('image', courseData[key]);
      } else if (key === 'syllabus_pdf' && courseData[key] instanceof File) {
        formData.append('syllabus_pdf', courseData[key]);
      } else if (key === 'materials_pdf' && courseData[key] instanceof File) {
        formData.append('materials_pdf', courseData[key]);
      } else if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });

    try {
      const response = await api.post('/courses/courses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createCourse API call:', error);
      // If it's a 500 error, the course might have been created successfully
      if (error.response?.status === 500) {
        // Check if the course was actually created by making a GET request
        try {
          const coursesResponse = await api.get('/courses/courses/');
          const coursesData = coursesResponse.data;
          const coursesArray = Array.isArray(coursesData) ? coursesData : 
                             coursesData.results ? coursesData.results : 
                             coursesData.data ? coursesData.data : [];
          
          // Look for a course with the same title and subtitle
          const createdCourse = coursesArray.find(course => 
            course.title === courseData.title && 
            course.subtitle === courseData.subtitle
          );
          
          if (createdCourse) {
            // Course was created successfully, return it
            return createdCourse;
          }
        } catch (fetchError) {
          console.error('Error fetching courses to verify creation:', fetchError);
        }
      }
      throw error;
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(courseData).forEach(key => {
      if (key === 'tags' && Array.isArray(courseData[key])) {
        courseData[key].forEach(tag => formData.append('tags', tag));
      } else if (key === 'image' && courseData[key] instanceof File) {
        formData.append('image', courseData[key]);
      } else if (key === 'syllabus_pdf' && courseData[key] instanceof File) {
        formData.append('syllabus_pdf', courseData[key]);
      } else if (key === 'materials_pdf' && courseData[key] instanceof File) {
        formData.append('materials_pdf', courseData[key]);
      } else if (courseData[key] !== null && courseData[key] !== undefined && courseData[key] !== '') {
        formData.append(key, courseData[key]);
      }
    });

    try {
      const response = await api.patch(`/courses/courses/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateCourse API call:', error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/courses/${id}/`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/courses/categories/');
      // Ensure we return an array
      const data = response.data;
      return Array.isArray(data) ? data : 
             data.results ? data.results : 
             data.data ? data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get tags
  getTags: async () => {
    const response = await api.get('/courses/tags/');
    return response.data;
  },

  // Search courses
  searchCourses: async (params = {}) => {
    const response = await api.get('/courses/search/', { params });
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

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/courses/${courseId}/enroll/`);
    return response.data;
  },

  // Unenroll from course
  unenrollFromCourse: async (courseId) => {
    const response = await api.post(`/courses/courses/${courseId}/unenroll/`);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/courses/dashboard/stats/');
    return response.data;
  },
};

// Payments API methods
export const paymentAPI = {
  // Create Moyasar hosted payment and get redirect URL
  createMoyasarPayment: async () => {
    const response = await api.post('/store/payment/moyasar/create/');
    return response.data; // { url, invoice }
  },
  
  // Create Moyasar hosted payment for a specific course
  createCoursePayment: async (courseId) => {
    const response = await api.post(`/store/payment/moyasar/course/${courseId}/create/`);
    return response.data; // { url, invoice }
  },
};

export default api;
