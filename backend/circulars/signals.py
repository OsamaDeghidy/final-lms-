"""
Django signals للتعاميم المجدولة
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Circular
from notifications.services import EmailService
from notifications.models import Notification, NotificationLog, BannerNotification
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Circular)
def handle_scheduled_circular(sender, instance, created, **kwargs):
    """معالجة التعاميم المجدولة عند الوصول لوقت النشر"""
    # لا نرسل هنا، بل نترك الأمر لإدارة command
    # هذا signal فقط لتسجيل التغييرات
    pass

