"""
Django management command لمعالجة التعاميم المجدولة
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from circulars.models import Circular
from notifications.services import EmailService
from notifications.models import Notification
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Process scheduled circulars that have reached their publish time'

    def handle(self, *args, **options):
        self.stdout.write('Starting scheduled circulars processing...')
        now = timezone.now()
        
        # البحث عن التعاميم المجدولة التي وصل وقتها
        scheduled_circulars = Circular.objects.filter(
            status='scheduled',
            publish_at__lte=now,
        ).exclude(
            publish_at__isnull=True
        ).prefetch_related(
            'target_students__profile__user',
            'target_divisions__students__profile__user'
        )
        
        processed_count = 0
        sent_count = 0
        
        for circular in scheduled_circulars:
            try:
                recipients = circular.get_recipients()
                if not recipients:
                    logger.warning(f"Circular '{circular.title}' has no recipients")
                    continue
                
                # تحديث الحالة
                circular.status = 'sent'
                circular.save(update_fields=['status'])
                
                # إنشاء إشعارات
                notifications = []
                if circular.send_notification:
                    for user in recipients:
                        if user and hasattr(user, 'email') and user.email:
                            try:
                                notification = Notification.objects.create(
                                    recipient=user,
                                    sender=circular.created_by,
                                    title=circular.title,
                                    message=circular.content or '',
                                    notification_type='system_announcement',
                                    priority='high',
                                )
                                notifications.append((notification, user))
                            except Exception as e:
                                logger.error(f"Error creating notification: {str(e)}")
                                continue
                
                # إرسال البريد الإلكتروني
                emails_sent = 0
                if circular.send_email:
                    # الحصول على المرفق إذا كان موجوداً
                    attachment = circular.attachment if hasattr(circular, 'attachment') and circular.attachment else None
                    
                    # إذا كان send_notification مفعلاً، استخدم الإشعارات المنشأة
                    if notifications:
                        for notification, user in notifications:
                            try:
                                if EmailService.send_notification_email(notification, user, attachment=attachment):
                                    emails_sent += 1
                            except Exception as e:
                                logger.error(f"Error sending email: {str(e)}")
                    else:
                        # إذا كان send_email فقط مفعلاً، أنشئ إشعارات مؤقتة
                        for user in recipients:
                            if user and hasattr(user, 'email') and user.email:
                                try:
                                    notification = Notification.objects.create(
                                        recipient=user,
                                        sender=circular.created_by,
                                        title=circular.title,
                                        message=circular.content or '',
                                        notification_type='system_announcement',
                                        priority='high',
                                    )
                                    if EmailService.send_notification_email(notification, user, attachment=attachment):
                                        emails_sent += 1
                                except Exception as e:
                                    logger.error(f"Error creating/sending notification: {str(e)}")
                
                sent_count += len(notifications) if notifications else emails_sent
                processed_count += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Processed circular ID {circular.id} - Sent {len(notifications) if notifications else emails_sent} notifications ({emails_sent} emails)'
                    )
                )
            except Exception as e:
                logger.error(f"Error processing circular: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
        
        if processed_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Processed {processed_count} circulars and sent {sent_count} notifications'
                )
            )
        else:
            self.stdout.write('No scheduled circulars to process')
