from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'templates', views.CertificateTemplateViewSet, basename='certificate-template')
router.register(r'signatures', views.UserSignatureViewSet, basename='user-signature')
router.register(r'certificates', views.CertificateViewSet, basename='certificate')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Template management
    path('templates/search/', views.search_templates, name='search-templates'),
    
    # Certificate verification
    path('verify/<str:certificate_id>/', views.verify_certificate, name='verify-certificate'),
    path('my-certificates/', views.my_certificates, name='my-certificates'),
    
    # Statistics
    path('stats/dashboard/', views.dashboard_stats, name='certificate-dashboard-stats'),
    path('stats/general/', views.general_stats, name='certificate-general-stats'),
    
    # Certificate generation endpoints
    path('generate/<int:course_id>/', views.generate_certificate, name='generate-certificate'),
    path('get-my-certificates/', views.get_my_certificates, name='get-my-certificates'),
    path('detail/<int:certificate_id>/', views.get_certificate_detail, name='certificate-detail'),
    path('verify-code/<str:verification_code>/', views.verify_certificate, name='verify-certificate-code'),
    path('download/<int:certificate_id>/', views.download_certificate_pdf, name='download-certificate'),
    path('check-completion/<int:course_id>/', views.check_course_completion, name='check-course-completion'),
] 
