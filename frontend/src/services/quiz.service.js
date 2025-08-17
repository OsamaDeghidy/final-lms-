import api from './api.service';

// Quiz API methods
export const quizAPI = {
  // Get all quizzes for student
  getQuizzes: async (params = {}) => {
    try {
      const response = await api.get('/assignments/quizzes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Get quiz by ID with questions and answers
  getQuiz: async (id) => {
    try {
      const response = await api.get(`/assignments/quizzes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Get quiz questions
  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/assignments/quiz-questions/?quiz=${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  },

  // Start a new quiz attempt
  startQuizAttempt: async (quizId) => {
    try {
      const response = await api.post('/assignments/quiz-attempts/', {
        quiz: quizId
      });
      return response.data;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  },

  // Submit quiz answers
  submitQuizAnswers: async (attemptId, answers) => {
    try {
      const response = await api.post('/assignments/quiz-user-answers/submit_answers/', {
        attempt: attemptId,
        answers: answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      throw error;
    }
  },

  // Finish quiz attempt
  finishQuizAttempt: async (attemptId) => {
    try {
      const response = await api.patch(`/assignments/quiz-attempts/${attemptId}/finish/`);
      return response.data;
    } catch (error) {
      console.error('Error finishing quiz attempt:', error);
      throw error;
    }
  },

  // Get quiz attempt result
  getQuizAttemptResult: async (attemptId) => {
    try {
      const response = await api.get(`/assignments/quiz-attempts/${attemptId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt result:', error);
      throw error;
    }
  },

  // Get user's quiz attempts
  getUserQuizAttempts: async (params = {}) => {
    try {
      const response = await api.get('/assignments/quiz-attempts/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error);
      throw error;
    }
  },

  // Get quiz attempt answers
  getQuizAttemptAnswers: async (attemptId) => {
    try {
      const response = await api.get(`/assignments/quiz-user-answers/?attempt=${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt answers:', error);
      throw error;
    }
  }
};

export default quizAPI;
