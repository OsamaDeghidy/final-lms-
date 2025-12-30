# خطة تنفيذ قسم "الشعب" و"التعاميم" وربطهما بالمنصة

## الهدف
- إضافة قسمين جديدين متكاملين في الواجهة الأمامية والخلفية دون تعارض:
  - "الشعب": لإنشاء شعب، تسميتها، وإضافة طلاب لها (من المستخدمين الحاليين، الاستيراد من Excel، أو إدخال يدوي). صلاحية إضافة الطلاب مقتصرة على الأدمن.
  - "التعاميم": لإنشاء تعميم بعنوان ومحتوى وملف مرفق، وإرساله إلى عملاء محددين أو شعب محددة، عبر البريد الإلكتروني أو ظهوره في الصفحة الرئيسية أو الاثنين معًا. صلاحية الإرسال للمعلم أو الأدمن.
hjkvbjhkvkhvkhvhvjkhtrurtdidgisj
## صورة عامة للتكامل بدون تعارض
- إنشاء تطبيقين مستقلين في الباكند: `divisions` و`circulars` لتقليل التداخل مع التطبيقات الحالية.
- ربط المسارات عبر `backend/core/urls.py` بإضافة:
  - `path('api/divisions/', include('divisions.urls'))`
  - `path('api/circulars/', include('circulars.urls'))`
- استخدام نظام الأدوار الحالي عبر `Profile.status` وقيمه (`Student`, `Instructor`, `Admin`) لضبط الصلاحيات.
- إظهار عناصر السايدبار بشكل شرطي حسب الدور عبر `frontend/src/components/layout/MainLayout.jsx` مع تعديل اختيار عناصر التنقل بحيث يعامل `admin` كـ `teacher` ويظهر له عناصر إضافية.
- إعادة استخدام تطبيق `notifications` للعرض داخل النظام (إن رغبت) وتسجيل سجلات الإرسال، مع تنفيذ إرسال بريد عبر إعدادات البريد في Django.

## الباكند

### نموذج الشعب (Divisions)
- إنشاء تطبيق `backend/divisions` يحتوي على نموذج:
  - `Division`:
    - `name` (CharField)
    - `description` (TextField, اختياري)
    - `students` (ManyToMany إلى `django.contrib.auth.models.User`, مع استخدام الطلاب فقط عبر التحقق في المنطق)
    - `created_by` (ForeignKey إلى User)
    - `created_at`, `updated_at` (DateTime)
- صلاحيات:
  - إنشاء/تعديل/حذف الشعب: `Admin` فقط.
  - إضافة أو إزالة الطلاب من الشعب: `Admin` فقط.
  - الاطلاع على الشعب وقوائم الطلاب: `Instructor` و`Admin`.
- Serializers:
  - `DivisionSerializer` لقراءة/كتابة الشعب.
  - `DivisionStudentSerializer` لعمليات الإضافة/الحذف الجماعي للطلاب.
- Views (DRF):
  - `DivisionViewSet` (list, retrieve, create, update, destroy) مع صلاحيات مخصصة.
  - `POST /api/divisions/{id}/students/add/` لاستقبال قائمة معرفات طلاب موجودين.
  - `POST /api/divisions/{id}/students/import/` لرفع ملف Excel وإضافة/إنشاء طلاب تلقائيًا.
  - `DELETE /api/divisions/{id}/students/{user_id}/` لإزالة طالب.
- URLs: `backend/divisions/urls.py` باستخدام Router مسارات REST قياسية بالإضافة لمسارات مخصصة للإضافة/الاستيراد.
- استيراد Excel:
  - استخدام `openpyxl` لقراءة `.xlsx`.
  - الأعمدة المقترحة: `email`, `first_name`, `last_name`, `phone`, `national_id`.
  - إن لم يوجد المستخدم عبر `email` يتم إنشاؤه كطالب (تسجيل حد أدنى كما في `backend/certificates/admin.py`).

### نموذج التعاميم (Circulars)
- إنشاء تطبيق `backend/circulars` يحتوي على نموذج:
  - `Circular`:
    - `title` (CharField)
    - `content` (TextField)
    - `attachment` (FileField, upload_to='circulars/') اختياري
    - `target_users` (ManyToMany إلى User) اختياري
    - `target_divisions` (ManyToMany إلى Division) اختياري
    - `delivery_method` (Choice: `email`, `homepage`, `both`)
    - `created_by` (ForeignKey إلى User)
    - `status` (Choice: `draft`, `sent`)
    - `publish_at` (DateTime, اختياري للظهور في الصفحة الرئيسية)
    - `created_at`, `updated_at`
