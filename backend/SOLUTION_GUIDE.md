# دليل حل مشاكل الاستيراد في Django LMS

## المشكلة
VS Code لا يتعرف على البيئة الافتراضية ولا يستطيع حل استيرادات Django.

## الحلول المطبقة

### 1. تم تحديث إعدادات VS Code
- ✅ تحديث `.vscode/settings.json` مع مسارات مطلقة
- ✅ إضافة `python.analysis.venvPath` و `python.analysis.venv`
- ✅ تحسين إعدادات التحليل

### 2. تم تحديث إعدادات Pyright
- ✅ تحديث `backend/pyrightconfig.json`
- ✅ إضافة `executionEnvironments`
- ✅ تحسين مسارات البحث

### 3. تم إنشاء ملف Workspace
- ✅ إنشاء `.vscode/workspace.code-workspace`
- ✅ إعدادات مخصصة للمشروع

## خطوات التطبيق الفورية

### الخطوة 1: إعادة تشغيل VS Code
```bash
# أغلق VS Code تماماً
# أعد فتح المشروع
```

### الخطوة 2: تحديد مفسر Python
1. اضغط `Ctrl+Shift+P`
2. اكتب `Python: Select Interpreter`
3. اختر: `./backend/venv/Scripts/python.exe`
4. إذا لم يظهر، اختر `Enter interpreter path...`
5. أدخل: `E:\projects\LMS-Osama\lms\backend\venv\Scripts\python.exe`

### الخطوة 3: إعادة تحميل النافذة
1. اضغط `Ctrl+Shift+P`
2. اكتب `Developer: Reload Window`
3. اضغط Enter

### الخطوة 4: تفعيل البيئة الافتراضية
```bash
cd backend
venv\Scripts\activate
```

### الخطوة 5: اختبار الحل
```bash
python manage.py check
```

## إذا استمرت المشكلة

### الحل البديل 1: إعادة تعيين إعدادات Python
1. اضغط `Ctrl+Shift+P`
2. اكتب `Python: Clear Cache and Reload`
3. اضغط Enter

### الحل البديل 2: إعادة تثبيت الحزم
```bash
cd backend
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### الحل البديل 3: إنشاء بيئة افتراضية جديدة
```bash
cd backend
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### الحل البديل 4: إعدادات VS Code اليدوية
1. اضغط `Ctrl+,` لفتح الإعدادات
2. ابحث عن `python.defaultInterpreterPath`
3. أدخل: `E:\projects\LMS-Osama\lms\backend\venv\Scripts\python.exe`

## التحقق من الحل

بعد تطبيق الحلول، يجب أن تختفي جميع أخطاء:
- ❌ `reportMissingImports`
- ❌ `Import "django.contrib" could not be resolved`
- ❌ `Import "rest_framework" could not be resolved`

## ملاحظات مهمة

1. **تأكد من تفعيل البيئة الافتراضية** قبل العمل
2. **استخدم Terminal المدمج** في VS Code
3. **تحقق من شريط الحالة** أسفل VS Code - يجب أن يظهر Python interpreter الصحيح
4. **أعد تشغيل VS Code** بعد تغيير الإعدادات

## الدعم الإضافي

إذا استمرت المشكلة:
1. تحقق من إصدار Python (يجب أن يكون 3.11)
2. تأكد من تثبيت جميع الحزم
3. جرب فتح المشروع كـ workspace جديد
4. تحقق من إعدادات Windows Defender أو Antivirus

## الملفات المُحدثة

- `.vscode/settings.json` - إعدادات VS Code المحسنة
- `backend/pyrightconfig.json` - إعدادات Pyright المحسنة
- `.vscode/workspace.code-workspace` - ملف workspace جديد

---

**ملاحظة**: هذه الحلول مصممة خصيصاً لمشروعك على Windows. إذا كنت تستخدم نظام تشغيل آخر، قد تحتاج لتعديل المسارات. 