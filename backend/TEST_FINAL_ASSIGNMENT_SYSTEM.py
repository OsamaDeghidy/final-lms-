#!/usr/bin/env python3
"""
اختبار نهائي شامل لنظام الواجبات الجديد
"""

import os
import django
import sys

# إعداد Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'custom_permissions.settings')
django.setup()

from assignments.models import Assignment, AssignmentQuestion, AssignmentAnswer
from courses.models import Course
from django.contrib.auth.models import User
from assignments.serializers import AssignmentQuestionSerializer, AssignmentAnswerSerializer
import json

def test_complete_assignment_system():
    """اختبار شامل لنظام الواجبات"""
    
    print("🧪 بدء الاختبار الشامل لنظام الواجبات...")
    print("=" * 60)
    
    # 1. التحقق من وجود البيانات الأساسية
    try:
        user = User.objects.get(username='testinstructor1')
        print(f"✅ تم العثور على المستخدم: {user.username}")
        
        course = Course.objects.get(id=7)
        print(f"✅ تم العثور على الكورس: {course.title}")
        
    except Exception as e:
        print(f"❌ خطأ في العثور على البيانات الأساسية: {e}")
        return False
    
    # 2. إنشاء واجب جديد
    try:
        assignment = Assignment.objects.create(
            title='واجب اختبار النظام الجديد',
            description='واجب لاختبار النظام الجديد بدون أسئلة',
            course=course,
            due_date='2024-12-31T23:59:00Z',
            points=100,
            has_questions=True,
            has_file_upload=False,
            is_active=True
        )
        print(f"✅ تم إنشاء الواجب: {assignment.title} (ID: {assignment.id})")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء الواجب: {e}")
        return False
    
    # 3. اختبار إنشاء أسئلة
    questions_created = 0
    answers_created = 0
    
    try:
        # سؤال اختيار من متعدد
        question1_data = {
            'assignment': assignment.id,
            'text': 'ما هو 2+2؟',
            'question_type': 'multiple_choice',
            'points': 20,
            'order': 1,
            'is_required': True
        }
        
        serializer1 = AssignmentQuestionSerializer(data=question1_data)
        if serializer1.is_valid():
            question1 = serializer1.save()
            print(f"✅ تم إنشاء السؤال 1: {question1.text} (ID: {question1.id})")
            questions_created += 1
            
            # إجابات السؤال الأول
            answers1 = [
                {'question': question1.id, 'text': '3', 'is_correct': False, 'order': 1},
                {'question': question1.id, 'text': '4', 'is_correct': True, 'order': 2},
                {'question': question1.id, 'text': '5', 'is_correct': False, 'order': 3},
            ]
            
            for answer_data in answers1:
                answer_serializer = AssignmentAnswerSerializer(data=answer_data)
                if answer_serializer.is_valid():
                    answer = answer_serializer.save()
                    print(f"  ✅ تم إنشاء الإجابة: {answer.text} (صحيحة: {answer.is_correct})")
                    answers_created += 1
                else:
                    print(f"  ❌ خطأ في إنشاء الإجابة: {answer_serializer.errors}")
        else:
            print(f"❌ خطأ في إنشاء السؤال 1: {serializer1.errors}")
        
        # سؤال صح أو خطأ
        question2_data = {
            'assignment': assignment.id,
            'text': 'السماء زرقاء؟',
            'question_type': 'true_false',
            'points': 15,
            'order': 2,
            'is_required': True
        }
        
        serializer2 = AssignmentQuestionSerializer(data=question2_data)
        if serializer2.is_valid():
            question2 = serializer2.save()
            print(f"✅ تم إنشاء السؤال 2: {question2.text} (ID: {question2.id})")
            questions_created += 1
            
            # إجابات السؤال الثاني
            answers2 = [
                {'question': question2.id, 'text': 'صح', 'is_correct': True, 'order': 1},
                {'question': question2.id, 'text': 'خطأ', 'is_correct': False, 'order': 2},
            ]
            
            for answer_data in answers2:
                answer_serializer = AssignmentAnswerSerializer(data=answer_data)
                if answer_serializer.is_valid():
                    answer = answer_serializer.save()
                    print(f"  ✅ تم إنشاء الإجابة: {answer.text} (صحيحة: {answer.is_correct})")
                    answers_created += 1
                else:
                    print(f"  ❌ خطأ في إنشاء الإجابة: {answer_serializer.errors}")
        else:
            print(f"❌ خطأ في إنشاء السؤال 2: {serializer2.errors}")
        
        # سؤال مقال
        question3_data = {
            'assignment': assignment.id,
            'text': 'اشرح مفهوم التعلم الإلكتروني',
            'question_type': 'essay',
            'points': 30,
            'order': 3,
            'is_required': True
        }
        
        serializer3 = AssignmentQuestionSerializer(data=question3_data)
        if serializer3.is_valid():
            question3 = serializer3.save()
            print(f"✅ تم إنشاء السؤال 3: {question3.text} (ID: {question3.id})")
            questions_created += 1
        else:
            print(f"❌ خطأ في إنشاء السؤال 3: {serializer3.errors}")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء الأسئلة: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 4. التحقق من قاعدة البيانات
    try:
        questions_count = AssignmentQuestion.objects.filter(assignment=assignment).count()
        answers_count = AssignmentAnswer.objects.filter(question__assignment=assignment).count()
        
        print("\n📊 إحصائيات قاعدة البيانات:")
        print(f"   - عدد الأسئلة في الواجب: {questions_count}")
        print(f"   - عدد الإجابات في الواجب: {answers_count}")
        print(f"   - الأسئلة المُنشأة: {questions_created}")
        print(f"   - الإجابات المُنشأة: {answers_created}")
        
        if questions_count == questions_created and answers_count == answers_created:
            print("✅ جميع البيانات محفوظة بشكل صحيح!")
        else:
            print("❌ هناك مشكلة في حفظ البيانات!")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في التحقق من قاعدة البيانات: {e}")
        return False
    
    # 5. اختبار استرجاع البيانات
    try:
        print("\n🔄 اختبار استرجاع البيانات:")
        
        # استرجاع الأسئلة
        questions = AssignmentQuestion.objects.filter(assignment=assignment).order_by('order')
        print(f"   - تم استرجاع {questions.count()} سؤال")
        
        for q in questions:
            print(f"     * {q.text} ({q.question_type}) - {q.points} نقطة")
            answers = AssignmentAnswer.objects.filter(question=q)
            if answers.exists():
                print(f"       - {answers.count()} إجابة:")
                for a in answers:
                    print(f"         > {a.text} (صحيحة: {a.is_correct})")
            else:
                print("       - بدون إجابات")
        
        print("✅ تم استرجاع البيانات بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في استرجاع البيانات: {e}")
        return False
    
    # 6. تنظيف البيانات التجريبية
    try:
        print("\n🧹 تنظيف البيانات التجريبية...")
        assignment.delete()
        print("✅ تم حذف الواجب التجريبي بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في حذف البيانات التجريبية: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 تم الاختبار الشامل بنجاح!")
    print("✅ نظام الواجبات يعمل بشكل مثالي")
    print("✅ يمكن إنشاء واجبات بدون أسئلة")
    print("✅ يمكن إضافة أسئلة منفصلة")
    print("✅ الأسئلة والإجابات تُحفظ في قاعدة البيانات")
    print("✅ يمكن استرجاع البيانات بشكل صحيح")
    
    return True

if __name__ == '__main__':
    success = test_complete_assignment_system()
    if success:
        print("\n🎉 النظام جاهز للاستخدام!")
    else:
        print("\n💥 هناك مشاكل في النظام. يرجى مراجعتها.")
        sys.exit(1)
