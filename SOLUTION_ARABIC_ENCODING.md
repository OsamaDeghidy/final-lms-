# حل مشكلة الترميز العربي في Excel

## المشكلة
النصوص العربية تظهر كرموز غير مفهومة مثل `Ø§Ø³Ø§Ù…Ù‡` بدلاً من `اسامه` عند تصدير البيانات إلى Excel.

## الأسباب المحتملة
1. البيانات مخزنة بشكل خاطئ في قاعدة البيانات (UTF-8 مخزن كـ Latin-1)
2. Excel لا يقرأ الترميز بشكل صحيح

## الحلول المطبقة

### 1. إصلاح الترميز عند التصدير
تم إضافة دالة `fix_arabic_encoding` في:
- `backend/users/admin.py`
- `backend/certificates/admin.py`

### 2. إصلاح البيانات في قاعدة البيانات
قم بتشغيل الأمر التالي لإصلاح البيانات الموجودة:

```bash
python manage.py fix_arabic_encoding
```

## حلول بديلة

### الحل 1: استخدام CSV بدلاً من Excel
إذا استمرت المشكلة، يمكن تصدير البيانات كـ CSV:

```python
# في export_excel_view
response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
# استخدام utf-8-sig لإضافة BOM لمساعدة Excel على قراءة UTF-8
```

### الحل 2: فتح Excel بشكل صحيح
عند فتح ملف Excel:
1. افتح Excel
2. اذهب إلى Data > From Text/CSV
3. اختر الملف
4. في Encoding، اختر "65001: Unicode (UTF-8)"

### الحل 3: استخدام مكتبة xlsxwriter
يمكن استبدال openpyxl بـ xlsxwriter الذي يدعم UTF-8 بشكل أفضل.

## التحقق من إصلاح المشكلة

بعد تطبيق الحلول:
1. قم بتصدير البيانات إلى Excel
2. تحقق من أن النصوص العربية تظهر بشكل صحيح
3. إذا لم تكن كذلك، قم بتشغيل الأمر `fix_arabic_encoding` لإصلاح البيانات في قاعدة البيانات

