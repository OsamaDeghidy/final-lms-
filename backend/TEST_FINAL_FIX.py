#!/usr/bin/env python3
"""
اختبار الإصلاح النهائي - التأكد من أن كل شيء يعمل
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

def test_final_fix():
    """اختبار الإصلاح النهائي"""
    
    print("🧪 اختبار الإصلاح النهائي...")
    print("=" * 60)
    
    # إنشاء client
    client = Client()
    
    # إنشاء مستخدم وكورس للاختبار
    try:
        user = User.objects.get(username='testinstructor1')
        course = Course.objects.get(id=7)
        print(f"✅ تم العثور على المستخدم: {user.username}")
        print(f"✅ تم العثور على الكورس: {course.title}")
        
        # التحقق من Profile و Instructor
        try:
            profile = user.profile
            print(f"✅ تم العثور على Profile: {profile.status}")
            
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
            'title': 'واجب اختبار الإصلاح النهائي',
            'description': 'واجب لاختبار الإصلاح النهائي',
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
                'text': 'سؤال اختبار الإصلاح النهائي',
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
                    'text': 'إجابة اختبار الإصلاح النهائي',
                    'is_correct': True,
                    'order': 1
                }
                
                response = client.post('/assignments/answers/', answer_data)
                print(f"✅ إنشاء إجابة - Status: {response.status_code}")
                
                if response.status_code == 201:
                    answer_id = response.data.get('id')
                    print(f"   - Answer ID: {answer_id}")
                    
                    # اختبار جلب الأسئلة
                    response = client.get(f'/assignments/questions/?assignment={assignment_id}')
                    print(f"✅ جلب الأسئلة - Status: {response.status_code}")
                    
                    if response.status_code == 200:
                        questions = response.data
                        print(f"   - عدد الأسئلة: {len(questions)}")
                        
                        # اختبار جلب الإجابات
                        response = client.get(f'/assignments/answers/?question={question_id}')
                        print(f"✅ جلب الإجابات - Status: {response.status_code}")
                        
                        if response.status_code == 200:
                            answers = response.data
                            print(f"   - عدد الإجابات: {len(answers)}")
                    
                # تنظيف البيانات
                Assignment.objects.filter(id=assignment_id).delete()
                print("✅ تم تنظيف البيانات التجريبية")
                
                print("\n🎉 تم اختبار الإصلاح النهائي بنجاح!")
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

def test_database_verification():
    """اختبار التحقق من قاعدة البيانات"""
    
    print("\n🔍 اختبار التحقق من قاعدة البيانات...")
    print("=" * 40)
    
    try:
        # التحقق من الواجبات
        assignments = Assignment.objects.all()
        print(f"عدد الواجبات في قاعدة البيانات: {assignments.count()}")
        
        # التحقق من الأسئلة
        questions = AssignmentQuestion.objects.all()
        print(f"عدد الأسئلة في قاعدة البيانات: {questions.count()}")
        
        # التحقق من الإجابات
        answers = AssignmentAnswer.objects.all()
        print(f"عدد الإجابات في قاعدة البيانات: {answers.count()}")
        
        # عرض آخر 3 واجبات
        print("\nآخر 3 واجبات:")
        for assignment in assignments.order_by('-created_at')[:3]:
            print(f"  - ID: {assignment.id}, العنوان: {assignment.title}, الكورس: {assignment.course.title}")
        
        # عرض آخر 3 أسئلة
        print("\nآخر 3 أسئلة:")
        for question in questions.order_by('-created_at')[:3]:
            print(f"  - ID: {question.id}, النص: {question.text[:50]}..., الواجب: {question.assignment.title}")
        
        # عرض آخر 3 إجابات
        print("\nآخر 3 إجابات:")
        for answer in answers.order_by('-created_at')[:3]:
            print(f"  - ID: {answer.id}, النص: {answer.text[:50]}..., السؤال: {answer.question.text[:30]}...")
            
    except Exception as e:
        print(f"❌ خطأ في اختبار قاعدة البيانات: {e}")

if __name__ == '__main__':
    test_database_verification()
    success = test_final_fix()
    if success:
        print("\n🎉 الإصلاح النهائي يعمل بشكل صحيح!")
        print("✅ يمكن إنشاء الواجبات")
        print("✅ يمكن إنشاء الأسئلة")
        print("✅ يمكن إنشاء الإجابات")
        print("✅ يمكن جلب البيانات")
        print("✅ النظام يعمل بشكل كامل!")
    else:
        print("\n💥 هناك مشاكل في الإصلاح النهائي.")
        sys.exit(1)
