# حل مشكلة Rebase القائمة

## المشكلة:
أنت في حالة rebase قائمة بالفعل. يجب إما إكمالها أو إلغاؤها أولاً.

## الحل السريع:

### الخيار 1: إلغاء الـ Rebase والبدء من جديد (موصى به)

```bash
# إلغاء الـ rebase الحالي
git rebase --abort

# إذا فشل، احذف المجلد يدوياً
rm -fr .git/rebase-merge

# ثم ابدأ rebase جديد
git rebase -i 78e70773
```

### الخيار 2: إكمال الـ Rebase الحالي

```bash
# تحقق من حالة الملفات
git status

# إذا كان الملف جاهز، أكمل الـ rebase
git rebase --continue

# إذا كان هناك تعارضات، حلّها أولاً ثم:
git add .
git rebase --continue
```

## الخطوات الكاملة بعد إلغاء الـ Rebase:

```bash
# 1. إلغاء الـ rebase
git rebase --abort

# 2. بدء rebase جديد
git rebase -i 78e70773

# في المحرر (vim):
# - اضغط 'i' للكتابة
# - ابحث عن: pick a6c500ce
# - غير 'pick' إلى 'edit'
# - اضغط Esc
# - اكتب :wq ثم Enter

# 3. بعد الخروج من المحرر، أزل الـ API Key
# افتح backend/core/settings.py وأزل الـ API Key من السطر 543
# أو استخدم:
sed -i "s/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', 'SG\..*')/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')/g" backend/core/settings.py

# 4. أضف الملف وعدّل الـ commit
git add backend/core/settings.py
git commit --amend --no-edit
git rebase --continue

# 5. إذا ظهر commit آخر، كرر:
git rebase --continue

# 6. Push
git push --force-with-lease
```

## أو استخدم السكريبت:

```bash
bash fix-rebase-issue.sh
```

