# حل مشكلة SendGrid API Key في commit a6c500ce

## المشكلة:
GitHub يرفض الـ push لأن commit `a6c500ce` يحتوي على SendGrid API Key في التاريخ.

## الحل السريع:

### الطريقة 1: استخدام السكريبت (الأسهل)

```bash
bash fix-commit-a6c500ce.sh
```

### الطريقة 2: يدوياً (خطوة بخطوة)

```bash
# 1. عرض الـ commits
git log --oneline -5

# 2. بدء Interactive Rebase
git rebase -i 78e70773

# في المحرر الذي سيظهر (vim):
# - اضغط 'i' للدخول في وضع الكتابة
# - ابحث عن السطر: pick a6c500ce
# - غير 'pick' إلى 'edit'
# - اضغط Esc للخروج من وضع الكتابة
# - اكتب :wq ثم Enter للحفظ والخروج

# 3. بعد الخروج من المحرر، ستكون في commit a6c500ce
# إزالة الـ API Key من الملف
sed -i "s/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', 'SG\..*')/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')/g" backend/core/settings.py

# أو افتح الملف يدوياً وأزل الـ API Key من السطر 543

# 4. إضافة الملف المعدل
git add backend/core/settings.py

# 5. تعديل الـ commit
git commit --amend --no-edit

# 6. إكمال الـ rebase
git rebase --continue

# 7. إذا ظهر commit آخر (377113e9)، كرر:
git rebase --continue

# 8. Push
git push --force-with-lease
```

## إذا فشل الحل:

إذا كان GitHub لا يزال يكتشف الـ secret بعد rebase، قد تحتاج إلى:

### استخدام git filter-branch (أقوى):

```bash
# إزالة الـ secret من جميع الـ commits في التاريخ
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/core/settings.py" \
  --prune-empty --tag-name-filter cat -- --all

# أو استخدام BFG Repo-Cleaner (أسرع وأسهل)
# تحميل من: https://rtyley.github.io/bfg-repo-cleaner/
```

## ملاحظات مهمة:

1. ✅ تم إصلاح ملف `backend/core/settings.py` الحالي
2. ✅ تم إضافته إلى `.gitignore`
3. ⚠️ يجب إزالة الـ secret من commit `a6c500ce` في التاريخ
4. 🔒 بعد الحل، لن يتم اكتشاف الـ secret في المستقبل

