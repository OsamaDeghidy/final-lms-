from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Circular
from .serializers import CircularSerializer
from users.models import Student
from notifications.models import Notification, NotificationLog


class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request.user, 'profile'):
            return False
        status_val = request.user.profile.status
        return status_val in ['Instructor', 'Admin'] or request.user.is_staff or request.user.is_superuser


class CircularViewSet(viewsets.ModelViewSet):
    queryset = Circular.objects.all()
    serializer_class = CircularSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Circular.objects.none()
        profile = user.profile

        # Admin/staff see all
        if profile.status == 'Admin' or user.is_staff or user.is_superuser:
            return Circular.objects.all()

        # Instructor sees their own circulars
        if profile.status == 'Instructor':
            return Circular.objects.filter(created_by=user)

        # Student sees circulars targeted to them or their divisions, and homepage public circulars
        try:
            student = Student.objects.get(profile=profile)
            return Circular.objects.filter(
                status='sent'
            ).filter(
                Q(target_students=student) |
                Q(target_divisions__students=student) |
                Q(show_on_homepage=True)
            ).distinct()
        except Student.DoesNotExist:
            return Circular.objects.filter(status='sent', show_on_homepage=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTeacherOrAdmin])
    def send(self, request, pk=None):
        circular = self.get_object()
        recipients = circular.get_recipients()
        created_notifications = []

        # Send in-app notifications
        created_notifications = []
        if circular.send_notification and recipients:
            from notifications.services import EmailService
            for user in recipients:
                if user and hasattr(user, 'email') and user.email:
                    try:
                        notification = Notification.objects.create(
                            recipient=user,
                            sender=request.user,
                            title=circular.title,
                            message=circular.content or '',
                            notification_type='system_announcement',
                            priority='high',
                        )
                        created_notifications.append(notification)
                        
                        # Log notification delivery
                        NotificationLog.objects.create(
                            notification=notification,
                            delivery_method='app',
                            status='sent',
                            sent_at=timezone.now()
                        )
                        
                        # Send email if enabled
                        if circular.send_email:
                            try:
                                attachment = circular.attachment if hasattr(circular, 'attachment') and circular.attachment else None
                                EmailService.send_notification_email(notification, user, attachment=attachment)
                                NotificationLog.objects.create(
                                    notification=notification,
                                    delivery_method='email',
                                    status='sent',
                                    sent_at=timezone.now()
                                )
                            except Exception as e:
                                NotificationLog.objects.create(
                                    notification=notification,
                                    delivery_method='email',
                                    status='failed',
                                    error_message=str(e),
                                    sent_at=timezone.now()
                                )
                    except Exception as e:
                        continue

        # Update status and publish time
        circular.status = 'sent'
        if circular.show_on_homepage and not circular.publish_at:
            circular.publish_at = timezone.now()
        circular.save(update_fields=['status', 'publish_at'])

        return Response({'message': 'تم إرسال التعميم', 'recipients_count': len(recipients)})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def homepage(self, request):
        qs = Circular.objects.filter(status='sent', show_on_homepage=True).order_by('-publish_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)