from django.urls import path
from . import views

app_name = 'custom_permissions'

urlpatterns = [
    # Main permissions management
    path('user-permissions/', views.user_permissions_view, name='user-permissions'),
    path('user-permissions/<int:user_id>/', views.user_permissions_view, name='user-permissions'),
    
    # List all users with permissions
    path('user-permissions-list/', views.user_permissions_list, name='user-permissions-list'),
    
    # Utility views
    path('check-permissions/<int:user_id>/', views.check_user_permissions, name='check-permissions'),
    path('bulk-update/', views.bulk_permissions_update, name='bulk-update'),
    
    # Example protected view
    path('example-protected/', views.example_protected_view, name='example-protected'),
] 