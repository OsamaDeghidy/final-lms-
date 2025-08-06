// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    PROFILE: '/auth/profile/',
    UPDATE_PROFILE: '/auth/profile/update/',
    CHANGE_PASSWORD: '/auth/change-password/',
    CHECK_EMAIL: '/auth/check-email/',
  },
  COURSES: {
    BASE: '/courses/',
    POPULAR: '/courses/popular/',
    FEATURED: '/courses/featured/',
  },
  USERS: {
    BASE: '/users/',
    ENROLLMENTS: '/users/enrollments/',
  },
};
