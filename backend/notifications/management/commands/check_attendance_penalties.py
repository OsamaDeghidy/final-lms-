"""
Django management command للتحقق من الغيابات وإرسال إشعارات الحرمان
"""
from django.core.management.base import BaseCommand
from notifications.utils import check_attendance_penalties


class Command(BaseCommand):
    help = 'التحقق من الغيابات وإرسال إشعارات الحرمان'

    def handle(self, *args, **options):
        self.stdout.write('بدء التحقق من الغيابات...')
        
        try:
            stats = check_attendance_penalties()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'تم إرسال {stats["penalties_sent"]} إشعار حرمان و {stats["warnings_sent"]} إشعار تحذير'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'حدث خطأ: {str(e)}')
            )


