from django.db import models
from django.contrib.auth.models import User
import uuid
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django_ckeditor_5.fields import CKEditor5Field
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import os

# إعدادات التطبيق
class Meta:
    app_label = 'apis_users'

class Profile(models.Model):
    name = models.CharField(max_length=2000, blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.CharField(max_length=2000, blank=True, null=True)
    phone = models.CharField(max_length=2000, blank=True, null=True)
    national_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='رقم الهوية')
    is_archived = models.BooleanField(default=False, verbose_name='مؤرشف')
    status_choices = (
        ('Admin', 'Admin'),
        ('Student', 'Student'),
        ('DiplomaStudent', 'طالب الدبلوم'),
        ('Instructor', 'Instructor'),
        ('Organization', 'المدرس (المنظمة)'), 
        ('CustomerService', 'خدمة عملاء'),
        ('CertificateStaff', 'موظفين شهادات')
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


class ArchivedUser(models.Model):
    original_user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_entry'
    )
    username = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    national_id = models.CharField(max_length=100, blank=True, null=True)
    profile_data = models.JSONField(blank=True, null=True)
    archived_at = models.DateTimeField(auto_now_add=True)
    archived_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_users'
    )

    class Meta:
        ordering = ['-archived_at']
        verbose_name = _('Archived User')
        verbose_name_plural = _('Archived Users')

    def __str__(self):
        if self.original_user:
            return f"Archived: {self.original_user.get_full_name() or self.username}"
        return f"Archived: {self.username}"


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
        verbose_name = 'مدرب'
        verbose_name_plural = 'مدربون'
    
    def __str__(self):
        return self.profile.name if self.profile else 'Unnamed Instructor'

class Student(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True, verbose_name='الملف الشخصي')
    department = models.CharField(max_length=2000, blank=True, null=True, verbose_name='القسم')
    date_of_birth = models.DateField(blank=True, null=True, verbose_name='تاريخ الميلاد')
    
    class Meta:
        verbose_name = 'طالب'
        verbose_name_plural = 'طلاب'
    
    def __str__(self):
        return self.profile.name if self.profile else 'طالب بدون ملف شخصي'


class StudentGPA(models.Model):
    """نموذج درجات الطلاب"""
    GPA_SCALE_CHOICES = [
        (4, '4'),
        (5, '5'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gpa_records', verbose_name='الطالب')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='student_gpas', null=True, blank=True, verbose_name='الكورس')
    gpa = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(5.0)], verbose_name='الدرجة')
    gpa_scale = models.DecimalField(max_digits=2, decimal_places=0, default=4, choices=GPA_SCALE_CHOICES, verbose_name='أصل المعدل')
    semester_gpa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='المعدل الفصلي')
    cumulative_gpa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='المعدل التراكمي')
    grade_name = models.CharField(max_length=50, blank=True, null=True, verbose_name='اسم الدرجة')
    semester = models.CharField(max_length=50, blank=True, null=True, verbose_name='الفصل الدراسي')
    academic_year = models.CharField(max_length=20, blank=True, null=True, verbose_name='السنة الأكاديمية')
    notes = models.TextField(blank=True, null=True, verbose_name='ملاحظات')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_gpas', verbose_name='تم الإنشاء بواسطة')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        verbose_name = 'درجة الطالب'
        verbose_name_plural = 'درجات الطلاب'
        ordering = ['-created_at']
        unique_together = ['student', 'course', 'semester', 'academic_year']
    
    def __str__(self):
        course_name = self.course.title if self.course else 'عام'
        return f"{self.student.username} - {course_name} - GPA: {self.gpa}"


class GPAHistory(models.Model):
    """سجل التحديثات على GPA"""
    gpa = models.ForeignKey(StudentGPA, on_delete=models.CASCADE, related_name='history', verbose_name='الدرجة')
    old_gpa = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='GPA السابق')
    new_gpa = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='GPA الجديد')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='gpa_changes', verbose_name='تم التغيير بواسطة')
    change_reason = models.TextField(blank=True, null=True, verbose_name='سبب التغيير')
    changed_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ التغيير')
    
    class Meta:
        verbose_name = 'سجل GPA'
        verbose_name_plural = 'سجلات GPA'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.gpa.student.username} - {self.old_gpa} → {self.new_gpa} ({self.changed_at})"


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


@receiver(post_save, sender=StudentGPA)
def track_gpa_changes(sender, instance, created, **kwargs):
    """تسجيل تحديثات GPA في GPAHistory"""
    if created:
        # عند الإنشاء
        GPAHistory.objects.create(
            gpa=instance,
            old_gpa=None,
            new_gpa=instance.gpa,
            changed_by=instance.created_by,
            change_reason='إنشاء جديد'
        )
    else:
        # عند التحديث - نحتاج لمقارنة القيم القديمة والجديدة
        # هذا يتطلب استخدام pre_save أيضاً
        pass


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
            
        elif status == 'DiplomaStudent':
            # طالب الدبلوم - نفس صلاحيات الطالب العادي
            Student.objects.get_or_create(profile=instance)
            # حذف Instructor إذا كان موجوداً
            Instructor.objects.filter(profile=instance).delete()
            
        elif status == 'Instructor':
            # إنشاء Instructor إذا لم يكن موجوداً
            Instructor.objects.get_or_create(profile=instance)
            # حذف Student إذا كان موجوداً
            Student.objects.filter(profile=instance).delete()
            
        elif status == 'Teacher':
            # المدرس (المنظمة) - ليس له صلاحية إضافة/تعديل الدورة
            # إنشاء Instructor لكن بصلاحيات محدودة
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
            
        elif status in ['CustomerService', 'CertificateStaff']:
            # خدمة عملاء وموظفين شهادات - لا يحتاجون Student أو Instructor
            Student.objects.filter(profile=instance).delete()
            Instructor.objects.filter(profile=instance).delete()
            
    except Exception as e:
        # تسجيل الخطأ دون إيقاف العملية
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error managing Student/Instructor for profile {instance.id}: {str(e)}")


# Signal لتسجيل تحديثات GPA
_gpa_old_values = {}

@receiver(pre_save, sender=StudentGPA)
def store_old_gpa(sender, instance, **kwargs):
    """تخزين القيمة القديمة للـ GPA قبل التحديث"""
    if instance.pk:
        try:
            old_instance = StudentGPA.objects.get(pk=instance.pk)
            _gpa_old_values[instance.pk] = {
                'gpa': old_instance.gpa,
                'created_by': old_instance.created_by
            }
        except StudentGPA.DoesNotExist:
            pass


@receiver(post_save, sender=StudentGPA)
def track_gpa_changes(sender, instance, created, **kwargs):
    """تسجيل تحديثات GPA في GPAHistory"""
    if created:
        # عند الإنشاء
        if instance.created_by:
            GPAHistory.objects.create(
                gpa=instance,
                old_gpa=None,
                new_gpa=instance.gpa,
                changed_by=instance.created_by,
                change_reason='إنشاء جديد'
            )
    else:
        # عند التحديث
        old_data = _gpa_old_values.get(instance.pk)
        if old_data and old_data['gpa'] != instance.gpa:
            # إنشاء سجل فقط إذا تغيرت القيمة
            changed_by = instance.created_by if instance.created_by else old_data.get('created_by')
            GPAHistory.objects.create(
                gpa=instance,
                old_gpa=old_data['gpa'],
                new_gpa=instance.gpa,
                changed_by=changed_by,
                change_reason=instance.notes or 'تحديث GPA'
            )
        # تنظيف القيم المخزنة
        _gpa_old_values.pop(instance.pk, None)
