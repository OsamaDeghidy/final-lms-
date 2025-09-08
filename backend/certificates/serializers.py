from rest_framework import serializers
from .models import Certificate, CertificateTemplate, UserSignature
from courses.models import Course
from django.contrib.auth.models import User
from users.models import Profile
from django.utils import timezone


class CertificateTemplateSerializer(serializers.ModelSerializer):
    institution_logo = serializers.SerializerMethodField()
    signature_image = serializers.SerializerMethodField()
    template_file = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'template_name', 'institution_name', 'institution_logo',
            'signature_name', 'signature_title', 'signature_image',
            'template_file', 'certificate_text', 'include_qr_code', 'include_grade', 
            'include_completion_date', 'include_course_duration',
            'is_active', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_institution_logo(self, obj):
        if obj.institution_logo:
            return obj.institution_logo.url
        return None
    
    def get_signature_image(self, obj):
        if obj.signature_image:
            return obj.signature_image.url
        return None
    
    def get_template_file(self, obj):
        if obj.template_file:
            return obj.template_file.url
        return None


class CertificationListSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    template_name = serializers.CharField(source='template.template_name', read_only=True)
    template = CertificateTemplateSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'course', 'course_name', 'course_title', 'user', 'student_name',
            'template', 'template_name', 'date_issued', 'certificate_id',
            'verification_status', 'verification_code', 'final_grade',
            'institution_name', 'course_duration_hours'
        ]
        read_only_fields = ['id', 'user', 'date_issued', 'certificate_id']


class CertificationDetailSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='user.email', read_only=True)
    template = CertificateTemplateSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'course', 'course_name', 'course_title', 'user', 'student_name',
            'student_email', 'template', 'date_issued', 'certificate_id',
            'verification_status', 'verification_code', 'final_grade',
            'institution_name', 'course_duration_hours', 'completion_percentage'
        ]
        read_only_fields = ['id', 'user', 'date_issued', 'certificate_id']


class CertificateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = [
            'course', 'user', 'template'
        ]
    
    def validate(self, data):
        course = data.get('course')
        user = data.get('user')
        
        # Check if student is enrolled in course
        if not course.enroller_user.filter(id=user.id).exists():
            raise serializers.ValidationError("الطالب غير مسجل في هذه الدورة")
        
        # Check if certificate already exists
        if Certificate.objects.filter(course=course, user=user).exists():
            raise serializers.ValidationError("الشهادة موجودة بالفعل لهذا الطالب")
        
        return data




class UserSignatureSerializer(serializers.ModelSerializer):
    """Serializer for user signatures"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    signature_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSignature
        fields = [
            'id', 'signature_name', 'signature_url', 'user_name', 
            'is_default', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']
    
    def get_signature_url(self, obj):
        if obj.signature_image:
            return obj.signature_image.url
        return None


class CertificateTemplateBasicSerializer(serializers.ModelSerializer):
    """Serializer for basic certificate template information"""
    preview_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'template_name', 'institution_name',
            'preview_url', 'is_active', 'is_default',
            'created_at'
        ]
    
    def get_preview_url(self, obj):
        if obj.template_file:
            return obj.template_file.url
        return None


class CertificateTemplateDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed certificate template information"""
    institution_logo_url = serializers.SerializerMethodField()
    signature_image_url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'template_name', 'institution_name',
            'institution_logo_url', 'signature_name', 'signature_title',
            'signature_image_url', 'certificate_text',
            'include_qr_code', 'include_grade', 'include_completion_date',
            'include_course_duration', 'is_default', 'is_active',
            'preview_url', 'created_at', 'updated_at'
        ]
    
    def get_institution_logo_url(self, obj):
        if obj.institution_logo:
            return obj.institution_logo.url
        return None
    
    def get_signature_image_url(self, obj):
        if obj.signature_image:
            return obj.signature_image.url
        return None
    
    def get_preview_url(self, obj):
        if obj.template_file:
            return obj.template_file.url
        return None


class CertificateTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating certificate templates"""
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'template_name', 'institution_name', 'institution_logo',
            'signature_name', 'signature_title', 'signature_image',
            'template_file', 'certificate_text', 'include_qr_code', 'include_grade',
            'include_completion_date', 'include_course_duration', 'is_default'
        ]
    
    def validate_certificate_text(self, value):
        """Validate certificate text contains required placeholders"""
        required_placeholders = ['{student_name}', '{course_name}']
        for placeholder in required_placeholders:
            if placeholder not in value:
                raise serializers.ValidationError(
                    f"نص الشهادة يجب أن يحتوي على المتغير {placeholder}"
                )
        return value
    
    def create(self, validated_data):
        """Create certificate template"""
        # Auto-generate template name if not provided
        if not validated_data.get('template_name'):
            validated_data['template_name'] = f"قالب جديد - {timezone.now().strftime('%Y-%m-%d')}"
        
        return super().create(validated_data)


class CertificateTemplateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating certificate templates"""
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'template_name', 'institution_name', 'institution_logo',
            'signature_name', 'signature_title', 'signature_image',
            'template_file', 'certificate_text', 'include_qr_code', 'include_grade',
            'include_completion_date', 'include_course_duration', 'is_default', 'is_active'
        ]
    
    def validate_certificate_text(self, value):
        """Validate certificate text contains required placeholders"""
        required_placeholders = ['{student_name}', '{course_name}']
        for placeholder in required_placeholders:
            if placeholder not in value:
                raise serializers.ValidationError(
                    f"نص الشهادة يجب أن يحتوي على المتغير {placeholder}"
                )
        return value


class UserSignatureCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user signatures"""
    
    class Meta:
        model = UserSignature
        fields = ['signature_name', 'signature_image', 'is_default']
    
    def validate_signature_name(self, value):
        """Validate signature name is unique for user"""
        user = self.context['request'].user
        if UserSignature.objects.filter(user=user, signature_name=value).exists():
            raise serializers.ValidationError("يوجد توقيع بهذا الاسم بالفعل")
        return value
    
    def create(self, validated_data):
        """Create signature with current user"""
        validated_data['user'] = self.context['request'].user
        
        # If this is set as default, unset other defaults
        if validated_data.get('is_default'):
            UserSignature.objects.filter(
                user=validated_data['user'],
                is_default=True
            ).update(is_default=False)
        
        return super().create(validated_data)


class CertificateTemplateFilterSerializer(serializers.Serializer):
    """Serializer for filtering certificate templates"""
    is_default = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    search = serializers.CharField(required=False, allow_blank=True) 
