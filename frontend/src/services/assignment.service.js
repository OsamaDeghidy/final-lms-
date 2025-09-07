import api from './api.service';

// Assignments API service
const BASE = '/api/assignments';

export const assignmentsAPI = {
  // List assignments (can filter by course, is_active, ordering, search)
  getAssignments: async (params = {}) => {
    const response = await api.get(`${BASE}/assignments/`, { params });
    return response.data;
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`${BASE}/assignments/${id}/`);
    return response.data;
  },

  // Get assignment with full details including questions
  getAssignmentWithQuestions: async (id) => {
    const response = await api.get(`${BASE}/assignments/${id}/questions_with_answers/`);
    return response.data;
  },

  // Get assignment submissions
  getAssignmentSubmissions: async (assignmentId) => {
    const response = await api.get(`${BASE}/assignments/${assignmentId}/submissions/`);
    return response.data;
  },

  createAssignment: async (data) => {
    console.log('createAssignment called with data:', data);
    
    // Build FormData to support file upload and booleans
    const form = new FormData();
    const appendIfDefined = (k, v) => {
      if (v !== undefined && v !== null && v !== '') form.append(k, v);
    };
    appendIfDefined('title', data.title);
    appendIfDefined('description', data.description);
    appendIfDefined('course', data.course);
    appendIfDefined('module', data.module);
    appendIfDefined('due_date', data.due_date);
    if (typeof data.duration !== 'undefined') form.append('duration', String(data.duration));
    appendIfDefined('points', data.points);
    if (typeof data.max_attempts !== 'undefined') form.append('max_attempts', String(data.max_attempts));
    if (typeof data.allow_late_submissions !== 'undefined') form.append('allow_late_submissions', data.allow_late_submissions ? 'true' : 'false');
    if (typeof data.late_submission_penalty !== 'undefined') form.append('late_submission_penalty', String(data.late_submission_penalty));
    if (typeof data.has_questions !== 'undefined') form.append('has_questions', data.has_questions ? 'true' : 'false');
    if (typeof data.has_file_upload !== 'undefined') form.append('has_file_upload', data.has_file_upload ? 'true' : 'false');
    if (data.assignment_file instanceof File) form.append('assignment_file', data.assignment_file);
    if (typeof data.is_active !== 'undefined') form.append('is_active', data.is_active ? 'true' : 'false');

    console.log('FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value}`);
    }

    console.log('Making POST request to:', `${BASE}/assignments/`);
    const response = await api.post(`${BASE}/assignments/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Response received:', response.data);
    console.log('Response structure:', {
      hasId: 'id' in response.data,
      idValue: response.data.id,
      keys: Object.keys(response.data),
      type: typeof response.data.id
    });
    return response.data;
  },

  updateAssignment: async (id, data) => {
    // Use FormData when updating to support file changes and booleans
    const form = new FormData();
    const appendIfDefined = (k, v) => {
      if (v !== undefined && v !== null && v !== '') form.append(k, v);
    };
    appendIfDefined('title', data.title);
    appendIfDefined('description', data.description);
    appendIfDefined('course', data.course);
    appendIfDefined('module', data.module);
    appendIfDefined('due_date', data.due_date);
    if (typeof data.duration !== 'undefined') form.append('duration', String(data.duration));
    appendIfDefined('points', data.points);
    if (typeof data.max_attempts !== 'undefined') form.append('max_attempts', String(data.max_attempts));
    if (typeof data.allow_late_submissions !== 'undefined') form.append('allow_late_submissions', data.allow_late_submissions ? 'true' : 'false');
    if (typeof data.late_submission_penalty !== 'undefined') form.append('late_submission_penalty', String(data.late_submission_penalty));
    if (typeof data.has_questions !== 'undefined') form.append('has_questions', data.has_questions ? 'true' : 'false');
    if (typeof data.has_file_upload !== 'undefined') form.append('has_file_upload', data.has_file_upload ? 'true' : 'false');
    if (data.assignment_file instanceof File) form.append('assignment_file', data.assignment_file);
    if (typeof data.is_active !== 'undefined') form.append('is_active', data.is_active ? 'true' : 'false');

    const response = await api.patch(`${BASE}/assignments/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAssignment: async (id) => {
    const response = await api.delete(`${BASE}/assignments/${id}/`);
    return response.data;
  },

  // Questions
  getAssignmentQuestions: async (assignmentId) => {
    const response = await api.get(`${BASE}/questions/`, {
      params: { assignment: assignmentId },
    });
    return response.data;
  },
  getAssignmentQuestionsWithAnswers: async (assignmentId) => {
    const response = await api.get(`${BASE}/questions/`, {
      params: { assignment: assignmentId },
    });
    return response.data;
  },
  createQuestion: async (payload) => {
    // payload: { assignment, text, question_type, points, explanation, order, is_required, file }
    console.log('createQuestion called with payload:', payload);
    
    const form = new FormData();
    
    // Add all text fields
    if (payload.assignment) form.append('assignment', payload.assignment);
    if (payload.text) form.append('text', payload.text);
    if (payload.question_type) form.append('question_type', payload.question_type);
    if (payload.points) form.append('points', payload.points);
    if (payload.explanation) form.append('explanation', payload.explanation);
    if (payload.order) form.append('order', payload.order);
    if (payload.is_required !== undefined) form.append('is_required', payload.is_required);
    
    // Add file if present
    if (payload.file instanceof File) {
      form.append('image', payload.file);
    }

    console.log('Question FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value}`);
    }

    console.log('Making POST request to:', `${BASE}/questions/`);
    const response = await api.post(`${BASE}/questions/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Question creation response:', response.data);
    return response.data;
  },
  updateQuestion: async (questionId, payload) => {
    const response = await api.patch(`${BASE}/questions/${questionId}/`, payload);
    return response.data;
  },
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`${BASE}/questions/${questionId}/`);
    return response.data;
  },

  // Answers
  getQuestionAnswers: async (questionId) => {
    const response = await api.get(`${BASE}/answers/`, { params: { question: questionId } });
    return response.data;
  },
  createAnswer: async (payload) => {
    // payload: { question, text, is_correct, explanation, order }
    console.log('createAnswer called with payload:', payload);
    
    // Create FormData for the answer
    const form = new FormData();
    if (payload.question) form.append('question', payload.question);
    if (payload.text) form.append('text', payload.text);
    if (payload.is_correct !== undefined) form.append('is_correct', payload.is_correct);
    if (payload.explanation) form.append('explanation', payload.explanation);
    if (payload.order) form.append('order', payload.order);
    
    console.log('Answer FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    const response = await api.post(`${BASE}/answers/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Answer creation response:', response.data);
    return response.data;
  },
  updateAnswer: async (answerId, payload) => {
    const response = await api.patch(`${BASE}/answers/${answerId}/`, payload);
    return response.data;
  },
  deleteAnswer: async (answerId) => {
    const response = await api.delete(`${BASE}/answers/${answerId}/`);
    return response.data;
  },

  // Submissions
  getSubmissions: async (params = {}) => {
    const response = await api.get(`${BASE}/submissions/`, { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await api.get(`${BASE}/submissions/${id}/`);
    return response.data;
  },

  createSubmission: async (payload) => {
    // payload: { assignment, submission_text, submitted_file, question_responses }
    const form = new FormData();
    if (payload.assignment) form.append('assignment', payload.assignment);
    if (payload.submission_text) form.append('submission_text', payload.submission_text);
    if (payload.submitted_file) form.append('submitted_file', payload.submitted_file);

    // Add question responses if present
    if (payload.question_responses && Array.isArray(payload.question_responses)) {
      console.log('Question responses before JSON.stringify:', payload.question_responses);  // Debug log
      
      // Convert to JSON string for proper handling
      form.append('question_responses', JSON.stringify(payload.question_responses));
      
      // Also add individual files for question responses
      payload.question_responses.forEach((response, index) => {
        if (response.file_answer) {
          form.append(`question_responses[${index}][file_answer]`, response.file_answer);
        }
      });
    }

    console.log('FormData contents:');  // Debug log
    for (let [key, value] of form.entries()) {
      console.log(`${key}: ${value}`);  // Debug log
    }

    const response = await api.post(`${BASE}/submissions/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Grade submission
  gradeSubmission: async (submissionId, gradeData) => {
    // gradeData: { grade, feedback, status }
    const response = await api.patch(`${BASE}/submissions/${submissionId}/grade/`, gradeData);
    return response.data;
  },

  updateSubmission: async (id, payload) => {
    const response = await api.patch(`${BASE}/submissions/${id}/`, payload);
    return response.data;
  },

  deleteSubmission: async (id) => {
    const response = await api.delete(`${BASE}/submissions/${id}/`);
    return response.data;
  },

  // Additional helper methods
  downloadAssignmentFile: async (assignmentId) => {
    const response = await api.get(`${BASE}/assignments/${assignmentId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  downloadSubmissionFile: async (submissionId) => {
    const response = await api.get(`${BASE}/submissions/${submissionId}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get assignment statistics
  getAssignmentStats: async (assignmentId) => {
    const response = await api.get(`${BASE}/assignments/${assignmentId}/statistics/`);
    return response.data;
  },

  // Get user's assignment submissions
  getMySubmissions: async (params = {}) => {
    const response = await api.get(`${BASE}/submissions/my/`, { params });
    return response.data;
  },

  // Get teacher's assignments
  getTeacherAssignments: async (params = {}) => {
    const response = await api.get(`${BASE}/assignments/teacher/`, { params });
    return response.data;
  },

  // Get student's assignments
  getStudentAssignments: async (params = {}) => {
    const response = await api.get(`${BASE}/assignments/student/`, { params });
    return response.data;
  },
};

export default assignmentsAPI;


