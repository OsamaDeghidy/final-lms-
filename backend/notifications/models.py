from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import JSONField


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('course_enrollment', 'تسجيل في دورة'),
        ('assignment_due', 'موعد تسليم واجب'),
        ('exam_reminder', 'تذكير امتحان'),
        ('meeting_reminder', 'تذكير اجتماع'),
        ('grade_released', 'إعلان درجة'),
        ('certificate_issued', 'إصدار شهادة'),
        ('course_update', 'تحديث دورة'),
        ('system_announcement', 'إعلان نظام'),
        ('message', 'رسالة'),
        ('general', 'عام'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'منخفض'),
        ('normal', 'عادي'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name='المستلم')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='sent_notifications', verbose_name='المرسل')
    
    title = models.CharField(max_length=255, verbose_name='العنوان')
    message = models.TextField(verbose_name='الرسالة')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general', verbose_name='نوع الإشعار')
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='normal', verbose_name='الأولوية')
    
    # Generic foreign key for related objects
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    is_read = models.BooleanField(default=False, verbose_name='تمت القراءة')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت القراءة')
    
    # Email and push notification settings
    email_sent = models.BooleanField(default=False, verbose_name='تم إرسال بريد إلكتروني')
    push_sent = models.BooleanField(default=False, verbose_name='تم إرسال إشعار فوري')
    
    # Action button (optional)
    action_url = models.URLField(null=True, blank=True, verbose_name='رابط الإجراء')
    action_text = models.CharField(max_length=100, null=True, blank=True, verbose_name='نص الإجراء')
    
    # Scheduling
    scheduled_at = models.DateTimeField(null=True, blank=True, verbose_name='مجدول في')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='ينتهي في')
    
    # Banner notification and target page
    banner_notification = models.ForeignKey('BannerNotification', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications', verbose_name='إشعار البانر')
    target_page = models.CharField(max_length=100, null=True, blank=True, verbose_name='الصفحة المستهدفة')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        verbose_name = 'إشعار'
        verbose_name_plural = 'الإشعارات'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f'{self.title} - {self.recipient.username}'
    
    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def is_expired(self):
        """فحص إذا كان الإشعار منتهي الصلاحية"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @classmethod
    def create_notification(cls, recipient, title, message, notification_type='general', 
                          sender=None, priority='normal', content_object=None, 
                          action_url=None, action_text=None, expires_at=None):
        """إنشاء إشعار جديد"""
        notification = cls.objects.create(
            recipient=recipient,
            sender=sender,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            content_object=content_object,
            action_url=action_url,
            action_text=action_text,
            expires_at=expires_at
        )
        return notification
    
    @classmethod
    def bulk_notify(cls, recipients, title, message, **kwargs):
        """إرسال إشعار جماعي"""
        notifications = []
        for recipient in recipients:
            notifications.append(cls(
                recipient=recipient,
                title=title,
                message=message,
                **kwargs
            ))
        return cls.objects.bulk_create(notifications)


class NotificationSettings(models.Model):
    """إعدادات الإشعارات للمستخدمين"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
    # Email notifications
    email_course_updates = models.BooleanField(default=True, verbose_name='تحديثات الدورات عبر البريد')
    email_assignments = models.BooleanField(default=True, verbose_name='الواجبات عبر البريد')
    email_exams = models.BooleanField(default=True, verbose_name='الامتحانات عبر البريد')
    email_meetings = models.BooleanField(default=True, verbose_name='الاجتماعات عبر البريد')
    email_grades = models.BooleanField(default=True, verbose_name='الدرجات عبر البريد')
    email_certificates = models.BooleanField(default=True, verbose_name='الشهادات عبر البريد')
    email_system = models.BooleanField(default=True, verbose_name='إعلانات النظام عبر البريد')
    
    # Push notifications
    push_course_updates = models.BooleanField(default=True, verbose_name='تحديثات الدورات فورية')
    push_assignments = models.BooleanField(default=True, verbose_name='الواجبات فورية')
    push_exams = models.BooleanField(default=True, verbose_name='الامتحانات فورية')
    push_meetings = models.BooleanField(default=True, verbose_name='الاجتماعات فورية')
    push_grades = models.BooleanField(default=True, verbose_name='الدرجات فورية')
    push_certificates = models.BooleanField(default=True, verbose_name='الشهادات فورية')
    push_system = models.BooleanField(default=True, verbose_name='إعلانات النظام فورية')
    
    # General settings
    digest_frequency = models.CharField(
        max_length=10,
        choices=[
            ('never', 'أبداً'),
            ('daily', 'يومي'),
            ('weekly', 'أسبوعي'),
            ('monthly', 'شهري'),
        ],
        default='weekly',
        verbose_name='تكرار الملخص'
    )
    
    quiet_hours_start = models.TimeField(null=True, blank=True, verbose_name='بداية الساعات الهادئة')
    quiet_hours_end = models.TimeField(null=True, blank=True, verbose_name='نهاية الساعات الهادئة')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'إعدادات الإشعارات'
        verbose_name_plural = 'إعدادات الإشعارات'
    
    def __str__(self):
        return f'إعدادات إشعارات {self.user.username}'


class NotificationTemplate(models.Model):
    """قوالب الإشعارات"""
    name = models.CharField(max_length=255, verbose_name='اسم القالب')
    notification_type = models.CharField(max_length=20, choices=Notification.NOTIFICATION_TYPES, verbose_name='نوع الإشعار')
    
    title_template = models.CharField(max_length=255, verbose_name='قالب العنوان')
    message_template = models.TextField(verbose_name='قالب الرسالة')
    
    # Email template (optional)
    email_subject_template = models.CharField(max_length=255, null=True, blank=True, verbose_name='قالب موضوع البريد')
    email_body_template = models.TextField(null=True, blank=True, verbose_name='قالب نص البريد')
    
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'قالب إشعار'
        verbose_name_plural = 'قوالب الإشعارات'
        unique_together = ('name', 'notification_type')
    
    def __str__(self):
        return f'{self.name} ({self.get_notification_type_display()})'
    
    def render_title(self, context):
        """تطبيق القالب على العنوان"""
        return self.title_template.format(**context)
    
    def render_message(self, context):
        """تطبيق القالب على الرسالة"""
        return self.message_template.format(**context)


class NotificationLog(models.Model):
    """سجل الإشعارات المرسلة"""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    
    delivery_method = models.CharField(
        max_length=10,
        choices=[
            ('app', 'التطبيق'),
            ('email', 'البريد الإلكتروني'),
            ('push', 'إشعار فوري'),
            ('sms', 'رسالة نصية'),
        ],
        verbose_name='طريقة التوصيل'
    )
    
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'في الانتظار'),
            ('sent', 'تم الإرسال'),
            ('delivered', 'تم التوصيل'),
            ('failed', 'فشل'),
            ('bounced', 'مرتد'),
        ],
        default='pending',
        verbose_name='الحالة'
    )
    
    error_message = models.TextField(null=True, blank=True, verbose_name='رسالة الخطأ')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت الإرسال')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='وقت التوصيل')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'سجل إشعار'
        verbose_name_plural = 'سجلات الإشعارات'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.notification.title} - {self.get_delivery_method_display()} - {self.get_status_display()}'