- صلاحيات:
  - إنشاء/إرسال التعاميم: `Instructor` و`Admin`.
  - الإرسال الفعلي ينشّط حسب `delivery_method`.
- وظائف الخدمة:
  - `send()` داخل الموديل أو Service يرسل حسب الطريقة:
    - `email`: عبر إعدادات البريد (`EMAIL_*`) وإعادة استخدام قوالب بريد، مع تسجيل في `NotificationLog` إن رغبت.
    - `homepage`: ضبط `status='sent'` و`publish_at=now` وتركه ليُجلب عبر API للواجهة الرئيسية.
    - `both`: تنفيذ الطريقتين.
- Serializers:
  - `CircularSerializer` مع حقول الهدف والطريقة.
- Views (DRF):
  - `CircularViewSet` (list/retrieve/create/update/destroy) مع صلاحيات.
  - `POST /api/circulars/{id}/send/` لتنفيذ الإرسال.
  - `GET /api/circulars/homepage/` لجلب التعاميم المرسلة للواجهة الرئيسية.
- URLs: `backend/circulars/urls.py` باستخدام Router ومسارات خاصة لـ `send` و`homepage`.

### الربط مع التطبيقات الحالية
- الأدوار:
  - الاعتماد على `backend/users/models.py` و`Profile.status` و`is_teacher_or_admin()`.
- المستخدمون/العملاء:
  - استخدام `users.urls` الموجودة:
    - `GET /api/users/students/` لجلب قائمة الطلاب.
    - `GET /api/users/search/?q=` للبحث عن مستخدمين لإضافتهم كـ "عملاء" مستهدفين في التعاميم.
- البريد الإلكتروني:
  - استخدام إعدادات البريد في `backend/core/settings.py`، وإن لم تكن مفعلة إدراج متغيرات البيئة المطلوبة في النشر.
- المرفقات:
  - تعتمد على `MEDIA_ROOT`/`MEDIA_URL` الموجودة بالفعل.

## الواجهة الأمامية

### السايدبار
- ملف: `frontend/src/components/layout/MainLayout.jsx`
  - تعديل اختيار عناصر التنقل بحيث:
    - يعامل `admin` كـ `teacher` في `getNavItems()` ليظهر العناصر المناسبة.
  - إضافة عنصرين:
    - "الشعب" (رابط: `/teacher/divisions`) يظهر للأدمن فقط.
    - "التعاميم" (رابط: `/teacher/circulars`) يظهر للمعلم والأدمن.

### الصفحات والمكونات
- Divisions:
  - `frontend/src/pages/teacher/divisions/DivisionsList.jsx`:
    - عرض الشعب، زر إضافة شعبة جديدة (Dialog أو صفحة فرعية)، وحذف/تعديل.
    - زر "إضافة طلاب" مع ثلاث خيارات: اختيار من العملاء (بحث في المستخدمين)، استيراد من Excel، إدخال يدوي.
    - صلاحية الأزرار الحساسة (إضافة/حذف/استيراد) للأدمن فقط.
  - `frontend/src/pages/teacher/divisions/DivisionDetail.jsx`:
    - تفاصيل الشعبة وقائمة الطلاب مع إمكانية إزالة طالب (للأدمن) أو الاطلاع فقط (للمعلم).
- Circulars:
  - `frontend/src/pages/teacher/circulars/CircularsList.jsx`:
    - عرض التعاميم المرسلة/المسودات.
  - `frontend/src/pages/teacher/circulars/CircularForm.jsx`:
    - حقول: عنوان، محتوى، مرفق، طريقة الإرسال (إيميل/الرئيسية/كلاهما)، اختيار المستلمين (عملاء/شعب).
    - زر "إرسال" ينفذ `POST /api/circulars/{id}/send/`.
- خدمات API:
  - `frontend/src/services/divisions.service.js`:
    - `listDivisions()`, `createDivision()`, `updateDivision()`, `deleteDivision()`, `addStudents(divisionId, userIds)`, `importStudents(divisionId, file)`.
  - `frontend/src/services/circulars.service.js`:
    - `listCirculars()`, `createCircular(data)`, `updateCircular()`, `deleteCircular()`, `sendCircular(id)`, `getHomepageCirculars()`.
- الصفحة الرئيسية:
  - إضافة مكوّن `CircularsSection.jsx` داخل `HomePage.jsx` بعد قسم التعليقات أو قبله:
    - يجلب `GET /api/circulars/homepage/` ويعرض آخر التعاميم المعروضة.

### الراوتر
- `frontend/src/App.jsx` ضمن مسار المعلم:
  - إضافة:
    - `Route path="divisions" element={<DivisionsList />} />`
    - `Route path="divisions/:id" element={<DivisionDetail />} />`
    - `Route path="circulars" element={<CircularsList />} />`
    - `Route path="circulars/new" element={<CircularForm />} />`

