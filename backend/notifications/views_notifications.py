from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone

from .models import Notification, BannerNotification
from .serializers import (
    NotificationBasicSerializer, BannerNotificationSerializer
)


class NotificationListView(generics.ListAPIView):
    """List user's notifications"""
    serializer_class = NotificationBasicSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'content_type')
        
        # Filter by target_page if provided
        target_page = self.request.query_params.get('target_page')
        if target_page:
            queryset = queryset.filter(
                Q(target_page=target_page) | Q(target_page__isnull=True)
            )
        
        return queryset.order_by('-created_at')


class BannerNotificationListView(generics.ListAPIView):
    """List active banner notifications for current page"""
    serializer_class = BannerNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        target_page = self.request.query_params.get('page', 'home')
        dashboard_type = self.request.query_params.get('dashboard_type')  # 'student' or 'instructor'
        now = timezone.now()
        
        queryset = BannerNotification.objects.filter(
            is_active=True
        ).filter(
            Q(start_date__lte=now) | Q(start_date__isnull=True),
            Q(end_date__gte=now) | Q(end_date__isnull=True)
        )
        
        # Filter by notification type based on dashboard
        if dashboard_type == 'student':
            queryset = queryset.filter(
                Q(notification_type='banner_dashboard_student') |
                Q(notification_type='banner_top')
            )
        elif dashboard_type == 'instructor':
            queryset = queryset.filter(
                Q(notification_type='banner_dashboard_instructor') |
                Q(notification_type='banner_top')
            )
        else:
            queryset = queryset.filter(notification_type='banner_top')
        
        # Filter by target pages
        queryset = queryset.filter(
            Q(target_pages__contains=[target_page]) | Q(target_pages=[])
        )
        
        # Filter by target users
        if hasattr(user, 'profile'):
            profile = user.profile
            
            if profile.status == 'Student':
                from users.models import Student
                try:
                    student = Student.objects.get(profile=profile)
                    queryset = queryset.filter(
                        Q(target_type__in=['all_users', 'all_students']) |
                        Q(target_students=student) |
                        Q(target_divisions__students=student)
                    ).distinct()
                except Student.DoesNotExist:
                    return BannerNotification.objects.none()
            elif profile.status == 'Instructor':
                from users.models import Instructor
                try:
                    instructor = Instructor.objects.get(profile=profile)
                    queryset = queryset.filter(
                        Q(target_type__in=['all_users', 'all_instructors']) |
                        Q(target_instructors=instructor) |
                        Q(created_by=user)
                    ).distinct()
                except Instructor.DoesNotExist:
                    return BannerNotification.objects.none()
            elif profile.status == 'Admin' or user.is_staff:
                # Admins see all
                pass
        
        return queryset.order_by('-created_at')


class UnreadNotificationCountView(APIView):
    """Get count of unread notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})
