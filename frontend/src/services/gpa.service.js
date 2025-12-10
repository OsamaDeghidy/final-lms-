import api from './api.service.js';

// GPA API methods
export const gpaAPI = {
  // Get all GPA records
  getGPAs: async (params = {}) => {
    try {
      const response = await api.get('/api/users/gpa/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching GPAs:', error);
      throw error;
    }
  },

  // Get GPA by ID
  getGPA: async (id) => {
    try {
      const response = await api.get(`/api/users/gpa/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching GPA:', error);
      throw error;
    }
  },

  // Get GPA for a specific student
  getStudentGPA: async (studentId) => {
    try {
      const response = await api.get('/api/users/gpa/', {
        params: { student: studentId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching student GPA:', error);
      throw error;
    }
  },

  // Get GPA for a specific course
  getCourseGPA: async (courseId) => {
    try {
      const response = await api.get('/api/users/gpa/', {
        params: { course: courseId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course GPA:', error);
      throw error;
    }
  },

  // Create new GPA record
  createGPA: async (gpaData) => {
    try {
      const response = await api.post('/api/users/gpa/', gpaData);
      return response.data;
    } catch (error) {
      console.error('Error creating GPA:', error);
      throw error;
    }
  },

  // Update GPA record
  updateGPA: async (id, gpaData) => {
    try {
      const response = await api.patch(`/api/users/gpa/${id}/`, gpaData);
      return response.data;
    } catch (error) {
      console.error('Error updating GPA:', error);
      throw error;
    }
  },

  // Delete GPA record (admin only)
  deleteGPA: async (id) => {
    try {
      const response = await api.delete(`/api/users/gpa/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting GPA:', error);
      throw error;
    }
  },
};

export default gpaAPI;

