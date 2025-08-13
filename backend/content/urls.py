from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_progress import ProgressViewSet
from .views_search import ContentSearchView

# Create a router for the ModuleViewSet
router = DefaultRouter()
router.register(r'modules', views.ModuleViewSet, basename='module')
router.register(r'lessons', views.LessonViewSet, basename='lesson')
router.register(r'resources', views.LessonResourceViewSet, basename='resource')

# Progress tracking viewset
progress_view = ProgressViewSet.as_view({
    'get': 'user_progress',
    'post': 'track_lesson_progress'
})

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Progress tracking endpoints
    path('progress/course/<int:course_id>/', progress_view, name='course-progress'),
    path('progress/course/<int:course_id>/track/', progress_view, name='track-progress'),
    path('progress/course/<int:course_id>/complete/', 
         ProgressViewSet.as_view({'post': 'complete_lesson'}), 
         name='complete-lesson'),
    path('progress/module/<int:module_id>/', 
         ProgressViewSet.as_view({'get': 'module_progress'}), 
         name='module-progress'),
    path('progress/course/<int:course_id>/modules/', 
         ProgressViewSet.as_view({'get': 'course_progress'}), 
         name='all-modules-progress'),
    
    # Search and filtering
    path('search/', ContentSearchView.as_view(), name='content-search'),
]
