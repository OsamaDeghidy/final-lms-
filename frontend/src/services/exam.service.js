import api from './api.service.js';

// Exam API methods
export const examAPI = {
  // Get all exams
  getExams: async (params = {}) => {
    try {
      const response = await api.get('/assignments/exams/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  // Get exam by ID
  getExam: async (id) => {
    try {
      const response = await api.get(`/assignments/exams/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      const response = await api.post('/assignments/exams/', examData);
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  // Update exam
  updateExam: async (id, examData) => {
    try {
      const response = await api.patch(`/assignments/exams/${id}/`, examData);
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  // Delete exam
  deleteExam: async (id) => {
    try {
      const response = await api.delete(`/assignments/exams/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },

  // Get exam questions
  getExamQuestions: async (examId) => {
    try {
      const response = await api.get(`/assignments/exams/${examId}/questions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      throw error;
    }
  },

  // Add question to exam
  addQuestion: async (examId, questionData) => {
    try {
      const response = await api.post(`/assignments/exams/${examId}/questions/add/`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(`/assignments/exam-questions/${questionId}/`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/assignments/exam-questions/${questionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Get exam attempts
  getExamAttempts: async (examId) => {
    try {
      const response = await api.get(`/assignments/exams/${examId}/attempts/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
      throw error;
    }
  },

  // Get exam statistics
  getExamStatistics: async (examId) => {
    try {
      const response = await api.get(`/assignments/exams/${examId}/statistics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam statistics:', error);
      throw error;
    }
  },
};

export default examAPI;
