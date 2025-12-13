from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django_ckeditor_5.fields import CKEditor5Field
from users.models import Student
from divisions.models import Division


class Circular(models.Model):
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('scheduled', 'مجدول'),
        ('sent', 'مرسل'),
    ]

    title = models.CharField(max_length=255, verbose_name='العنوان')
    content = CKEditor5Field(blank=True, null=True, verbose_name='المحتوى')
    attachment = models.FileField(upload_to='circulars/attachments/', null=True, blank=True, verbose_name='مرفق')

    target_divisions = models.ManyToManyField(Division, related_name='circulars', blank=True, verbose_name='الشعب المستهدفة')
    target_students = models.ManyToManyField(Student, related_name='circulars', blank=True, verbose_name='الطلاب المستهدفون')

    send_email = models.BooleanField(default=False, verbose_name='إرسال بريد')
    send_notification = models.BooleanField(default=True, verbose_name='إرسال إشعار')
    show_on_homepage = models.BooleanField(default=True, verbose_name='عرض في الصفحة الرئيسية')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='الحالة')
    publish_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت النشر')

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_circulars', verbose_name='أنشأها')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'تعميم'
        verbose_name_plural = 'التعاميم'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_recipients(self):
        """إرجاع قائمة مستخدمي المستلمين بناءً على الشعب والطلاب المحددين"""
        import logging
        logger = logging.getLogger(__name__)
        
        users = set()
        
        # From explicit students
        students = self.target_students.select_related('profile__user').all()
        logger.info(f"عدد الطلاب المحددين مباشرة: {students.count()}")
        for st in students:
            if st.profile and st.profile.user:
                if st.profile.user.email:
                    users.add(st.profile.user)
                    logger.debug(f"إضافة طالب: {st.profile.user.email}")
                else:
                    logger.warning(f"الطالب {st.id} لا يمتلك بريد إلكتروني")
            else:
                logger.warning(f"الطالب {st.id} لا يمتلك profile أو user")
        
        # From divisions' students
        divisions = self.target_divisions.prefetch_related('students__profile__user').all()
        logger.info(f"عدد الشعب المحددة: {divisions.count()}")
        for div in divisions:
            div_students = div.students.select_related('profile__user').all()
            logger.info(f"الشعبة '{div.name}' تحتوي على {div_students.count()} طالب")
            for st in div_students:
                if st.profile and st.profile.user:
                    if st.profile.user.email:
                        users.add(st.profile.user)
                        logger.debug(f"إضافة طالب من الشعبة '{div.name}': {st.profile.user.email}")
                    else:
                        logger.warning(f"الطالب {st.id} من الشعبة '{div.name}' لا يمتلك بريد إلكتروني")
                else:
                    logger.warning(f"الطالب {st.id} من الشعبة '{div.name}' لا يمتلك profile أو user")
        
        logger.info(f"إجمالي المستلمين: {len(users)}")
        return list(users)

    @property
    def recipients_count(self):
        return len(self.get_recipients())