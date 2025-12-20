"""
Signals for certificates app
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.urls import reverse
from django.conf import settings
from .models import Certificate


@receiver(post_save, sender=Certificate)
def send_certificate_notification(sender, instance, created, **kwargs):
    """
    إرسال إشعار عبر البريد الإلكتروني عند إنشاء شهادة جديدة
    """
    if created and instance.user and instance.user.email:
        try:
            from notifications.models import Notification, NotificationLog
            from notifications.services import EmailService
            
            # التحقق من إعدادات المستخدم للإشعارات
            if hasattr(instance.user, 'notification_settings'):
                settings_obj = instance.user.notification_settings
                if not settings_obj.email_certificates:
                    # المستخدم لا يريد استقبال إشعارات الشهادات عبر البريد
                    return
            
            # الحصول على رابط معاينة PDF
            pdf_preview_url = instance.get_pdf_preview_url()
            
            # إنشاء رسالة الإشعار
            title = "🎓 تم إصدار شهادتك!"
            message = f"""
            <p>تهانينا {instance.student_name}!</p>
            <p>تم إصدار شهادتك بنجاح في الدورة التدريبية: <strong>{instance.course_title}</strong></p>
            <p>يمكنك الآن معاينة وتحميل شهادتك من خلال الرابط التالي:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="{pdf_preview_url}" style="display: inline-block; background-color: #0e5181; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600;">
                    📄 معاينة وتحميل الشهادة
                </a>
            </p>
            <p>رقم الشهادة: <strong>{instance.certificate_id}</strong></p>
            <p>تاريخ الإصدار: <strong>{instance.date_issued.strftime('%Y-%m-%d')}</strong></p>
            """
            
            # إنشاء إشعار
            notification = Notification.objects.create(
                recipient=instance.user,
                sender=None,  # الإشعار من النظام
                title=title,
                message=message,
                notification_type='certificate_issued',
                priority='high',
                content_object=instance,
                action_url=pdf_preview_url,
                action_text='معاينة وتحميل الشهادة'
            )
            
            # إرسال البريد الإلكتروني
            try:
                EmailService.send_notification_email(notification, instance.user)
                
                # تحديث حالة الإشعار
                notification.email_sent = True
                notification.save(update_fields=['email_sent'])
                
                # تسجيل الإرسال
                NotificationLog.objects.create(
                    notification=notification,
                    delivery_method='email',
                    status='sent'
                )
            except Exception as e:
                # تسجيل الخطأ
                try:
                    NotificationLog.objects.create(
                        notification=notification,
                        delivery_method='email',
                        status='failed',
                        error_message=str(e)
                    )
                except:
                    pass
                    
        except Exception as e:
            # لا نريد أن يمنع إنشاء الشهادة في حالة فشل إرسال الإشعار
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send certificate notification: {str(e)}")

