import api from './api.service';

// Quiz API methods
export const quizAPI = {
  // Get all quizzes for student
  getQuizzes: async (params = {}) => {
    try {
      const response = await api.get('/api/assignments/quizzes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Get quiz by ID with questions and answers
  getQuiz: async (id) => {
    try {
      const response = await api.get(`/api/assignments/quizzes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Get quiz questions
  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/api/assignments/quiz-questions/?quiz=${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  },

  // Start a new quiz attempt
  startQuizAttempt: async (quizId) => {
    try {
      const response = await api.post('/api/assignments/quiz-attempts/', {
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
      console.log('submitQuizAnswers called with:', { attemptId, answers });
      
      // Validate data before sending
      if (!attemptId) {
        throw new Error('Attempt ID is required');
      }
      
      if (!Array.isArray(answers)) {
        throw new Error('Answers must be an array');
      }
      
      // Transform answers to the format expected by the API
      const transformedAnswers = answers.map(answer => ({
        question_id: answer.question_id,
        selected_answer_id: answer.selected_answer_id || null,
        text_answer: answer.text_answer || null
      }));
      
      console.log('Transformed answers:', transformedAnswers);
      
      // Try different API formats
      let response;
      try {
        // First try: send as array of answers
        response = await api.post('/api/assignments/quiz-user-answers/submit_answers/', {
          attempt: attemptId,
          answers: transformedAnswers
        });
      } catch (firstError) {
        console.log('First attempt failed, trying alternative format:', firstError.response?.data);
        
        // Second try: send each answer individually
        response = await api.post('/api/assignments/quiz-user-answers/submit_answers/', {
          attempt: attemptId,
          answers: transformedAnswers
        });
      }
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Finish quiz attempt
  finishQuizAttempt: async (attemptId) => {
    try {
      const response = await api.patch(`/api/assignments/quiz-attempts/${attemptId}/finish/`);
      return response.data;
    } catch (error) {
      console.error('Error finishing quiz attempt:', error);
      throw error;
    }
  },

  // Get quiz attempt result
  getQuizAttemptResult: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/quiz-attempts/${attemptId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt result:', error);
      throw error;
    }
  },

  // Get user's quiz attempts
  getUserQuizAttempts: async (params = {}) => {
    try {
      const response = await api.get('/api/assignments/quiz-attempts/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user quiz attempts:', error);
      throw error;
    }
  },

  // Get quiz attempt answers
  getQuizAttemptAnswers: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/quiz-user-answers/?attempt=${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt answers:', error);
      throw error;
    }
  },

  // Get quiz attempt answers with correct answers for results
  getQuizAttemptResultAnswers: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/quiz-user-answers/result_answers/?attempt=${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt result answers:', error);
      throw error;
    }
  },

  // Get courses for quiz creation/editing
  getCourses: async () => {
    try {
      const response = await api.get('/api/courses/courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get modules for a specific course
  getModules: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/modules/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },

  // Create new quiz
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/api/assignments/quizzes/', quizData);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update quiz
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await api.patch(`/api/assignments/quizzes/${quizId}/`, quizData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete quiz
  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/api/assignments/quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Create quiz question
  createQuizQuestion: async (questionData) => {
    try {
      // Ensure data types are correct
      const cleanData = {
        quiz: parseInt(questionData.quiz),
        text: questionData.text.toString().trim(),
        question_type: questionData.question_type.toString(),
        points: parseInt(questionData.points) || 1,
        explanation: questionData.explanation ? questionData.explanation.toString() : '',
        order: Math.max(0, parseInt(questionData.order) || 0), // Ensure order is non-negative
      };
      
      console.log('🚀 Creating quiz question with clean data:', JSON.stringify(cleanData, null, 2));
      
      // Set content type to JSON explicitly
      const response = await api.post('/api/assignments/quiz-questions/', cleanData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Quiz question created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating quiz question:', error);
      if (error.response && error.response.data) {
        console.error('❌ Server error details:', error.response.data);
      }
      throw error;
    }
  },

  // Update quiz question
  updateQuizQuestion: async (questionId, questionData) => {
    try {
      // Ensure data types are correct
      const cleanData = {
        text: questionData.text.toString().trim(),
        question_type: questionData.question_type.toString(),
        points: parseInt(questionData.points) || 1,
        explanation: questionData.explanation ? questionData.explanation.toString() : '',
        order: Math.max(0, parseInt(questionData.order) || 0), // Ensure order is non-negative
      };
      
      console.log('🔄 Updating quiz question with clean data:', JSON.stringify(cleanData, null, 2));
      
      // Set content type to JSON explicitly
      const response = await api.patch(`/api/assignments/quiz-questions/${questionId}/`, cleanData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('✅ Quiz question updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating quiz question:', error);
      if (error.response && error.response.data) {
        console.error('❌ Server error details:', error.response.data);
      }
      throw error;
    }
  },

  // Delete quiz question
  deleteQuizQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/api/assignments/quiz-questions/${questionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      throw error;
    }
  },

  // Create quiz answer
  createQuizAnswer: async (answerData) => {
    try {
      const response = await api.post('/api/assignments/quiz-answers/', answerData);
      return response.data;
    } catch (error) {
      console.error('Error creating quiz answer:', error);
      throw error;
    }
  },

  // Update quiz answer
  updateQuizAnswer: async (answerId, answerData) => {
    try {
      const response = await api.patch(`/api/assignments/quiz-answers/${answerId}/`, answerData);
      return response.data;
    } catch (error) {
      console.error('Error updating quiz answer:', error);
      throw error;
    }
  },

  // Delete quiz answer
  deleteQuizAnswer: async (answerId) => {
    try {
      const response = await api.delete(`/api/assignments/quiz-answers/${answerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quiz answer:', error);
      throw error;
    }
  },

  // Get question answers
  getQuestionAnswers: async (questionId) => {
    try {
      const response = await api.get(`/api/assignments/quiz-answers/?question=${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question answers:', error);
      throw error;
    }
  }
};

export default quizAPI;
