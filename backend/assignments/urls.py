from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'exams', views.ExamViewSet, basename='exam')
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
] 