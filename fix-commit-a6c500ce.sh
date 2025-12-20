#!/bin/bash

# سكريبت لإصلاح commit a6c500ce الذي يحتوي على SendGrid API Key
# قم بتشغيله من Git Bash: bash fix-commit-a6c500ce.sh

echo "========================================"
echo "إصلاح commit a6c500ce - إزالة SendGrid API Key"
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

# عرض الـ commits
echo "الـ commits الحالية:"
echo "----------------------------------------"
git log --oneline -5
echo ""

# التحقق من وجود commit a6c500ce
if ! git log --oneline | grep -q "a6c500ce"; then
    echo "⚠️  commit a6c500ce غير موجود في التاريخ"
    echo "ربما تم حذفه بالفعل"
    exit 1
fi

echo "الخطوة 1: بدء Interactive Rebase لتعديل commit a6c500ce"
echo "----------------------------------------"
echo "سيتم فتح محرر. في المحرر:"
echo "  - ابحث عن السطر: pick a6c500ce"
echo "  - غير 'pick' إلى 'edit'"
echo "  - احفظ وأغلق (في vim: اضغط i للكتابة، Esc للخروج، :wq للحفظ)"
echo ""
read -p "اضغط Enter للمتابعة..."

# بدء rebase من قبل commit المشكلة
git rebase -i 78e70773

if [ $? -ne 0 ]; then
    echo "❌ فشل الـ rebase. ربما تم إلغاؤه"
    exit 1
fi

# التحقق من أننا في حالة rebase
if [ ! -d .git/rebase-merge ] && [ ! -d .git/rebase-apply ]; then
    echo "⚠️  الـ rebase لم يبدأ. ربما لم تغير 'pick' إلى 'edit'"
    exit 1
fi

echo ""
echo "الخطوة 2: إزالة الـ API Key من الملف"
echo "----------------------------------------"

# التحقق من وجود الملف
if [ ! -f "backend/core/settings.py" ]; then
    echo "⚠️  ملف backend/core/settings.py غير موجود"
    echo "ربما تم حذفه في commit لاحق"
    echo "سنستمر بدون تعديل الملف..."
else
    # إزالة الـ API Key من الملف
    sed -i "s/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', 'SG\..*')/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')/g" backend/core/settings.py
    
    # إضافة الملف المعدل
    git add backend/core/settings.py
    echo "✓ تم إزالة الـ API Key من الملف"
fi

echo ""
echo "الخطوة 3: تعديل الـ commit"
echo "----------------------------------------"
git commit --amend --no-edit

if [ $? -ne 0 ]; then
    echo "❌ فشل تعديل الـ commit"
    exit 1
fi

echo ""
echo "الخطوة 4: إكمال الـ Rebase"
echo "----------------------------------------"
git rebase --continue

# إذا كان هناك commits أخرى، نستمر
while [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; do
    echo ""
    echo "يوجد commit آخر، استمر..."
    git rebase --continue
done

echo ""
echo "✓ تم إكمال الـ rebase بنجاح"
echo ""
echo "الخطوة 5: التحقق من عدم وجود الـ secret"
echo "----------------------------------------"
if git log -p | grep -q "SG\."; then
    echo "⚠️  تحذير: لا يزال هناك API Key في التاريخ!"
    echo "يرجى التحقق يدوياً"
else
    echo "✓ لا يوجد API Keys في التاريخ"
fi

echo ""
echo "الخطوة 6: Push إلى GitHub"
echo "----------------------------------------"
echo "سيتم استخدام --force-with-lease (أكثر أماناً)"
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
        echo "إذا كان GitHub لا يزال يكتشف الـ secret، قد تحتاج إلى:"
        echo "  1. التحقق من جميع الـ commits: git log -p | grep 'SG\\.'"
        echo "  2. أو استخدام git filter-branch أو BFG Repo-Cleaner"
    fi
else
    echo "يمكنك عمل push لاحقاً باستخدام:"
    echo "  git push --force-with-lease"
fi

echo ""
echo "========================================"
echo "تم الانتهاء!"
echo "========================================"

