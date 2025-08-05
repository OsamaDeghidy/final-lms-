# نظام الواجبات المتقدم

## الميزات الجديدة

### 1. رفع الملفات
- إمكانية رفع ملفات للواجبات
- دعم أنواع مختلفة من الملفات (PDF, DOC, PPT, إلخ)
- تخزين آمن للملفات في مجلد `assignment_files/`

### 2. الأسئلة والأجوبة
- إضافة أسئلة متعددة للواجب الواحد
- أنواع مختلفة من الأسئلة:
  - **اختيار من متعدد**: أسئلة مع خيارات محددة
  - **صح أو خطأ**: أسئلة بسيطة بنعم/لا
  - **إجابة قصيرة**: أسئلة نصية قصيرة
  - **مقال**: أسئلة نصية طويلة
  - **رفع ملف**: أسئلة تتطلب رفع ملف

### 3. التقييم المتقدم
- تقييم كل سؤال على حدة
- إعطاء درجات منفصلة لكل إجابة
- إضافة ملاحظات وتغذية راجعة مفصلة

## النماذج الجديدة

### AssignmentQuestion
```python
class AssignmentQuestion(models.Model):
    assignment = models.ForeignKey(Assignment, ...)
    text = models.TextField()  # نص السؤال
    question_type = models.CharField(choices=QUESTION_TYPE_CHOICES)
    points = models.PositiveIntegerField()  # الدرجة المخصصة
    explanation = models.TextField()  # شرح السؤال
    image = models.ImageField()  # صورة توضيحية
    order = models.PositiveIntegerField()  # ترتيب السؤال
    is_required = models.BooleanField()  # هل السؤال إجباري
```

### AssignmentAnswer
```python
class AssignmentAnswer(models.Model):
    question = models.ForeignKey(AssignmentQuestion, ...)
    text = models.CharField()  # نص الإجابة
    is_correct = models.BooleanField()  # هل الإجابة صحيحة
    explanation = models.TextField()  # شرح الإجابة
    order = models.PositiveIntegerField()  # ترتيب الإجابة
```

### AssignmentQuestionResponse
```python
class AssignmentQuestionResponse(models.Model):
    submission = models.ForeignKey(AssignmentSubmission, ...)
    question = models.ForeignKey(AssignmentQuestion, ...)
    text_answer = models.TextField()  # الإجابة النصية
    selected_answer = models.ForeignKey(AssignmentAnswer, ...)  # الإجابة المختارة
    file_answer = models.FileField()  # الملف المرفوع
    points_earned = models.FloatField()  # الدرجة المكتسبة
    feedback = models.TextField()  # ملاحظات المدرس
```

## API Endpoints

### الواجبات
- `GET /api/assignments/` - قائمة الواجبات
- `GET /api/assignments/{id}/` - تفاصيل الواجب مع الأسئلة
- `POST /api/assignments/` - إنشاء واجب جديد
- `PUT /api/assignments/{id}/` - تحديث الواجب

### الأسئلة
- `GET /api/assignment-questions/` - قائمة الأسئلة
- `GET /api/assignment-questions/{id}/` - تفاصيل السؤال مع الإجابات
- `POST /api/assignment-questions/` - إنشاء سؤال جديد
- `PUT /api/assignment-questions/{id}/` - تحديث السؤال

### الإجابات
- `GET /api/assignment-answers/` - قائمة الإجابات
- `POST /api/assignment-answers/` - إنشاء إجابة جديدة
- `PUT /api/assignment-answers/{id}/` - تحديث الإجابة

### التسليم
- `GET /api/submissions/` - قائمة التسليمات
- `GET /api/submissions/{id}/` - تفاصيل التسليم مع الاستجابات
- `POST /api/submissions/` - تسليم واجب
- `POST /api/assignments/{id}/submit-with-questions/` - تسليم واجب مع الأسئلة

## أمثلة الاستخدام

### إنشاء واجب مع أسئلة
```python
# إنشاء الواجب
assignment = Assignment.objects.create(
    title="واجب الرياضيات",
    description="حل المسائل التالية",
    course=course,
    has_questions=True,
    has_file_upload=True,
    due_date=datetime.now() + timedelta(days=7)
)

# إضافة أسئلة
question1 = AssignmentQuestion.objects.create(
    assignment=assignment,
    text="ما هو ناتج 2 + 2؟",
    question_type="multiple_choice",
    points=10,
    order=1
)

# إضافة إجابات
AssignmentAnswer.objects.create(
    question=question1,
    text="3",
    is_correct=False,
    order=1
)
AssignmentAnswer.objects.create(
    question=question1,
    text="4",
    is_correct=True,
    order=2
)
```

### تسليم واجب
```python
# إنشاء التسليم
submission = AssignmentSubmission.objects.create(
    assignment=assignment,
    user=user,
    submission_text="تم حل الواجب",
    submitted_file=uploaded_file
)

# إضافة استجابات للأسئلة
AssignmentQuestionResponse.objects.create(
    submission=submission,
    question=question1,
    selected_answer=correct_answer,
    points_earned=10
)
```

## إعدادات Django Admin

تم إعداد لوحة الإدارة لتشمل:
- إدارة الواجبات مع الأسئلة
- إدارة الأسئلة مع الإجابات
- إدارة التسليمات والاستجابات
- تقييم الواجبات والاستجابات

## الملفات المحدثة

1. `models.py` - إضافة النماذج الجديدة
2. `admin.py` - إعداد لوحة الإدارة
3. `serializers.py` - إضافة serializers للـ API
4. `views.py` - إضافة views للـ API
5. `urls.py` - إضافة مسارات جديدة
6. `forms.py` - إضافة نماذج للواجهة الأمامية

## التثبيت والتشغيل

1. تشغيل الهجرات:
```bash
python manage.py makemigrations assignments
python manage.py migrate
```

2. إنشاء مستخدم superuser:
```bash
python manage.py createsuperuser
```

3. تشغيل الخادم:
```bash
python manage.py runserver
```

4. الوصول إلى لوحة الإدارة:
```
http://localhost:8000/admin/
``` 