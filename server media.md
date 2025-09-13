# دليل إعداد رفع الملفات الكبيرة - Server Media Configuration

## المشكلة
- خطأ 413 Request Entity Too Large عند رفع الملفات الكبيرة
- خطأ 403 Forbidden عند الوصول لملفات media
- الملفات لا ترفع إلى مجلد media على الخادم

## الحل الكامل

### 1. إعدادات nginx الأساسية

```bash
sudo nano /etc/nginx/nginx.conf
```

أضف في قسم `http`:

```nginx
http {
    # ... existing settings ...
    
    # إعدادات الملفات الكبيرة
    client_max_body_size 500M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    client_body_buffer_size 128k;
    
    # إعدادات proxy للملفات الكبيرة
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    proxy_request_buffering off;
    
    # ... rest of settings ...
}
```

### 2. إعدادات موقع nginx

```bash
sudo nano /etc/nginx/sites-available/myproject
```

```nginx
server {
    listen 443 ssl;
    server_name 157.245.234.55 pdt-admin.com www.pdt-admin.com;

    # إعدادات الملفات الكبيرة
    client_max_body_size 500M;
    client_body_timeout 300s;

    location = /favicon.ico { 
        access_log off; 
        log_not_found off; 
    }

    # Static files
    location /staticfiles/ {
        alias /home/sammy/myprojectdir/staticfiles/;
        expires 30d;
        add_header Cache-Control public;
    }

    # Media files - إعدادات محسنة
    location /media/ {
        alias /home/sammy/myprojectdir/media/;
        expires 30d;
        add_header Cache-Control public;
        
        # إعدادات إضافية للملفات
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
        
        # تحسين الأداء للملفات الكبيرة
        try_files $uri $uri/ =404;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
        
        # إعدادات proxy للملفات الكبيرة
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_request_buffering off;
    }

    ssl_certificate /etc/letsencrypt/live/pdt-admin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdt-admin.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.pdt-admin.com) {
        return 301 https://$host$request_uri;
    }

    if ($host = pdt-admin.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name 157.245.234.55 pdt-admin.com www.pdt-admin.com;
    return 404;
}
```

### 3. إعدادات Django

```bash
sudo nano /home/sammy/myprojectdir/backend/settings.py
```

تأكد من هذه الإعدادات:

```python
# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Upload limits - زيادة الحدود
MAX_MODULE_FILE_MB = 500
DATA_UPLOAD_MAX_MEMORY_SIZE = 500 * 1024 * 1024  # 500MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 500 * 1024 * 1024  # 500MB

# إعدادات إضافية للملفات الكبيرة
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_TEMP_DIR = None
```

### 4. إعدادات Gunicorn

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=sammy
Group=www-data
WorkingDirectory=/home/sammy/myprojectdir
Environment="PATH=/home/sammy/myprojectdir/myprojectenv/bin"
ExecStart=/home/sammy/myprojectdir/myprojectenv/bin/gunicorn --workers 3 --bind unix:/run/gunicorn.sock core.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure
RestartSec=5
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

# إعدادات للملفات الكبيرة
LimitNOFILE=65535
```

### 5. إنشاء مجلدات media

```bash
# إنشاء مجلدات media
sudo mkdir -p /home/sammy/myprojectdir/media/courses/images
sudo mkdir -p /home/sammy/myprojectdir/media/courses/syllabus
sudo mkdir -p /home/sammy/myprojectdir/media/courses/materials
sudo mkdir -p /home/sammy/myprojectdir/media/categories
sudo mkdir -p /home/sammy/myprojectdir/media/uploads/ckeditor5
sudo mkdir -p /home/sammy/myprojectdir/media/banners
sudo mkdir -p /home/sammy/myprojectdir/media/certificate_templates

# تعيين الصلاحيات
sudo chown -R sammy:www-data /home/sammy/myprojectdir/media/
sudo chmod -R 755 /home/sammy/myprojectdir/media/
```

### 6. إصلاح الصلاحيات

```bash
# إصلاح صلاحيات nginx
sudo chown -R www-data:www-data /home/sammy/myprojectdir/
sudo chmod -R 755 /home/sammy/myprojectdir/

# إضافة nginx user إلى مجموعة sammy
sudo usermod -a -G sammy www-data
```

### 7. إنشاء مجلد temp للملفات

```bash
# إنشاء مجلد temp
sudo mkdir -p /tmp/nginx_uploads
sudo chown www-data:www-data /tmp/nginx_uploads
sudo chmod 755 /tmp/nginx_uploads
```

### 8. تطبيق التغييرات

```bash
# اختبار nginx
sudo nginx -t

# إعادة تشغيل الخدمات
sudo systemctl daemon-reload
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

### 9. اختبار الرفع

```bash
# اختبار رفع ملف صغير
echo "test file" > /home/sammy/myprojectdir/media/test-upload.txt

# اختبار الوصول
curl -I https://pdt-admin.com/media/test-upload.txt

# اختبار صورة موجودة
curl -I https://pdt-admin.com/media/courses/images/mostafav5.png
```

### 10. مراقبة السجلات

