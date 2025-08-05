from rest_framework import generics, permissions, status, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, Sum, F
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.paginator import Paginator

from .models import Meeting, Participant, Notification, MeetingChat
from courses.models import Course, Enrollment
from users.models import Instructor, Profile
from .serializers import (
    MeetingDetailSerializer, MeetingCreateSerializer,
    MeetingAttendanceSerializer, MeetingInvitationSerializer,
    MeetingStatsSerializer, QuickMeetingSerializer, MeetingBasicSerializer,
    MeetingUpdateSerializer, MeetingParticipantSerializer, MeetingRegistrationSerializer,
    MeetingFilterSerializer, ParticipantSerializer
)


class MeetingViewSet(viewsets.ModelViewSet):
    """إدارة الاجتماعات المباشرة"""
    queryset = Meeting.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'meeting_type', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return MeetingCreateSerializer
        elif self.action == 'retrieve':
            return MeetingDetailSerializer
        return MeetingBasicSerializer

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        
        # Filter by user role
        if user.profile.status == 'Student':
            # Students see meetings they're registered for
            return queryset.filter(participants__user=user).distinct()
        
        elif user.profile.status == 'Instructor':
            # Instructors see meetings they created or are registered for
            return queryset.filter(
                Q(creator=user) | Q(participants__user=user)
            ).distinct()
        
        else:
            # Admins see all meetings
            return queryset
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        now = timezone.now()
        
        if status_filter == 'live':
            # Currently happening meetings
            queryset = queryset.filter(
                scheduled_time__lte=now,
                scheduled_time__gt=now - timedelta(hours=1),  # Assume max 1 hour duration
                is_active=True
            )
        elif status_filter == 'upcoming':
            queryset = queryset.filter(
                scheduled_time__gt=now,
                is_active=True
            )
        elif status_filter == 'completed':
            queryset = queryset.filter(
                scheduled_time__lt=now - timedelta(hours=1)
            )
        
        return queryset.order_by('-scheduled_time')
    
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        user = request.user
        
        # For students, check course enrollment
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_instructor_or_admin())):
            if not obj.course.enroller_user.filter(id=user.id).exists():
                raise permissions.PermissionDenied("يجب التسجيل في الدورة للوصول للاجتماع")
        
        # For creation/modification, check instructor permissions
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if not (user.is_superuser or 
                    (hasattr(user, 'profile') and user.profile.is_admin()) or
                    obj.course.instructor.profile.user == user):
                raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل هذا الاجتماع")
    
    def perform_create(self, serializer):
        # Check if user is instructor
        try:
            instructor = Instructor.objects.get(profile__user=self.request.user)
            serializer.save(instructor=instructor)
        except Instructor.DoesNotExist:
            raise permissions.PermissionDenied("يجب أن تكون معلماً لإنشاء اجتماع")
    
    def perform_update(self, serializer):
        """Update meeting with permission check"""
        meeting = self.get_object()
        user = self.request.user
        
        # Check permissions
        if not (meeting.instructor == user or user.profile.is_admin()):
            raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل هذا الاجتماع")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete meeting with permission check"""
        user = self.request.user
        
        # Check permissions
        if not (instance.instructor == user or user.profile.is_admin()):
            raise permissions.PermissionDenied("ليس لديك صلاحية لحذف هذا الاجتماع")
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """
        الانضمام للاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        # Check if meeting is available to join
        now = timezone.now()
        buffer_time = timedelta(minutes=15)  # Allow joining 15 minutes early
        end_time = meeting.scheduled_time + timedelta(minutes=meeting.duration)
        
        if not ((meeting.scheduled_time - buffer_time) <= now <= end_time):
            return Response({
                'error': 'الاجتماع غير متاح للانضمام في الوقت الحالي'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not meeting.is_active:
            return Response({
                'error': 'الاجتماع غير نشط'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is enrolled in course
        if not meeting.course.enroller_user.filter(id=user.id).exists():
            return Response({
                'error': 'يجب التسجيل في الدورة للانضمام للاجتماع'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if meeting is full
        current_attendees = meeting.attendances.filter(
            left_at__isnull=True
        ).count()
        
        if current_attendees >= meeting.max_participants:
            return Response({
                'error': 'الاجتماع ممتلئ'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update attendance record
        attendance, created = MeetingAttendance.objects.get_or_create(
            meeting=meeting,
            user=user,
            defaults={
                'joined_at': timezone.now(),
                'is_attended': True
            }
        )
        
        if not created and attendance.left_at:
            # User is rejoining
            attendance.joined_at = timezone.now()
            attendance.left_at = None
            attendance.is_attended = True
            attendance.save()
        
        return Response({
            'message': 'تم الانضمام للاجتماع بنجاح',
            'meeting_url': meeting.meeting_url,
            'attendance_id': attendance.id
        })
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """
        مغادرة الاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        try:
            attendance = MeetingAttendance.objects.get(
                meeting=meeting,
                user=user,
                left_at__isnull=True
            )
            
            attendance.left_at = timezone.now()
            # Calculate attendance duration
            if attendance.joined_at:
                duration = attendance.left_at - attendance.joined_at
                attendance.attendance_duration = int(duration.total_seconds())
            attendance.save()
            
            return Response({
                'message': 'تم مغادرة الاجتماع',
                'attendance_duration': attendance.attendance_duration
            })
        
        except MeetingAttendance.DoesNotExist:
            return Response({
                'error': 'لم تنضم للاجتماع بعد'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attendances(self, request, pk=None):
        """
        قائمة الحضور للاجتماع (للمعلمين)
        """
        meeting = self.get_object()
        user = request.user
        
        # Check permissions
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_admin()) or
                meeting.course.instructor.profile.user == user):
            raise permissions.PermissionDenied("ليس لديك صلاحية لعرض قائمة الحضور")
        
        attendances = meeting.attendances.select_related('user__profile').all()
        serializer = MeetingAttendanceSerializer(attendances, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_invitations(self, request, pk=None):
        """
        إرسال دعوات للاجتماع
        """
        meeting = self.get_object()
        user = request.user
        
        # Check permissions
        if not (user.is_superuser or 
                (hasattr(user, 'profile') and user.profile.is_admin()) or
                meeting.course.instructor.profile.user == user):
            raise permissions.PermissionDenied("ليس لديك صلاحية لإرسال دعوات")
        
        # Get all enrolled students
        enrolled_students = meeting.course.enroller_user.all()
        invitations_created = 0
        
        for student in enrolled_students:
            invitation, created = MeetingInvitation.objects.get_or_create(
                meeting=meeting,
                user=student,
                defaults={
                    'sent_at': timezone.now(),
                    'is_sent': True
                }
            )
            
            if created:
                invitations_created += 1
                # Here you would integrate with email/notification service
                # send_meeting_invitation_email(student, meeting)
        
        return Response({
            'message': f'تم إرسال {invitations_created} دعوة جديدة',
            'total_invitations': invitations_created
        })
    
    @action(detail=True, methods=['get'])
    def recordings(self, request, pk=None):
        """
        تسجيلات الاجتماع
        """
        meeting = self.get_object()
        recordings = meeting.recordings.filter(is_available=True)
        serializer = MeetingRecordingSerializer(recordings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register user for a meeting"""
        meeting = self.get_object()
        user = request.user
        
        # Check if meeting is in the future
        if meeting.scheduled_time < timezone.now():
            return Response({
                'error': 'لا يمكن التسجيل في اجتماع انتهى'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is already registered
        if meeting.participants.filter(user=user).exists():
            return Response({
                'error': 'أنت مسجل بالفعل في هذا الاجتماع'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check max participants limit
        if meeting.max_participants and meeting.participants.count() >= meeting.max_participants:
            return Response({
                'error': 'تم الوصول للحد الأقصى من المشاركين'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Register user
        MeetingParticipant.objects.create(
            meeting=meeting,
            user=user,
            joined_at=timezone.now()
        )
        
        return Response({
            'message': 'تم التسجيل في الاجتماع بنجاح'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        """Unregister user from a meeting"""
        meeting = self.get_object()
        user = request.user
        
        try:
            participant = meeting.participants.get(user=user)
            participant.delete()
            
            return Response({
                'message': 'تم إلغاء التسجيل من الاجتماع بنجاح'
            }, status=status.HTTP_200_OK)
        except MeetingParticipant.DoesNotExist:
            return Response({
                'error': 'أنت غير مسجل في هذا الاجتماع'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get meeting participants"""
        meeting = self.get_object()
        
        # Check if user can view participants
        user = request.user
        if not (meeting.instructor == user or 
                meeting.participants.filter(user=user).exists() or
                user.profile.is_admin()):
            return Response({
                'error': 'ليس لديك صلاحية لعرض المشاركين'
            }, status=status.HTTP_403_FORBIDDEN)
        
        participants = meeting.participants.select_related('user__profile')
        serializer = MeetingParticipantSerializer(participants, many=True)
        
        return Response({
            'participants': serializer.data,
            'total_count': participants.count()
        })
    
    @action(detail=False, methods=['get'])
    def my_meetings(self, request):
        """Get user's meetings (created or registered)"""
        user = request.user
        
        # Get meetings user created
        created_meetings = Meeting.objects.filter(instructor=user)
        
        # Get meetings user is registered for
        registered_meetings = Meeting.objects.filter(participants__user=user)
        
        # Combine and remove duplicates
        all_meetings = (created_meetings | registered_meetings).distinct().order_by('-scheduled_time')
        
        # Paginate
        page = request.GET.get('page', 1)
        paginator = Paginator(all_meetings, 10)
        meetings_page = paginator.get_page(page)
        
        serializer = MeetingBasicSerializer(meetings_page, many=True, context={'request': request})
        
        return Response({
            'meetings': serializer.data,
            'page': int(page),
            'pages': paginator.num_pages,
            'total': paginator.count
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming meetings"""
        now = timezone.now()
        meetings = self.get_queryset().filter(scheduled_time__gt=now)[:10]
        
        serializer = MeetingBasicSerializer(meetings, many=True, context={'request': request})
        return Response({'meetings': serializer.data})
    
    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get live meetings"""
        now = timezone.now()
        live_meetings = Meeting.objects.filter(
            scheduled_time__lte=now,
            scheduled_time__gte=now - timedelta(hours=1),  # Assume max 1 hour duration
            is_active=True
        ).select_related('instructor__profile')
        
        page = request.GET.get('page', 1)
        paginator = Paginator(live_meetings, 20)
        meetings_page = paginator.get_page(page)
        
        serializer = MeetingBasicSerializer(
            meetings_page, many=True, context={'request': request}
        )
        
        return Response({
            'meetings': serializer.data,
            'page': int(page),
            'pages': paginator.num_pages,
            'total': paginator.count
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_meetings(request):
    """Search meetings with filters"""
    filter_serializer = MeetingFilterSerializer(data=request.GET)
    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    filters = filter_serializer.validated_data
    queryset = Meeting.objects.select_related('instructor__profile').prefetch_related('participants')
    
    # Apply user-based filtering
    user = request.user
    if user.profile.status == 'student':
        queryset = queryset.filter(
            Q(participants__user=user) | 
            Q(max_participants__isnull=True) |
            Q(participants__count__lt=F('max_participants'))
        ).distinct()
    elif user.profile.status == 'instructor':
        queryset = queryset.filter(
            Q(instructor=user) |
            Q(max_participants__isnull=True) |
            Q(participants__count__lt=F('max_participants'))
        ).distinct()
    
    # Apply search filters
    if filters.get('meeting_type'):
        queryset = queryset.filter(meeting_type=filters['meeting_type'])
    
    if filters.get('start_date'):
        queryset = queryset.filter(scheduled_time__date__gte=filters['start_date'])
    
    if filters.get('end_date'):
        queryset = queryset.filter(scheduled_time__date__lte=filters['end_date'])
    
    if filters.get('is_past') is not None:
        now = timezone.now()
        if filters['is_past']:
            queryset = queryset.filter(scheduled_time__lt=now)
        else:
            queryset = queryset.filter(scheduled_time__gte=now)
    
    if filters.get('search'):
        search_term = filters['search']
        queryset = queryset.filter(
            Q(title__icontains=search_term) |
            Q(description__icontains=search_term) |
            Q(instructor__profile__name__icontains=search_term)
        )
    
    # Order by scheduled time
    queryset = queryset.order_by('-scheduled_time')
    
    # Paginate
    page = request.GET.get('page', 1)
    paginator = Paginator(queryset, 20)
    meetings_page = paginator.get_page(page)
    
    serializer = MeetingBasicSerializer(meetings_page, many=True, context={'request': request})
    
    return Response({
        'meetings': serializer.data,
        'page': int(page),
        'pages': paginator.num_pages,
        'total': paginator.count,
        'filters_applied': filters
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get meeting statistics for dashboard"""
    user = request.user
    now = timezone.now()
    
    if user.profile.status == 'instructor':
        # Instructor statistics
        total_meetings = Meeting.objects.filter(instructor=user).count()
        upcoming_meetings = Meeting.objects.filter(instructor=user, scheduled_time__gt=now).count()
        completed_meetings = Meeting.objects.filter(instructor=user, scheduled_time__lt=now).count()
        
        # Get participants count for instructor's meetings
        total_participants = MeetingParticipant.objects.filter(meeting__instructor=user).count()
        
        return Response({
            'total_meetings': total_meetings,
            'upcoming_meetings': upcoming_meetings,
            'completed_meetings': completed_meetings,
            'total_participants': total_participants
        })
    
    elif user.profile.status in ['admin', 'manager']:
        # Admin statistics
        total_meetings = Meeting.objects.count()
        upcoming_meetings = Meeting.objects.filter(scheduled_time__gt=now).count()
        completed_meetings = Meeting.objects.filter(scheduled_time__lt=now).count()
        total_participants = MeetingParticipant.objects.count()
        
        # Meeting types distribution
        meeting_types = Meeting.objects.values('meeting_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_meetings': total_meetings,
            'upcoming_meetings': upcoming_meetings,
            'completed_meetings': completed_meetings,
            'total_participants': total_participants,
            'meeting_types': list(meeting_types)
        })
    
    else:
        # Student statistics
        registered_meetings = Meeting.objects.filter(participants__user=user).count()
        upcoming_meetings = Meeting.objects.filter(
            participants__user=user, 
            scheduled_time__gt=now
        ).count()
        completed_meetings = Meeting.objects.filter(
            participants__user=user,
            scheduled_time__lt=now
        ).count()
        
        return Response({
            'registered_meetings': registered_meetings,
            'upcoming_meetings': upcoming_meetings,
            'completed_meetings': completed_meetings
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def general_stats(request):
    """Get general meeting statistics"""
    now = timezone.now()
    
    total_meetings = Meeting.objects.count()
    live_meetings = Meeting.objects.filter(
        scheduled_time__lte=now,
        scheduled_time__gte=now - timezone.timedelta(hours=8)
    ).count()
    upcoming_meetings = Meeting.objects.filter(scheduled_time__gt=now).count()
    total_participants = MeetingParticipant.objects.count()
    
    # Meeting types distribution
    meeting_types = Meeting.objects.values('meeting_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent meetings
    recent_meetings = Meeting.objects.select_related('instructor__profile').order_by('-created_at')[:5]
    recent_serializer = MeetingBasicSerializer(recent_meetings, many=True, context={'request': request})
    
    return Response({
        'total_meetings': total_meetings,
        'live_meetings': live_meetings,
        'upcoming_meetings': upcoming_meetings,
        'total_participants': total_participants,
        'meeting_types': list(meeting_types),
        'recent_meetings': recent_serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_quick_meeting(request):
    """
    إنشاء اجتماع سريع
    """
    serializer = QuickMeetingSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        # Check if user is instructor
        try:
            instructor = Instructor.objects.get(profile__user=request.user)
            meeting = serializer.save(instructor=instructor)
            
            # Send invitations automatically
            enrolled_students = meeting.course.enroller_user.all()
            for student in enrolled_students:
                MeetingInvitation.objects.create(
                    meeting=meeting,
                    user=student,
                    sent_at=timezone.now(),
                    is_sent=True
                )
            
            response_data = MeetingDetailSerializer(meeting, context={'request': request}).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        except Teacher.DoesNotExist:
            return Response({
                'error': 'يجب أن تكون معلماً لإنشاء اجتماع'
            }, status=status.HTTP_403_FORBIDDEN)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def upcoming_meetings(request):
    """
    الاجتماعات القادمة (عامة)
    """
    now = timezone.now()
    next_24_hours = now + timedelta(hours=24)
    
    meetings = Meeting.objects.filter(
        scheduled_time__gt=now,
        scheduled_time__lte=next_24_hours,
        is_active=True
    ).select_related('course', 'teacher__profile')[:10]
    
    serializer = MeetingListSerializer(meetings, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_to_invitation(request, invitation_id):
    """
    الرد على دعوة اجتماع
    """
    try:
        invitation = MeetingInvitation.objects.get(
            id=invitation_id,
            user=request.user
        )
    except MeetingInvitation.DoesNotExist:
        return Response({
            'error': 'الدعوة غير موجودة'
        }, status=status.HTTP_404_NOT_FOUND)
    
    response = request.data.get('response')
    
    if response not in ['accepted', 'declined']:
        return Response({
            'error': 'الرد يجب أن يكون accepted أو declined'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    invitation.response = response
    invitation.responded_at = timezone.now()
    invitation.save()
    
    return Response({
        'message': 'تم حفظ ردك على الدعوة',
        'response': response
    })


class ParticipantViewSet(viewsets.ModelViewSet):
    """ViewSet for Participant management"""
    queryset = Participant.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['meeting', 'attendance_status']

    def get_serializer_class(self):
        return ParticipantSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_meetings(request):
    """Get current user's meetings"""
    user = request.user
    meetings = Meeting.objects.filter(
        participants__user=user
    ).distinct()[:10]
    
    serializer = MeetingBasicSerializer(meetings, many=True, context={'request': request})
    return Response({
        'meetings': serializer.data,
        'total': meetings.count()
    }) 
