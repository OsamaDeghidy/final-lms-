#!/usr/bin/env python3
"""
اختبار سريع لإصلاح مشكلة PermissionDenied
"""

import os
import django
import sys

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'custom_permissions.settings')
django.setup()

from django.test import Client
from assignments.models import Assignment, AssignmentQuestion, AssignmentAnswer
from courses.models import Course
from django.contrib.auth.models import User

def test_permission_fix():
    """اختبار إصلاح مشكلة PermissionDenied"""
    
    print("🧪 اختبار إصلاح مشكلة PermissionDenied...")
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
    
    # اختبار إنشاء واجب
    try:
        assignment_data = {
            'title': 'واجب اختبار Permission',
            'description': 'واجب لاختبار إصلاح PermissionDenied',
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
                'text': 'سؤال اختبار Permission',
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
                    'text': 'إجابة اختبار Permission',
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
                
                print("\n🎉 تم اختبار إصلاح PermissionDenied بنجاح!")
                return True
            
            else:
                print(f"   - Error: {response.content.decode()}")
                return False
            
        else:
            print(f"   - Error: {response.content.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في اختبار إنشاء البيانات: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_permission_fix()
    if success:
        print("\n🎉 إصلاح PermissionDenied يعمل بشكل صحيح!")
    else:
        print("\n💥 هناك مشاكل في إصلاح PermissionDenied.")
        sys.exit(1)
