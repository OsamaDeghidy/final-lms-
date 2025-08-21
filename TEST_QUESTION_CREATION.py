#!/usr/bin/env python3
"""
اختبار سريع لإنشاء الأسئلة
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

def test_question_creation():
    """اختبار إنشاء سؤال وإجابة"""
    
    print("🧪 بدء اختبار إنشاء الأسئلة...")
    
    # 1. الحصول على مستخدم وكورس وواجب
    try:
        user = User.objects.get(username='testinstructor1')
        print(f"✅ تم العثور على المستخدم: {user.username}")
        
        course = Course.objects.get(id=7)  # استخدام الكورس الموجود
        print(f"✅ تم العثور على الكورس: {course.title}")
        
        # الحصول على أحدث واجب
        assignment = Assignment.objects.filter(course=course).order_by('-created_at').first()
        if not assignment:
            print("❌ لا يوجد واجبات في هذا الكورس")
            return False
            
        print(f"✅ تم العثور على الواجب: {assignment.title} (ID: {assignment.id})")
        
    except Exception as e:
        print(f"❌ خطأ في العثور على البيانات: {e}")
        return False
    
    # 2. اختبار إنشاء سؤال
    try:
        question_data = {
            'assignment': assignment.id,
            'text': 'سؤال اختبار API - ما هو 2+2؟',
            'question_type': 'multiple_choice',
            'points': 10,
            'order': 1,
            'is_required': True
        }
        
        print(f"📝 محاولة إنشاء سؤال: {question_data}")
        
        serializer = AssignmentQuestionSerializer(data=question_data)
        if serializer.is_valid():
            question = serializer.save()
            print(f"✅ تم إنشاء السؤال: {question.text} (ID: {question.id})")
            
            # 3. اختبار إنشاء إجابة
            answer_data = {
                'question': question.id,
                'text': '4',
                'is_correct': True,
                'order': 1
            }
            
            print(f"📝 محاولة إنشاء إجابة: {answer_data}")
            
            answer_serializer = AssignmentAnswerSerializer(data=answer_data)
            if answer_serializer.is_valid():
                answer = answer_serializer.save()
                print(f"✅ تم إنشاء الإجابة: {answer.text} (ID: {answer.id})")
                
                # 4. التحقق من قاعدة البيانات
                questions_count = AssignmentQuestion.objects.filter(assignment=assignment).count()
                answers_count = AssignmentAnswer.objects.filter(question=question).count()
                
                print(f"📊 إحصائيات قاعدة البيانات:")
                print(f"   - عدد الأسئلة في الواجب: {questions_count}")
                print(f"   - عدد الإجابات في السؤال: {answers_count}")
                
                return True
            else:
                print(f"❌ خطأ في إنشاء الإجابة: {answer_serializer.errors}")
                return False
                
        else:
            print(f"❌ خطأ في إنشاء السؤال: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ خطأ في اختبار API: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_question_creation()
    if success:
        print("\n🎉 تم اختبار إنشاء الأسئلة بنجاح!")
    else:
        print("\n💥 فشل في الاختبار. يرجى مراجعة الأخطاء أعلاه.")
        sys.exit(1)
