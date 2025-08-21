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

urlpatterns = [
    # Quiz endpoints
    path('quiz/<int:quiz_id>/', views.get_quiz_data, name='get_quiz_data'),
    path('quiz/<int:quiz_id>/submit/', views.submit_quiz_attempt, name='submit_quiz_attempt'),
    
    # Include router URLs (ViewSets) - Only ViewSets
    path('', include(router.urls)),
] 