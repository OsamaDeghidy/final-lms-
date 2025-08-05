from datetime import datetime, timedelta
from django.db import models
from django.contrib.auth.models import User
from ckeditor.fields import RichTextField
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.conf import settings
try:
    import qrcode
except ImportError:
    qrcode = None
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
import hashlib
from courses.models import Course


class CertificateTemplate(models.Model):
    """Certificate template settings for admins and teachers"""
    TEMPLATE_STYLE_CHOICES = [
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
    
    TEMPLATE_SOURCE_CHOICES = [
        ('custom', 'قالب مخصص'),
        ('preset', 'قالب جاهز'),
        ('imported', 'قالب مستورد'),
    ]
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="منشئ القالب")
    template_name = models.CharField(max_length=255, verbose_name="اسم القالب")
    template_style = models.CharField(max_length=20, choices=TEMPLATE_STYLE_CHOICES, default='modern', verbose_name="نمط الشهادة")
    template_source = models.CharField(max_length=20, choices=TEMPLATE_SOURCE_CHOICES, default='custom', verbose_name="مصدر القالب")
    primary_color = models.CharField(max_length=7, choices=COLOR_CHOICES, default='#2a5a7c', verbose_name="اللون الأساسي")
    secondary_color = models.CharField(max_length=7, choices=COLOR_CHOICES, default='#28a745', verbose_name="اللون الثانوي")
    institution_name = models.CharField(max_length=255, verbose_name="اسم المؤسسة")
    institution_logo = models.ImageField(upload_to='certificate_templates/logos/', null=True, blank=True, verbose_name="شعار المؤسسة")
    signature_name = models.CharField(max_length=255, verbose_name="اسم الموقع")
    signature_title = models.CharField(max_length=255, verbose_name="منصب الموقع")
    signature_image = models.ImageField(upload_to='certificate_templates/signatures/', null=True, blank=True, verbose_name="صورة التوقيع")
    
    # New field for user signature upload
    user_signature = models.ImageField(upload_to='certificate_templates/user_signatures/', null=True, blank=True, verbose_name="توقيع المستخدم")
    
    certificate_text = models.TextField(
        default="هذا يشهد بأن {student_name} قد أكمل بنجاح دورة {course_name} بتاريخ {completion_date}",
        verbose_name="نص الشهادة",
        help_text="يمكنك استخدام المتغيرات: {student_name}, {course_name}, {completion_date}, {institution_name}"
    )
    
    # Template styling options
    background_pattern = models.CharField(max_length=50, default='none', verbose_name="نمط الخلفية")
    border_style = models.CharField(max_length=50, default='classic', verbose_name="نمط الحدود")
    font_family = models.CharField(max_length=100, default='Arial', verbose_name="نوع الخط")
    
    include_qr_code = models.BooleanField(default=True, verbose_name="إضافة رمز QR للتحقق")
    include_grade = models.BooleanField(default=False, verbose_name="إضافة الدرجة في الشهادة")
    include_completion_date = models.BooleanField(default=True, verbose_name="إضافة تاريخ الإكمال")
    include_course_duration = models.BooleanField(default=False, verbose_name="إضافة مدة الدورة")
    
    # Template preview data
    preview_data = models.JSONField(default=dict, blank=True, verbose_name="بيانات المعاينة")
    
    is_public = models.BooleanField(default=False, verbose_name="قالب عام (يمكن للجميع استخدامه)")
    is_default = models.BooleanField(default=False, verbose_name="القالب الافتراضي")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "قالب الشهادة"
        verbose_name_plural = "قوالب الشهادات"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.template_name} ({self.created_by.username})"

    def save(self, *args, **kwargs):
        # إذا تم تعيين هذا كافتراضي، يجب إزالة الافتراضي من الآخرين
        if self.is_default:
            CertificateTemplate.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_default_template(cls):
        """الحصول على القالب الافتراضي"""
        template = cls.objects.filter(is_default=True, is_active=True).first()
        if not template:
            # إنشاء قالب افتراضي إذا لم يوجد
            template = cls.objects.filter(is_active=True).first()
        return template

    @classmethod
    def get_public_templates(cls):
        """الحصول على القوالب العامة"""
        return cls.objects.filter(is_public=True, is_active=True)

    @classmethod
    def get_preset_templates(cls):
        """الحصول على القوالب الجاهزة"""
        return cls.objects.filter(template_source='preset', is_active=True)

    def format_certificate_text(self, student_name, course_name, completion_date, grade=None, course_duration=None):
        """تنسيق نص الشهادة مع البيانات المحددة"""
        text = self.certificate_text.format(
            student_name=student_name,
            course_name=course_name,
            completion_date=completion_date,
            institution_name=self.institution_name
        )
        
        if self.include_grade and grade:
            text += f"\nبدرجة: {grade}%"
        
        if self.include_course_duration and course_duration:
            text += f"\nمدة الدورة: {course_duration} ساعة"
            
        return text

    def get_template_css(self):
        """إنشاء CSS للقالب"""
        css = f"""
        .certificate {{
            font-family: {self.font_family};
            color: {self.primary_color};
            border: 3px solid {self.secondary_color};
        }}
        """
        return css

    def duplicate_template(self, new_name, new_owner):
        """إنشاء نسخة من القالب"""
        new_template = CertificateTemplate.objects.create(
            created_by=new_owner,
            template_name=new_name,
            template_style=self.template_style,
            template_source='custom',
            primary_color=self.primary_color,
            secondary_color=self.secondary_color,
            institution_name=self.institution_name,
            signature_name=self.signature_name,
            signature_title=self.signature_title,
            certificate_text=self.certificate_text,
            background_pattern=self.background_pattern,
            border_style=self.border_style,
            font_family=self.font_family,
            include_qr_code=self.include_qr_code,
            include_grade=self.include_grade,
            include_completion_date=self.include_completion_date,
            include_course_duration=self.include_course_duration,
            is_public=False,
            is_default=False,
            is_active=True
        )
        
        # نسخ الصور إذا كانت موجودة
        if self.institution_logo:
            new_template.institution_logo = self.institution_logo
        if self.signature_image:
            new_template.signature_image = self.signature_image
        if self.user_signature:
            new_template.user_signature = self.user_signature
            
        new_template.save()
        return new_template


