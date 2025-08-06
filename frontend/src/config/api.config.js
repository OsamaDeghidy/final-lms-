// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

export const API_CONFIG = {
  baseURL: 'http://localhost:8000', // Force the correct URL
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
