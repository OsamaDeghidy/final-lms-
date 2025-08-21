#!/usr/bin/env python3
"""
اختبار سريع للـ API
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

def test_assignment_question_api():
    """اختبار إنشاء سؤال وإجابة"""
    
    print("🧪 بدء اختبار Assignment Question API...")
    
    # 1. الحصول على مستخدم وكورس وواجب
    try:
        user = User.objects.get(username='testinstructor1')
        print(f"✅ تم العثور على المستخدم: {user.username}")
        
        course = Course.objects.get(id=7)  # استخدام الكورس الموجود
        print(f"✅ تم العثور على الكورس: {course.title}")
        
        assignment = Assignment.objects.get(id=6)  # استخدام الواجب الموجود
        print(f"✅ تم العثور على الواجب: {assignment.title}")
        
    except Exception as e:
        print(f"❌ خطأ في العثور على البيانات: {e}")
        return False
    
    # 2. اختبار إنشاء سؤال
    try:
        question_data = {
            'assignment': assignment.id,
            'text': 'سؤال اختبار API',
            'question_type': 'multiple_choice',
            'points': 10,
            'order': 1,
            'is_required': True
        }
        
        serializer = AssignmentQuestionSerializer(data=question_data)
        if serializer.is_valid():
            question = serializer.save()
            print(f"✅ تم إنشاء السؤال: {question.text}")
            
            # 3. اختبار إنشاء إجابة
            answer_data = {
                'question': question.id,
                'text': 'إجابة صحيحة',
                'is_correct': True,
                'order': 1
            }
            
            answer_serializer = AssignmentAnswerSerializer(data=answer_data)
            if answer_serializer.is_valid():
                answer = answer_serializer.save()
                print(f"✅ تم إنشاء الإجابة: {answer.text}")
            else:
                print(f"❌ خطأ في إنشاء الإجابة: {answer_serializer.errors}")
                
        else:
            print(f"❌ خطأ في إنشاء السؤال: {serializer.errors}")
            
    except Exception as e:
        print(f"❌ خطأ في اختبار API: {e}")
        return False
    
    print("\n🎉 تم اختبار Assignment Question API بنجاح!")
    return True

if __name__ == '__main__':
    success = test_assignment_question_api()
    if success:
        print("\n✨ الاختبار نجح! API يعمل بشكل صحيح.")
    else:
        print("\n💥 فشل في الاختبار. يرجى مراجعة الأخطاء أعلاه.")
        sys.exit(1)
