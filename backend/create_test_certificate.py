#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from certificates.models import Certificate, CertificateTemplate
from courses.models import Course
from django.contrib.auth.models import User
from django.utils import timezone

def create_test_certificate():
    # Check if there are any certificates
    certificates = Certificate.objects.all()
    print(f'Total certificates: {certificates.count()}')

    if certificates.count() == 0:
        print('No certificates found. Creating a test certificate...')
        
        # Get or create a user
        user = User.objects.filter(is_staff=False).first()
        if not user:
            user = User.objects.create_user(
                username='test_student',
                email='test@example.com',
                password='testpass123',
                first_name='Test',
                last_name='Student'
            )
            print(f'Created user: {user.username}')
        
        # Get or create a course
        course = Course.objects.first()
        if not course:
            print('No courses found. Please create a course first.')
            return
        
        # Get or create a template
        template = CertificateTemplate.objects.first()
        if not template:
            template = CertificateTemplate.objects.create(
                template_name='قالب الشهادة الافتراضي',
                institution_name='أكاديمية التعلم الإلكتروني',
                signature_name='د. أحمد محمد',
                signature_title='مدير الأكاديمية',
                certificate_text='هذا يشهد بأن {student_name} قد أكمل بنجاح دورة {course_name} بتاريخ {completion_date} من {institution_name}',
                include_qr_code=True,
                include_grade=True,
                include_completion_date=True,
                include_course_duration=False,
                is_default=True,
                is_active=True
            )
            print(f'Created template: {template.template_name}')
        
        # Create a certificate
        certificate = Certificate.objects.create(
            user=user,
            course=course,
            template=template,
            student_name=f'{user.first_name} {user.last_name}',
            course_title=course.title,
            institution_name=template.institution_name,
            final_grade=85.5,
            completion_percentage=100.0,
            course_duration_hours=40,
            completion_date=timezone.now(),
            verification_status='verified'
        )
        print(f'Created certificate: {certificate.certificate_id}')
        print(f'User: {certificate.user.username}')
        print(f'Course: {certificate.course.title}')
        print(f'Template: {certificate.template.template_name}')
    else:
        cert = certificates.first()
        print(f'First certificate: {cert.certificate_id}')
        print(f'User: {cert.user.username}')
        print(f'Course: {cert.course.title}')
        print(f'Template: {cert.template.template_name if cert.template else "No template"}')

if __name__ == '__main__':
    create_test_certificate()
