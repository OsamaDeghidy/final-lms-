from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.validators import FileExtensionValidator
from courses.models import Course


class Banner(models.Model):
    """Model for managing banners on the website"""
    BANNER_TYPES = [
        ('main', 'Main Banner'),
        ('sidebar', 'Sidebar Banner'),
        ('promo', 'Promotional Banner'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='عنوان البانر')
    description = models.TextField(blank=True, null=True, verbose_name='الوصف')
    image = models.ImageField(
        upload_to='banners/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
        ],
        verbose_name='صورة البانر'
    )
    url = models.URLField(max_length=500, blank=True, null=True, verbose_name='رابط البانر')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    banner_type = models.CharField(
        max_length=20,
        choices=BANNER_TYPES,
        default='main',
        verbose_name='نوع البانر'
    )
    display_order = models.PositiveIntegerField(default=0, verbose_name='ترتيب العرض')
    start_date = models.DateTimeField(default=timezone.now, verbose_name='تاريخ البدء')
    end_date = models.DateTimeField(blank=True, null=True, verbose_name='تاريخ الانتهاء')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'بانر'
        verbose_name_plural = 'البانرات'
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.title
    
    def is_active_now(self):
        """Check if the banner is currently active"""
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date and self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True


class CourseCollection(models.Model):
    """Model for grouping courses under a named collection"""
    name = models.CharField(max_length=200, verbose_name='اسم المجموعة')
    slug = models.SlugField(max_length=200, unique=True, allow_unicode=True, verbose_name='رابط المجموعة')
    description = models.TextField(blank=True, null=True, verbose_name='الوصف')
    courses = models.ManyToManyField(
        Course,
        related_name='collections',
        blank=True,
        verbose_name='الكورسات'
    )
    is_featured = models.BooleanField(default=False, verbose_name='مميز')
    display_order = models.PositiveIntegerField(default=0, verbose_name='ترتيب العرض')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'مجموعة كورسات'
        verbose_name_plural = 'مجموعات الكورسات'
        ordering = ['display_order', '-created_at']
    
    def __str__(self):
        return self.name
    
    def get_active_courses(self):
        """Return only active courses in this collection"""
        return self.courses.filter(status='published', is_active=True)
    
    def course_count(self):
        """Return count of active courses in this collection"""
        return self.get_active_courses().count()
