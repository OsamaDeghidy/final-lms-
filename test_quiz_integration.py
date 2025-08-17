#!/usr/bin/env python3
"""
ملف تجريبي لاختبار ربط API الكويزات بالفرونت إند
"""

import requests
import json

# إعدادات API
BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/auth/login/"
QUIZ_URL = f"{BASE_URL}/assignments/quizzes/"

def test_quiz_api():
    """اختبار API الكويزات"""
    
    print("🚀 بدء اختبار ربط API الكويزات...")
    
    # بيانات تسجيل الدخول (يجب تغييرها حسب البيانات الحقيقية)
    login_data = {
        "username": "student1",  # تغيير لاسم المستخدم الحقيقي
        "password": "password123"  # تغيير لكلمة المرور الحقيقية
    }
    
    try:
        # 1. تسجيل الدخول
        print("📝 محاولة تسجيل الدخول...")
        login_response = requests.post(LOGIN_URL, json=login_data)
        
        if login_response.status_code != 200:
            print(f"❌ فشل تسجيل الدخول: {login_response.status_code}")
            print(f"الاستجابة: {login_response.text}")
            return False
        
        # استخراج التوكن
        token = login_response.json().get('access')
        if not token:
            print("❌ لم يتم الحصول على توكن الوصول")
            return False
        
        print("✅ تم تسجيل الدخول بنجاح")
        
        # إعداد headers للمصادقة
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # 2. جلب قائمة الكويزات
        print("📋 جلب قائمة الكويزات...")
        quizzes_response = requests.get(QUIZ_URL, headers=headers)
        
        if quizzes_response.status_code != 200:
            print(f"❌ فشل جلب الكويزات: {quizzes_response.status_code}")
            print(f"الاستجابة: {quizzes_response.text}")
            return False
        
        quizzes_data = quizzes_response.json()
        print(f"✅ تم جلب {len(quizzes_data.get('results', []))} كويز")
        
        # عرض الكويزات المتاحة
        for quiz in quizzes_data.get('results', []):
            print(f"  - {quiz.get('title')} (ID: {quiz.get('id')})")
        
        if not quizzes_data.get('results'):
            print("⚠️ لا توجد كويزات متاحة")
            return True
        
        # 3. جلب تفاصيل أول كويز
        first_quiz = quizzes_data['results'][0]
        quiz_id = first_quiz['id']
        quiz_detail_url = f"{QUIZ_URL}{quiz_id}/"
        
        print(f"🔍 جلب تفاصيل الكويز: {first_quiz['title']}")
        quiz_detail_response = requests.get(quiz_detail_url, headers=headers)
        
        if quiz_detail_response.status_code != 200:
            print(f"❌ فشل جلب تفاصيل الكويز: {quiz_detail_response.status_code}")
            return False
        
        quiz_detail = quiz_detail_response.json()
        questions_count = len(quiz_detail.get('questions', []))
        print(f"✅ الكويز يحتوي على {questions_count} سؤال")
        
        # 4. بدء محاولة جديدة
        print("🎯 بدء محاولة جديدة...")
        attempt_url = f"{BASE_URL}/assignments/quiz-attempts/"
        attempt_data = {"quiz": quiz_id}
        
        attempt_response = requests.post(attempt_url, json=attempt_data, headers=headers)
        
        if attempt_response.status_code != 201:
            print(f"❌ فشل بدء المحاولة: {attempt_response.status_code}")
            print(f"الاستجابة: {attempt_response.text}")
            return False
        
        attempt_data = attempt_response.json()
        attempt_id = attempt_data['id']
        print(f"✅ تم بدء المحاولة بنجاح (ID: {attempt_id})")
        
        # 5. إرسال إجابات (إذا كان هناك أسئلة)
        if questions_count > 0:
            print("📝 إرسال إجابات تجريبية...")
            
            # إنشاء إجابات تجريبية
            answers = []
            for question in quiz_detail.get('questions', []):
                question_id = question['id']
                if question['question_type'] in ['multiple_choice', 'true_false']:
                    # اختيار أول إجابة متاحة
                    if question.get('answers'):
                        selected_answer = question['answers'][0]['id']
                        answers.append({
                            'question': question_id,
                            'selected_answer': selected_answer
                        })
                elif question['question_type'] == 'short_answer':
                    answers.append({
                        'question': question_id,
                        'text_answer': 'إجابة تجريبية'
                    })
            
            if answers:
                submit_url = f"{BASE_URL}/assignments/quiz-user-answers/submit_answers/"
                submit_data = {
                    'attempt': attempt_id,
                    'answers': answers
                }
                
                submit_response = requests.post(submit_url, json=submit_data, headers=headers)
                
                if submit_response.status_code == 201:
                    print(f"✅ تم إرسال {len(answers)} إجابة بنجاح")
                else:
                    print(f"⚠️ فشل إرسال الإجابات: {submit_response.status_code}")
            
            # 6. إنهاء المحاولة
            print("🏁 إنهاء المحاولة...")
            finish_url = f"{BASE_URL}/assignments/quiz-attempts/{attempt_id}/finish/"
            finish_response = requests.patch(finish_url, headers=headers)
            
            if finish_response.status_code == 200:
                finish_data = finish_response.json()
                score = finish_data.get('score', 0)
                passed = finish_data.get('passed', False)
                print(f"✅ تم إنهاء المحاولة - النتيجة: {score}% - الحالة: {'ناجح' if passed else 'راسب'}")
            else:
                print(f"⚠️ فشل إنهاء المحاولة: {finish_response.status_code}")
        
        print("\n🎉 تم اختبار ربط API الكويزات بنجاح!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ لا يمكن الاتصال بالخادم. تأكد من تشغيل Django server")
        return False
    except Exception as e:
        print(f"❌ حدث خطأ غير متوقع: {str(e)}")
        return False

