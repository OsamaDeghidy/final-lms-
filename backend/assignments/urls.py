from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'quiz-questions', views.QuizQuestionViewSet, basename='quiz-question')
router.register(r'quiz-answers', views.QuizAnswerViewSet, basename='quiz-answer')
router.register(r'quiz-attempts', views.QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'quiz-user-answers', views.QuizUserAnswerViewSet, basename='quiz-user-answer')
router.register(r'exams', views.ExamViewSet, basename='exam')
router.register(r'exam-questions', views.ExamQuestionViewSet, basename='exam-question')
router.register(r'exam-answers', views.ExamAnswerViewSet, basename='exam-answer')
router.register(r'assignments', views.AssignmentViewSet, basename='assignment')
router.register(r'submissions', views.AssignmentSubmissionViewSet, basename='submission')
router.register(r'assignment-questions', views.AssignmentQuestionViewSet, basename='assignment-question')
router.register(r'assignment-answers', views.AssignmentAnswerViewSet, basename='assignment-answer')
router.register(r'question-responses', views.AssignmentQuestionResponseViewSet, basename='question-response')

urlpatterns = [
    path('', include(router.urls)),
    path('my-assignments/', views.my_assignments, name='my-assignments'),
    path('quiz/<int:quiz_id>/statistics/', views.quiz_statistics, name='quiz-statistics'),
    path('assignments/<int:assignment_id>/questions/', views.assignment_questions, name='assignment-questions'),
    path('assignments/<int:assignment_id>/submit-with-questions/', views.submit_assignment_with_questions, name='submit-assignment-with-questions'),
    path('exams/<int:exam_id>/questions/', views.exam_questions, name='exam-questions'),
    path('exams/<int:exam_id>/questions/add/', views.add_exam_question, name='add-exam-question'),
    path('exams/<int:exam_id>/statistics/', views.exam_statistics, name='exam-statistics'),
] 