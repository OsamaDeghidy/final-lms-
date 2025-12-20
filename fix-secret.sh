#!/bin/bash

# سكريبت لإصلاح مشكلة SendGrid API Key في Git
# قم بتشغيله من Git Bash: bash fix-secret.sh

echo "========================================"
echo "إصلاح مشكلة SendGrid API Key في Git"
echo "========================================"
echo ""

# التحقق من وجود Git
if ! command -v git &> /dev/null; then
    echo "❌ خطأ: Git غير مثبت"
    exit 1
fi

# التحقق من أننا في مستودع Git
if [ ! -d .git ]; then
    echo "❌ خطأ: هذا المجلد ليس مستودع Git"
    exit 1
fi

echo "✓ تم العثور على Git"
echo ""

# التحقق من حالة rebase
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
    echo "⚠️  أنت في حالة rebase"
    read -p "هل تريد إلغاء الـ rebase الحالي؟ (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git rebase --abort
        echo "✓ تم إلغاء الـ rebase"
    else
        echo "يرجى إكمال أو إلغاء الـ rebase يدوياً أولاً"
        exit 1
    fi
fi

echo ""
echo "الخطوة 1: عرض آخر 5 commits"
echo "----------------------------------------"
git log --oneline -5
echo ""

echo "الخطوة 2: بدء Interactive Rebase"
echo "----------------------------------------"
echo "سيتم فتح محرر. في المحرر:"
echo "  - ابحث عن: pick a6c500ce"
echo "  - غير 'pick' إلى 'edit'"
echo "  - احفظ وأغلق (في vim: Esc ثم :wq ثم Enter)"
echo ""
read -p "اضغط Enter للمتابعة..."

git rebase -i 78e70773

if [ $? -ne 0 ]; then
    echo "❌ فشل الـ rebase"
    exit 1
fi

echo ""
echo "الخطوة 3: إضافة الملف المعدل"
echo "----------------------------------------"
git add backend/core/settings.py
git commit --amend --no-edit

echo ""
echo "الخطوة 4: إكمال الـ Rebase"
echo "----------------------------------------"
git rebase --continue

# إذا كان هناك commits أخرى
while [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; do
    echo ""
    echo "يوجد commit آخر، استمر..."
    git rebase --continue
done

echo ""
echo "✓ تم إكمال الـ rebase بنجاح"
echo ""
echo "الخطوة 5: Push إلى GitHub"
echo "----------------------------------------"
echo "سيتم استخدام --force-with-lease (أكثر أماناً من --force)"
read -p "هل تريد المتابعة مع push؟ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push --force-with-lease
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ تم الـ push بنجاح!"
    else
        echo ""
        echo "❌ فشل الـ push. تحقق من الرسائل أعلاه"
    fi
else
    echo "يمكنك عمل push لاحقاً باستخدام:"
    echo "  git push --force-with-lease"
fi

echo ""
echo "========================================"
echo "تم الانتهاء!"
echo "========================================"

