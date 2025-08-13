import api from './api.service';

// Content (Modules/Lessons) API service
export const contentAPI = {
  // Modules
  getModules: async (courseId) => {
    const response = await api.get('/content/modules/', {
      params: { course_id: courseId, course: courseId }, // backend uses course_id; include course just in case
    });
    return response.data;
  },

  // Lessons CRUD
  getLessons: async ({ moduleId, courseId } = {}) => {
    const response = await api.get('/content/lessons/', {
      params: { module: moduleId, course: courseId },
    });
    return response.data;
  },
  getLessonById: async (lessonId) => {
    const response = await api.get(`/content/lessons/${lessonId}/`);
    return response.data;
  },
  createLesson: async (payload) => {
    const response = await api.post('/content/lessons/', payload);
    return response.data;
  },
  updateLesson: async (lessonId, payload) => {
    const response = await api.patch(`/content/lessons/${lessonId}/`, payload);
    return response.data;
  },
  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/content/lessons/${lessonId}/`);
    return response.data;
  },

  getModuleById: async (moduleId) => {
    const response = await api.get(`/content/modules/${moduleId}/`);
    return response.data;
  },

  createModule: async ({ courseId, name, title, description, order, isActive, status, durationMinutes, videoDurationSeconds, pdfFile, videoFile, note }) => {
    const formData = new FormData();
    formData.append('course', courseId);
    if (name || title) formData.append('name', name || title);
    if (description != null) formData.append('description', description);
    if (typeof order !== 'undefined') formData.append('order', String(order));
    if (typeof isActive !== 'undefined') formData.append('is_active', isActive ? 'true' : 'false');
    if (status) formData.append('status', status); // draft/published/archived
    // The model has video_duration (seconds). Prefer explicit seconds, else convert minutes
    const seconds = typeof videoDurationSeconds === 'number' ? videoDurationSeconds : (typeof durationMinutes === 'number' ? Math.round(durationMinutes * 60) : 0);
    if (seconds) formData.append('video_duration', String(seconds));
    if (note) formData.append('note', note);
    if (videoFile instanceof File) formData.append('video', videoFile);
    if (pdfFile instanceof File) formData.append('pdf', pdfFile);

    const response = await api.post('/content/modules/', formData);
    return response.data;
  },

  updateModule: async (moduleId, { name, title, description, order, isActive, status, durationMinutes, videoDurationSeconds, pdfFile, videoFile, note }) => {
    const formData = new FormData();
    if (name || title) formData.append('name', name || title);
    if (description != null) formData.append('description', description);
    if (typeof order !== 'undefined') formData.append('order', String(order));
    if (typeof isActive !== 'undefined') formData.append('is_active', isActive ? 'true' : 'false');
    if (status) formData.append('status', status);
    const seconds = typeof videoDurationSeconds === 'number' ? videoDurationSeconds : (typeof durationMinutes === 'number' ? Math.round(durationMinutes * 60) : undefined);
    if (typeof seconds !== 'undefined') formData.append('video_duration', String(seconds));
    if (note) formData.append('note', note);
    if (videoFile instanceof File) formData.append('video', videoFile);
    if (pdfFile instanceof File) formData.append('pdf', pdfFile);

    const response = await api.patch(`/content/modules/${moduleId}/`, formData);
    return response.data;
  },

  // Lesson resources
  getLessonResources: async ({ lessonId, moduleId } = {}) => {
    const response = await api.get('/content/resources/', {
      params: { lesson: lessonId, module: moduleId },
    });
    return response.data;
  },
  createLessonResource: async (payload) => {
    // payload: { lesson, title, resource_type, file?, url?, description?, is_public?, order? }
    const form = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v);
    });
    const response = await api.post('/content/resources/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateLessonResource: async (resourceId, payload) => {
    const form = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v);
    });
    const response = await api.patch(`/content/resources/${resourceId}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  deleteLessonResource: async (resourceId) => {
    const response = await api.delete(`/content/resources/${resourceId}/`);
    return response.data;
  },
};

export default contentAPI;


