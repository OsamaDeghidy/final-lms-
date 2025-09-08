import api from './api.service.js';

// Exam API methods
export const examAPI = {
  // Get all exams
  getExams: async (params = {}) => {
    try {
      const response = await api.get('/api/assignments/exams/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },

  // Get exam by ID
  getExam: async (id) => {
    try {
      const response = await api.get(`/api/assignments/exams/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

  // Create new exam
  createExam: async (examData) => {
    try {
      const response = await api.post('/api/assignments/exams/', examData);
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },

  // Update exam
  updateExam: async (id, examData) => {
    try {
      const response = await api.patch(`/api/assignments/exams/${id}/`, examData);
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },

  // Delete exam
  deleteExam: async (id) => {
    try {
      const response = await api.delete(`/api/assignments/exams/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  },

  // Get exam questions
  getExamQuestions: async (examId) => {
    try {
      const response = await api.get('/api/assignments/exam-questions/', {
        params: { exam: examId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      throw error;
    }
  },

  // Get exam question answers
  getExamQuestionAnswers: async (questionId) => {
    try {
      const response = await api.get('/api/assignments/exam-answers/', {
        params: { question: questionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam question answers:', error);
      throw error;
    }
  },

  // Create exam answer
  createExamAnswer: async (answerData) => {
    try {
      const formData = new FormData();
      formData.append('question', answerData.question);
      formData.append('text', answerData.text || '');
      formData.append('is_correct', answerData.is_correct || false);
      formData.append('explanation', answerData.explanation || '');
      formData.append('order', answerData.order || 0);
      
      const response = await api.post('/api/assignments/exam-answers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating exam answer:', error);
      throw error;
    }
  },

  // Update exam answer
  updateExamAnswer: async (answerId, answerData) => {
    try {
      const formData = new FormData();
      formData.append('text', answerData.text || '');
      formData.append('is_correct', answerData.is_correct || false);
      formData.append('explanation', answerData.explanation || '');
      formData.append('order', answerData.order || 0);
      
      const response = await api.put(`/api/assignments/exam-answers/${answerId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating exam answer:', error);
      throw error;
    }
  },

  // Delete exam answer
  deleteExamAnswer: async (answerId) => {
    try {
      const response = await api.delete(`/api/assignments/exam-answers/${answerId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting exam answer:', error);
      throw error;
    }
  },

  // Add question to exam
  addQuestion: async (examId, questionData) => {
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('exam', examId);
      formData.append('text', questionData.text || '');
      formData.append('question_type', questionData.question_type || 'essay');
      formData.append('points', questionData.points || 10);
      formData.append('explanation', questionData.explanation || '');
      formData.append('order', questionData.order || 1);
      
      // Add image if exists
      if (questionData.image) {
        formData.append('image', questionData.image);
      }
      
      const response = await api.post('/api/assignments/exam-questions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('text', questionData.text || '');
      formData.append('question_type', questionData.question_type || 'essay');
      formData.append('points', questionData.points || 10);
      formData.append('explanation', questionData.explanation || '');
      formData.append('order', questionData.order || 1);
      
      // Add image if exists
      if (questionData.image) {
        formData.append('image', questionData.image);
      }
      
      const response = await api.put(`/api/assignments/exam-questions/${questionId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    try {
      const response = await api.delete(`/api/assignments/exam-questions/${questionId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Get exam attempts
  getExamAttempts: async (examId) => {
    try {
      const response = await api.get(`/api/assignments/exams/${examId}/attempts/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
      throw error;
    }
  },

  // Get exam statistics
  getExamStatistics: async (examId) => {
    try {
      const response = await api.get(`/api/assignments/exams/${examId}/statistics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam statistics:', error);
      throw error;
    }
  },

  // Start exam attempt
  startExamAttempt: async (examId) => {
    try {
      console.log('examAPI.startExamAttempt called with examId:', examId);
      const response = await api.post('/api/assignments/exam-attempts/', {
        exam: examId
      });
      console.log('examAPI.startExamAttempt response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting exam attempt:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Submit exam answers
  submitExamAnswers: async (attemptId, answers) => {
    try {
      console.log('examAPI.submitExamAnswers called with:', { attemptId, answers });
      const response = await api.post('/api/assignments/exam-user-answers/submit_answers/', {
        attempt: attemptId,
        answers: answers
      });
      console.log('examAPI.submitExamAnswers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting exam answers:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Finish exam attempt
  finishExamAttempt: async (attemptId) => {
    try {
      console.log('examAPI.finishExamAttempt called with:', { attemptId });
      const response = await api.patch(`/api/assignments/exam-attempts/${attemptId}/finish/`);
      console.log('examAPI.finishExamAttempt response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error finishing exam attempt:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Get exam attempt result
  getExamAttemptResult: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/exam-attempts/${attemptId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam attempt result:', error);
      throw error;
    }
  },

  // Get exam attempt answers
  getExamAttemptAnswers: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/exam-user-answers/?attempt=${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam attempt answers:', error);
      throw error;
    }
  },

  // Get exam attempt answers with correct answers for results
  getExamAttemptResultAnswers: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/exam-user-answers/result_answers/?attempt=${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam attempt result answers:', error);
      throw error;
    }
  },

  // Get exam attempt answers for review
  getExamAttemptAnswers: async (attemptId) => {
    try {
      const response = await api.get(`/api/assignments/exam-user-answers/?attempt=${attemptId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam attempt answers:', error);
      throw error;
    }
  },
};

export default examAPI;
