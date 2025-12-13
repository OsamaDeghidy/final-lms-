"""
إشارات Django للإشعارات
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from store.models import CartItem
from meetings.models import Participant
from .models import BannerNotification, StudentAttendance
from .utils import send_banner_notification, create_cart_notification, check_attendance_penalties
from django.utils import timezone


@receiver(post_save, sender=CartItem)
def cart_item_created(sender, instance, created, **kwargs):
    """
    عند إضافة منتج جديد للسلة، إنشاء إشعار للأدمن
    """
    if created:
        create_cart_notification(instance)


@receiver(post_save, sender=Participant)
def participant_absence_updated(sender, instance, **kwargs):
    """
    عند تحديث حالة الحضور، تحديث عدد الغيابات والتحقق من الحرمان
    """
    # التحقق من أن الطالب غائب
    if instance.attendance_status == 'absent' and instance.meeting:
        try:
            # الحصول على الطالب
            from users.models import Student
            student = Student.objects.filter(profile__user=instance.user).first()
            
            if not student:
                return
            
            # الحصول على الدورة من الاجتماع
            course = instance.meeting.course if hasattr(instance.meeting, 'course') else None
            
            if course:
                # الحصول على أو إنشاء سجل الحضور
                attendance, created = StudentAttendance.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'absences_count': 0,
                        'last_absence_date': timezone.now()
                    }
                )
                
                # زيادة عدد الغيابات فقط إذا كان هذا الغياب جديد
                if created or not attendance.last_absence_date or instance.attendance_time:
                    # التحقق من أن هذا الغياب لم يتم حسابه من قبل
                    if not attendance.last_absence_date or attendance.last_absence_date < instance.attendance_time:
                        attendance.increment_absence()
                        
                        # التحقق من قواعد الحرمان
                        check_attendance_penalties()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"خطأ في تحديث الغيابات: {str(e)}")


@receiver(post_save, sender=BannerNotification)
def banner_notification_created(sender, instance, created, **kwargs):
    """
    عند إنشاء أو تحديث إشعار بانر ونشطه، إرساله للمستهدفين
    """
    # إرسال الإشعار إذا كان نشطًا (سواء كان إنشاء جديد أو تحديث)
    # لكن فقط إذا كان مفعلاً ونشط حالياً
    if instance.is_active and instance.is_currently_active():
        # تجنب إرسال مكرر - يمكن التحقق من updated_at للتأكد
        try:
            send_banner_notification(instance)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"خطأ في إرسال إشعار البانر: {str(e)}")

