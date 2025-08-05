export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',
  },
  COURSES: {
    BASE: '/courses',
    POPULAR: '/courses/popular',
    FEATURED: '/courses/featured',
  },
  USERS: {
    BASE: '/users',
    ENROLLMENTS: '/users/enrollments',
  },
};
