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

from .models import Certificate, CertificateTemplate, PresetCertificateTemplate, UserSignature
from courses.models import Course
from users.models import Instructor, Profile
from .serializers import (
    CertificateTemplateSerializer, CertificationListSerializer,
    CertificationDetailSerializer, CertificateCreateSerializer,
    CertificateTemplateBasicSerializer, CertificateTemplateDetailSerializer,
    CertificateTemplateCreateSerializer, CertificateTemplateUpdateSerializer,
    PresetCertificateTemplateSerializer, UserSignatureSerializer,
    UserSignatureCreateSerializer, PresetTemplateSelectionSerializer,
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
                is_active=True, is_public=True
            ).select_related('created_by__profile')
        
        # Teachers and admins see their own templates + public templates
        queryset = CertificateTemplate.objects.filter(
            Q(created_by=user) | Q(is_public=True),
            is_active=True
        ).select_related('created_by__profile')
        
        # Admins see all templates
        if user.profile.status in ['Admin', 'Manager']:
            queryset = CertificateTemplate.objects.filter(
                is_active=True
            ).select_related('created_by__profile')
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create certificate template with current user as creator"""
        # Check if user can create templates
        if self.request.user.profile.status not in ['Teacher', 'Admin', 'Manager']:
            raise PermissionDenied("فقط المعلمين والمديرين يمكنهم إنشاء قوالب الشهادات")
        
        serializer.save()
    
    def perform_update(self, serializer):
        """Update certificate template with permission check"""
        template = self.get_object()
        user = self.request.user
        
        # Check permissions
        if not (template.created_by == user or user.profile.status in ['Admin', 'Manager']):
            raise PermissionDenied("ليس لديك صلاحية لتعديل هذا القالب")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Delete certificate template with permission check"""
        user = self.request.user
        
        # Check permissions
        if not (instance.created_by == user or user.profile.status in ['Admin', 'Manager']):
            raise PermissionDenied("ليس لديك صلاحية لحذف هذا القالب")
        
        # Soft delete - mark as inactive
        instance.is_active = False
        instance.save()
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set template as default for user"""
        template = self.get_object()
        user = request.user
        
        # Check if user can set default (own template or admin)
        if not (template.created_by == user or user.profile.status in ['Admin', 'Manager']):
            return Response({
                'error': 'ليس لديك صلاحية لتعديل هذا القالب'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Unset other default templates for this user
        CertificateTemplate.objects.filter(
            created_by=user,
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
            created_by=user,
            is_active=True
        ).order_by('-created_at')
        
        serializer = CertificateTemplateBasicSerializer(
            templates, many=True, context={'request': request}
        )
        
        return Response({
            'templates': serializer.data,
            'total_count': templates.count()
        })


class PresetCertificateTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for preset certificate templates (read-only)"""
    serializer_class = PresetCertificateTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PresetCertificateTemplate.objects.filter(
            is_active=True
        ).order_by('template_name')


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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_from_preset(request):
    """Create custom template from preset template"""
    # Check permissions
    if request.user.profile.status not in ['Teacher', 'Admin', 'Manager']:
        return Response({
            'error': 'ليس لديك صلاحية لإنشاء قوالب الشهادات'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PresetTemplateSelectionSerializer(
        data=request.data, 
        context={'request': request}
    )
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    validated_data = serializer.validated_data
    
    # Get preset template
    preset = get_object_or_404(
        PresetCertificateTemplate, 
        id=validated_data['preset_template_id'],
        is_active=True
    )
    
    # Get user signature if provided
    user_signature = None
    if validated_data.get('user_signature_id'):
        user_signature = get_object_or_404(
            UserSignature,
            id=validated_data['user_signature_id'],
            user=request.user
        )
    
    # Create custom template from preset
    template = CertificateTemplate.objects.create(
        created_by=request.user,
        template_name=f"قالب {request.user.profile.name} - {preset.template_style}",
        template_style=preset.template_style,
        template_source='preset',
        primary_color=preset.primary_color,
        secondary_color=preset.secondary_color,
        background_pattern=preset.background_pattern,
        border_style=preset.border_style,
        font_family=preset.font_family,
        institution_name=validated_data['institution_name'],
        signature_name=validated_data['signature_name'],
        signature_title=validated_data['signature_title'],
        certificate_text=preset.certificate_text or "هذا يشهد بأن {student_name} قد أكمل بنجاح دورة {course_name} بتاريخ {completion_date}",
        include_qr_code=preset.include_qr_code,
        include_grade=preset.include_grade,
        include_completion_date=preset.include_completion_date,
        include_course_duration=preset.include_course_duration,
        is_public=validated_data.get('is_public', False),
        institution_logo=validated_data.get('institution_logo'),
        user_signature=user_signature.signature_image if user_signature else None
    )
    
    # Return created template
    response_serializer = CertificateTemplateDetailSerializer(
        template, context={'request': request}
    )
    
    return Response({
        'message': 'تم إنشاء القالب من النموذج الجاهز بنجاح',
        'template': response_serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_templates(request):
    """Search certificate templates with filters"""
    filter_serializer = CertificateTemplateFilterSerializer(data=request.GET)
    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    filters = filter_serializer.validated_data
    user = request.user
    
    # Base queryset
    if user.profile.status not in ['Teacher', 'Admin', 'Manager']:
        # Students see only public templates
        queryset = CertificateTemplate.objects.filter(
            is_active=True, is_public=True
        )
    else:
        # Teachers see their own + public templates
        queryset = CertificateTemplate.objects.filter(
            Q(created_by=user) | Q(is_public=True),
            is_active=True
        )
        
        # Admins see all templates
        if user.profile.status in ['Admin', 'Manager']:
            queryset = CertificateTemplate.objects.filter(is_active=True)
    
    # Apply filters
    if filters.get('template_style'):
        queryset = queryset.filter(template_style=filters['template_style'])
    
    if filters.get('template_source'):
        queryset = queryset.filter(template_source=filters['template_source'])
    
    if filters.get('is_public') is not None:
        queryset = queryset.filter(is_public=filters['is_public'])
    
    if filters.get('created_by'):
        queryset = queryset.filter(created_by_id=filters['created_by'])
    
    if filters.get('search'):
        search_term = filters['search']
        queryset = queryset.filter(
            Q(template_name__icontains=search_term) |
            Q(institution_name__icontains=search_term) |
            Q(created_by__profile__name__icontains=search_term)
        )
    
    # Order and paginate
    queryset = queryset.select_related('created_by__profile').order_by('-created_at')
    
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
    
    if user.profile.status == 'Teacher':
        # Teacher statistics
        total_templates = CertificateTemplate.objects.filter(
            created_by=user, is_active=True
        ).count()
        public_templates = CertificateTemplate.objects.filter(
            created_by=user, is_active=True, is_public=True
        ).count()
        signatures_count = UserSignature.objects.filter(user=user).count()
        
        return Response({
            'total_templates': total_templates,
            'public_templates': public_templates,
            'signatures_count': signatures_count
        })
    
    elif user.profile.status in ['Admin', 'Manager']:
        # Admin statistics
        total_templates = CertificateTemplate.objects.filter(is_active=True).count()
        custom_templates = CertificateTemplate.objects.filter(
            is_active=True, template_source='custom'
        ).count()
        preset_templates = PresetCertificateTemplate.objects.filter(is_active=True).count()
        total_signatures = UserSignature.objects.count()
        
        # Template styles distribution
        template_styles = CertificateTemplate.objects.filter(
            is_active=True
        ).values('template_style').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_templates': total_templates,
            'custom_templates': custom_templates,
            'preset_templates': preset_templates,
            'total_signatures': total_signatures,
            'template_styles': list(template_styles)
        })
    
    else:
        # Students - limited stats
        available_templates = CertificateTemplate.objects.filter(
            is_active=True, is_public=True
        ).count()
        
        return Response({
            'available_templates': available_templates
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def general_stats(request):
    """Get general certificate template statistics"""
    total_templates = CertificateTemplate.objects.filter(is_active=True).count()
    public_templates = CertificateTemplate.objects.filter(
        is_active=True, is_public=True
    ).count()
    custom_templates = CertificateTemplate.objects.filter(
        is_active=True, template_source='custom'
    ).count()
    preset_templates = PresetCertificateTemplate.objects.filter(is_active=True).count()
    total_signatures = UserSignature.objects.count()
    
    # Template styles distribution
    template_styles = CertificateTemplate.objects.filter(
        is_active=True
    ).values('template_style').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent templates
    recent_templates = CertificateTemplate.objects.filter(
        is_active=True
    ).select_related('created_by__profile').order_by('-created_at')[:5]
    recent_serializer = CertificateTemplateBasicSerializer(
        recent_templates, many=True, context={'request': request}
    )
    
    return Response({
        'total_templates': total_templates,
        'public_templates': public_templates,
        'custom_templates': custom_templates,
        'preset_templates': preset_templates,
        'total_signatures': total_signatures,
        'template_styles': list(template_styles),
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
