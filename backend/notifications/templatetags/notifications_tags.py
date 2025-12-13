from django import template
from notifications.models import Notification

register = template.Library()


@register.simple_tag
def get_unread_notifications_count(user):
    """الحصول على عدد الإشعارات غير المقروءة للمستخدم"""
    if not user or not user.is_authenticated:
        return 0
    try:
        return Notification.objects.filter(
            recipient=user,
            is_read=False
        ).count()
    except:
        return 0