class PresetCertificateTemplate(models.Model):
    """Preset certificate templates that users can choose from"""
    name = models.CharField(max_length=255, verbose_name="اسم القالب الجاهز")
    description = models.TextField(verbose_name="وصف القالب")
    template_style = models.CharField(max_length=20, choices=CertificateTemplate.TEMPLATE_STYLE_CHOICES, verbose_name="نمط القالب")
    primary_color = models.CharField(max_length=7, default='#2a5a7c', verbose_name="اللون الأساسي")
    secondary_color = models.CharField(max_length=7, default='#28a745', verbose_name="اللون الثانوي")
    background_pattern = models.CharField(max_length=50, default='none', verbose_name="نمط الخلفية")
    border_style = models.CharField(max_length=50, default='classic', verbose_name="نمط الحدود")
    font_family = models.CharField(max_length=100, default='Arial', verbose_name="نوع الخط")
    preview_image = models.ImageField(upload_to='preset_templates/', verbose_name="صورة المعاينة")
    template_html = models.TextField(verbose_name="كود HTML للقالب")
    template_css = models.TextField(verbose_name="كود CSS للقالب")
    category = models.CharField(max_length=50, default='general', verbose_name="التصنيف")
    is_featured = models.BooleanField(default=False, verbose_name="قالب مميز")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "قالب جاهز"
        verbose_name_plural = "القوالب الجاهزة"
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.name

    def create_template_for_user(self, user, institution_name, signature_name, signature_title):
        """إنشاء قالب مخصص للمستخدم بناءً على القالب الجاهز"""
        return CertificateTemplate.objects.create(
            created_by=user,
            template_name=f"{self.name} - {user.username}",
            template_style=self.template_style,
            template_source='preset',
            primary_color=self.primary_color,
            secondary_color=self.secondary_color,
            institution_name=institution_name,
            signature_name=signature_name,
            signature_title=signature_title,
            background_pattern=self.background_pattern,
            border_style=self.border_style,
            font_family=self.font_family,
            is_active=True
        )


