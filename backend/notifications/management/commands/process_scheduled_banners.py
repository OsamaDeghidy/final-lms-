"""
Django management command لمعالجة التعاميم المجدولة
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from notifications.models import BannerNotification
from notifications.utils import send_banner_notification


class Command(BaseCommand):
    help = 'معالجة التعاميم المجدولة التي وصل وقتها'

    def handle(self, *args, **options):
        self.stdout.write('بدء معالجة التعاميم المجدولة...')
        now = timezone.now()
        
        # البحث عن التعاميم المجدولة التي وصل وقتها
        scheduled_banners = BannerNotification.objects.filter(
            is_active=True,
            send_immediately=False,  # التعاميم المجدولة فقط
            start_date__lte=now,
        ).exclude(
            start_date__isnull=True
        )
        
        processed_count = 0
        sent_count = 0
        
        for banner in scheduled_banners:
            # التحقق من أن وقت البدء قد حان
            if banner.start_date and banner.start_date <= now:
                try:
                    count = send_banner_notification(banner, force=False)
                    sent_count += count
                    processed_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'تم معالجة التعميم "{banner.title}" - تم إرسال {count} إشعار'
                        )
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'خطأ في معالجة التعميم "{banner.title}": {str(e)}'
                        )
                    )
        
        if processed_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'تم معالجة {processed_count} تعميم وإرسال {sent_count} إشعار'
                )
            )
        else:
            self.stdout.write('لا توجد تعاميم مجدولة تحتاج للمعالجة')


