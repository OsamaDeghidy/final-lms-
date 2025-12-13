from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_notifications

# Create router for viewsets
router = DefaultRouter()
router.register(r'', views.NotificationViewSet, basename='notification')
router.register(r'banner', views.BannerNotificationViewSet, basename='banner-notification')
router.register(r'attendance-penalties', views.AttendancePenaltyViewSet, basename='attendance-penalty')
router.register(r'student-attendance', views.StudentAttendanceViewSet, basename='student-attendance')

urlpatterns = [
    # Include router URLs for notifications at root level
    path('', include(router.urls)),
    
    # Banner notifications
    path('banner-list/', views_notifications.BannerNotificationListView.as_view(), name='banner-notification-list'),
    
    # Bulk operations
    path('bulk-send/', views.send_bulk_notification, name='bulk-send-notification'),
    path('search/', views.search_notifications, name='search-notifications'),
    path('system-create/', views.create_system_notification, name='create-system-notification'),
    
    # Settings
    path('settings/', views.notification_settings, name='notification-settings'),
    
    # Statistics
    path('stats/dashboard/', views.dashboard_stats, name='notification-dashboard-stats'),
    path('stats/general/', views.general_stats, name='notification-general-stats'),
] 
