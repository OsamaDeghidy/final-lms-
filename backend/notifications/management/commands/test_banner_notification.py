"""
Django management command لاختبار إرسال إشعار بانر
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.models import BannerNotification
from notifications.utils import send_banner_notification
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'اختبار إرسال إشعار بانر لمستخدم محدد'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='البريد الإلكتروني للمستخدم المستهدف'
        )
        parser.add_argument(
            '--title',
            type=str,
            default='تعميم اختباري',
            help='عنوان الإشعار'
        )
        parser.add_argument(
            '--message',
            type=str,
            default='هذا إشعار اختباري من نظام إدارة التعلم',
            help='نص الإشعار'
        )
        parser.add_argument(
            '--send-email',
            action='store_true',
            help='إرسال عبر البريد الإلكتروني'
        )

    def handle(self, *args, **options):
        email = options['email']
        title = options['title']
        message = options['message']
        send_email = options['send_email']
        
        # البحث عن المستخدم
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.SUCCESS(f'تم العثور على المستخدم: {user.username}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'المستخدم بالبريد {email} غير موجود'))
            return
        except User.MultipleObjectsReturned:
            users = User.objects.filter(email=email)
            user = users.first()
            self.stdout.write(self.style.WARNING(f'تم العثور على عدة مستخدمين، سيتم استخدام: {user.username}'))
        
        # التحقق من وجود Profile و Student/Instructor
        if not hasattr(user, 'profile'):
            self.stdout.write(self.style.ERROR(f'المستخدم {user.username} ليس لديه profile'))
            return
        
        profile = user.profile
        self.stdout.write(f'نوع المستخدم: {profile.status}')
        
        # إنشاء BannerNotification
        banner = BannerNotification.objects.create(
            title=title,
            message=message,
            notification_type='banner_top',
            target_type='specific_students' if profile.status == 'Student' else 'specific_instructors',
            text_color='#000000',
            background_color='#FFD700',
            is_active=True,
            send_email=send_email,
            created_by=user if user.is_staff else User.objects.filter(is_superuser=True).first(),
        )
        
        # تحديد المستخدم المستهدف
        if profile.status == 'Student':
            from users.models import Student
            try:
                student = Student.objects.get(profile=profile)
                banner.target_students.add(student)
                self.stdout.write(self.style.SUCCESS(f'تم إضافة الطالب {student} كهدف'))
            except Student.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'المستخدم ليس لديه سجل Student'))
                # إرسال للمستخدم مباشرة باستخدام all_users
                banner.target_type = 'all_users'
                banner.save()
        elif profile.status == 'Instructor':
            from users.models import Instructor
            try:
                instructor = Instructor.objects.get(profile=profile)
                banner.target_instructors.add(instructor)
                self.stdout.write(self.style.SUCCESS(f'تم إضافة المعلم {instructor} كهدف'))
            except Instructor.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'المستخدم ليس لديه سجل Instructor'))
                # إرسال للمستخدم مباشرة باستخدام all_users
                banner.target_type = 'all_users'
                banner.save()
        else:
            # للمستخدمين الآخرين، استخدم all_users
            banner.target_type = 'all_users'
            banner.save()
        
        # إرسال الإشعار
        self.stdout.write(self.style.SUCCESS(f'بدء إرسال الإشعار...'))
        try:
            count = send_banner_notification(banner, force=True)
            if count > 0:
                self.stdout.write(self.style.SUCCESS(f'✅ تم إرسال الإشعار إلى {count} مستخدم بنجاح'))
                
                # التحقق من إنشاء Notification
                from notifications.models import Notification
                notifications = Notification.objects.filter(banner_notification=banner)
                self.stdout.write(f'عدد الإشعارات المُنشأة: {notifications.count()}')
                
                for notif in notifications:
                    self.stdout.write(f'  - إشعار إلى: {notif.recipient.email} (مقروء: {notif.is_read}, بريد: {notif.email_sent})')
            else:
                self.stdout.write(self.style.WARNING('لم يتم إرسال أي إشعار'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ حدث خطأ: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())