class BannerNotification(models.Model):
    """نموذج إشعارات البانر التي تظهر في أعلى الصفحات"""
    
    BANNER_TYPES = [
        ('banner_top', 'بانر أعلى الموقع'),
        ('banner_dashboard_student', 'بانر داشبورد الطلاب'),
        ('banner_dashboard_instructor', 'بانر داشبورد المعلمين'),
    ]
    
    TARGET_TYPES = [
        ('all_students', 'جميع الطلاب'),
        ('specific_students', 'طلاب محددين'),
        ('specific_divisions', 'شعب محددة'),
        ('all_instructors', 'جميع المعلمين'),
        ('specific_instructors', 'معلمين محددين'),
        ('all_users', 'جميع المستخدمين'),
    ]
    
    title = models.CharField(max_length=255, verbose_name='العنوان')
    message = models.TextField(verbose_name='الرسالة')
    notification_type = models.CharField(max_length=30, choices=BANNER_TYPES, default='banner_top', verbose_name='نوع البانر')
    
    # Target pages - JSON array of page identifiers
    target_pages = JSONField(default=list, verbose_name='الصفحات المستهدفة', help_text='قائمة بصفحات المستهدفة، مثال: ["home", "my-courses"]')
    
    # Colors
    text_color = models.CharField(max_length=7, default='#000000', verbose_name='لون النص', help_text='صيغة HEX مثل #000000')
    background_color = models.CharField(max_length=7, default='#FFFFFF', verbose_name='لون الخلفية', help_text='صيغة HEX مثل #FFFFFF')
    
    # Targeting
    target_type = models.CharField(max_length=30, choices=TARGET_TYPES, default='all_users', verbose_name='نوع الاستهداف')
    
    # Relationships
    target_students = models.ManyToManyField('users.Student', blank=True, related_name='banner_notifications', verbose_name='الطلاب المستهدفون')
    target_divisions = models.ManyToManyField('divisions.Division', blank=True, related_name='banner_notifications', verbose_name='الشعب المستهدفة')
    target_instructors = models.ManyToManyField('users.Instructor', blank=True, related_name='banner_notifications', verbose_name='المعلمين المستهدفون')
    
    # Status and scheduling
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    start_date = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ البدء')
    end_date = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ الانتهاء')
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_banner_notifications', verbose_name='منشئ الإشعار')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    # Email option
    send_email = models.BooleanField(default=False, verbose_name='إرسال عبر البريد الإلكتروني')
    send_immediately = models.BooleanField(default=True, verbose_name='إرسال فوري', help_text='إرسال الإشعار فوراً بعد الحفظ (حتى لو كان مجدولاً)')
    
    class Meta:
        verbose_name = 'إشعار بانر'
        verbose_name_plural = 'إشعارات البانر'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'notification_type']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f'{self.title} - {self.get_notification_type_display()}'
    
    def is_currently_active(self):
        """التحقق من أن الإشعار نشط حالياً"""
        if not self.is_active:
            return False
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True
    
    def get_target_users(self):
        """الحصول على قائمة المستخدمين المستهدفين"""
        users = []
        
        if self.target_type == 'all_users':
            from django.contrib.auth import get_user_model
            User = get_user_model()
            users = list(User.objects.filter(is_active=True))
        elif self.target_type == 'all_students':
            from users.models import Student
            students = Student.objects.select_related('profile__user').filter(
                profile__user__is_active=True
            ).exclude(profile__user__isnull=True)
            users = [s.profile.user for s in students if s.profile and s.profile.user and s.profile.user.email]
        elif self.target_type == 'specific_students':
            # إعادة تحميل العلاقة ManyToMany للتأكد من الحصول على البيانات المحدثة
            students = self.target_students.select_related('profile__user').filter(
                profile__user__is_active=True
            ).exclude(profile__user__isnull=True)
            users = [s.profile.user for s in students if s.profile and s.profile.user and s.profile.user.email]
        elif self.target_type == 'specific_divisions':
            # إعادة تحميل العلاقة ManyToMany للتأكد من الحصول على البيانات المحدثة
            divisions = self.target_divisions.prefetch_related('students__profile__user').all()
            user_ids = set()  # استخدام set لتجنب التكرار
            for division in divisions:
                students = division.students.select_related('profile__user').filter(
                    profile__user__is_active=True
                ).exclude(profile__user__isnull=True)
                for student in students:
                    if student.profile and student.profile.user and student.profile.user.email:
                        if student.profile.user.id not in user_ids:
                            users.append(student.profile.user)
                            user_ids.add(student.profile.user.id)
        elif self.target_type == 'all_instructors':
            from users.models import Instructor
            instructors = Instructor.objects.select_related('profile__user').filter(
                profile__user__is_active=True
            ).exclude(profile__user__isnull=True)
            users = [i.profile.user for i in instructors if i.profile and i.profile.user and i.profile.user.email]
        elif self.target_type == 'specific_instructors':
            # إعادة تحميل العلاقة ManyToMany للتأكد من الحصول على البيانات المحدثة
            instructors = self.target_instructors.select_related('profile__user').filter(
                profile__user__is_active=True
            ).exclude(profile__user__isnull=True)
            users = [i.profile.user for i in instructors if i.profile and i.profile.user and i.profile.user.email]
        
        # تصفية المستخدمين الذين لديهم بريد إلكتروني
        users = [u for u in users if u and hasattr(u, 'email') and u.email]
        
        return users


