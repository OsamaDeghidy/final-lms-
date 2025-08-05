from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from courses.models import Course, Enrollment
from users.models import Profile
from content.models import Module, ModuleProgress, UserProgress
from content.serializers import ModuleDetailSerializer, ModuleCreateSerializer, ProgressUpdateSerializer


class ModuleViewSet(ModelViewSet):
    """إدارة الوحدات"""
    queryset = Module.objects.select_related('course').all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ModuleDetailSerializer
        elif self.action == 'create':
            return ModuleCreateSerializer
        return ModuleDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course if provided
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        """عرض تفاصيل وحدة"""
        module = self.get_object()
        course = module.course
        user = request.user
        
        # Check permissions
        is_enrolled = course.enroller_user.filter(id=user.id).exists()
        is_instructor_or_admin = False
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                is_instructor_or_admin = True
            elif profile.status == 'Instructor':
                instructor = profile.get_instructor_object()
                if instructor and instructor in course.instructors.all():
                    is_instructor_or_admin = True
        except Profile.DoesNotExist:
            pass
        
        if not is_enrolled and not is_instructor_or_admin:
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة للوصول لهذا المحتوى'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(module)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_progress(self, request, pk=None):
        """تحديث تقدم المستخدم في الوحدة"""
        module = self.get_object()
        course = module.course
        
        # Check if user is enrolled
        if not course.enroller_user.filter(id=request.user.id).exists():
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProgressUpdateSerializer(data=request.data)
        if serializer.is_valid():
            progress = serializer.save(user=request.user, module=module)
            
            return Response({
                'message': 'تم تحديث التقدم بنجاح',
                'progress': {
                    'is_completed': progress.is_completed,
                    'video_watched': progress.video_watched,
                    'pdf_viewed': progress.pdf_viewed,
                    'notes_read': progress.notes_read,
                    'quiz_completed': progress.quiz_completed,
                    'completion_percentage': progress.get_completion_percentage()
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'بيانات غير صحيحة',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# Progress-related functionality from CourseViewSet
class CourseProgressMixin:
    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """جلب وحدات الدورة"""
        course = self.get_object()
        user = request.user
        
        # Check if user is enrolled or is the instructor/admin
        is_enrolled = course.enroller_user.filter(id=user.id).exists()
        is_instructor_or_admin = False
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                is_instructor_or_admin = True
            elif profile.status == 'Instructor':
                instructor = profile.get_instructor_object()
                if instructor and instructor in course.instructors.all():
                    is_instructor_or_admin = True
        except Profile.DoesNotExist:
            pass
        
        if not is_enrolled and not is_instructor_or_admin:
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة للوصول لهذا المحتوى'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Import here to avoid circular imports
        from .serializers import ModuleBasicSerializer
        
        modules = course.modules.all().order_by('number')
        serializer = ModuleBasicSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'modules': serializer.data
        }, status=status.HTTP_200_OK)


# Add this to the end of the file to make the mixin available for import
__all__ = ['ModuleViewSet', 'CourseProgressMixin']
