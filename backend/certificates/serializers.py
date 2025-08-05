from rest_framework import serializers
from .models import Certificate, CertificateTemplate, PresetCertificateTemplate, UserSignature
from courses.models import Course
from django.contrib.auth.models import User
from users.models import Profile


class CertificateTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'template_name', 'template_style', 'institution_name',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CertificationListSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    template_name = serializers.CharField(source='template.template_name', read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'course', 'course_name', 'user', 'student_name',
            'template', 'template_name', 'date_issued', 'certificate_id',
            'verification_status', 'verification_code'
        ]
        read_only_fields = ['id', 'user', 'date_issued', 'certificate_id']


class CertificationDetailSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='user.email', read_only=True)
    template = CertificateTemplateSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'course', 'course_name', 'user', 'student_name',
            'student_email', 'template', 'date_issued', 'certificate_id',
            'verification_status', 'verification_code', 'final_grade'
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


class PresetCertificateTemplateSerializer(serializers.ModelSerializer):
    """Serializer for preset certificate templates"""
    preview_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PresetCertificateTemplate
        fields = [
            'id', 'name', 'template_style', 'description',
            'primary_color', 'secondary_color', 'background_pattern',
            'border_style', 'font_family', 'preview_url', 'is_active'
        ]
    
    def get_preview_url(self, obj):
        if obj.preview_image:
            return obj.preview_image.url
        return None


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
    created_by_name = serializers.CharField(source='created_by.profile.name', read_only=True)
    preview_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'template_name', 'template_style', 'template_source',
            'created_by_name', 'preview_url', 'is_active', 'is_public',
            'created_at'
        ]
    
    def get_preview_url(self, obj):
        if obj.preview_image:
            return obj.preview_image.url
        return None


class CertificateTemplateDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed certificate template information"""
    created_by = serializers.SerializerMethodField()
    institution_logo_url = serializers.SerializerMethodField()
    signature_image_url = serializers.SerializerMethodField()
    user_signature_url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'id', 'template_name', 'template_style', 'template_source',
            'primary_color', 'secondary_color', 'background_pattern',
            'border_style', 'font_family', 'institution_name',
            'institution_logo_url', 'signature_name', 'signature_title',
            'signature_image_url', 'user_signature_url', 'certificate_text',
            'include_qr_code', 'include_grade', 'include_completion_date',
            'include_course_duration', 'is_public', 'is_active',
            'created_by', 'preview_url', 'can_edit', 'can_delete',
            'created_at', 'updated_at'
        ]
    
    def get_created_by(self, obj):
        return {
            'id': obj.created_by.id,
            'name': obj.created_by.profile.name,
            'email': obj.created_by.email,
            'is_teacher': obj.created_by.profile.status == 'Teacher'
        }
    
    def get_institution_logo_url(self, obj):
        if obj.institution_logo:
            return obj.institution_logo.url
        return None
    
    def get_signature_image_url(self, obj):
        if obj.signature_image:
            return obj.signature_image.url
        return None
    
    def get_user_signature_url(self, obj):
        if obj.user_signature:
            return obj.user_signature.url
        return None
    
    def get_preview_url(self, obj):
        if obj.preview_image:
            return obj.preview_image.url
        return None
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.created_by == request.user or request.user.profile.status in ['Admin', 'Manager']
        return False
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.created_by == request.user or request.user.profile.status in ['Admin', 'Manager']
        return False


class CertificateTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating certificate templates"""
    
    TEMPLATE_CHOICES = [
        ('modern', 'تصميم حديث'),
        ('classic', 'تصميم كلاسيكي'),
        ('elegant', 'تصميم أنيق'),
        ('professional', 'تصميم مهني'),
        ('creative', 'تصميم إبداعي'),
        ('minimalist', 'تصميم بسيط'),
        ('colorful', 'تصميم ملون'),
        ('corporate', 'تصميم شركات'),
    ]
    
    COLOR_CHOICES = [
        ('#2a5a7c', 'أزرق'),
        ('#28a745', 'أخضر'),
        ('#dc3545', 'أحمر'),
        ('#ffc107', 'أصفر'),
        ('#6f42c1', 'بنفسجي'),
        ('#fd7e14', 'برتقالي'),
        ('#17a2b8', 'سماوي'),
        ('#e83e8c', 'وردي'),
        ('#6c757d', 'رمادي'),
        ('#343a40', 'أسود'),
    ]
    
    BACKGROUND_PATTERN_CHOICES = [
        ('none', 'بدون نمط'),
        ('dots', 'نقاط'),
        ('lines', 'خطوط'),
        ('waves', 'موجات'),
        ('geometric', 'أشكال هندسية'),
        ('floral', 'نباتي'),
        ('abstract', 'تجريدي'),
    ]
    
    BORDER_STYLE_CHOICES = [
        ('classic', 'كلاسيكي'),
        ('modern', 'حديث'),
        ('ornate', 'مزخرف'),
        ('simple', 'بسيط'),
        ('double', 'مزدوج'),
        ('dashed', 'متقطع'),
        ('rounded', 'مدور'),
    ]
    
    FONT_FAMILY_CHOICES = [
        ('Arial', 'Arial'),
        ('Helvetica', 'Helvetica'),
        ('Times New Roman', 'Times New Roman'),
        ('Georgia', 'Georgia'),
        ('Verdana', 'Verdana'),
        ('Tahoma', 'Tahoma'),
        ('Calibri', 'Calibri'),
        ('Trebuchet MS', 'Trebuchet MS'),
    ]
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'template_name', 'template_style', 'primary_color', 'secondary_color',
            'background_pattern', 'border_style', 'font_family', 'institution_name',
            'institution_logo', 'signature_name', 'signature_title', 'signature_image',
            'user_signature', 'certificate_text', 'include_qr_code', 'include_grade',
            'include_completion_date', 'include_course_duration', 'is_public'
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
        """Create certificate template with current user as creator"""
        validated_data['created_by'] = self.context['request'].user
        validated_data['template_source'] = 'custom'
        
        # Auto-generate template name if not provided
        if not validated_data.get('template_name'):
            user_name = self.context['request'].user.profile.name
            style = validated_data.get('template_style', 'modern')
            validated_data['template_name'] = f"قالب {user_name} - {style}"
        
        return super().create(validated_data)


class CertificateTemplateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating certificate templates"""
    
    class Meta:
        model = CertificateTemplate
        fields = [
            'template_name', 'template_style', 'primary_color', 'secondary_color',
            'background_pattern', 'border_style', 'font_family', 'institution_name',
            'institution_logo', 'signature_name', 'signature_title', 'signature_image',
            'user_signature', 'certificate_text', 'include_qr_code', 'include_grade',
            'include_completion_date', 'include_course_duration', 'is_public', 'is_active'
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


class PresetTemplateSelectionSerializer(serializers.Serializer):
    """Serializer for creating template from preset"""
    preset_template_id = serializers.IntegerField()
    institution_name = serializers.CharField(max_length=255)
    signature_name = serializers.CharField(max_length=255)
    signature_title = serializers.CharField(max_length=255)
    user_signature_id = serializers.IntegerField(required=False)
    institution_logo = serializers.ImageField(required=False)
    is_public = serializers.BooleanField(default=False)
    
    def validate_preset_template_id(self, value):
        """Validate preset template exists and is active"""
        try:
            preset = PresetCertificateTemplate.objects.get(id=value, is_active=True)
        except PresetCertificateTemplate.DoesNotExist:
            raise serializers.ValidationError("القالب المحدد غير موجود أو غير نشط")
        return value
    
    def validate_user_signature_id(self, value):
        """Validate user signature belongs to current user"""
        if value:
            user = self.context['request'].user
            try:
                signature = UserSignature.objects.get(id=value, user=user)
            except UserSignature.DoesNotExist:
                raise serializers.ValidationError("التوقيع المحدد غير موجود")
        return value


class CertificateTemplateFilterSerializer(serializers.Serializer):
    """Serializer for filtering certificate templates"""
    template_style = serializers.CharField(required=False, allow_blank=True)
    template_source = serializers.CharField(required=False, allow_blank=True)
    is_public = serializers.BooleanField(required=False)
    created_by = serializers.IntegerField(required=False)
    search = serializers.CharField(required=False, allow_blank=True) 
