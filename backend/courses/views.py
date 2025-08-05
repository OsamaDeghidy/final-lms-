import logging
from rest_framework import status, generics, permissions, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

# Set up logging
logger = logging.getLogger(__name__)
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, F, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db import transaction
from datetime import timedelta, datetime
from django.core.paginator import Paginator
import logging

from .models import Course, Category, Tags, Enrollment
from users.models import Instructor, Profile, User
from .serializers import (
    CategorySerializer, TagsSerializer, CourseBasicSerializer, 
    CourseDetailSerializer, CourseCreateSerializer, CourseUpdateSerializer,
    CourseEnrollmentSerializer, DashboardStatsSerializer, SearchSerializer
)

logger = logging.getLogger(__name__)


class CategoryViewSet(ReadOnlyModelViewSet):
    """عرض التصنيفات"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class TagsViewSet(ReadOnlyModelViewSet):
    """عرض الوسوم"""
    queryset = Tags.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [AllowAny]


class CourseViewSet(ModelViewSet):
    """إدارة الدورات"""
    queryset = Course.objects.select_related('category').prefetch_related('instructors', 'instructors__profile', 'tags', 'reviews')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level', 'status']
    search_fields = ['name', 'description', 'small_description']
    ordering_fields = ['created_at', 'updated_at', 'name', 'price', 'rating']
    ordering = ['-created_created_at']
    
    # Explicitly define allowed HTTP methods
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']
    
    def initial(self, request, *args, **kwargs):
        logger.info(f"[CourseViewSet] Initializing request: {request.method} {request.path}")
        logger.info(f"[CourseViewSet] Request data: {request.data}")
        logger.info(f"[CourseViewSet] Request user: {request.user}")
        logger.info(f"[CourseViewSet] Request auth: {request.auth}")
        logger.info(f"[CourseViewSet] View action: {self.action}")
        logger.info(f"[CourseViewSet] Allowed methods: {self.http_method_names}")
        logger.info(f"[CourseViewSet] Request headers: {dict(request.headers)}")
        logger.info(f"[CourseViewSet] Request content type: {request.content_type}")
        logger.info(f"[CourseViewSet] Request body: {request.body}")
        logger.info(f"[CourseViewSet] Request META: {dict(request.META)}")
        return super().initial(request, *args, **kwargs)
        
    def dispatch(self, request, *args, **kwargs):
        logger.info(f"[CourseViewSet] Dispatch - Method: {request.method}, Path: {request.path}")
        logger.info(f"[CourseViewSet] Request headers: {dict(request.headers)}")
        logger.info(f"[CourseViewSet] Request body: {request.body}")
        logger.info(f"[CourseViewSet] Request content type: {request.content_type}")
        
        # Log the actual method being used
        logger.info(f"[CourseViewSet] Request method (actual): {request.method}")
        logger.info(f"[CourseViewSet] Request META: {dict(request.META)}")
        
        # Check if this is a POST request with a different method in X-HTTP-Method-Override
        method_override = request.META.get('HTTP_X_HTTP_METHOD_OVERRIDE', '').upper()
        if method_override:
            logger.info(f"[CourseViewSet] Method override detected: {method_override}")
        
        # Check if the method is in http_method_names
        method = request.method.upper()
        logger.info(f"[CourseViewSet] Checking if method {method} is in {self.http_method_names}")
        
        if method not in [m.upper() for m in self.http_method_names if hasattr(self, m)]:
            logger.error(f"[CourseViewSet] Method {method} not allowed. Allowed methods: {self.http_method_names}")
        
        # Call the parent's dispatch
        response = super().dispatch(request, *args, **kwargs)
        
        logger.info(f"[CourseViewSet] Response status: {response.status_code}")
        logger.info(f"[CourseViewSet] Response headers: {dict(response.items())}")
        if hasattr(response, 'data'):
            logger.info(f"[CourseViewSet] Response data: {response.data}")
        else:
            logger.info("[CourseViewSet] No response data attribute")
        return response

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseBasicSerializer
        elif self.action == 'retrieve':
            return CourseDetailSerializer
        elif self.action == 'create':
            return CourseCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CourseUpdateSerializer
        return CourseDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # For non-authenticated users, only show published courses
        if not self.request.user.is_authenticated:
            return queryset.filter(status='published')
        
        # For regular users, show published courses + their own courses
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                # Admins see all courses
                return queryset
            elif profile.status == 'Teacher':
                # Teachers see published courses + their own courses
                teacher = profile.get_teacher_object()
                if teacher:
                    return queryset.filter(
                        Q(status='published') | Q(instructors=teacher)
                    )
            else:
                # Students see only published courses
                return queryset.filter(status='published')
        except Profile.DoesNotExist:
            return queryset.filter(status='published')

    def create(self, request, *args, **kwargs):
        logger.info("CourseViewSet.create method called")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Request auth: {request.auth}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Log the allowed methods for this view
        logger.info(f"Allowed methods: {self._allowed_methods()}")
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in CourseViewSet.create: {str(e)}", exc_info=True)
            raise
    
    def perform_create(self, serializer):
        """إنشاء دورة جديدة"""
        logger.info("CourseViewSet.perform_create method called")
        logger.info(f"Serializer data: {serializer.validated_data}")
        logger.info(f"Request user: {self.request.user}")
        
        # Ensure the user is an instructor
        user = self.request.user
        try:
            profile = user.profile
            if profile.status != 'Instructor' and not (profile.status == 'Admin' or user.is_staff):
                logger.warning(f"User {user.id} is not authorized to create courses")
                raise permissions.PermissionDenied("You are not authorized to create courses")
            
            # Save the course
            course = serializer.save()
            logger.info(f"Course created with ID: {course.id}")
            
            # Add the instructor to the course
            if profile.status == 'Instructor':
                try:
                    instructor = Instructor.objects.get(profile=profile)
                    course.instructors.add(instructor)
                    logger.info(f"Instructor {instructor.id} added to course {course.id}")
                except Instructor.DoesNotExist:
                    logger.error(f"Instructor profile not found for user {user.id}")
                    raise serializers.ValidationError("Instructor profile not found")
            
            return course
            
        except Profile.DoesNotExist:
            logger.error(f"Profile not found for user {user.id}")
            raise permissions.PermissionDenied("User profile not found")

    def perform_update(self, serializer):
        """تحديث دورة"""
        # Check permissions
        course = self.get_object()
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                # Admin can update any course
                pass
            elif profile.status == 'Teacher':
                teacher = profile.get_teacher_object()
                if not teacher or course.teacher != teacher:
                    raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل هذه الدورة")
            else:
                raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل الدورات")
        except Profile.DoesNotExist:
            raise permissions.PermissionDenied("لم يتم العثور على ملف تعريف المستخدم")
        
        serializer.save()

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """التسجيل في دورة"""
        course = self.get_object()
        
        if course.status != 'published':
            return Response({
                'error': 'هذه الدورة غير متاحة للتسجيل'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already enrolled
        if course.enroller_user.filter(id=request.user.id).exists():
            return Response({
                'error': 'أنت مسجل في هذه الدورة بالفعل'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Add user to course enrollments
                course.enroller_user.add(request.user)
                
                # Create enrollment record
                enrollment, created = Enrollment.objects.get_or_create(
                    course=course,
                    student=request.user,
                    defaults={'status': 'active'}
                )
                
                # User progress will be created in the content app
                
                return Response({
                    'message': 'تم التسجيل في الدورة بنجاح',
                    'enrollment_id': enrollment.id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error enrolling user in course: {str(e)}")
            return Response({
                'error': 'حدث خطأ أثناء التسجيل في الدورة'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        """إلغاء التسجيل من دورة"""
        course = self.get_object()
        
        if not course.enroller_user.filter(id=request.user.id).exists():
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Remove user from course enrollments
                course.enroller_user.remove(request.user)
                
                # Update enrollment status
                try:
                    enrollment = Enrollment.objects.get(course=course, student=request.user)
                    enrollment.status = 'cancelled'
                    enrollment.save()
                except Enrollment.DoesNotExist:
                    pass
                
                return Response({
                    'message': 'تم إلغاء التسجيل من الدورة'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error unenrolling user from course: {str(e)}")
            return Response({
                'error': 'حدث خطأ أثناء إلغاء التسجيل'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """جلب وحدات الدورة"""
        course = self.get_object()
        
        # Check if user is enrolled or is the teacher/admin
        user = request.user
        is_enrolled = course.enroller_user.filter(id=user.id).exists()
        is_instructor_or_admin = False
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                # Admin can access any course
                is_instructor_or_admin = True
            elif profile.status == 'Instructor':
                instructor = profile.get_instructor_object()
                if instructor and course.instructors.filter(id=instructor.id).exists():
                    is_instructor_or_admin = True
        except Profile.DoesNotExist:
            pass
        
        if not is_enrolled and not is_instructor_or_admin:
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة للوصول لهذا المحتوى'
            }, status=status.HTTP_403_FORBIDDEN)
        
        modules = course.module_set.all().order_by('number')
        serializer = ModuleBasicSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'modules': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def my_courses(self, request):
        """دوراتي المسجل بها"""
        user = request.user
        enrolled_courses = Course.objects.filter(
            enroller_user=user,
            status='published'
        ).select_related('instructors', 'category').prefetch_related('tags')
        
        serializer = CourseBasicSerializer(enrolled_courses, many=True, context={'request': request})
        return Response({
            'courses': serializer.data
        }, status=status.HTTP_200_OK)


# ModuleViewSet has been moved to content.views


@api_view(['GET'])
@permission_classes([AllowAny])
def course_search(request):
    """البحث في الدورات"""
    serializer = SearchSerializer(data=request.GET)
    
    if not serializer.is_valid():
        return Response({
            'error': 'معاملات بحث غير صحيحة',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    # Start with published courses
    queryset = Course.objects.filter(status='published').select_related('instructors', 'category').prefetch_related('tags')
    
    # Apply filters
    if data.get('query'):
        queryset = queryset.filter(
            Q(name__icontains=data['query']) |
            Q(description__icontains=data['query']) |
            Q(small_description__icontains=data['query'])
        )
    
    if data.get('category'):
        queryset = queryset.filter(category_id=data['category'])
    
    if data.get('level'):
        queryset = queryset.filter(level=data['level'])
    
    if data.get('min_price') is not None:
        queryset = queryset.filter(price__gte=data['min_price'])
    
    if data.get('max_price') is not None:
        queryset = queryset.filter(price__lte=data['max_price'])
    
    if data.get('tags'):
        queryset = queryset.filter(tags__in=data['tags']).distinct()
    
    if data.get('instructor'):
        queryset = queryset.filter(instructors=data['instructor'])
    
    # Apply sorting
    sort_by = data.get('sort_by', '-created_at')
    queryset = queryset.order_by(sort_by)
    
    # Paginate results
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 12
    page = paginator.paginate_queryset(queryset, request)
    
    serializer = CourseBasicSerializer(page, many=True, context={'request': request})
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_courses(request):
    """الدورات المميزة"""
    courses = Course.objects.filter(
        status='published',
        is_featured=True
    ).select_related('category').prefetch_related('instructors', 'instructors__profile', 'tags')[:8]
    
    serializer = CourseBasicSerializer(courses, many=True, context={'request': request})
    return Response({
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def popular_courses(request):
    """الدورات الأكثر شعبية"""
    courses = Course.objects.filter(
        status='published'
    ).annotate(
        enrollment_count=Count('enrollments')
    ).order_by('-enrollment_count').select_related('instructors', 'category').prefetch_related('tags')[:8]
    
    serializer = CourseBasicSerializer(courses, many=True, context={'request': request})
    return Response({
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def recent_courses(request):
    """أحدث الدورات"""
    courses = Course.objects.filter(
        status='published'
    ).order_by('-created_at').select_related('instructors', 'category').prefetch_related('tags')[:8]
    
    serializer = CourseBasicSerializer(courses, many=True, context={'request': request})
    return Response({
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


# Review-related views have been moved to the reviews app


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """إحصائيات لوحة التحكم للمعلمين والمديرين"""
    user = request.user
    
    try:
        profile = user.profile
        if profile.status not in ['Instructor', 'Admin'] and not user.is_staff:
            return Response({
                'error': 'ليس لديك صلاحية للوصول لهذه الإحصائيات'
            }, status=status.HTTP_403_FORBIDDEN)
        
        stats = {}
        
        if profile.status == 'Admin' or user.is_staff:
            # Admin stats - all courses
            all_courses = Course.objects.all()
            stats = {
                'total_courses': all_courses.count(),
                'published_courses': all_courses.filter(status='published').count(),
                'draft_courses': all_courses.filter(status='draft').count(),
                'total_students': User.objects.filter(profile__status='Student').count(),
                'total_enrollments': Enrollment.objects.count(),
            }
        elif profile.status == 'Instructor':
            # Instructor stats - only their courses
            instructor = profile.get_instructor_object()
            if instructor:
                instructor_courses = Course.objects.filter(instructors=instructor)
                total_students = 0
                for course in instructor_courses:
                    total_students += course.enroller_user.count()
                
                stats = {
                    'total_courses': instructor_courses.count(),
                    'published_courses': instructor_courses.filter(status='published').count(),
                    'draft_courses': instructor_courses.filter(status='draft').count(),
                    'total_students': total_students,
                    'total_enrollments': Enrollment.objects.filter(course__in=instructor_courses).count(),
                }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Profile.DoesNotExist:
        return Response({
            'error': 'لم يتم العثور على ملف تعريف المستخدم'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def general_stats(request):
    """إحصائيات عامة للموقع"""
    stats = {
        'total_courses': Course.objects.filter(status='published').count(),
        'total_students': User.objects.filter(profile__status='Student').count(),
        'total_instructors': Instructor.objects.count(),
        'total_enrollments': Enrollment.objects.count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK) 