class Certificate(models.Model):
    """Student course completion certificates"""
    STATUS_CHOICES = [
        ('active', 'نشطة'),
        ('revoked', 'ملغية'),
        ('expired', 'منتهية الصلاحية'),
    ]
    
    VERIFICATION_STATUS_CHOICES = [
        ('verified', 'تم التحقق'),
        ('pending', 'في انتظار التحقق'),
        ('failed', 'فشل التحقق'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates', verbose_name="الطالب")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates', verbose_name="الدورة")
    template = models.ForeignKey(CertificateTemplate, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="قالب الشهادة")
    
    certificate_id = models.CharField(max_length=100, unique=True, verbose_name="رقم الشهادة")
    date_issued = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإصدار")
    completion_date = models.DateTimeField(verbose_name="تاريخ إكمال الدورة")
    
    # Certificate content
    student_name = models.CharField(max_length=255, verbose_name="اسم الطالب")
    course_title = models.CharField(max_length=500, verbose_name="عنوان الدورة")
    institution_name = models.CharField(max_length=255, default="أكاديمية التعلم الإلكتروني", verbose_name="اسم المؤسسة")
    
    # Performance data
    final_grade = models.FloatField(null=True, blank=True, verbose_name="الدرجة النهائية")
    completion_percentage = models.FloatField(default=100.0, verbose_name="نسبة الإكمال")
    course_duration_hours = models.IntegerField(null=True, blank=True, verbose_name="مدة الدورة بالساعات")
    
    # Certificate status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="حالة الشهادة")
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='verified', verbose_name="حالة التحقق")
    verification_code = models.CharField(max_length=50, unique=True, verbose_name="رمز التحقق")
    
    # Metadata
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_certificates', verbose_name="أصدرت بواسطة")
    pdf_file = models.FileField(upload_to='certificates/pdfs/', null=True, blank=True, verbose_name="ملف PDF")
    qr_code_image = models.ImageField(upload_to='certificates/qr_codes/', null=True, blank=True, verbose_name="صورة رمز QR")
    
    # Digital signature
    digital_signature = models.TextField(null=True, blank=True, verbose_name="التوقيع الرقمي")
    signature_verified = models.BooleanField(default=False, verbose_name="تم التحقق من التوقيع")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "شهادة"
        verbose_name_plural = "الشهادات"
        unique_together = ('user', 'course')
        ordering = ['-date_issued']
        indexes = [
            models.Index(fields=['certificate_id']),
            models.Index(fields=['verification_code']),
            models.Index(fields=['user', 'course']),
            models.Index(fields=['status']),
            models.Index(fields=['verification_status']),
        ]

    def __str__(self):
        return f"شهادة {self.course_title} - {self.student_name}"

    def save(self, *args, **kwargs):
        # Generate certificate ID if not exists
        if not self.certificate_id:
            self.certificate_id = self.generate_certificate_id()
        
        # Generate verification code if not exists
        if not self.verification_code:
            self.verification_code = self.generate_verification_code()
        
        # Set student name from user if not provided
        if not self.student_name:
            self.student_name = f"{self.user.first_name} {self.user.last_name}".strip()
            if not self.student_name:
                self.student_name = self.user.username
        
        # Set course title from course if not provided
        if not self.course_title:
            self.course_title = self.course.title
        
        # Set completion date if not provided
        if not self.completion_date:
            self.completion_date = timezone.now()
        
        super().save(*args, **kwargs)
        
        # Generate QR code after saving
        if not self.qr_code_image and qrcode:
            self.generate_qr_code()

    def generate_certificate_id(self):
        """إنشاء رقم شهادة فريد"""
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_part = str(uuid.uuid4())[:8].upper()
        return f"CERT-{timestamp}-{random_part}"

    def generate_verification_code(self):
        """إنشاء رمز تحقق فريد"""
        data = f"{self.user.id}-{self.course.id}-{timezone.now().timestamp()}"
        return hashlib.md5(data.encode()).hexdigest()[:16].upper()

    def get_verification_url(self):
        """الحصول على رابط التحقق من الشهادة"""
        domain = getattr(settings, 'DOMAIN_NAME', 'localhost:8000')
        return f"https://{domain}/verify-certificate/{self.verification_code}/"

    def get_download_url(self):
        """الحصول على رابط تحميل الشهادة"""
        if self.pdf_file:
            return self.pdf_file.url
        return None

    def get_template_or_default(self):
        """الحصول على القالب المخصص أو الافتراضي"""
        if self.template and self.template.is_active:
            return self.template
        return CertificateTemplate.get_default_template()

    def generate_qr_code(self):
        """إنشاء رمز QR للشهادة"""
        if not self.verification_code or not qrcode:
            return
        
        # إنشاء رمز QR يحتوي على رابط التحقق
        qr_data = self.get_verification_url()
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # إنشاء صورة QR
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # حفظ الصورة في BytesIO
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        buffer.seek(0)
        
        # حفظ الصورة في النموذج
        filename = f"qr_code_{self.certificate_id}.png"
        self.qr_code_image.save(
            filename,
            ContentFile(buffer.getvalue()),
            save=False
        )
        
        # حفظ التغييرات
        self.save(update_fields=['qr_code_image'])

    def is_valid(self):
        """فحص صلاحية الشهادة"""
        return self.status == 'active' and self.verification_status == 'verified'

    def revoke(self, reason=""):
        """إلغاء الشهادة"""
        self.status = 'revoked'
        self.save(update_fields=['status'])

    def get_grade_display(self):
        """عرض الدرجة النهائية"""
        if self.final_grade:
            return f"{self.final_grade:.1f}%"
        return "غير محدد"

    def get_duration_display(self):
        """عرض مدة الدورة"""
        if self.course_duration_hours:
            return f"{self.course_duration_hours} ساعة"
        return "غير محدد"


class UserSignature(models.Model):
    """User digital signatures for certificates"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signatures', verbose_name="المستخدم")
    signature_name = models.CharField(max_length=255, verbose_name="اسم التوقيع")
    signature_image = models.ImageField(upload_to='user_signatures/', verbose_name="صورة التوقيع")
    signature_title = models.CharField(max_length=255, null=True, blank=True, verbose_name="المنصب")
    is_default = models.BooleanField(default=False, verbose_name="التوقيع الافتراضي")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "توقيع المستخدم"
        verbose_name_plural = "توقيعات المستخدمين"
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.signature_name} - {self.user.username}"

    def save(self, *args, **kwargs):
        # إذا تم تعيين هذا كافتراضي، يجب إزالة الافتراضي من الآخرين للمستخدم نفسه
        if self.is_default:
            UserSignature.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
