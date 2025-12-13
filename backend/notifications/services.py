"""
خدمة إرسال البريد الإلكتروني عبر SendGrid
"""
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Notification, NotificationLog

logger = logging.getLogger(__name__)


class EmailService:
    """خدمة إرسال البريد الإلكتروني"""
    
    @staticmethod
    def _process_html_content_for_email(html_content):
        """معالجة محتوى HTML للبريد الإلكتروني"""
        if not html_content:
            return ''
        
        # تحويل الروابط النسبية للصور إلى مطلقة (إذا لزم الأمر)
        import re
        from django.conf import settings
        
        # استبدال newlines بـ <br>
        processed = html_content.replace(chr(10), '<br>').replace(chr(13), '')
        
        # معالجة الصور - تحويل الروابط النسبية
        def replace_img_src(match):
            img_tag = match.group(0)
            src = match.group(1)
            
            # إذا كانت الصورة محلية، أبقها كما هي (سيتم معالجتها كـ CID لاحقاً)
            if settings.MEDIA_URL in src or src.startswith('/media/'):
                return img_tag
            
            return img_tag
        
        # البحث عن الصور
        img_pattern = r'<img([^>]+)src=["\']([^"\']+)["\']([^>]*)>'
        processed = re.sub(img_pattern, replace_img_src, processed)
        
        return processed
    
    @staticmethod
    def send_notification_email(notification, recipient, attachment=None):
        """
        إرسال إشعار عبر البريد الإلكتروني
        
        Args:
            notification: كائن Notification
            recipient: المستلم (User object)
            attachment: ملف مرفق (FileField object) - اختياري
        
        Returns:
            bool: True إذا تم الإرسال بنجاح، False خلاف ذلك
        """
        try:
            subject = notification.title
            message = notification.message
            
            # إنشاء محتوى نصي نظيف (محسّن لتجنب Spam)
            import re
            plain_text_message = re.sub(r'<[^>]+>', '', message)
            plain_text_message = plain_text_message.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').strip()
            if not plain_text_message:
                plain_text_message = subject
            
            # تنظيف النص من HTML tags للنسخة النصية
            import re
            clean_message = re.sub(r'<[^>]+>', '', message)
            clean_message = clean_message.replace('&nbsp;', ' ').strip()
            
            # إنشاء HTML محسّن (استخدام settings من أعلى الملف)
            domain = getattr(settings, 'DOMAIN_NAME', 'lms-system.com')
            unsubscribe_url = f"https://{domain}/unsubscribe/?email={recipient.email}"
            
            html_message = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar-SA" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Language" content="ar-SA">
    <title>{subject}</title>
    <style>
        @media only screen and (max-width: 600px) {{
            .email-container {{
                width: 100% !important;
            }}
        }}
    </style>
