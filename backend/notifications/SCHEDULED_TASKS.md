# تعليمات جدولة التعاميم

## لتشغيل التعاميم المجدولة:

### الطريقة 1: استخدام Cron Job (Linux/Mac)
أضف هذا السطر إلى crontab:
```bash
*/15 * * * * cd /path/to/backend && python manage.py process_scheduled_banners
```
هذا سيعمل كل 15 دقيقة

### الطريقة 2: استخدام Task Scheduler (Windows)
1. افتح Task Scheduler
2. أنشئ مهمة جديدة
3. قم بتشغيل الأمر:
```
cd D:\apps\lms\lmsjory\final-lms-\backend && python manage.py process_scheduled_banners
```
4. حدد التكرار كل 15 دقيقة

### الطريقة 3: استخدام Celery (إذا كان مثبتاً)
يمكن إضافة periodic task في settings.py