class AttendancePenalty(models.Model):
    """قواعد الحرمان للمعلمين بناءً على عدد الغيابات"""
    
    instructor = models.ForeignKey('users.Instructor', on_delete=models.CASCADE, related_name='attendance_penalties', verbose_name='المعلم')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, null=True, blank=True, related_name='attendance_penalties', verbose_name='الدورة', help_text='إذا ترك فارغاً، ينطبق على جميع الدورات')
    max_absences = models.PositiveIntegerField(verbose_name='عدد الغيابات المسموح بها', help_text='عند الوصول لهذا العدد يتم إرسال إشعار الحرمان')
    warning_threshold = models.PositiveIntegerField(null=True, blank=True, verbose_name='عدد الغيابات للتحذير', help_text='عند الوصول لهذا العدد يتم إرسال تحذير (اختياري)')
    penalty_message = models.TextField(verbose_name='رسالة الحرمان', help_text='الرسالة التي يتم إرسالها للطالب عند الوصول للحد الأقصى')
    warning_message = models.TextField(null=True, blank=True, verbose_name='رسالة التحذير', help_text='الرسالة التي يتم إرسالها عند الوصول لعدد التحذير')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        verbose_name = 'قاعدة حرمان'
        verbose_name_plural = 'قواعد الحرمان'
        ordering = ['-created_at']
        unique_together = ['instructor', 'course', 'max_absences']
    
    def __str__(self):
        course_name = self.course.title if self.course else 'جميع الدورات'
        return f'{self.instructor} - {course_name} - {self.max_absences} غيابات'


class StudentAttendance(models.Model):
    """تتبع عدد الغيابات للطالب في كل دورة"""
    
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name='attendance_records', verbose_name='الطالب')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='student_attendances', verbose_name='الدورة')
    absences_count = models.PositiveIntegerField(default=0, verbose_name='عدد الغيابات')
    last_absence_date = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ آخر غياب')
    penalty_sent = models.BooleanField(default=False, verbose_name='تم إرسال إشعار الحرمان')
    warning_sent = models.BooleanField(default=False, verbose_name='تم إرسال إشعار التحذير')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        verbose_name = 'سجل حضور الطالب'
        verbose_name_plural = 'سجلات حضور الطلاب'
        ordering = ['-updated_at']
        unique_together = ['student', 'course']
        indexes = [
            models.Index(fields=['student', 'course']),
            models.Index(fields=['absences_count']),
        ]
    
    def __str__(self):
        return f'{self.student} - {self.course.title} - {self.absences_count} غيابات'
    
    def increment_absence(self):
        """زيادة عدد الغيابات"""
        self.absences_count += 1
        self.last_absence_date = timezone.now()
        self.save(update_fields=['absences_count', 'last_absence_date', 'updated_at']) 