from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'meetings', views.MeetingViewSet, basename='meeting')
router.register(r'participants', views.ParticipantViewSet, basename='participant')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Search and filter
    path('meetings/search/', views.search_meetings, name='search-meetings'),
    
    # Statistics
    path('meetings/stats/dashboard/', views.dashboard_stats, name='meeting-dashboard-stats'),
    path('meetings/stats/general/', views.general_stats, name='meeting-general-stats'),
    
    # Quick actions
    path('meetings/quick-create/', views.create_quick_meeting, name='quick-create-meeting'),
    
    # Additional function-based views
    path('my-meetings/', views.my_meetings, name='my-meetings'),
    path('upcoming/', views.upcoming_meetings, name='upcoming-meetings'),
    path('invitations/<int:invitation_id>/respond/', views.respond_to_invitation, name='respond-invitation'),
] 
