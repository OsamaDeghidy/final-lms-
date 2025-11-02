import api from './api.service';

const BASE = '/api/divisions/divisions/';

// Normalize paginated responses to always return an array
export const listDivisions = async () => {
  const { data } = await api.get(BASE, { params: { page: 1, page_size: 100 } });
  return Array.isArray(data) ? data : (data?.results || []);
};

export const createDivision = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

export const updateDivision = async (id, payload) => {
  const { data } = await api.put(`${BASE}${id}/`, payload);
  return data;
};

export const deleteDivision = async (id) => {
  const { data } = await api.delete(`${BASE}${id}/`);
  return data;
};

export const getDivisionStudents = async (id) => {
  const { data } = await api.get(`${BASE}${id}/students/`);
  return data;
};

export const addDivisionStudents = async (id, studentIds) => {
  const { data } = await api.post(`${BASE}${id}/add_students/`, { student_ids: studentIds });
  return data;
};

export const removeDivisionStudents = async (id, studentIds) => {
  const { data } = await api.post(`${BASE}${id}/remove_students/`, { student_ids: studentIds });
  return data;
};