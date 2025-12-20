# إصلاح مشكلة SendGrid API Key في Git

## المشكلة
GitHub يرفض الـ push لأن commit `a6c500ce` يحتوي على SendGrid API Key في `backend/core/settings.py:543`

## الحل

### الخطوة 1: إلغاء الـ Rebase الحالي (إذا كنت في حالة rebase)

```bash
git rebase --abort
```

### الخطوة 2: إزالة الـ Secret من commit `a6c500ce`

نحتاج إلى تعديل commit `a6c500ce` لإزالة الـ API Key منه:

```bash
# عرض الـ commits
git log --oneline -5

# بدء interactive rebase من قبل commit المشكلة
git rebase -i 78e70773
```

في المحرر الذي سيظهر:
- ابحث عن السطر: `pick a6c500ce Update admin interfaces...`
- غير `pick` إلى `edit`
- احفظ وأغلق الملف (في vim: اضغط `Esc` ثم اكتب `:wq` ثم Enter)

### الخطوة 3: إزالة الـ Secret من الملف في ذلك الـ Commit

```bash
# الملف تم إصلاحه بالفعل، لكن نحتاج إلى التأكد من إزالته من الـ commit
git add backend/core/settings.py
git commit --amend --no-edit
```

### الخطوة 4: إكمال الـ Rebase

```bash
git rebase --continue
```

إذا ظهرت رسالة عن commit آخر (377113e9)، كرر:
```bash
git rebase --continue
```

### الخطوة 5: Push مرة أخرى

```bash
git push --force-with-lease
```

## ملاحظات مهمة:

1. ✅ تم إصلاح ملف `backend/core/settings.py` وإزالة الـ API Key منه
2. ✅ تم إضافة ملفات الإعدادات إلى `.gitignore`
3. ⚠️ استخدم `--force-with-lease` بدلاً من `--force` لأنه أكثر أماناً
4. 🔒 الـ API Key الآن يستخدم environment variables فقط

## إذا واجهت مشاكل:

### إذا كان الـ rebase معقد:
```bash
# إلغاء الـ rebase
git rebase --abort

# إعادة تعيين إلى قبل commit المشكلة
git reset --soft 78e70773

# إزالة ملفات الإعدادات
git rm --cached backend/core/settings.py

# إضافة الملفات المعدلة (بدون settings.py)
git add .

# إنشاء commit جديد بدون الـ secret
git commit -m "Update admin interfaces and models with Arabic translations, enhance GPA management features, and improve notification handling. Added new GPA page for students and integrated banner notifications in the header. Adjusted various model fields for better clarity and user experience."

# إضافة باقي الـ commits
git add .
git commit -m "Add whitespace for improved code readability in Footer component"

git add .
git commit -m "setitng"

# Push
git push --force-with-lease
```

