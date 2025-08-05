from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'templates', views.CertificateTemplateViewSet, basename='certificate-template')
router.register(r'preset-templates', views.PresetCertificateTemplateViewSet, basename='preset-template')
router.register(r'signatures', views.UserSignatureViewSet, basename='user-signature')
router.register(r'certificates', views.CertificateViewSet, basename='certificate')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Template management
    path('templates/create-from-preset/', views.create_from_preset, name='create-from-preset'),
    path('templates/search/', views.search_templates, name='search-templates'),
    
    # Certificate verification
    path('verify/<str:certificate_id>/', views.verify_certificate, name='verify-certificate'),
    path('my-certificates/', views.my_certificates, name='my-certificates'),
    
    # Statistics
    path('stats/dashboard/', views.dashboard_stats, name='certificate-dashboard-stats'),
    path('stats/general/', views.general_stats, name='certificate-general-stats'),
] 