```bash
# مراقبة سجلات nginx
sudo tail -f /var/log/nginx/error.log

# مراقبة سجلات gunicorn
sudo journalctl -u gunicorn -f
```

### 11. اختبار رفع ملف كبير

```bash
# إنشاء ملف اختبار كبير (10MB)
dd if=/dev/zero of=/home/sammy/myprojectdir/media/test-large.bin bs=1M count=10

# اختبار الوصول
curl -I https://pdt-admin.com/media/test-large.bin
```

## ملاحظات مهمة

1. **500MB** حد معقول للدورات
2. **nginx** يخدم ملفات media مباشرة
3. **Django** يرفع الملفات إلى مجلد media
4. **الصلاحيات** مهمة جداً
5. **مراقبة السجلات** عند حدوث مشاكل

## اختبار نهائي

```bash
# اختبار شامل
curl -X POST https://pdt-admin.com/api/courses/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Course" \
  -F "image=@/path/to/large-image.jpg"
```

## استكشاف الأخطاء

### إذا ظهر خطأ 413:
- تأكد من `client_max_body_size` في nginx
- تحقق من `DATA_UPLOAD_MAX_MEMORY_SIZE` في Django

### إذا ظهر خطأ 403:
- تحقق من صلاحيات المجلدات
- تأكد من إعدادات nginx لـ media

### إذا لم ترفع الملفات:
- تحقق من مسار `MEDIA_ROOT` في Django
- تأكد من وجود مجلدات media

## الأوامر السريعة

```bash
# إعادة تشغيل سريع
sudo nginx -t && sudo systemctl restart nginx && sudo systemctl restart gunicorn

# فحص الصلاحيات
ls -la /home/sammy/myprojectdir/media/

# اختبار سريع
curl -I https://pdt-admin.com/media/test.txt
```

---

**تاريخ الإنشاء**: 11 سبتمبر 2025  
**الخادم**: 157.245.234.55  
**الدومين**: pdt-admin.com  
**المستخدم**: sammy
```

تم إنشاء الملف! 🎉 هذا الملف يحتوي على جميع الخطوات المطلوبة لحل مشكلة رفع الملفات الكبيرة على الخادم.



# المسار الحالي (sammy user)
ls -la /home/sammy/myprojectdir/media/

# المسار الذي قد تراه في WinSCP (root user)
ls -la /root/myprojectdir/media/




# تغيير ملكية المجلد إلى sammy
sudo chown -R sammy:sammy /home/sammy/myprojectdir/

# إعطاء صلاحيات كاملة
sudo chmod -R 755 /home/sammy/myprojectdir/


# إضافة nginx إلى مجموعة sammy
sudo usermod -a -G sammy www-data

# إصلاح صلاحيات media
sudo chown -R sammy:www-data /home/sammy/myprojectdir/media/
sudo chmod -R 775 /home/sammy/myprojectdir/media/



# إصلاح صلاحيات جميع الملفات
sudo chown -R sammy:sammy /home/sammy/myprojectdir/backend/
sudo chmod -R 644 /home/sammy/myprojectdir/backend/*.py
sudo chmod -R 755 /home/sammy/myprojectdir/backend/




# إصلاح صلاحيات manage.py
sudo chown sammy:sammy /home/sammy/myprojectdir/manage.py
sudo chmod 755 /home/sammy/myprojectdir/manage.py

# إصلاح صلاحيات requirements.txt
sudo chown sammy:sammy /home/sammy/myprojectdir/requirements.txt
sudo chmod 644 /home/sammy/myprojectdir/requirements.txt





# إصلاح صلاحيات media
sudo chown -R sammy:www-data /home/sammy/myprojectdir/media/
sudo chmod -R 775 /home/sammy/myprojectdir/media/

# إصلاح صلاحيات staticfiles
sudo chown -R sammy:www-data /home/sammy/myprojectdir/staticfiles/
sudo chmod -R 775 /home/sammy/myprojectdir/staticfiles/



# إصلاح صلاحيات nginx
sudo chown -R www-data:www-data /home/sammy/myprojectdir/
sudo chmod -R 755 /home/sammy/myprojectdir/

# إعطاء صلاحيات الكتابة لـ sammy
sudo chown -R sammy:sammy /home/sammy/myprojectdir/backend/
sudo chmod -R 775 /home/sammy/myprojectdir/backend/



# إصلاح صلاحيات Gunicorn
sudo chown -R sammy:www-data /home/sammy/myprojectdir/
sudo chmod -R 775 /home/sammy/myprojectdir/



# إعادة تشغيل الخدمات
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# اختبار إنشاء ملف
echo "test" > /home/sammy/myprojectdir/test-permissions.txt

# اختبار تعديل ملف موجود
echo "test edit" >> /home/sammy/myprojectdir/test-permissions.txt



# حل سريع لجميع الصلاحيات
sudo chown -R sammy:sammy /home/sammy/myprojectdir/
sudo chmod -R 775 /home/sammy/myprojectdir/
sudo chown -R www-data:www-data /home/sammy/myprojectdir/media/
sudo chmod -R 775 /home/sammy/myprojectdir/media/