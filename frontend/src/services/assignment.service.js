import api from './api.service';

// Assignments API service
const BASE = '/assignments';

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

  createAssignment: async (data) => {
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

    const response = await api.post(`${BASE}/assignments/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
    const response = await api.get(`${BASE}/assignment-questions/`, {
      params: { assignment: assignmentId },
    });
    return response.data;
  },
  getAssignmentQuestionsWithAnswers: async (assignmentId) => {
    const response = await api.get(`${BASE}/assignments/${assignmentId}/questions/`);
    return response.data;
  },
  createQuestion: async (payload) => {
    // payload: { assignment, text, question_type, points, explanation, order, is_required }
    const response = await api.post(`${BASE}/assignment-questions/`, payload);
    return response.data;
  },
  updateQuestion: async (questionId, payload) => {
    const response = await api.patch(`${BASE}/assignment-questions/${questionId}/`, payload);
    return response.data;
  },
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`${BASE}/assignment-questions/${questionId}/`);
    return response.data;
  },

  // Answers
  getQuestionAnswers: async (questionId) => {
    const response = await api.get(`${BASE}/assignment-answers/`, { params: { question: questionId } });
    return response.data;
  },
  createAnswer: async (payload) => {
    // payload: { question, text, is_correct, explanation, order }
    const response = await api.post(`${BASE}/assignment-answers/`, payload);
    return response.data;
  },
  updateAnswer: async (answerId, payload) => {
    const response = await api.patch(`${BASE}/assignment-answers/${answerId}/`, payload);
    return response.data;
  },
  deleteAnswer: async (answerId) => {
    const response = await api.delete(`${BASE}/assignment-answers/${answerId}/`);
    return response.data;
  },
};

export default assignmentsAPI;


