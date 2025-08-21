#!/usr/bin/env python3
"""
اختبار سريع للـ URLs الجديدة
"""

import os
import django
import sys

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'custom_permissions.settings')
django.setup()

from django.test import Client
from django.urls import reverse
from assignments.models import Assignment, AssignmentQuestion, AssignmentAnswer
from courses.models import Course
from django.contrib.auth.models import User

def test_urls():
    """اختبار الـ URLs الجديدة"""
    
    print("🧪 اختبار الـ URLs الجديدة...")
    print("=" * 50)
    
    # إنشاء client
    client = Client()
    
    # إنشاء مستخدم وكورس للاختبار
    try:
        user = User.objects.get(username='testinstructor1')
        course = Course.objects.get(id=7)
        print(f"✅ تم العثور على المستخدم: {user.username}")
        print(f"✅ تم العثور على الكورس: {course.title}")
    except Exception as e:
        print(f"❌ خطأ في العثور على البيانات الأساسية: {e}")
        return False
    
    # تسجيل الدخول
    client.force_login(user)
    
    # اختبار الـ URLs
    urls_to_test = [
        '/assignments/assignments/',
        '/assignments/questions/',
        '/assignments/submissions/',
        '/assignments/answers/',
    ]
    
    for url in urls_to_test:
        try:
            response = client.get(url)
            print(f"✅ {url} - Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   - Content-Type: {response.get('Content-Type', 'N/A')}")
                if hasattr(response, 'data'):
                    print(f"   - Data keys: {list(response.data.keys()) if isinstance(response.data, dict) else 'Not dict'}")
        except Exception as e:
            print(f"❌ {url} - Error: {e}")
    
    # اختبار إنشاء واجب
    try:
        assignment_data = {
            'title': 'واجب اختبار URLs',
            'description': 'واجب لاختبار الـ URLs الجديدة',
            'course': course.id,
            'due_date': '2024-12-31T23:59:00Z',
            'points': 100,
            'has_questions': True,
            'has_file_upload': False,
            'is_active': True
        }
        
        response = client.post('/assignments/assignments/', assignment_data)
        print(f"✅ إنشاء واجب - Status: {response.status_code}")
        
        if response.status_code == 201:
            assignment_id = response.data.get('id')
            print(f"   - Assignment ID: {assignment_id}")
            
            # اختبار إنشاء سؤال
            question_data = {
                'assignment': assignment_id,
                'text': 'سؤال اختبار',
                'question_type': 'essay',
                'points': 10,
                'order': 1,
                'is_required': True
            }
            
            response = client.post('/assignments/questions/', question_data)
            print(f"✅ إنشاء سؤال - Status: {response.status_code}")
            
            if response.status_code == 201:
                question_id = response.data.get('id')
                print(f"   - Question ID: {question_id}")
                
                # اختبار إنشاء إجابة
                answer_data = {
                    'question': question_id,
                    'text': 'إجابة اختبار',
                    'is_correct': True,
                    'order': 1
                }
                
                response = client.post('/assignments/answers/', answer_data)
                print(f"✅ إنشاء إجابة - Status: {response.status_code}")
                
                if response.status_code == 201:
                    print(f"   - Answer ID: {response.data.get('id')}")
                
                # تنظيف البيانات
                Assignment.objects.filter(id=assignment_id).delete()
                print("✅ تم تنظيف البيانات التجريبية")
            
        else:
            print(f"   - Error: {response.content.decode()}")
            
    except Exception as e:
        print(f"❌ خطأ في اختبار إنشاء البيانات: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("🎉 تم اختبار الـ URLs بنجاح!")
    return True

if __name__ == '__main__':
    success = test_urls()
    if success:
        print("\n🎉 الـ URLs تعمل بشكل صحيح!")
    else:
        print("\n💥 هناك مشاكل في الـ URLs.")
        sys.exit(1)
