# API Configuration Guide

## Overview
This guide explains how to configure the API base URL for different environments (development and production).

## Environment Variables

### Development Environment
For local development, create a `.env` file in the frontend directory with:
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Production Environment
For production deployment, create a `.env` file in the frontend directory with:
```
VITE_API_BASE_URL=https://www.pdt-admin.com
```

## Automatic Configuration
The application automatically detects the environment:
- **Development mode**: Uses `http://127.0.0.1:8000` as default if no environment variable is set
- **Production mode**: Uses `https://www.pdt-admin.com` as default if no environment variable is set

## Files Modified
The following files have been updated to use the dynamic API configuration:

1. `src/config/api.config.js` - Main API configuration
2. `src/pages/student/CourseTracking.jsx` - Video and file URL processing
3. `src/pages/courses/CourseDetail.jsx` - Image and file URL processing
4. `src/pages/courses/Courses.jsx` - Course image URL processing

## Usage
After setting up the environment variables, rebuild the application:
```bash
npm run build
```

The application will now use the correct API base URL based on your environment configuration.
