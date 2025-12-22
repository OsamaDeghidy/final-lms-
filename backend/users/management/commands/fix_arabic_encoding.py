"""
Management command to fix Arabic text encoding in database
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import connection


class Command(BaseCommand):
    help = 'إصلاح ترميز النصوص العربية في قاعدة البيانات'

    def handle(self, *args, **options):
        self.stdout.write('بدء إصلاح ترميز النصوص العربية...')
        
        fixed_count = 0
        
        # إصلاح بيانات المستخدمين
        for user in User.objects.all():
            updated = False
            
            # إصلاح first_name
            if user.first_name:
                fixed = self.fix_encoding(user.first_name)
                if fixed != user.first_name:
                    user.first_name = fixed
                    updated = True
            
            # إصلاح last_name
            if user.last_name:
                fixed = self.fix_encoding(user.last_name)
                if fixed != user.last_name:
                    user.last_name = fixed
                    updated = True
            
            if updated:
                user.save(update_fields=['first_name', 'last_name'])
                fixed_count += 1
                self.stdout.write(f'تم إصلاح بيانات المستخدم: {user.username}')
        
        self.stdout.write(self.style.SUCCESS(f'تم إصلاح {fixed_count} مستخدم'))
    
    def fix_encoding(self, text):
        """إصلاح ترميز النص العربي"""
        if not text or not isinstance(text, str):
            return text if text else ''
        
        # إذا كان النص يحتوي على رموز مثل Ø§Ø³Ø§، فهذا يعني أنه UTF-8 مخزن كـ Latin-1
        if 'Ø' in text or '§' in text or '³' in text or 'Ù' in text:
            try:
                # تحويل من Latin-1 إلى bytes ثم decode كـ UTF-8
                fixed = text.encode('latin-1').decode('utf-8')
                # التحقق من أن الإصلاح نجح
                if 'Ø' not in fixed and '§' not in fixed:
                    return fixed
            except (UnicodeEncodeError, UnicodeDecodeError):
                pass
        
        return text

