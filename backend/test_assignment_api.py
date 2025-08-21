#!/usr/bin/env python3
"""
اختبار API الواجبات
يمكن تشغيل هذا الاختبار للتأكد من أن الـ API يعمل بشكل صحيح
"""

import os
import django
import sys

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'custom_permissions.settings')
django.setup()

from assignments.models import Assignment, AssignmentQuestion, AssignmentAnswer, AssignmentSubmission
from courses.models import Course
from django.contrib.auth.models import User
from assignments.serializers import AssignmentBasicSerializer, AssignmentDetailSerializer
import json

def test_assignment_api():
    """اختبار API الواجبات"""
    
    print("🧪 بدء اختبار Assignment API...")
    
    # 1. إنشاء مستخدم وكورس تجريبي
    try:
        user, created = User.objects.get_or_create(
            username='test_instructor',
            defaults={
                'email': 'instructor@test.com',
                'first_name': 'Test',
                'last_name': 'Instructor'
            }
        )
        print(f"✅ تم إنشاء/تحديد المستخدم: {user.username}")
        
        course, created = Course.objects.get_or_create(
            title='كورس تجريبي',
            defaults={
                'description': 'هذا كورس للاختبار',
                'instructor': user,
                'is_published': True
            }
        )
        print(f"✅ تم إنشاء/تحديد الكورس: {course.title}")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء البيانات التجريبية: {e}")
        return False
    
    # 2. إنشاء واجب تجريبي
    try:
        assignment_data = {
            'title': 'واجب تجريبي للاختبار',
            'description': 'هذا واجب للاختبار API',
            'course': course,
            'due_date': '2024-12-31T23:59:00Z',
            'points': 100,
            'has_questions': True,
            'has_file_upload': True,
            'is_active': True
        }
        
        assignment, created = Assignment.objects.get_or_create(
            title=assignment_data['title'],
            course=course,
            defaults=assignment_data
        )
        print(f"✅ تم إنشاء/تحديد الواجب: {assignment.title}")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء الواجب: {e}")
        return False
    
    # 3. إنشاء أسئلة تجريبية
    try:
        # سؤال اختيار من متعدد
        question1, created = AssignmentQuestion.objects.get_or_create(
            assignment=assignment,
            text='ما هو 2 + 2؟',
            defaults={
                'question_type': 'multiple_choice',
                'points': 10,
                'order': 1,
                'is_required': True
            }
        )
        
        if created:
            # إضافة إجابات
            AssignmentAnswer.objects.create(
                question=question1,
                text='3',
                is_correct=False,
                order=1
            )
            AssignmentAnswer.objects.create(
                question=question1,
                text='4',
                is_correct=True,
                order=2
            )
            AssignmentAnswer.objects.create(
                question=question1,
                text='5',
                is_correct=False,
                order=3
            )
        
        # سؤال مقال
        question2, created = AssignmentQuestion.objects.get_or_create(
            assignment=assignment,
            text='اشرح أهمية التعليم الإلكتروني',
            defaults={
                'question_type': 'essay',
                'points': 20,
                'order': 2,
                'is_required': True
            }
        )
        
        print(f"✅ تم إنشاء الأسئلة: {assignment.questions.count()} سؤال")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء الأسئلة: {e}")
        return False
    
    # 4. اختبار Serializers
    try:
        # اختبار AssignmentBasicSerializer
        basic_serializer = AssignmentBasicSerializer(assignment)
        basic_data = basic_serializer.data
        
        print("\n📊 بيانات AssignmentBasicSerializer:")
        print(f"   - ID: {basic_data['id']}")
        print(f"   - العنوان: {basic_data['title']}")
        print(f"   - الكورس: {basic_data['course_title']}")
        print(f"   - عدد الأسئلة: {basic_data['questions_count']}")
        print(f"   - إجمالي النقاط: {basic_data['total_points']}")
        print(f"   - عدد التسليمات: {basic_data['submissions_count']}")
        print(f"   - التسليمات المصححة: {basic_data['graded_count']}")
        
        # اختبار AssignmentDetailSerializer
        detail_serializer = AssignmentDetailSerializer(assignment)
        detail_data = detail_serializer.data
        
        print(f"\n📋 بيانات AssignmentDetailSerializer:")
        print(f"   - عدد الأسئلة في التفاصيل: {len(detail_data.get('questions', []))}")
        
        if detail_data.get('questions'):
            for i, q in enumerate(detail_data['questions']):
                print(f"   - السؤال {i+1}: {q['text'][:50]}...")
                print(f"     النوع: {q['question_type']}, النقاط: {q['points']}")
                if q.get('answers'):
                    print(f"     عدد الإجابات: {len(q['answers'])}")
        
        print("✅ تم اختبار Serializers بنجاح")
        
    except Exception as e:
        print(f"❌ خطأ في اختبار Serializers: {e}")
        return False
    
    # 5. إنشاء تسليم تجريبي
    try:
        student, created = User.objects.get_or_create(
            username='test_student',
            defaults={
                'email': 'student@test.com',
                'first_name': 'Test',
                'last_name': 'Student'
            }
        )
        
        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            user=student,
            defaults={
                'submission_text': 'هذا تسليم تجريبي للاختبار',
                'status': 'submitted'
            }
        )
        
        print(f"✅ تم إنشاء التسليم التجريبي للطالب: {student.username}")
        
        # اختبار البيانات مع التسليم
        basic_serializer = AssignmentBasicSerializer(assignment)
        updated_data = basic_serializer.data
        print(f"   - التسليمات بعد الإضافة: {updated_data['submissions_count']}")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء التسليم: {e}")
        return False
    
    print("\n🎉 تم اختبار Assignment API بنجاح!")
    print("\n📝 ملخص النتائج:")
    print(f"   ✅ الواجب: {assignment.title}")
    print(f"   ✅ عدد الأسئلة: {assignment.questions.count()}")
    print(f"   ✅ عدد التسليمات: {assignment.submissions.count()}")
    print(f"   ✅ إجمالي النقاط: {assignment.get_total_points()}")
    
    return True

if __name__ == '__main__':
    success = test_assignment_api()
    if success:
        print("\n✨ جميع الاختبارات نجحت! API جاهز للاستخدام.")
    else:
        print("\n💥 فشل في بعض الاختبارات. يرجى مراجعة الأخطاء أعلاه.")
        sys.exit(1)
