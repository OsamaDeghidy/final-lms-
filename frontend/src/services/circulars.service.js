import api from './api.service';

const BASE = '/api/circulars/circulars/';

// Normalize paginated responses to always return an array
export const listCirculars = async () => {
  const { data } = await api.get(BASE, { params: { page: 1, page_size: 100 } });
  return Array.isArray(data) ? data : (data?.results || []);
};

export const getCircular = async (id) => {
  const { data } = await api.get(`${BASE}${id}/`);
  return data;
};

export const createCircular = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

export const updateCircular = async (id, payload) => {
  const { data } = await api.put(`${BASE}${id}/`, payload);
  return data;
};

export const deleteCircular = async (id) => {
  const { data } = await api.delete(`${BASE}${id}/`);
  return data;
};

export const sendCircular = async (id) => {
  const { data } = await api.post(`${BASE}${id}/send/`, {});
  return data;
};

export const listHomepageCirculars = async () => {
  const { data } = await api.get(`${BASE}homepage/`);
  return data;
};