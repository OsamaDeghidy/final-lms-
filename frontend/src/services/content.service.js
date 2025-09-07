import api from './api.service';

// Content (Modules/Lessons) API service
export const contentAPI = {
  // Modules
  getModules: async (courseId) => {
    const response = await api.get('/api/content/modules/', {
      params: { course_id: courseId, course: courseId }, // backend uses course_id; include course just in case
    });
    return response.data;
  },

  // Lessons CRUD
  getLessons: async ({ moduleId, courseId } = {}) => {
    const response = await api.get('/api/content/lessons/', {
      params: { module: moduleId, course: courseId },
    });
    return response.data;
  },
  getLessonById: async (lessonId) => {
    const response = await api.get(`/api/content/lessons/${lessonId}/`);
    return response.data;
  },
  createLesson: async (payload) => {
    try {
      console.log('Creating lesson with payload:', payload);
      const response = await api.post('/api/content/lessons/', payload);
      console.log('Lesson created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data) {
        const errorMessage = error.response.data.error || 
                           error.response.data.details || 
                           error.response.data.message ||
                           'حدث خطأ أثناء إنشاء الدرس';
        throw new Error(errorMessage);
      }
      throw new Error('حدث خطأ أثناء إنشاء الدرس');
    }
  },
  updateLesson: async (lessonId, payload) => {
    const response = await api.patch(`/api/content/lessons/${lessonId}/`, payload);
    return response.data;
  },
  deleteLesson: async (lessonId) => {
    const response = await api.delete(`/api/content/lessons/${lessonId}/`);
    return response.data;
  },

  getModuleById: async (moduleId) => {
      const response = await api.get(`/api/content/modules/${moduleId}/`);
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
    if (videoFile && videoFile instanceof File) formData.append('video', videoFile);
    if (pdfFile && pdfFile instanceof File) formData.append('pdf', pdfFile);

    const response = await api.post('/api/content/modules/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    if (videoFile && videoFile instanceof File) formData.append('video', videoFile);
    if (pdfFile && pdfFile instanceof File) formData.append('pdf', pdfFile);

    const response = await api.patch(`/api/content/modules/${moduleId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Lesson resources
  getLessonResources: async ({ lessonId, moduleId } = {}) => {
    const response = await api.get('/api/content/resources/', {
      params: { lesson: lessonId, module: moduleId },
    });
    return response.data;
  },
  createLessonResource: async (payload) => {
    // payload: { lesson, title, resource_type, file?, url?, description?, is_public?, order? }
    try {
      console.log('Creating lesson resource with payload:', payload);
      
      const form = new FormData();
      Object.entries(payload || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          console.log(`Adding to FormData: ${k} = ${v}`);
          form.append(k, v);
        }
      });
      
      console.log('FormData entries:');
      for (let [key, value] of form.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      const response = await api.post('/api/content/resources/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating lesson resource:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data) {
        const errorMessage = error.response.data.error || 
                           error.response.data.details || 
                           error.response.data.message ||
                           'حدث خطأ أثناء إنشاء المورد';
        throw new Error(errorMessage);
      }
      throw new Error('حدث خطأ أثناء إنشاء المورد');
    }
  },
  updateLessonResource: async (resourceId, payload) => {
    try {
      const form = new FormData();
      Object.entries(payload || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v);
      });
      const response = await api.patch(`/api/content/resources/${resourceId}/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lesson resource:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.error || error.response.data.details || 'حدث خطأ أثناء تحديث المورد');
      }
      throw new Error('حدث خطأ أثناء تحديث المورد');
    }
  },
  deleteLessonResource: async (resourceId) => {
    try {
      const response = await api.delete(`/api/content/resources/${resourceId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lesson resource:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.error || error.response.data.details || 'حدث خطأ أثناء حذف المورد');
      }
      throw new Error('حدث خطأ أثناء حذف المورد');
    }
  },
};

export default contentAPI;


