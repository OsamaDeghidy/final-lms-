#!/usr/bin/env python3
"""
اختبار إصلاح مشكلة Course instructor
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
from users.models import Profile, Instructor

def test_course_instructor_fix():
    """اختبار إصلاح مشكلة Course instructor"""
    
    print("🧪 اختبار إصلاح مشكلة Course instructor...")
    print("=" * 60)
    
    # إنشاء client
    client = Client()
    
    # إنشاء مستخدم وكورس للاختبار
    try:
        user = User.objects.get(username='testinstructor1')
        course = Course.objects.get(id=7)
        print(f"✅ تم العثور على المستخدم: {user.username}")
        print(f"✅ تم العثور على الكورس: {course.title}")
        
        # التحقق من Profile
        try:
            profile = user.profile
            print(f"✅ تم العثور على Profile: {profile.status}")
            
            # التحقق من Instructor
            try:
                instructor = Instructor.objects.get(profile=profile)
                print(f"✅ تم العثور على Instructor: {instructor}")
                
                # التحقق من علاقة Instructor مع الكورس
                if course.instructors.filter(id=instructor.id).exists():
                    print(f"✅ Instructor مرتبط بالكورس")
                else:
                    print(f"❌ Instructor غير مرتبط بالكورس")
                    # إضافة Instructor للكورس
                    course.instructors.add(instructor)
                    print(f"✅ تم إضافة Instructor للكورس")
                    
            except Instructor.DoesNotExist:
                print(f"❌ المستخدم ليس له Instructor object")
                return False
                
        except AttributeError:
            print("❌ المستخدم ليس له Profile")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في العثور على البيانات الأساسية: {e}")
        return False
    
    # تسجيل الدخول
    client.force_login(user)
    
    # اختبار إنشاء واجب
    try:
        assignment_data = {
            'title': 'واجب اختبار Course Instructor',
            'description': 'واجب لاختبار إصلاح Course instructor',
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
                'text': 'سؤال اختبار Course Instructor',
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
                    'text': 'إجابة اختبار Course Instructor',
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
                
                print("\n🎉 تم اختبار إصلاح Course instructor بنجاح!")
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

def test_course_instructor_info():
    """اختبار معلومات Course instructor"""
    
    print("\n🔍 اختبار معلومات Course instructor...")
    print("=" * 40)
    
    try:
        user = User.objects.get(username='testinstructor1')
        course = Course.objects.get(id=7)
        print(f"المستخدم: {user.username}")
        print(f"الكورس: {course.title}")
        
        try:
            profile = user.profile
            print(f"Profile Status: {profile.status}")
            
            try:
                instructor = Instructor.objects.get(profile=profile)
                print(f"Instructor ID: {instructor.id}")
                print(f"Instructor Profile: {instructor.profile.name}")
                
                # التحقق من علاقة Instructor مع الكورس
                if course.instructors.filter(id=instructor.id).exists():
                    print("✅ Instructor مرتبط بالكورس")
                else:
                    print("❌ Instructor غير مرتبط بالكورس")
                    
            except Instructor.DoesNotExist:
                print("❌ المستخدم ليس له Instructor object")
                
        except AttributeError:
            print("❌ المستخدم ليس له Profile")
            
    except Exception as e:
        print(f"❌ خطأ في اختبار Course instructor: {e}")

if __name__ == '__main__':
    test_course_instructor_info()
    success = test_course_instructor_fix()
    if success:
        print("\n🎉 إصلاح Course instructor يعمل بشكل صحيح!")
    else:
        print("\n💥 هناك مشاكل في إصلاح Course instructor.")
        sys.exit(1)
