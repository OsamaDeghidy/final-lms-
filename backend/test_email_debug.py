"""
سكريبت لاختبار إرسال البريد وتتبع المشاكل
"""
import os
import sys
import django

# Fix encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from circulars.models import Circular
from notifications.models import Notification
from notifications.services import EmailService
from django.contrib.auth.models import User

# الحصول على التعاميم
circulars = Circular.objects.filter(title__icontains='فورى').order_by('-id')[:2]

if not circulars:
    print("لم يتم العثور على التعاميم")
    exit(1)

for circular in circulars:
    print(f"\n{'='*50}")
    print(f"التعميم: {circular.title}")
    print(f"ID: {circular.pk}")
    print(f"Status: {circular.status}")
    print(f"Send Email: {circular.send_email}")
    print(f"Send Notification: {circular.send_notification}")
    print(f"Recipients Count: {circular.recipients_count}")
    
    # الحصول على المستلمين
    recipients = circular.get_recipients()
    print(f"عدد المستلمين: {len(recipients)}")
    
    # فحص الإشعارات المرسلة
    notifications = Notification.objects.filter(title=circular.title).order_by('-created_at')[:5]
    print(f"عدد الإشعارات المنشأة: {notifications.count()}")
    
    for n in notifications:
        print(f"  - {n.recipient.email}: email_sent={n.email_sent}, created_at={n.created_at}")
    
    # محاولة إرسال بريد مباشرة
    if recipients and circular.send_email:
        print("\nمحاولة إرسال بريد مباشرة...")
        test_user = recipients[0]
        print(f"المستخدم المستهدف: {test_user.email}")
        
        # إنشاء إشعار تجريبي
        test_notification = Notification.objects.create(
            recipient=test_user,
            sender=circular.created_by if circular.created_by else User.objects.filter(is_superuser=True).first(),
            title=f"[TEST] {circular.title}",
            message=circular.content or '',
            notification_type='system_announcement',
            priority='high',
        )
        
        try:
            attachment = circular.attachment if hasattr(circular, 'attachment') and circular.attachment else None
            result = EmailService.send_notification_email(test_notification, test_user, attachment=attachment)
            print(f"نتيجة الإرسال: {'نجح ✅' if result else 'فشل ❌'}")
        except Exception as e:
            print(f"خطأ في الإرسال: {str(e)}")
            import traceback
            traceback.print_exc()