## الصلاحيات والأمان
- التحقق من الدور عبر الباكند باستخدام `IsAuthenticated` + تحقق مخصص:
  - Divisions: إنشاء/تعديل/حذف وإدارة الطلاب للأدمن فقط؛ القراءة للمعلم والأدمن.
  - Circulars: الإنشاء والإرسال للمعلم والأدمن.
- الواجهة الأمامية تعتمد على `useAuth().getUserRole()`:
  - إخفاء الأزرار/العناصر حسب الدور.
- معالجة إدخال البيانات والتحقق من صحة الملفات المرفوعة.

## مواصفات استيراد Excel (للشعب)
- صيغة: `.xlsx`.
- أعمدة مطلوبة على الأقل: `email` (مفتاح)، وأعمدة اختيارية: `first_name`, `last_name`, `phone`, `national_id`.
- السلوك:
  - إن لم يوجد مستخدم بالـ `email`، يتم إنشاؤه كطالب بحساب بسيط وتعيين دوره `Student`.
  - يتم إضافته تلقائيًا لطلاب الشعبة المحددة.

## اختبار وتحقق
- باكند:
  - اختبارات وحدات (unit tests) لـ Divisions وCirculars:
    - إنشاء Division، إضافة/إزالة طلاب، استيراد Excel.
    - إنشاء Circular وإرساله بالطرق المختلفة، التحقق من صلاحيات الدور.
  - تحقق من مسارات `core/urls.py` وعدم التعارض مع موجودات أخرى.
- فرونت:
  - اختبار يدوي لمسارات السايدبار وإظهار العناصر حسب الدور.
  - تجربة إنشاء شعب، وإضافة طلاب من بحث المستخدمين، واستيراد ملف.
  - تجربة إنشاء تعميم مع مرفق وإرساله إلى شعبة/عملاء عبر البريد والواجهة الرئيسية.
  - التحقق من ظهور التعاميم في الصفحة الرئيسية عند اختيار هذا الخيار.

## النشر والمتغيرات
- البريد الإلكتروني:
  - ضبط `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS/SSL`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` في البيئة الإنتاجية.
- الملفات المرفقة:
  - ضمان إعدادات `MEDIA_ROOT` و`MEDIA_URL` ومسارات الاستضافة.

## ملاحظات توافقية
- هناك تباين في تسمية الدور (`Teacher` vs `Instructor`) في بعض الأكواد؛ سنُوحّد على `Instructor` في الباكند عند التحقق، ونضيف تعامل خاص لـ `admin` كمعلم في الفرونت قبل الإضافة.
- إعادة استخدام `users/auth/register/` لعملية إنشاء طالب يدويًا عند الحاجة.
- إعادة استخدام منطق الاستيراد من `backend/certificates/admin.py` كمثال لإنشاء مستخدمين عند الاستيراد.

## خطوات التنفيذ (ترتيب مقترح)
1) إنشاء تطبيق `divisions` (موديل، serializer، viewset، urls) مع صلاحيات.
2) إضافة نقاط نهاية: إضافة/إزالة طلاب، واستيراد من Excel.
3) إنشاء تطبيق `circulars` (موديل، serializer، viewset، urls)، ونقطة نهاية `send` و`homepage`.
4) ربط التطبيقات في `core/urls.py` وإجراء الهجرات.
5) تعديل `MainLayout.jsx` لإضافة روابط السايدبار وإظهارها حسب الدور؛ تعديل `getNavItems()` ليعامل `admin` كـ `teacher`.
6) إضافة صفحات الفرونت: DivisionsList, DivisionDetail, CircularsList, CircularForm؛ وخدمات API.
7) إضافة `CircularsSection.jsx` وإدراجه في `HomePage.jsx`.
8) اختبار شامل للواجهتين ومراجعة الصلاحيات.
9) إعداد إعدادات البريد في الإنتاج والتأكد من عرض المرفقات.

## الأثر المتوقع وعدم التعارض
- التطبيقات الجديدة مستقلة، مساراتها تحت `/api/divisions/` و`/api/circulars/` ولن تتداخل مع الموجود.
- ضبط الصلاحيات يمنع استخدام غير المصرح له.
- التعديلات في السايدبار محدودة ومشروطة بالدور.

---
هذه الخطة قابلة للتنفيذ تدريجيًا. عند الموافقة، أبدأ بالباكند أولًا (النماذج والمسارات)، ثم واجهة الإدارة والفرونت، مع معاينة واجهات المستخدم في كل خطوة.