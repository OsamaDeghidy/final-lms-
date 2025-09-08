from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse, path
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import CertificateTemplate, Certificate, UserSignature


class TemplateStatusFilter(SimpleListFilter):
    title = 'حالة القالب'
    parameter_name = 'is_active'

    def lookups(self, request, model_admin):
        return (
            ('active', 'نشط'),
            ('inactive', 'غير نشط'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(is_active=True)
        elif self.value() == 'inactive':
            return queryset.filter(is_active=False)
        return queryset


class CertificateStatusFilter(SimpleListFilter):
    title = 'حالة الشهادة'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('active', 'نشطة'),
            ('revoked', 'ملغية'),
            ('expired', 'منتهية الصلاحية'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(status=self.value())
        return queryset


class VerificationStatusFilter(SimpleListFilter):
    title = 'حالة التحقق'
    parameter_name = 'verification_status'

    def lookups(self, request, model_admin):
        return (
            ('verified', 'تم التحقق'),
            ('pending', 'في انتظار التحقق'),
            ('failed', 'فشل التحقق'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(verification_status=self.value())
        return queryset


@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = (
        'template_name', 'institution_name', 'template_file_preview',
        'usage_count', 'default_status', 'is_active', 'created_at'
    )
    list_filter = (
        TemplateStatusFilter, 'is_default', 'is_active', 'created_at'
    )
    search_fields = ('template_name', 'institution_name', 'certificate_text')
    readonly_fields = ('created_at', 'updated_at', 'usage_count')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('template_name', 'institution_name', 'institution_logo')
        }),
        ('القالب الجاهز', {
            'fields': ('template_file',)
        }),
        ('التوقيع', {
            'fields': (
                ('signature_name', 'signature_title'),
                'signature_image'
            )
        }),
        ('محتوى الشهادة', {
            'fields': ('certificate_text',)
        }),
        ('خيارات الإضافة', {
            'fields': (
                ('include_qr_code', 'include_grade'),
                ('include_completion_date', 'include_course_duration')
            )
        }),
        ('الحالة', {
            'fields': (
                ('is_default', 'is_active')
            )
        }),
        ('الإحصائيات', {
            'fields': ('usage_count',),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def template_file_preview(self, obj):
        if obj.template_file:
            if obj.template_file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                return format_html(
                    '<img src="{}" width="50" height="30" style="border: 1px solid #ccc; object-fit: cover;" />',
                    obj.template_file.url
                )
            else:
                return format_html(
                    '<span style="color: #007bff;">📄 {}</span>',
                    obj.template_file.name.split('/')[-1]
                )
        return 'لا يوجد'
    template_file_preview.short_description = 'القالب'
    
    def usage_count(self, obj):
        count = obj.certificate_set.count()
        if count > 0:
            url = reverse('admin:certificates_certificate_changelist') + f'?template__id__exact={obj.id}'
            return format_html('<a href="{}">{} شهادة</a>', url, count)
        return '0 شهادة'
    usage_count.short_description = 'عدد الاستخدامات'
    
    def default_status(self, obj):
        if obj.is_default:
            return format_html('<span style="color: #28a745; font-weight: bold;">⭐ افتراضي</span>')
        return '⚪ عادي'
    default_status.short_description = 'افتراضي'
    
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related('certificate_set')
    
    actions = ['make_default', 'duplicate_template']
    
    def make_default(self, request, queryset):
        if queryset.count() > 1:
            self.message_user(request, 'يمكن تعيين قالب واحد فقط كافتراضي.', level='error')
            return
        
        template = queryset.first()
        CertificateTemplate.objects.filter(is_default=True).update(is_default=False)
        template.is_default = True
        template.save()
        self.message_user(request, f'تم تعيين "{template.template_name}" كقالب افتراضي.')
    make_default.short_description = "تعيين كقالب افتراضي"
    
    def duplicate_template(self, request, queryset):
        duplicated_count = 0
        for template in queryset:
            new_name = f"{template.template_name} - نسخة"
            # إنشاء نسخة بسيطة من القالب
            new_template = CertificateTemplate.objects.create(
                template_name=new_name,
                institution_name=template.institution_name,
                institution_logo=template.institution_logo,
                signature_name=template.signature_name,
                signature_title=template.signature_title,
                signature_image=template.signature_image,
                template_file=template.template_file,
                certificate_text=template.certificate_text,
                include_qr_code=template.include_qr_code,
                include_grade=template.include_grade,
                include_completion_date=template.include_completion_date,
                include_course_duration=template.include_course_duration,
                is_default=False,
                is_active=True
            )
            duplicated_count += 1
        
        self.message_user(request, f'تم إنشاء {duplicated_count} نسخة من القوالب.')
    duplicate_template.short_description = "إنشاء نسخة من القوالب"


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = (
        'certificate_id', 'student_name', 'course_title', 'final_grade_display',
        'status_display', 'verification_display', 'date_issued', 'actions_column'
    )
    list_filter = (
        CertificateStatusFilter, VerificationStatusFilter, 'date_issued',
        'completion_date', 'course', 'template'
    )
    search_fields = (
        'certificate_id', 'student_name', 'course_title', 'user__username',
        'user__first_name', 'user__last_name', 'verification_code'
    )
    readonly_fields = (
        'certificate_id', 'verification_code', 'date_issued', 'created_at',
        'updated_at', 'qr_code_preview', 'verification_url_display'
    )
    
    fieldsets = (
        ('معلومات الشهادة', {
            'fields': (
                'certificate_id', 'user', 'course', 'template'
            )
        }),
        ('بيانات الطالب والدورة', {
            'fields': (
                'student_name', 'course_title', 'institution_name',
                'completion_date', 'course_duration_hours'
            )
        }),
        ('الدرجات والأداء', {
            'fields': (
                'final_grade', 'completion_percentage'
            )
        }),
        ('الحالة والتحقق', {
            'fields': (
                ('status', 'verification_status'),
                'verification_code', 'verification_url_display'
            )
        }),
        ('الملفات', {
            'fields': (
                'pdf_file', 'qr_code_image', 'qr_code_preview'
            )
        }),
        ('التوقيع الرقمي', {
            'fields': (
                'digital_signature', 'signature_verified', 'issued_by'
            ),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('date_issued', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def final_grade_display(self, obj):
        if obj.final_grade is not None:
            if obj.final_grade >= 90:
                color = '#28a745'
                grade_text = 'ممتاز'
            elif obj.final_grade >= 80:
                color = '#007bff'
                grade_text = 'جيد جداً'
            elif obj.final_grade >= 70:
                color = '#ffc107'
                grade_text = 'جيد'
            elif obj.final_grade >= 60:
                color = '#fd7e14'
                grade_text = 'مقبول'
            else:
                color = '#dc3545'
                grade_text = 'ضعيف'
            
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}% ({})</span>',
                color, obj.final_grade, grade_text
            )
        return 'غير محدد'
    final_grade_display.short_description = 'الدرجة النهائية'
    
    def status_display(self, obj):
        status_colors = {
            'active': ('#28a745', '✅ نشطة'),
            'revoked': ('#dc3545', '❌ ملغية'),
            'expired': ('#6c757d', '⏰ منتهية'),
        }
        color, text = status_colors.get(obj.status, ('#6c757d', obj.get_status_display()))
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, text)
    status_display.short_description = 'الحالة'
    
    def verification_display(self, obj):
        verification_colors = {
            'verified': ('#28a745', '✅ تم التحقق'),
            'pending': ('#ffc107', '⏳ في الانتظار'),
            'failed': ('#dc3545', '❌ فشل'),
        }
        color, text = verification_colors.get(obj.verification_status, ('#6c757d', obj.get_verification_status_display()))
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, text)
    verification_display.short_description = 'التحقق'
    
    def qr_code_preview(self, obj):
        if obj.qr_code_image:
            return format_html(
                '<img src="{}" width="100" height="100" style="border: 1px solid #ccc;" />',
                obj.qr_code_image.url
            )
        return 'لا يوجد'
    qr_code_preview.short_description = 'معاينة رمز QR'
    
    def verification_url_display(self, obj):
        url = obj.get_verification_url()
        return format_html('<a href="{}" target="_blank">{}</a>', url, url)
    verification_url_display.short_description = 'رابط التحقق'
    
    def actions_column(self, obj):
        actions = []
        
        if obj.status == 'active':
            actions.append(
                f'<a href="#" onclick="revokeCertificate({obj.id})" style="color: #dc3545;">إلغاء</a>'
            )
        
        if obj.pdf_file:
            actions.append(
                f'<a href="{obj.pdf_file.url}" target="_blank" style="color: #007bff;">تحميل PDF</a>'
            )
        
        verification_url = obj.get_verification_url()
        actions.append(
            f'<a href="{verification_url}" target="_blank" style="color: #28a745;">تحقق</a>'
        )
        
        return format_html(' | '.join(actions))
    actions_column.short_description = 'الإجراءات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user', 'course', 'template', 'issued_by')
    
    actions = ['revoke_certificates', 'verify_certificates', 'regenerate_qr_codes']
    
    def revoke_certificates(self, request, queryset):
        revoked_count = 0
        for certificate in queryset.filter(status='active'):
            certificate.revoke("تم الإلغاء من لوحة الإدارة")
            revoked_count += 1
        
        if revoked_count:
            self.message_user(request, f'تم إلغاء {revoked_count} شهادة.')
        else:
            self.message_user(request, 'لا توجد شهادات نشطة للإلغاء.', level='warning')
    revoke_certificates.short_description = "إلغاء الشهادات المحددة"
    
    def verify_certificates(self, request, queryset):
        verified_count = queryset.filter(verification_status__in=['pending', 'failed']).update(
            verification_status='verified'
        )
        
        if verified_count:
            self.message_user(request, f'تم التحقق من {verified_count} شهادة.')
        else:
            self.message_user(request, 'لا توجد شهادات تحتاج للتحقق.', level='warning')
    verify_certificates.short_description = "التحقق من الشهادات المحددة"
    
    def regenerate_qr_codes(self, request, queryset):
        regenerated_count = 0
        for certificate in queryset:
            certificate.generate_qr_code()
            regenerated_count += 1
        
        self.message_user(request, f'تم إعادة إنشاء رموز QR لـ {regenerated_count} شهادة.')
    regenerate_qr_codes.short_description = "إعادة إنشاء رموز QR"


@admin.register(UserSignature)
class UserSignatureAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'signature_name', 'signature_title', 'signature_preview',
        'default_status', 'is_active', 'created_at'
    )
    list_filter = ('is_default', 'is_active', 'created_at')
    search_fields = ('user__username', 'signature_name', 'signature_title')
    readonly_fields = ('created_at', 'signature_preview')
    
    fieldsets = (
        ('معلومات التوقيع', {
            'fields': ('user', 'signature_name', 'signature_title')
        }),
        ('صورة التوقيع', {
            'fields': ('signature_image', 'signature_preview')
        }),
        ('الحالة', {
            'fields': (('is_default', 'is_active'),)
        }),
        ('التواريخ', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def signature_preview(self, obj):
        if obj.signature_image:
            return format_html(
                '<img src="{}" width="150" height="75" style="border: 1px solid #ccc; object-fit: contain;" />',
                obj.signature_image.url
            )
        return 'لا يوجد'
    signature_preview.short_description = 'معاينة التوقيع'
    
    def default_status(self, obj):
        if obj.is_default:
            return format_html('<span style="color: #28a745; font-weight: bold;">⭐ افتراضي</span>')
        return '⚪ عادي'
    default_status.short_description = 'افتراضي'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user') 