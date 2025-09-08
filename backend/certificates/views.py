from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.utils import timezone
import uuid
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.core.exceptions import PermissionDenied

from .models import Certificate, CertificateTemplate, UserSignature
from courses.models import Course, Enrollment
from users.models import Instructor, Profile
from .serializers import (
    CertificateTemplateSerializer, CertificationListSerializer,
    CertificationDetailSerializer, CertificateCreateSerializer,
    CertificateTemplateBasicSerializer, CertificateTemplateDetailSerializer,
    CertificateTemplateCreateSerializer, CertificateTemplateUpdateSerializer,
    UserSignatureSerializer,
    UserSignatureCreateSerializer,
    CertificateTemplateFilterSerializer
)


class CertificateTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing certificate templates"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CertificateTemplateCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CertificateTemplateUpdateSerializer
        elif self.action == 'retrieve':
            return CertificateTemplateDetailSerializer
        return CertificateTemplateBasicSerializer
    
    def get_queryset(self):
        """Get certificate templates queryset with proper filtering"""
        user = self.request.user
        
        # Check if user can create/manage templates
        if user.profile.status not in ['Teacher', 'Admin', 'Manager']:
            # Students can only see public templates
            return CertificateTemplate.objects.filter(
                is_active=True
            )
        
        # Teachers and admins see all templates
        queryset = CertificateTemplate.objects.filter(
            is_active=True
        )
        
        # Admins see all templates
        if user.profile.status in ['Admin', 'Manager']:
            queryset = CertificateTemplate.objects.filter(
                is_active=True
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create certificate template with current user as creator"""
        # Check if user can create templates
        if self.request.user.profile.status not in ['Teacher', 'Admin', 'Manager']:
            raise PermissionDenied("فقط المعلمين والمديرين يمكنهم إنشاء قوالب الشهادات")
        
        serializer.save()
    
    def perform_update(self, serializer):
        """Update certificate template with permission check"""
        user = self.request.user
        
        # Check permissions - only admins can update
        if user.profile.status not in ['Admin', 'Manager']:
            raise PermissionDenied("ليس لديك صلاحية لتعديل هذا القالب")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete certificate template with permission check"""
        user = self.request.user
        
        # Check permissions - only admins can delete
        if user.profile.status not in ['Admin', 'Manager']:
            raise PermissionDenied("ليس لديك صلاحية لحذف هذا القالب")
        
        # Soft delete - mark as inactive
        instance.is_active = False
        instance.save()
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set template as default for user"""
        template = self.get_object()
        user = request.user
        
        # Check if user can set default (only admins)
        if user.profile.status not in ['Admin', 'Manager']:
            return Response({
                'error': 'ليس لديك صلاحية لتعديل هذا القالب'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Unset other default templates
        CertificateTemplate.objects.filter(
            is_default=True
        ).update(is_default=False)
        
        # Set this template as default
        template.is_default = True
        template.save()
        
        return Response({
            'message': 'تم تعيين القالب كافتراضي بنجاح'
        })
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Generate preview for certificate template"""
        template = self.get_object()
        
        # Generate preview data
        preview_data = {
            'template_id': template.id,
            'template_name': template.template_name,
            'preview_url': template.preview_image.url if template.preview_image else None,
            'sample_data': {
                'student_name': 'أحمد محمد علي',
                'course_name': 'دورة تطوير المواقع',
                'completion_date': '2024-01-15',
                'institution_name': template.institution_name,
                'grade': '95%',
                'course_duration': '40 ساعة'
            }
        }
        
        return Response(preview_data)
    
    @action(detail=False, methods=['get'])
    def my_templates(self, request):
        """Get user's certificate templates"""
        user = request.user
        
        if user.profile.status not in ['Teacher', 'Admin', 'Manager']:
            return Response({
                'error': 'ليس لديك صلاحية لعرض القوالب'
            }, status=status.HTTP_403_FORBIDDEN)
        
        templates = CertificateTemplate.objects.filter(
            is_active=True
        ).order_by('-created_at')
        
        serializer = CertificateTemplateBasicSerializer(
            templates, many=True, context={'request': request}
        )
        
        return Response({
            'templates': serializer.data,
            'total_count': templates.count()
        })




class UserSignatureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user signatures"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserSignatureCreateSerializer
        return UserSignatureSerializer
    
    def get_queryset(self):
        """Get user's signatures only"""
        return UserSignature.objects.filter(
            user=self.request.user
        ).order_by('-is_default', '-created_at')
    
    def perform_create(self, serializer):
        """Create signature with current user"""
        # Check if user can create signatures
        if self.request.user.profile.status not in ['Teacher', 'Admin', 'Manager']:
            raise PermissionDenied("فقط المعلمين والمديرين يمكنهم إضافة التوقيعات")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete user signature"""
        # Check if this is user's signature
        if instance.user != self.request.user:
            raise PermissionDenied("ليس لديك صلاحية لحذف هذا التوقيع")
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set signature as default"""
        signature = self.get_object()
        
        # Unset other default signatures for this user
        UserSignature.objects.filter(
            user=request.user,
            is_default=True
        ).update(is_default=False)
        
        # Set this signature as default
        signature.is_default = True
        signature.save()
        
        return Response({
            'message': 'تم تعيين التوقيع كافتراضي بنجاح'
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_templates(request):
    """Search certificate templates with filters"""
    filter_serializer = CertificateTemplateFilterSerializer(data=request.GET)
    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    filters = filter_serializer.validated_data
    user = request.user
    
    # Base queryset - all users see all active templates
    queryset = CertificateTemplate.objects.filter(is_active=True)
    
    # Apply filters
    if filters.get('is_default') is not None:
        queryset = queryset.filter(is_default=filters['is_default'])
    
    if filters.get('is_active') is not None:
        queryset = queryset.filter(is_active=filters['is_active'])
    
    if filters.get('search'):
        search_term = filters['search']
        queryset = queryset.filter(
            Q(template_name__icontains=search_term) |
            Q(institution_name__icontains=search_term)
        )
    
    # Order and paginate
    queryset = queryset.order_by('-created_at')
    
    page = request.GET.get('page', 1)
    paginator = Paginator(queryset, 20)
    templates_page = paginator.get_page(page)
    
    serializer = CertificateTemplateBasicSerializer(
        templates_page, many=True, context={'request': request}
    )
    
    return Response({
        'templates': serializer.data,
        'page': int(page),
        'pages': paginator.num_pages,
        'total': paginator.count,
        'filters_applied': filters
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get certificate template statistics for dashboard"""
    user = request.user
    
    if user.profile.status in ['Teacher', 'Admin', 'Manager']:
        # Teacher/Admin statistics
        total_templates = CertificateTemplate.objects.filter(is_active=True).count()
        default_templates = CertificateTemplate.objects.filter(
            is_active=True, is_default=True
        ).count()
        signatures_count = UserSignature.objects.filter(user=user).count()
        
        return Response({
            'total_templates': total_templates,
            'default_templates': default_templates,
            'signatures_count': signatures_count
        })
    
    else:
        # Students - limited stats
        available_templates = CertificateTemplate.objects.filter(
            is_active=True
        ).count()
        
        return Response({
            'available_templates': available_templates
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def general_stats(request):
    """Get general certificate template statistics"""
    total_templates = CertificateTemplate.objects.filter(is_active=True).count()
    default_templates = CertificateTemplate.objects.filter(
        is_active=True, is_default=True
    ).count()
    total_signatures = UserSignature.objects.count()
    
    # Recent templates
    recent_templates = CertificateTemplate.objects.filter(
        is_active=True
    ).order_by('-created_at')[:5]
    recent_serializer = CertificateTemplateBasicSerializer(
        recent_templates, many=True, context={'request': request}
    )
    
    return Response({
        'total_templates': total_templates,
        'default_templates': default_templates,
        'total_signatures': total_signatures,
        'recent_templates': recent_serializer.data
    })


class CertificateViewSet(viewsets.ModelViewSet):
    """
    إدارة الشهادات
    """
    queryset = Certificate.objects.select_related('course', 'user', 'template').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'verification_status']
    ordering = ['-date_issued']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CertificationListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CertificateCreateSerializer
        return CertificationDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by user role
        if user.is_superuser:
            return self.queryset
        elif hasattr(user, 'profile') and user.profile.status == 'Admin':
            return self.queryset
        elif hasattr(user, 'profile') and user.profile.status == 'Teacher':
            # Teachers can see certificates for their courses
            teacher_courses = Course.objects.filter(teacher__profile__user=user)
            return self.queryset.filter(course__in=teacher_courses)
        else:
            # Students can only see their own certificates
            return self.queryset.filter(user=user)
    
    def perform_create(self, serializer):
        # Generate unique certificate ID
        certificate_id = str(uuid.uuid4())[:8].upper()
        serializer.save(
            certificate_id=certificate_id,
            date_issued=timezone.now(),
            verification_status='verified'
        )
    
    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        """
        التحقق من صحة الشهادة
        """
        certificate = self.get_object()
        
        return Response({
            'verification_status': certificate.verification_status,
            'certificate_id': certificate.certificate_id,
            'student_name': certificate.user.get_full_name(),
            'course_name': certificate.course.title,
            'date_issued': certificate.date_issued,
            'verification_code': certificate.verification_code
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_certificates(request):
    """
    شهاداتي
    """
    certificates = Certificate.objects.filter(
        user=request.user
    ).select_related('course', 'template')
    
    serializer = CertificationListSerializer(certificates, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_certificate(request, certificate_id):
    """
    التحقق من الشهادة بالرقم المرجعي (عام)
    """
    try:
        certificate = Certificate.objects.get(
            certificate_id=certificate_id,
            verification_status='verified'
        )
        
        return Response({
            'is_valid': True,
            'student_name': certificate.user.get_full_name(),
            'course_name': certificate.course.title,
            'date_issued': certificate.date_issued,
            'certificate_id': certificate.certificate_id
        })
    
    except Certificate.DoesNotExist:
        return Response({
            'is_valid': False,
            'message': 'الشهادة غير موجودة أو غير صالحة'
        }, status=status.HTTP_404_NOT_FOUND)


# API Views for Certificate Generation
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_certificate(request, course_id):
    """Generate certificate for completed course"""
    try:
        user = request.user
        course = get_object_or_404(Course, id=course_id)
        
        # Check if user is enrolled in the course
        try:
            enrollment = Enrollment.objects.get(student=user, course=course)
        except Enrollment.DoesNotExist:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if course is completed (all lessons completed)
        print(f"Debug - Enrollment status: {enrollment.status}")
        print(f"Debug - Enrollment progress: {enrollment.progress}")
        print(f"Debug - Course completion check: status={enrollment.status}, progress={enrollment.progress}")
        
        # Check if all modules are completed by checking ModuleProgress
        from content.models import Module, ModuleProgress
        total_modules = Module.objects.filter(course=course, is_active=True).count()
        completed_modules = ModuleProgress.objects.filter(
            user=user,
            module__course=course,
            is_completed=True
        ).count()
        
        print(f"Debug - Total modules: {total_modules}, Completed modules: {completed_modules}")
        
        # Course is completed if all modules are completed OR enrollment status is completed OR progress is 100%
        is_course_completed = (
            (total_modules > 0 and completed_modules == total_modules) or
            enrollment.status == 'completed' or 
            enrollment.progress >= 100
        )
        
        if not is_course_completed:
            return Response({
                'error': f'يجب إكمال جميع وحدات الدورة أولاً. الوحدات المكتملة: {completed_modules}/{total_modules}, الحالة: {enrollment.status}, التقدم: {enrollment.progress}%'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if certificate already exists
        existing_certificate = Certificate.objects.filter(user=user, course=course).first()
        if existing_certificate:
            return Response({
                'message': 'الشهادة موجودة بالفعل',
                'certificate': CertificationDetailSerializer(existing_certificate).data
            }, status=status.HTTP_200_OK)
        
        # Get default template or create one
        template = CertificateTemplate.get_default_template()
        if not template:
            # Create a basic default template
            template = CertificateTemplate.objects.create(
                template_name="قالب افتراضي",
                institution_name="أكاديمية التعلم الإلكتروني",
                signature_name="مدير الأكاديمية",
                signature_title="مدير التعليم",
                certificate_text="هذا يشهد بأن {student_name} قد أكمل بنجاح دورة {course_name} بتاريخ {completion_date}",
                is_default=True,
                is_active=True
            )
        
        # Calculate final grade if available
        final_grade = None
        if hasattr(enrollment, 'final_grade') and enrollment.final_grade:
            final_grade = enrollment.final_grade
        
        # Create certificate
        certificate = Certificate.objects.create(
            user=user,
            course=course,
            template=template,
            student_name=f"{user.first_name} {user.last_name}".strip() or user.username,
            course_title=course.title,
            institution_name=template.institution_name,
            completion_date=timezone.now(),
            final_grade=final_grade,
            completion_percentage=100.0,
            course_duration_hours=_calculate_course_duration_hours(course),
            status='active',
            verification_status='verified',
            issued_by=course.instructors.first().profile.user if course.instructors.exists() else None
        )
        
        return Response({
            'message': 'تم إنشاء الشهادة بنجاح',
            'certificate': CertificationDetailSerializer(certificate).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ أثناء إنشاء الشهادة: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_certificates(request):
    """Get user's certificates"""
    try:
        user = request.user
        certificates = Certificate.objects.filter(user=user).select_related('course', 'template').prefetch_related('template')
        
        serializer = CertificationListSerializer(certificates, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ أثناء جلب الشهادات: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_certificate_detail(request, certificate_id):
    """Get certificate details"""
    try:
        user = request.user
        certificate = get_object_or_404(Certificate, id=certificate_id, user=user)
        
        serializer = CertificationDetailSerializer(certificate)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ أثناء جلب تفاصيل الشهادة: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def verify_certificate(request, verification_code):
    """Verify certificate by verification code"""
    try:
        certificate = get_object_or_404(Certificate, verification_code=verification_code)
        
        if certificate.status != 'active':
            return Response({
                'error': 'هذه الشهادة غير صالحة أو ملغية'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CertificationDetailSerializer(certificate)
        return Response({
            'certificate': serializer.data,
            'verified': True
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ أثناء التحقق من الشهادة: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_certificate_pdf(request, certificate_id):
    """Download certificate as PDF"""
    try:
        user = request.user
        certificate = get_object_or_404(Certificate, id=certificate_id, user=user)
        
        # If PDF doesn't exist, return the certificate detail URL for printing
        if not certificate.pdf_file:
            return Response({
                'download_url': f'/certificates/verify/{certificate.verification_code}/',
                'message': 'يمكنك طباعة الشهادة من صفحة التفاصيل'
            }, status=status.HTTP_200_OK)
        
        # Return file URL for download
        return Response({
            'download_url': certificate.pdf_file.url
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ أثناء تحميل الشهادة: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_course_completion(request, course_id):
    """Check if course is completed and certificate can be generated"""
    try:
        user = request.user
        course = get_object_or_404(Course, id=course_id)
        
        # Check enrollment
        try:
            enrollment = Enrollment.objects.get(student=user, course=course)
        except Enrollment.DoesNotExist:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if certificate already exists
        existing_certificate = Certificate.objects.filter(user=user, course=course).first()
        
        # Check if all modules are completed by checking ModuleProgress
        from content.models import Module, ModuleProgress
        total_modules = Module.objects.filter(course=course, is_active=True).count()
        completed_modules = ModuleProgress.objects.filter(
            user=user,
            module__course=course,
            is_completed=True
        ).count()
        
        # Course is completed if all modules are completed OR enrollment status is completed OR progress is 100%
        is_completed = (
            (total_modules > 0 and completed_modules == total_modules) or
            enrollment.status == 'completed' or 
            enrollment.progress >= 100
        )
        
        print(f"Debug - Check completion: status={enrollment.status}, progress={enrollment.progress}, total_modules={total_modules}, completed_modules={completed_modules}, is_completed={is_completed}")
        
        return Response({
            'is_completed': is_completed,
            'has_certificate': existing_certificate is not None,
            'certificate_id': existing_certificate.id if existing_certificate else None,
            'progress_percentage': enrollment.progress,
            'enrollment_status': enrollment.status,
            'total_modules': total_modules,
            'completed_modules': completed_modules
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'حدث خطأ أثناء فحص إكمال الدورة: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _calculate_course_duration_hours(course):
    """Calculate course duration in hours from modules and lessons"""
    try:
        from content.models import Module, Lesson
        from django.db import models
        
        # Calculate total duration from all lessons in all modules
        total_minutes = Lesson.objects.filter(
            module__course=course,
            module__is_active=True,
            is_active=True
        ).aggregate(
            total=models.Sum('duration_minutes')
        )['total'] or 0
        
        # Convert minutes to hours (round to nearest hour)
        return round(total_minutes / 60) if total_minutes > 0 else 0
    except Exception:
        # Return default value if calculation fails
        return 0 
