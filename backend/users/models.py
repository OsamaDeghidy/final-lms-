from django.db import models
from django.contrib.auth.models import User
import uuid
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django_ckeditor_5.fields import CKEditor5Field
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
import os

# إعدادات التطبيق
class Meta:
    app_label = 'apis_users'

class Profile(models.Model):
    name = models.CharField(max_length=2000, blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.CharField(max_length=2000, blank=True, null=True)
    phone = models.CharField(max_length=2000, blank=True, null=True)
    status_choices = (
        ('Admin', 'Admin'),
        ('Student', 'Student'),
        ('Instructor', 'Instructor'),
        ('Organization', 'Organization')
    )
    status = models.CharField(max_length=2000, choices=status_choices, blank=True, null=True, default='Student')
    image_profile = models.ImageField(null=True, blank=True, default='blank.png', upload_to='user_profile/')
    shortBio = models.CharField(max_length=2000, blank=True, null=True)
    detail = CKEditor5Field(null=True, blank=True)
    
    github = models.URLField(null=True, blank=True)
    youtube = models.URLField(null=True, blank=True)
    twitter = models.URLField(null=True, blank=True)
    facebook = models.URLField(null=True, blank=True)
    instagram = models.URLField(null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.name)

    def is_admin(self):
        return self.status == 'Admin' or self.user.is_superuser

    def is_teacher_or_admin(self):
        """
        تحقق مما إذا كان المستخدم معلم أو أدمن (الأدمن له جميع صلاحيات المعلم)
        """
        return self.status in ['Instructor', 'Admin'] or self.user.is_superuser

    def get_instructor_object(self):
        """
        الحصول على كائن المدرب (أو إنشاؤه للأدمن إذا لم يكن موجوداً)
        """
        if self.status == 'Instructor':
            try:
                return Instructor.objects.get(profile=self)
            except Instructor.DoesNotExist:
                return None
        elif self.status == 'Admin' or self.user.is_superuser:
            # إنشاء كائن مدرب للأدمن إذا لم يكن موجوداً
            instructor, created = Instructor.objects.get_or_create(
                profile=self,
                defaults={
                    'bio': 'Administrator with full instructor permissions',
                    'qualification': 'System Administrator'
                }
            )
            return instructor
        return None


class Organization(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    description = CKEditor5Field(blank=True, null=True)
    location = models.CharField(max_length=2000, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    founded_year = models.DateField(blank=True, null=True)
    employees = models.IntegerField(blank=True, null=True, default = 0)


class Instructor(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, null=True, blank=True, related_name='instructor')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    department = models.CharField(max_length=2000, blank=True, null=True)
    qualification = models.CharField(max_length=2000, blank=True, null=True)
    bio = CKEditor5Field(blank=True, null=True)    
    date_of_birth = models.DateField(blank=True, null=True)
    research_interests = CKEditor5Field(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Instructor'
        verbose_name_plural = 'Instructors'
    
    def __str__(self):
        return self.profile.name if self.profile else 'Unnamed Instructor'

class Student(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    department = models.CharField(max_length=2000, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    def __str__(self):
        return self.profile.name


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to create user profile when a new User is created.
    Only triggers for newly created users to avoid duplicates.
    Note: Student/Instructor will be created automatically by manage_student_instructor signal.
    """
    if created:
        try:
            # تحقق إضافي للتأكد من عدم وجود profile
            if not hasattr(instance, 'profile') or not Profile.objects.filter(user=instance).exists():
                status = 'Admin' if instance.is_superuser else 'Student'
                Profile.objects.create(
                    user=instance,
                    name=instance.get_full_name() or instance.username,
                    email=instance.email,
                    status=status
                )
                # Student/Instructor سيتم إنشاؤه تلقائياً بواسطة signal manage_student_instructor
        except Exception as e:
            # تسجيل الخطأ دون إيقاف العملية
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating profile for user {instance.username}: {str(e)}")


@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to update existing user profile when User is updated.
    Only triggers for existing users.
    """
    if not created:
        try:
            if hasattr(instance, 'profile'):
                profile = instance.profile
                # تحديث البيانات الأساسية فقط
                profile.email = instance.email
                profile.name = instance.get_full_name() or instance.username
                
                # تحديث status للمستخدمين الفائقين
                if instance.is_superuser and profile.status != 'Admin':
                    profile.status = 'Admin'
                
                profile.save(update_fields=['email', 'name', 'status'])
        except Exception as e:
            # تسجيل الخطأ دون إيقاف العملية
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating profile for user {instance.username}: {str(e)}")


@receiver(post_save, sender=Profile)
def manage_student_instructor(sender, instance, created, **kwargs):
    """
    Signal handler to automatically create/delete Student or Instructor 
    based on Profile status changes.
    """
    try:
        status = instance.status
        
        if status == 'Student':
            # إنشاء Student إذا لم يكن موجوداً
            Student.objects.get_or_create(profile=instance)
            # حذف Instructor إذا كان موجوداً
            Instructor.objects.filter(profile=instance).delete()
            
        elif status == 'Instructor':
            # إنشاء Instructor إذا لم يكن موجوداً
            Instructor.objects.get_or_create(profile=instance)
            # حذف Student إذا كان موجوداً
            Student.objects.filter(profile=instance).delete()
            
        elif status == 'Admin':
            # إنشاء Instructor للأدمن إذا لم يكن موجوداً
            Instructor.objects.get_or_create(
                profile=instance,
                defaults={
                    'bio': 'Administrator with full instructor permissions',
                    'qualification': 'System Administrator'
                }
            )
            # حذف Student إذا كان موجوداً
            Student.objects.filter(profile=instance).delete()
            
        elif status == 'Organization':
            # حذف Student و Instructor إذا كانت الحالة Organization
            Student.objects.filter(profile=instance).delete()
            Instructor.objects.filter(profile=instance).delete()
            
    except Exception as e:
        # تسجيل الخطأ دون إيقاف العملية
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error managing Student/Instructor for profile {instance.id}: {str(e)}")
