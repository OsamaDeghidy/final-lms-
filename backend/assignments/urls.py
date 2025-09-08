from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'assignments_api'

# Create router and register ViewSets
router = DefaultRouter()
router.register(r'assignments', views.AssignmentViewSet, basename='assignment')
router.register(r'questions', views.AssignmentQuestionViewSet, basename='assignment-question')
router.register(r'submissions', views.AssignmentSubmissionViewSet, basename='assignment-submission')
router.register(r'answers', views.AssignmentAnswerViewSet, basename='assignment-answer')
router.register(r'exams', views.ExamViewSet, basename='exam')
router.register(r'exam-questions', views.ExamQuestionViewSet, basename='exam-question')
router.register(r'exam-answers', views.ExamAnswerViewSet, basename='exam-answer')
router.register(r'exam-attempts', views.ExamAttemptViewSet, basename='exam-attempt')
router.register(r'exam-user-answers', views.ExamUserAnswerViewSet, basename='exam-user-answer')
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'quiz-questions', views.QuizQuestionViewSet, basename='quiz-question')
router.register(r'quiz-answers', views.QuizAnswerViewSet, basename='quiz-answer')
router.register(r'quiz-attempts', views.QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'quiz-user-answers', views.QuizUserAnswerViewSet, basename='quiz-user-answer')

urlpatterns = [
    # Quiz endpoints
    path('quiz/<int:quiz_id>/', views.get_quiz_data, name='get_quiz_data'),
    path('quiz/<int:quiz_id>/submit/', views.submit_quiz_attempt, name='submit_quiz_attempt'),
    
    # Exam endpoints
    path('exam/<int:exam_id>/', views.get_exam_data, name='get_exam_data'),
    path('exam/<int:exam_id>/submit/', views.submit_exam_attempt, name='submit_exam_attempt'),
    
    # Include router URLs (ViewSets) - Only ViewSets
    path('', include(router.urls)),
] 