def test_frontend_integration():
    """اختبار تكامل الفرونت إند"""
    print("\n🌐 اختبار تكامل الفرونت إند...")
    
    # قائمة بالملفات المطلوبة
    required_files = [
        "frontend/src/services/quiz.service.js",
        "frontend/src/pages/student/quiz/QuizList.jsx",
        "frontend/src/pages/student/quiz/QuizStart.jsx",
        "frontend/src/pages/student/quiz/QuizResult.jsx",
        "frontend/src/pages/student/quiz/QuizHistory.jsx",
        "frontend/src/pages/student/quiz/index.js"
    ]
    
    missing_files = []
    for file_path in required_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if len(content.strip()) == 0:
                    missing_files.append(f"{file_path} (فارغ)")
        except FileNotFoundError:
            missing_files.append(f"{file_path} (غير موجود)")
    
    if missing_files:
        print("❌ الملفات التالية مفقودة أو فارغة:")
        for file in missing_files:
            print(f"  - {file}")
        return False
    else:
        print("✅ جميع ملفات الفرونت إند موجودة")
        return True

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 اختبار ربط API الكويزات بالفرونت إند")
    print("=" * 60)
    
    # اختبار الفرونت إند
    frontend_ok = test_frontend_integration()
    
    # اختبار API
    api_ok = test_quiz_api()
    
    print("\n" + "=" * 60)
    print("📊 نتائج الاختبار:")
    print(f"  الفرونت إند: {'✅ ناجح' if frontend_ok else '❌ فشل'}")
    print(f"  API: {'✅ ناجح' if api_ok else '❌ فشل'}")
    
    if frontend_ok and api_ok:
        print("\n🎉 تم ربط API الكويزات بالفرونت إند بنجاح!")
        print("\n📝 الخطوات التالية:")
        print("1. تأكد من إضافة routes في React Router")
        print("2. اختبر الواجهة في المتصفح")
        print("3. أضف بيانات كويزات حقيقية")
    else:
        print("\n⚠️ هناك مشاكل تحتاج إلى حل")
    
    print("=" * 60)
