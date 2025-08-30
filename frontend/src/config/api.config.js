// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add retry configuration
  retry: {
    retries: 3,
    retryDelay: 1000,
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
    PUBLIC: '/courses/public/',
    POPULAR: '/courses/popular/',
    FEATURED: '/courses/featured/',
    SEARCH: '/courses/search/',
    CATEGORIES: '/courses/categories/',
    TAGS: '/courses/tags/',
    ENROLL: '/courses/courses/{id}/enroll/',
    UNENROLL: '/courses/courses/{id}/unenroll/',
    MODULES: '/courses/courses/{id}/modules/',
    REVIEWS: '/courses/courses/{id}/reviews/',
    RELATED: '/courses/courses/{id}/related/',
    PROGRESS: '/courses/courses/{id}/progress/',
  },
  STORE: {
    CART: '/store/cart/',
    CART_ITEMS: '/store/cart/items/',
    PAYMENT: {
      MOYASAR_CREATE: '/store/payment/moyasar/create/',
      MOYASAR_COURSE: '/store/payment/moyasar/course/{id}/create/',
      STATUS: '/store/payment/{id}/status/',
    },
  },
  USERS: {
    BASE: '/users/',
    ENROLLMENTS: '/users/enrollments/',
  },
  CONTENT: {
    MODULES: '/content/modules/',
    LESSONS: '/content/lessons/',
  },
  ASSIGNMENTS: {
    QUIZZES: '/assignments/quizzes/',
    QUIZ_ATTEMPTS: '/assignments/quiz-attempts/',
    QUIZ_ANSWERS: '/assignments/quiz-user-answers/',
  },
};

// Helper function to replace URL parameters
export const replaceUrlParams = (url, params) => {
  let result = url;
  Object.keys(params).forEach(key => {
    result = result.replace(`{${key}}`, params[key]);
  });
  return result;
};

// API error messages in Arabic
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت.',
  UNAUTHORIZED: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
  NOT_FOUND: 'المحتوى المطلوب غير موجود.',
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
  TIMEOUT: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};
