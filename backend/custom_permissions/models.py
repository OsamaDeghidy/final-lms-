from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class CustomPermission(models.Model):
    """
    Custom permissions model for website functionality
    """
    PERMISSION_CHOICES = [
        # إدارة المستخدمين
        ('view_instructors', _('عرض المعلمين')),
        ('add_instructors', _('إضافة معلمين')),
        ('edit_instructors', _('تعديل المعلمين')),
        ('delete_instructors', _('حذف المعلمين')),
        ('view_students', _('عرض الطلاب')),
        ('add_students', _('إضافة طلاب')),
        ('edit_students', _('تعديل الطلاب')),
        ('delete_students', _('حذف الطلاب')),
        
        # إدارة الكورسات
        ('view_all_courses', _('عرض جميع الكورسات')),
        ('add_all_courses', _('إضافة جميع الكورسات')),
        ('edit_all_courses', _('تعديل جميع الكورسات')),
        ('delete_all_courses', _('حذف جميع الكورسات')),
        ('view_my_courses', _('عرض كورساتي')),
        ('add_my_courses', _('إضافة كورساتي')),
        ('edit_my_courses', _('تعديل كورساتي')),
        ('delete_my_courses', _('حذف كورساتي')),
        
        # إدارة المحتوى
        ('view_lessons', _('عرض الدروس')),
        ('add_lessons', _('إضافة دروس')),
        ('edit_lessons', _('تعديل الدروس')),
        ('delete_lessons', _('حذف الدروس')),
        ('view_modules', _('عرض الوحدات')),
        ('add_modules', _('إضافة وحدات')),
        ('edit_modules', _('تعديل الوحدات')),
        ('delete_modules', _('حذف الوحدات')),
        
        # إدارة الاختبارات
        ('view_quizzes', _('عرض الاختبارات')),
        ('add_quizzes', _('إضافة اختبارات')),
        ('edit_quizzes', _('تعديل الاختبارات')),
        ('delete_quizzes', _('حذف الاختبارات')),
        ('view_questions', _('عرض الأسئلة')),
        ('add_questions', _('إضافة أسئلة')),
        ('edit_questions', _('تعديل الأسئلة')),
        ('delete_questions', _('حذف الأسئلة')),
        
        # إدارة الطلبات والمدفوعات
        ('view_orders', _('عرض الطلبات')),
        ('add_orders', _('إضافة طلبات')),
        ('edit_orders', _('تعديل الطلبات')),
        ('delete_orders', _('حذف الطلبات')),
        ('view_payments', _('عرض المدفوعات')),
        ('add_payments', _('إضافة مدفوعات')),
        ('edit_payments', _('تعديل المدفوعات')),
        ('delete_payments', _('حذف المدفوعات')),
        ('view_coupons', _('عرض الكوبونات')),
        ('add_coupons', _('إضافة كوبونات')),
        ('edit_coupons', _('تعديل الكوبونات')),
        ('delete_coupons', _('حذف الكوبونات')),
        
        # إدارة الشهادات
        ('view_certificates', _('عرض الشهادات')),
        ('add_certificates', _('إضافة شهادات')),
        ('edit_certificates', _('تعديل الشهادات')),
        ('delete_certificates', _('حذف الشهادات')),
        
        # إدارة التقييمات
        ('view_reviews', _('عرض التقييمات')),
        ('add_reviews', _('إضافة تقييمات')),
        ('edit_reviews', _('تعديل التقييمات')),
        ('delete_reviews', _('حذف التقييمات')),
        
        # إدارة اللافتات والإعدادات
        ('view_banners', _('عرض اللافتات')),
        ('add_banners', _('إضافة لافتات')),
        ('edit_banners', _('تعديل اللافتات')),
        ('delete_banners', _('حذف اللافتات')),
        ('view_settings', _('عرض الإعدادات')),
        ('add_settings', _('إضافة إعدادات')),
        ('edit_settings', _('تعديل الإعدادات')),
        ('delete_settings', _('حذف الإعدادات')),
        
        # إدارة المحاضرات
        ('view_meetings', _('عرض المحاضرات')),
        ('add_meetings', _('إضافة محاضرات')),
        ('edit_meetings', _('تعديل المحاضرات')),
        ('delete_meetings', _('حذف المحاضرات')),
        
        # إدارة المقالات
        ('view_articles', _('عرض المقالات')),
        ('add_articles', _('إضافة مقالات')),
        ('edit_articles', _('تعديل المقالات')),
        ('delete_articles', _('حذف المقالات')),
        ('view_article_categories', _('عرض تصنيفات المقالات')),
        ('add_article_categories', _('إضافة تصنيفات مقالات')),
        ('edit_article_categories', _('تعديل تصنيفات المقالات')),
        ('delete_article_categories', _('حذف تصنيفات المقالات')),
        ('view_article_comments', _('عرض تعليقات المقالات')),
        ('add_article_comments', _('إضافة تعليقات مقالات')),
        ('edit_article_comments', _('تعديل تعليقات المقالات')),
        ('delete_article_comments', _('حذف تعليقات المقالات')),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name=_('المستخدم'),
        related_name='custom_permissions'
    )
    permission_code = models.CharField(
        max_length=100,
        choices=PERMISSION_CHOICES,
        verbose_name=_('رمز الصلاحية')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('نشط')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('تاريخ الإنشاء')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('تاريخ التحديث')
    )
    
    class Meta:
        verbose_name = _('صلاحية مخصصة')
        verbose_name_plural = _('الصلاحيات المخصصة')
        unique_together = ['user', 'permission_code']
        ordering = ['user', 'permission_code']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_permission_code_display()}"
    
    @classmethod
    def get_user_permissions(cls, user):
        """Get all active permissions for a user"""
        return cls.objects.filter(
            user=user,
            is_active=True
        ).values_list('permission_code', flat=True)
    
    @classmethod
    def has_permission(cls, user, permission_code):
        """Check if user has specific permission"""
        if user.is_superuser:
            return True
        return cls.objects.filter(
            user=user,
            permission_code=permission_code,
            is_active=True
        ).exists()
    
    @classmethod
    def has_any_permission(cls, user, permission_codes):
        """Check if user has any of the specified permissions"""
        if user.is_superuser:
            return True
        return cls.objects.filter(
            user=user,
            permission_code__in=permission_codes,
            is_active=True
        ).exists()
    
    @classmethod
    def has_all_permissions(cls, user, permission_codes):
        """Check if user has all of the specified permissions"""
        if user.is_superuser:
            return True
        user_permissions = set(cls.get_user_permissions(user))
        required_permissions = set(permission_codes)
        return required_permissions.issubset(user_permissions) 