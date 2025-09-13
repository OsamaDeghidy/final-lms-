# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Here are all the quiz-related routes we've created in the application:

Teacher Routes:
Create Quiz
/teacher/courses/[courseId]/quizzes/create
Renders: 
pages/teacher/quizzes/create.jsx
e:\projects\LMS-Osama\frontend\src\pages\teacher\quizzes\create.jsx
Edit Quiz
/teacher/courses/[courseId]/quizzes/[id]/edit
Renders: pages/teacher/quizzes/edit/[id].jsx
Quiz Details
/teacher/courses/[courseId]/quizzes/[id]
Renders: pages/teacher/quizzes/[id].jsx
Quiz Attempts List
/teacher/courses/[courseId]/quizzes/[id]/attempts
Renders: pages/teacher/quizzes/[id]/attempts/index.jsx
Quiz Attempt Review
/teacher/courses/[courseId]/quizzes/[id]/attempts/[attemptId]
Renders: pages/teacher/quizzes/[id]/attempts/[attemptId].jsx
Student Routes:
Quiz Attempt
/student/courses/[courseId]/quizzes/[id]
Renders: pages/student/quizzes/[id].jsx
Quiz Results
/student/courses/[courseId]/quizzes/results/[id]
Renders: pages/student/quizzes/results/[id].jsx
API Endpoints (used in components):
Teacher API Endpoints:
GET /api/teacher/quizzes/ - List all quizzes
GET /api/teacher/quizzes/[id] - Get quiz details
POST /api/teacher/quizzes/ - Create new quiz
PUT /api/teacher/quizzes/[id] - Update quiz
DELETE /api/teacher/quizzes/[id] - Delete quiz
GET /api/teacher/quizzes/[id]/attempts - List quiz attempts
GET /api/teacher/quizzes/[id]/attempts/[attemptId] - Get attempt details
POST /api/teacher/quizzes/[id]/attempts/[attemptId]/grade - Grade attempt
Student API Endpoints:
GET /api/student/quizzes/[id] - Get quiz for attempt
POST /api/student/quizzes/[id]/attempt - Start/Submit quiz attempt
GET /api/student/quizzes/attempts/[attemptId] - Get attempt details
GET /api/student/quizzes/results/[id] - Get quiz results
These routes cover the complete flow of quiz management for both teachers and students, including creation, editing, attempting, and reviewing quizzes.







user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

        gzip on;

        # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        ##
        # Virtual Host Configs
        ##

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
        # زيادة حد رفع الملفات
        client_max_body_size 500M;  # 500 ميجابايت
        client_body_timeout 300s;   # 5 دقائق timeout
        client_header_timeout 300s;

        # إعدادات إضافية للملفات الكبيرة
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;



}


#mail {
#       # See sample authentication script at:
#       # http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
#
#       # auth_http localhost/auth.php;
#       # pop3_capabilities "TOP" "USER";
#       # imap_capabilities "IMAP4rev1" "UIDPLUS";
#
#       server {
#               listen     localhost:110;
#               protocol   pop3;
#               proxy      on;
#       }
#
#       server {
#               listen     localhost:143;
#               protocol   imap;
#               proxy      on;
#       }
#}




server {
    server_name 157.245.234.55 pdt-admin.com www.pdt-admin.com;

    # زيادة حد رفع الملفات للموقع
    client_max_body_size 500M;
    client_body_timeout 300s;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    
    # Static files
    location /staticfiles/ {
        alias /home/sammy/myprojectdir/staticfiles/;
        expires 30d;
        add_header Cache-Control public;
    }

    # Media files
    location /media/ {
        alias /home/sammy/myprojectdir/media/;
        expires 30d;
        add_header Cache-Control public;
        # إعدادات خاصة للملفات الكبيرة
        client_max_body_size 500M;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
        # إعدادات proxy للملفات الكبيرة
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_request_buffering off;  # مهم للملفات الكبيرة
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/pdt-admin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdt-admin.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}





###########
server {
    server_name 157.245.234.55 pdt-admin.com  www.pdt-admin.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    # Static files
    location /staticfiles/ {
        alias /home/sammy/myprojectdir/staticfiles/;
        expires 30d;
        add_header Cache-Control public;
    }

    # Media files
    location /media/ {
        alias /home/sammy/myprojectdir/media/;
        expires 30d;
        add_header Cache-Control public;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/pdt-admin.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/pdt-admin.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.pdt-admin.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = pdt-admin.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name 157.245.234.55 pdt-admin.com  www.pdt-admin.com;
    return 404; # managed by Certbot




}




#############
Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=sammy
Group=www-data
WorkingDirectory=/home/sammy/myprojectdir
ExecStart=/home/sammy/myprojectdir/myprojectenv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          core.wsgi:application

[Install]
WantedBy=multi-user.target

sudo nano /etc/systemd/system/gunicorn.service

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