</head>
<body dir="rtl" style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, Helvetica, sans-serif; background-color: #f4f4f4; direction: rtl;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
        <tr>
            <td align="center" style="padding: 0;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 30px 20px; background-color: #0e5181; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">{subject}</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px; background-color: #ffffff;">
                            <div style="color: #333333; font-size: 16px; line-height: 1.8; text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
                                {EmailService._process_html_content_for_email(message)}
                            </div>
                            {f'<div style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px; border-right: 3px solid #0e5181;"><strong>📎 مرفق:</strong> تم إرفاق ملف مع هذا التعميم</div>' if attachment else ''}
                            {f'<div style="margin-top: 30px; text-align: center;"><a href="{notification.action_url}" style="display: inline-block; background-color: #0e5181; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; font-family: Arial, sans-serif;">{notification.action_text or "عرض التفاصيل"}</a></div>' if notification.action_url else ''}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; text-align: center; font-family: Arial, sans-serif; line-height: 1.6;">
                                نظام إدارة التعلم<br>
                                Learning Management System
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 11px; text-align: center; font-family: Arial, sans-serif;">
                                <a href="{unsubscribe_url}" style="color: #999999; text-decoration: underline;">إلغاء الاشتراك</a> | 
                                هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""
            
            # إرسال البريد مع headers محسّنة
            from django.core.mail import EmailMultiAlternatives
            from django.utils import timezone
            import uuid
            
            # إنشاء Message-ID فريد
            message_id = f"<{uuid.uuid4()}@{getattr(settings, 'DOMAIN_NAME', 'lms-system.com')}>"
            
            # إعداد اسم المرسل
            from_name = "نظام إدارة التعلم"
            from_email_full = f"{from_name} <{settings.DEFAULT_FROM_EMAIL}>"
            
            # معالجة الصور في المحتوى (تحويل إلى inline attachments) قبل إنشاء البريد
            image_cid_map = {}  # خريطة لربط URLs بـ CIDs
            try:
                import re
                from urllib.parse import urlparse
                from django.core.files.storage import default_storage
                # settings مستورد بالفعل من أعلى الملف
                
                # البحث عن جميع الصور في المحتوى
                img_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>'
                images = re.findall(img_pattern, message)
                
                for img_url in images:
                    # التحقق إذا كانت الصورة محلية
                    parsed_url = urlparse(img_url)
                    is_local = (
                        not parsed_url.netloc or 
                        settings.MEDIA_URL.replace('/', '') in parsed_url.path or
                        img_url.startswith('/media/')
                    )
                    
                    if is_local:
                        # صورة محلية - سنحولها إلى CID attachment
                        try:
                            # استخراج مسار الملف
                            if settings.MEDIA_URL in img_url:
                                file_path = img_url.split(settings.MEDIA_URL)[1]
                            elif img_url.startswith('/media/'):
                                file_path = img_url.replace('/media/', '')
                            else:
                                file_path = img_url.lstrip('/')
                            
                            # إنشاء CID فريد
                            import uuid
                            cid = str(uuid.uuid4())[:8]
                            cid_url = f'image_{cid}'
                            image_cid_map[img_url] = cid_url
                            
                            # استبدال URL الصورة في HTML بـ CID
                            html_message = html_message.replace(img_url, f'cid:{cid_url}')
                            logger.info(f"تم تحويل الصورة إلى CID: {file_path}")
                        except Exception as e:
                            logger.warning(f"لم يتم معالجة الصورة {img_url}: {str(e)}")
                            # المتابعة بدون الصورة
            except Exception as e:
                logger.warning(f"خطأ في معالجة الصور: {str(e)}")
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_text_message,
                from_email=from_email_full,
                to=[recipient.email],
                reply_to=[settings.DEFAULT_FROM_EMAIL],
            )
            email.attach_alternative(html_message, "text/html")
            
            # إضافة الصور كـ inline attachments
            if image_cid_map:
                try:
                    from django.core.files.storage import default_storage
                    import mimetypes
                    
                    for img_url, cid_url in image_cid_map.items():
                        try:
                            # استخراج مسار الملف
                            if settings.MEDIA_URL in img_url:
                                file_path = img_url.split(settings.MEDIA_URL)[1]
                            elif img_url.startswith('/media/'):
                                file_path = img_url.replace('/media/', '')
                            else:
                                file_path = img_url.lstrip('/')
                            
                            # فتح الصورة
                            try:
                                full_path = default_storage.path(file_path)
                            except (ValueError, AttributeError):
                                # إذا كان default_storage لا يدعم path، استخدم MEDIA_ROOT مباشرة
                                import os
                                full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                            
                            with open(full_path, 'rb') as img_file:
                                img_content = img_file.read()
                            
                            # تحديد نوع المحتوى
                            content_type, _ = mimetypes.guess_type(full_path)
                            if not content_type:
                                content_type = 'image/jpeg'
                            
                            # إرفاق الصورة كـ inline attachment
                            email.attach(cid_url, img_content, content_type)
                            logger.info(f"تم إرفاق الصورة كـ inline: {file_path}")
                        except Exception as e:
                            logger.warning(f"لم يتم إرفاق الصورة {img_url}: {str(e)}")
                except Exception as e:
                    logger.warning(f"خطأ في إرفاق الصور: {str(e)}")
            
            # إضافة الملف المرفق إذا كان موجوداً
            if attachment and attachment.name:
                try:
                    from django.core.files.storage import default_storage
                    
                    # فتح الملف وإرفاقه
                    if hasattr(attachment, 'file') and attachment.file:
                        attachment.file.open('rb')
                        file_content = attachment.file.read()
                        attachment.file.close()
                        
                        # تحديد نوع المحتوى
                        import mimetypes
                        content_type, _ = mimetypes.guess_type(attachment.name)
                        if not content_type:
                            # تحديد نوع افتراضي بناءً على الامتداد
                            ext = attachment.name.split('.')[-1].lower()
                            content_type_map = {
                                'pdf': 'application/pdf',
                                'doc': 'application/msword',
                                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'xls': 'application/vnd.ms-excel',
                                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                'jpg': 'image/jpeg',
                                'jpeg': 'image/jpeg',
                                'png': 'image/png',
                                'gif': 'image/gif',
                                'zip': 'application/zip',
                                'rar': 'application/x-rar-compressed',
                            }
                            content_type = content_type_map.get(ext, 'application/octet-stream')
                        
                        email.attach(attachment.name, file_content, content_type)
                        logger.info(f"تم إرفاق الملف: {attachment.name}")
                except Exception as e:
                    logger.error(f"خطأ في إرفاق الملف: {str(e)}")
                    import traceback
                    logger.error(traceback.format_exc())
                    # المتابعة بدون المرفق
            
            # إضافة headers محسّنة لتقليل Spam
            domain = getattr(settings, 'DOMAIN_NAME', 'lms-system.com')
            unsubscribe_url = f"https://{domain}/unsubscribe/?email={recipient.email}"
            
            # Headers محسّنة لتجنب Spam وتحسين التسليم
            email.extra_headers = {
                'Message-ID': message_id,
                'X-Priority': '3',  # Normal priority
                'X-MSMail-Priority': 'Normal',
                'Importance': 'Normal',
                'Content-Language': 'ar-SA',
                'List-Unsubscribe': f'<{unsubscribe_url}>, <mailto:{settings.DEFAULT_FROM_EMAIL}?subject=unsubscribe>',
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                'X-Mailer': 'LMS Learning Management System',
                # ملاحظة: إزالة 'Precedence: bulk' و 'Auto-Submitted: auto-generated' 
                # لأنها قد تسبب تصنيف البريد كـ bulk/spam
                # وإزالة 'X-Auto-Response-Suppress' لأنها قد تؤثر على التسليم
            }
            
            email.send(fail_silently=False)
            
            # تحديث حالة الإشعار
            notification.email_sent = True
            notification.save(update_fields=['email_sent'])
            
            # تسجيل نجاح الإرسال
            NotificationLog.objects.create(
                notification=notification,
                delivery_method='email',
                status='sent',
            )
            
            logger.info(f"تم إرسال البريد الإلكتروني بنجاح للمستخدم {recipient.email}")
            return True
            
        except Exception as e:
            logger.error(f"خطأ في إرسال البريد الإلكتروني: {str(e)}")
            
            # تسجيل فشل الإرسال
            NotificationLog.objects.create(
                notification=notification,
                delivery_method='email',
                status='failed',
                error_message=str(e),
            )
            
            return False
    
    @staticmethod
    def send_banner_notification_email(banner_notification, recipient):
        """
        إرسال إشعار بانر عبر البريد الإلكتروني
        
        Args:
            banner_notification: كائن BannerNotification
            recipient: المستلم (User object)
        
        Returns:
            bool: True إذا تم الإرسال بنجاح، False خلاف ذلك
        """
        try:
            subject = banner_notification.title
            message = banner_notification.message
            
            # إنشاء محتوى HTML للبريد
            html_message = f"""
            <html>
            <body dir="rtl" style="font-family: Arial, sans-serif; direction: rtl;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: {banner_notification.background_color}; color: {banner_notification.text_color};">
                    <h2 style="color: {banner_notification.text_color};">{subject}</h2>
                    <div style="margin: 20px 0; line-height: 1.6;">
                        {message}
                    </div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
                    <p style="color: {banner_notification.text_color}; font-size: 12px; opacity: 0.8;">هذا بريد إلكتروني تلقائي من نظام إدارة التعلم</p>
                </div>
            </body>
            </html>
            """
            
            plain_message = strip_tags(message)
            
            # إرسال البريد
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"تم إرسال إشعار البانر عبر البريد للمستخدم {recipient.email}")
            return True
            
        except Exception as e:
            logger.error(f"خطأ في إرسال إشعار البانر عبر البريد: {str(e)}")
            return False
    
    @staticmethod
    def send_bulk_emails(notifications):
        """
        إرسال مجموعة من الإشعارات عبر البريد الإلكتروني
        
        Args:
            notifications: قائمة من tuples (notification, recipient)
        
        Returns:
            dict: إحصائيات الإرسال {'success': count, 'failed': count}
        """
        stats = {'success': 0, 'failed': 0}
        
        for notification, recipient in notifications:
            if EmailService.send_notification_email(notification, recipient):
                stats['success'] += 1
            else:
                stats['failed'] += 1
        
        return stats

