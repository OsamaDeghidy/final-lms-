# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Here are all the quiz-related routes we've created in the application:

Teacher Routes:
Create Quiz
/teacher/courses/[courseId]/quizzes/create
Renders: 
pages/teacher/quizzes/create.jsx
e:\projects\LMS-Osama\frontend\src\pages\teacher\quizzes\create.jsx
Edit Quiz
/teacher/courses/[courseId]/quizzes/[id]/edit
Renders: pages/teacher/quizzes/edit/[id].jsx
Quiz Details
/teacher/courses/[courseId]/quizzes/[id]
Renders: pages/teacher/quizzes/[id].jsx
Quiz Attempts List
/teacher/courses/[courseId]/quizzes/[id]/attempts
Renders: pages/teacher/quizzes/[id]/attempts/index.jsx
Quiz Attempt Review
/teacher/courses/[courseId]/quizzes/[id]/attempts/[attemptId]
Renders: pages/teacher/quizzes/[id]/attempts/[attemptId].jsx
Student Routes:
Quiz Attempt
/student/courses/[courseId]/quizzes/[id]
Renders: pages/student/quizzes/[id].jsx
Quiz Results
/student/courses/[courseId]/quizzes/results/[id]
Renders: pages/student/quizzes/results/[id].jsx
API Endpoints (used in components):
Teacher API Endpoints:
GET /api/teacher/quizzes/ - List all quizzes
GET /api/teacher/quizzes/[id] - Get quiz details
POST /api/teacher/quizzes/ - Create new quiz
PUT /api/teacher/quizzes/[id] - Update quiz
DELETE /api/teacher/quizzes/[id] - Delete quiz
GET /api/teacher/quizzes/[id]/attempts - List quiz attempts
GET /api/teacher/quizzes/[id]/attempts/[attemptId] - Get attempt details
POST /api/teacher/quizzes/[id]/attempts/[attemptId]/grade - Grade attempt
Student API Endpoints:
GET /api/student/quizzes/[id] - Get quiz for attempt
POST /api/student/quizzes/[id]/attempt - Start/Submit quiz attempt
GET /api/student/quizzes/attempts/[attemptId] - Get attempt details
GET /api/student/quizzes/results/[id] - Get quiz results
These routes cover the complete flow of quiz management for both teachers and students, including creation, editing, attempting, and reviewing quizzes.