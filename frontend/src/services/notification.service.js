import api from './api.service';

const notificationAPI = {
  // Banner Notifications
  getBannerNotifications: async (page = 'home', dashboardType = null) => {
    const params = { page };
    if (dashboardType) {
      params.dashboard_type = dashboardType;
    }
    const response = await api.get('/api/notifications/banner-list/', { params });
    return response.data;
  },

  // Regular Notifications
  getNotifications: async (filters = {}) => {
    const response = await api.get('/api/notifications/', { params: filters });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/notifications/unread-count/');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.post(`/api/notifications/${notificationId}/mark_read/`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/api/notifications/mark_all_read/');
    return response.data;
  },

  // Create Notification (for instructors/admins)
  createNotification: async (data) => {
    const response = await api.post('/api/notifications/', data);
    return response.data;
  },

  // Banner Notification Management
  createBannerNotification: async (data) => {
    const response = await api.post('/api/notifications/banner/', data);
    return response.data;
  },

  updateBannerNotification: async (id, data) => {
    const response = await api.patch(`/api/notifications/banner/${id}/`, data);
    return response.data;
  },

  deleteBannerNotification: async (id) => {
    const response = await api.delete(`/api/notifications/banner/${id}/`);
    return response.data;
  },

  sendBannerNotification: async (id) => {
    const response = await api.post(`/api/notifications/banner/${id}/send_now/`);
    return response.data;
  },

  // Attendance Penalties
  getAttendancePenalties: async () => {
    const response = await api.get('/api/notifications/attendance-penalties/');
    return response.data;
  },

  createAttendancePenalty: async (data) => {
    const response = await api.post('/api/notifications/attendance-penalties/', data);
    return response.data;
  },

  updateAttendancePenalty: async (id, data) => {
    const response = await api.patch(`/api/notifications/attendance-penalties/${id}/`, data);
    return response.data;
  },

  deleteAttendancePenalty: async (id) => {
    const response = await api.delete(`/api/notifications/attendance-penalties/${id}/`);
    return response.data;
  },

  // Student Attendance
  getStudentAttendance: async (filters = {}) => {
    const response = await api.get('/api/notifications/student-attendance/', { params: filters });
    return response.data;
  },
};

export default notificationAPI;


