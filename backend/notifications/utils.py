"""
أدوات مساعدة للإشعارات
"""
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Notification, BannerNotification, AttendancePenalty, StudentAttendance
from .services import EmailService
from users.models import Student
from courses.models import Course

User = get_user_model()


def send_banner_notification(banner_notification, force=False):
    """
    إرسال إشعار بانر للمستهدفين
    
    Args:
        banner_notification: كائن BannerNotification
        force: إذا كان True، يرسل حتى لو لم يكن نشطاً حالياً
    
    Returns:
        int: عدد الإشعارات المرسلة
    """
    import logging
    logger = logging.getLogger(__name__)
    
    if not force and not banner_notification.is_currently_active():
        logger.info(f"إشعار البانر '{banner_notification.title}' غير نشط حالياً")
        return 0
    
    # الحصول على المستخدمين المستهدفين
    try:
        target_users = banner_notification.get_target_users()
        logger.info(f"عدد المستخدمين المستهدفين لإشعار '{banner_notification.title}': {len(target_users)}")
    except Exception as e:
        logger.error(f"خطأ في الحصول على المستخدمين المستهدفين: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return 0
    
    if not target_users:
        logger.warning(f"لا يوجد مستخدمين مستهدفين لإشعار '{banner_notification.title}'")
        return 0
    
    # إنشاء إشعارات للمستخدمين (تجنب الإشعارات المكررة)
    notifications = []
    sent_count = 0
    skipped_count = 0
    
    for user in target_users:
        if not user or not hasattr(user, 'email'):
            logger.warning(f"مستخدم غير صحيح: {user}")
            continue
            
        # التحقق من وجود إشعار مشابه بالفعل (خلال آخر ساعة)
        existing = Notification.objects.filter(
            recipient=user,
            banner_notification=banner_notification,
            title=banner_notification.title,
            created_at__gte=timezone.now() - timezone.timedelta(hours=1)
        ).exists()
        
        if not existing:
            try:
                notification = Notification.objects.create(
                    recipient=user,
                    sender=banner_notification.created_by,
                    title=banner_notification.title,
                    message=banner_notification.message,
                    notification_type='system_announcement',
                    priority='high',
                    banner_notification=banner_notification,
                    expires_at=banner_notification.end_date,
                )
                notifications.append((notification, user))
                sent_count += 1
            except Exception as e:
                logger.error(f"خطأ في إنشاء إشعار للمستخدم {user.username}: {str(e)}")
                continue
        else:
            skipped_count += 1
            logger.info(f"تم تخطي إشعار مكرر للمستخدم {user.username}")
    
    logger.info(f"تم إنشاء {sent_count} إشعار جديد لإشعار البانر '{banner_notification.title}' (تم تخطي {skipped_count} إشعار مكرر)")
    
    # إرسال عبر البريد الإلكتروني إذا كان مفعلاً
    emails_sent = 0
    emails_failed = 0
    if banner_notification.send_email and notifications:
        logger.info(f"بدء إرسال {len(notifications)} بريد إلكتروني لإشعار '{banner_notification.title}'")
        try:
            # إرسال كل بريد بشكل منفصل للتأكد من الإرسال
            for notification, user in notifications:
                try:
                    if user and hasattr(user, 'email') and user.email:
                        result = EmailService.send_notification_email(notification, user)
                        if result:
                            emails_sent += 1
                        else:
                            emails_failed += 1
                    else:
                        logger.warning(f"المستخدم {user} لا يمتلك بريد إلكتروني")
                        emails_failed += 1
                except Exception as e:
                    logger.error(f"خطأ في إرسال البريد للمستخدم {user.email if user else 'unknown'}: {str(e)}")
                    emails_failed += 1
            
            logger.info(f"تم إرسال {emails_sent} بريد إلكتروني بنجاح ({emails_failed} فشل)")
        except Exception as e:
            logger.error(f"خطأ عام في إرسال البريد الإلكتروني: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
    
    return sent_count


def check_attendance_penalties():
    """
    التحقق من الغيابات وإرسال إشعارات الحرمان
    """
    penalties_sent = 0
    warnings_sent = 0
    
    # الحصول على جميع قواعد الحرمان النشطة
    active_penalties = AttendancePenalty.objects.filter(is_active=True)
    
    for penalty in active_penalties:
        # الحصول على الدورات المستهدفة
        if penalty.course:
            courses = [penalty.course]
        else:
            # جميع دورات المعلم
            courses = Course.objects.filter(instructors__in=[penalty.instructor])
        
        for course in courses:
            # الحصول على جميع الطلاب المسجلين في الدورة
            enrollments = course.enrollment_set.all()
            
            for enrollment in enrollments:
                student = None
                try:
                    # الحصول على كائن Student من Profile
                    if hasattr(enrollment.student, 'profile'):
                        from users.models import Student as StudentModel
                        student = StudentModel.objects.filter(profile=enrollment.student.profile).first()
                except:
                    continue
                
                if not student:
                    continue
                
                # الحصول على أو إنشاء سجل الحضور
                attendance, created = StudentAttendance.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={'absences_count': 0}
                )
                
                # التحقق من عدد الغيابات
                if attendance.absences_count >= penalty.max_absences and not attendance.penalty_sent:
                    # إرسال إشعار الحرمان
                    notification = Notification.objects.create(
                        recipient=student.profile.user,
                        sender=penalty.instructor.profile.user if penalty.instructor.profile else None,
                        title='إشعار حرمان',
                        message=penalty.penalty_message,
                        notification_type='system_announcement',
                        priority='urgent',
                    )
                    
                    # إرسال عبر البريد
                    EmailService.send_notification_email(notification, student.profile.user)
                    
                    attendance.penalty_sent = True
                    attendance.save(update_fields=['penalty_sent'])
                    penalties_sent += 1
                
                # التحقق من عتبة التحذير
                elif (penalty.warning_threshold and 
                      attendance.absences_count >= penalty.warning_threshold and 
                      not attendance.warning_sent and
                      attendance.absences_count < penalty.max_absences):
                    # إرسال إشعار تحذير
                    warning_message = penalty.warning_message or f'تحذير: وصلت عدد غياباتك إلى {attendance.absences_count} من {penalty.max_absences} المسموح بها'
                    
                    notification = Notification.objects.create(
                        recipient=student.profile.user,
                        sender=penalty.instructor.profile.user if penalty.instructor.profile else None,
                        title='تحذير غياب',
                        message=warning_message,
                        notification_type='system_announcement',
                        priority='high',
                    )
                    
                    # إرسال عبر البريد
                    EmailService.send_notification_email(notification, student.profile.user)
                    
                    attendance.warning_sent = True
                    attendance.save(update_fields=['warning_sent'])
                    warnings_sent += 1
    
    return {'penalties_sent': penalties_sent, 'warnings_sent': warnings_sent}


def create_cart_notification(cart_item):
    """
    إنشاء إشعار عند إضافة منتج للسلة
    
    Args:
        cart_item: كائن CartItem
    """
    # الحصول على جميع المستخدمين الأدمن
    admin_users = User.objects.filter(
        profile__status='Admin'
    ) | User.objects.filter(is_superuser=True)
    
    course = cart_item.course
    student = cart_item.cart.user
    
    # إنشاء إشعار لكل أدمن
    for admin in admin_users:
        Notification.objects.create(
            recipient=admin,
            sender=student,
            title='طلب جديد',
            message=f'قام الطالب {student.get_full_name() or student.username} بإضافة دورة "{course.title}" إلى السلة',
            notification_type='system_announcement',
            priority='normal',
            content_object=cart_item,
            action_url=f'/admin/store/cartitem/{cart_item.id}/change/',
            action_text='عرض السلة',
        )
    
    return admin_users.count()

