import api from './api.service';

// Quiz API methods
export const quizAPI = {
  // Get all quizzes
  getQuizzes: async (params = {}) => {
    try {
      console.log('Making API call to /assignments/quizzes/');
      const response = await api.get('/assignments/quizzes/', { params });
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Get quiz by ID
  getQuiz: async (id) => {
    try {
      console.log('Fetching quiz with ID:', id);
      const response = await api.get(`/assignments/quizzes/${id}/`);
      console.log('Quiz response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Create new quiz
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/assignments/quizzes/', quizData);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    try {
      const response = await api.patch(`/assignments/quizzes/${id}/`, quizData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    try {
      const response = await api.delete(`/assignments/quizzes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Get quiz questions
  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/assignments/quizzes/${quizId}/questions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  },

  // Create quiz question
  createQuizQuestion: async (questionData) => {
    try {
      const response = await api.post('/assignments/quiz-questions/', questionData);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz question:', error);
      throw error;
    }
  },

  // Update quiz question
  updateQuizQuestion: async (questionId, questionData) => {
    try {
      const response = await api.patch(`/assignments/quiz-questions/${questionId}/`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz question:', error);
      throw error;
    }
  },

  // Delete quiz question
  deleteQuizQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/assignments/quiz-questions/${questionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      throw error;
    }
  },

  // Create quiz answer
  createQuizAnswer: async (answerData) => {
    try {
      console.log('Creating quiz answer with data:', answerData);
      const response = await api.post('/assignments/quiz-answers/', answerData);
      console.log('Quiz answer created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz answer:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update quiz answer
  updateQuizAnswer: async (answerId, answerData) => {
    try {
      const response = await api.patch(`/assignments/quiz-answers/${answerId}/`, answerData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz answer:', error);
      throw error;
    }
  },

  // Delete quiz answer
  deleteQuizAnswer: async (answerId) => {
    try {
      const response = await api.delete(`/assignments/quiz-answers/${answerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz answer:', error);
      throw error;
    }
  },

  // Get quiz attempts
  getQuizAttempts: async (quizId) => {
    try {
      const response = await api.get(`/assignments/quizzes/${quizId}/attempts/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      throw error;
    }
  },

  // Start quiz attempt
  startQuizAttempt: async (quizId) => {
    try {
      const response = await api.post(`/assignments/quizzes/${quizId}/start-attempt/`);
      return response.data;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  },

  // Submit quiz attempt
  submitQuizAttempt: async (attemptId, answers) => {
    try {
      const response = await api.post(`/assignments/quiz-attempts/${attemptId}/submit/`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },

  // Get quiz statistics
  getQuizStatistics: async (quizId) => {
    try {
      const response = await api.get(`/assignments/quiz/${quizId}/statistics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      throw error;
    }
  },

  // Get courses for quiz creation
  getCourses: async () => {
    try {
      console.log('Fetching courses...');
      const response = await api.get('/courses/courses/');
      console.log('Courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get modules for a specific course
  getModules: async (courseId) => {
    try {
      console.log('Fetching modules for course:', courseId);
      const response = await api.get(`/content/modules/`, {
        params: { course_id: courseId }
      });
      console.log('Modules response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },
};

export default quizAPI;
