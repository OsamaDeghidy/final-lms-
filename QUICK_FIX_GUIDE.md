# دليل سريع لإصلاح مشكلة SendGrid API Key

## ✅ ما تم إصلاحه:
1. ✅ تم إزالة SendGrid API Key من ملف `backend/core/settings.py`
2. ✅ تم إضافة ملفات الإعدادات إلى `.gitignore`
3. ✅ الملف الآن يستخدم environment variables فقط

## ⚠️ المشكلة المتبقية:
commit `a6c500ce` في التاريخ لا يزال يحتوي على الـ API Key. GitHub يرفض الـ push بسبب هذا.

## 🔧 الحل السريع (3 خطوات):

### في Git Bash:

```bash
# 1. إلغاء أي rebase قائم
git rebase --abort

# 2. تعديل commit المشكلة
git rebase -i 78e70773
# في المحرر: غير "pick a6c500ce" إلى "edit a6c500ce"
# احفظ وأغلق (في vim: Esc ثم :wq ثم Enter)

# 3. بعد الخروج من المحرر:
git add backend/core/settings.py
git commit --amend --no-edit
git rebase --continue

# 4. إذا ظهر commit آخر:
git rebase --continue

# 5. Push
git push --force-with-lease
```

## 🚀 أو استخدم السكريبت:

```bash
# في Git Bash:
bash fix-secret.sh
```

## 📝 ملاحظات:
- استخدم `--force-with-lease` بدلاً من `--force` (أكثر أماناً)
- إذا فشل الـ rebase، يمكنك إلغاؤه بـ `git rebase --abort`
- الملف الحالي آمن ولن يحتوي على secrets في المستقبل

