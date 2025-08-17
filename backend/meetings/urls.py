from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'list', views.MeetingViewSet, basename='meeting')
router.register(r'participants', views.ParticipantViewSet, basename='participant')

urlpatterns = [
    # Function-based views (must come before router)
    path('available-meetings/', views.available_meetings, name='available-meetings'),
    path('joinable-meetings/', views.joinable_meetings, name='joinable-meetings'),
    path('teaching-meetings/', views.teaching_meetings, name='teaching-meetings'),
    path('attending-meetings/', views.attending_meetings, name='attending-meetings'),
    path('meeting-history/', views.meeting_history, name='meeting-history'),
    path('my-meetings/', views.my_meetings, name='my-meetings'),
    path('upcoming/', views.upcoming_meetings, name='upcoming-meetings'),
    
    # Search and filter
    path('search/', views.search_meetings, name='search-meetings'),
    
    # Statistics
    path('stats/dashboard/', views.dashboard_stats, name='meeting-dashboard-stats'),
    path('stats/general/', views.general_stats, name='meeting-general-stats'),
    
    # Quick actions
    path('quick-create/', views.create_quick_meeting, name='quick-create-meeting'),
    
    # Invitations
    path('invitations/', views.meeting_invitations, name='meeting-invitations'),
    path('invitations/<int:invitation_id>/respond/', views.respond_to_invitation, name='respond-invitation'),
    path('invitations/<int:invitation_id>/accept/', views.accept_invitation, name='accept-invitation'),
    path('invitations/<int:invitation_id>/decline/', views.decline_invitation, name='decline-invitation'),
    
    # Meeting-specific endpoints
    path('<int:meeting_id>/status/', views.meeting_status, name='meeting-status'),
    path('<int:meeting_id>/analytics/', views.meeting_analytics, name='meeting-analytics'),
    path('<int:meeting_id>/attendance-report/', views.meeting_attendance_report, name='meeting-attendance-report'),
    path('<int:meeting_id>/export/', views.export_meeting_data, name='export-meeting-data'),
    
    # Router URLs (must come last)
    path('', include(router.urls)),
] 
