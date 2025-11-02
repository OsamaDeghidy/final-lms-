from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CircularViewSet

router = DefaultRouter()
router.register(r'circulars', CircularViewSet, basename='circular')

app_name = 'circulars_api'

urlpatterns = [
    path('', include(router.urls)),
]