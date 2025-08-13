from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'tags', views.TagsViewSet, basename='tag')
router.register(r'courses', views.CourseViewSet, basename='course')

app_name = 'courses_api'

urlpatterns = [
    # Public courses (no authentication required)
    path('public/', views.public_courses, name='public_courses'),
    
    # Search and filtering
    path('search/', views.course_search, name='course_search'),
    path('featured/', views.featured_courses, name='featured_courses'),
    path('popular/', views.popular_courses, name='popular_courses'),
    path('recent/', views.recent_courses, name='recent_courses'),
    
    # Statistics and dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('general/stats/', views.general_stats, name='general_stats'),
    
    # Include router URLs
    path('', include(router.urls)),
]
