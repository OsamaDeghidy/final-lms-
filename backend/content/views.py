from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from courses.models import Course, Enrollment
from users.models import Profile
from content.models import Module, ModuleProgress, UserProgress, Lesson, LessonResource
from content.serializers import (
    ModuleDetailSerializer, ModuleCreateSerializer, ProgressUpdateSerializer,
    LessonSerializer, LessonDetailSerializer, LessonCreateUpdateSerializer, LessonResourceSerializer
)


class ModuleViewSet(ModelViewSet):
    """إدارة الوحدات"""
    queryset = Module.objects.select_related('course').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
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
        
        # Check permissions: enrolled student or instructor/admin
        is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
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
        if not course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
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

    @action(detail=True, methods=['post'])
    def update_video_progress(self, request, pk=None):
        """تحديث تقدم مشاهدة الفيديو"""
        module = self.get_object()
        course = module.course
        
        # Check if user is enrolled
        if not course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        video_progress = request.data.get('video_progress', 0)
        video_last_position = request.data.get('video_last_position', 0)
        
        # Get or create module progress
        progress, created = ModuleProgress.objects.get_or_create(
            user=request.user,
            module=module,
            defaults={'status': ModuleProgress.ProgressStatus.NOT_STARTED}
        )
        
        # Update video progress
        progress.mark_video_watched(
            progress=video_progress,
            last_position=video_last_position,
            commit=True
        )
        
        return Response({
            'message': 'تم تحديث تقدم الفيديو بنجاح',
            'video_progress': progress.video_progress,
            'video_watched': progress.video_watched,
            'completion_percentage': progress.get_completion_percentage()
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """Create a new module with better error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء إنشاء الوحدة',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='courses/(?P<course_id>[^/.]+)')
    def course_modules(self, request, course_id=None):
        """الحصول على وحدات كورس معين"""
        try:
            course = Course.objects.get(id=course_id)
            modules = Module.objects.filter(course=course).order_by('order')
            serializer = self.get_serializer(modules, many=True)
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response({
                'error': 'الكورس غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)


# Progress-related functionality from CourseViewSet
class CourseProgressMixin:
    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """جلب وحدات الدورة"""
        course = self.get_object()
        user = request.user
        
        # Check if user is enrolled or is the instructor/admin
        is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
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
        
        modules = course.modules.all().order_by('order')
        serializer = ModuleBasicSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'modules': serializer.data
        }, status=status.HTTP_200_OK)


class LessonViewSet(ModelViewSet):
    """CRUD for lessons"""
    queryset = Lesson.objects.select_related('module', 'module__course').all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LessonDetailSerializer
        if self.action == 'list':
            return LessonSerializer
        return LessonCreateUpdateSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.request.query_params.get('module')
        course_id = self.request.query_params.get('course')
        if module_id:
            qs = qs.filter(module_id=module_id)
        if course_id:
            qs = qs.filter(module__course_id=course_id)
        return qs.order_by('order', 'created_at')

    def create(self, request, *args, **kwargs):
        """Create a new lesson with better error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء إنشاء الدرس',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Update a lesson with better error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء تحديث الدرس',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LessonResourceViewSet(ModelViewSet):
    """CRUD for lesson resources (files/links)"""
    queryset = LessonResource.objects.select_related('lesson', 'lesson__module').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        return LessonResourceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lesson_id = self.request.query_params.get('lesson')
        module_id = self.request.query_params.get('module')
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        if module_id:
            qs = qs.filter(lesson__module_id=module_id)
        return qs.order_by('order', 'created_at')

    def create(self, request, *args, **kwargs):
        """Create a new lesson resource with better error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء إنشاء المورد',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Update a lesson resource with better error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء تحديث المورد',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Add this to the end of the file to make the mixin available for import
__all__ = ['ModuleViewSet', 'CourseProgressMixin', 'LessonViewSet', 'LessonResourceViewSet']
