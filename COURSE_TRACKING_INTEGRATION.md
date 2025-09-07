# Course Tracking Integration Documentation

## نظرة عامة
تم ربط صفحة تتبع الدورة (CourseTracking) بالـ API الحقيقي وقاعدة البيانات لضمان عمل جميع الوظائف بشكل صحيح.

## الوظائف المضافة

### 1. جلب بيانات الدورة (Course Data Fetching)
- **الوظيفة**: `fetchCourseData()`
- **الوصف**: يجلب جميع بيانات الدورة من الـ API
- **البيانات المطلوبة**:
  - معلومات الدورة الأساسية
  - الوحدات والدروس
  - التقدم الحالي للمستخدم
  - الواجبات والكويزات والامتحانات
  - الملفات والموارد

### 2. تتبع تقدم الفيديو (Video Progress Tracking)
- **الوظيفة**: `trackVideoProgress(progress)`
- **الوصف**: يتتبع تقدم المستخدم في مشاهدة الفيديو
- **الميزات**:
  - تحديث التقدم كل 10 ثواني
  - حفظ آخر موضع في الفيديو
  - حساب النسبة المئوية للمشاهدة

### 3. إكمال الدروس (Lesson Completion)
- **الوظيفة**: `markLessonAsCompleted()`
- **الوصف**: يحدد الدرس كمكتمل
- **الميزات**:
  - تحديث حالة الدرس في قاعدة البيانات
  - تحديث التقدم العام للدورة
  - الانتقال التلقائي للدرس التالي
  - إظهار إشعار نجاح

### 4. التنقل بين الدروس (Lesson Navigation)
- **الوظائف**:
  - `navigateToNextLesson()`: الانتقال للدرس التالي
  - `navigateToPreviousLesson()`: الانتقال للدرس السابق
- **الميزات**:
  - التنقل داخل نفس الوحدة
  - الانتقال بين الوحدات
  - التحقق من وجود دروس متاحة

### 5. تحميل الموارد (Resource Download)
- **الوظيفة**: `downloadResource(resource)`
- **الوصف**: تحميل الملفات المرفقة أو فتح الروابط الخارجية
- **الميزات**:
  - تحميل مباشر للملفات
  - فتح الروابط في نافذة جديدة
  - إظهار إشعارات للمستخدم

### 6. نظام الإشعارات (Notification System)
- **الوظائف**:
  - `showSnackbar(message, severity)`: إظهار إشعار
  - `handleSnackbarClose()`: إغلاق الإشعار
- **أنواع الإشعارات**:
  - `success`: نجاح العملية
  - `error`: خطأ في العملية
  - `info`: معلومات عامة

## API Endpoints المستخدمة

### 1. جلب بيانات تتبع الدورة
```javascript
GET /courses/course-tracking/{courseId}/
```

### 2. تحديد درس كمكتمل
```javascript
POST /content/progress/course/{courseId}/complete/
{
  "lesson_id": lessonId
}
```

### 3. تتبع تقدم الدرس
```javascript
POST /content/progress/course/{courseId}/track/
{
  "lesson_id": lessonId,
  "content_type": "video",
  "progress_percentage": percentage,
  "current_time": seconds,
  "duration": totalDuration
}
```

### 4. تحديث تقدم الوحدة
```javascript
POST /content/modules/{moduleId}/mark_progress/
{
  "content_type": "video|pdf|notes|quiz",
  "completed": true
}
```

## هيكل البيانات (Data Structure)

### بيانات الدورة
```javascript
{
  id: number,
  title: string,
  instructor: string,
  instructorAvatar: string,
  category: string,
  level: string,
  duration: number,
  progress: number,
  rating: number,
  totalStudents: number,
  hasFinalExam: boolean,
  modules: Module[],
  assignments: Assignment[],
  exams: Exam[],
  quizzes: Quiz[]
}
```

### بيانات الوحدة
```javascript
{
  id: number,
  title: string,
  progress: number,
  totalLessons: number,
  completedLessons: number,
  lessons: Lesson[]
}
```

### بيانات الدرس
```javascript
{
  id: number,
  title: string,
  duration: string,
  type: "video|article",
  completed: boolean,
  videoUrl: string,
  content: string,
  resources: Resource[]
}
```

### بيانات المورد
```javascript
{
  id: number,
  title: string,
  description: string,
  resource_type: string,
  file_url: string,
  url: string,
  is_downloadable: boolean
}
```

## الميزات المضافة

### 1. تتبع التقدم في الوقت الفعلي
- تحديث شريط التقدم
- حساب النسبة المئوية للإكمال
- عرض الإحصائيات

### 2. واجهة مستخدم محسنة
- تصميم متجاوب
- أزرار التنقل
- مؤشرات الحالة
- إشعارات تفاعلية

### 3. إدارة الملفات
- عرض الملفات المرفقة
- تحميل الملفات
- فتح الروابط الخارجية

### 4. التنقل الذكي
- الانتقال التلقائي للدرس التالي
- التحقق من إكمال المتطلبات
- عرض الدرس التالي المقترح

## معالجة الأخطاء

### أنواع الأخطاء المعالجة
1. **خطأ 404**: الدورة غير موجودة
2. **خطأ 403**: المستخدم غير مسجل في الدورة
3. **خطأ 401**: مشكلة في المصادقة
4. **خطأ 500**: خطأ في الخادم

### رسائل الخطأ
- رسائل باللغة العربية
- وصف واضح للمشكلة
- اقتراحات للحل

## الأمان والتحقق

### التحقق من الصلاحيات
- التحقق من تسجيل المستخدم في الدورة
- التحقق من حالة الاشتراك
- التحقق من صلاحيات الوصول

### حماية البيانات
- تشفير البيانات الحساسة
- التحقق من صحة المدخلات
- منع الوصول غير المصرح به

## الاختبار والتطوير

### اختبار الوظائف
- اختبار جلب البيانات
- اختبار تتبع التقدم
- اختبار إكمال الدروس
- اختبار تحميل الملفات

### تحسين الأداء
- تحميل تدريجي للبيانات
- تخزين مؤقت للبيانات
- تحسين استعلامات قاعدة البيانات

## الاستخدام

### للمطورين
1. تأكد من وجود جميع الـ API endpoints
2. تحقق من صحة هيكل البيانات
3. اختبر جميع الوظائف
4. راجع معالجة الأخطاء

### للمستخدمين
1. تسجيل الدخول للمنصة
2. اختيار دورة مسجل فيها
3. بدء التعلم وتتبع التقدم
4. إكمال الدروس والواجبات

## الدعم والصيانة

### المراقبة
- مراقبة أداء الـ API
- تتبع الأخطاء
- مراقبة استخدام الموارد

### التحديثات
- تحديث الوظائف حسب الحاجة
- إضافة ميزات جديدة
- تحسين الأداء

## الخلاصة

تم ربط صفحة تتبع الدورة بالكامل مع الـ API الحقيقي وقاعدة البيانات، مما يضمن:
- عمل جميع الوظائف بشكل صحيح
- تتبع دقيق للتقدم
- تجربة مستخدم سلسة
- أمان وموثوقية عالية
