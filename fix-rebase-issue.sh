#!/bin/bash

# سكريبت لإصلاح مشكلة rebase وإزالة SendGrid API Key

echo "========================================"
echo "إصلاح مشكلة Rebase وإزالة SendGrid API Key"
echo "========================================"
echo ""

# التحقق من وجود rebase
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
    echo "⚠️  يوجد rebase قائم"
    echo ""
    echo "الخيارات:"
    echo "1. إلغاء الـ rebase الحالي والبدء من جديد"
    echo "2. محاولة إكمال الـ rebase الحالي"
    echo ""
    read -p "اختر (1 أو 2): " choice
    
    if [ "$choice" == "1" ]; then
        echo ""
        echo "إلغاء الـ rebase..."
        git rebase --abort
        if [ $? -eq 0 ]; then
            echo "✓ تم إلغاء الـ rebase"
        else
            echo "❌ فشل إلغاء الـ rebase. جاري حذف المجلد يدوياً..."
            rm -fr .git/rebase-merge .git/rebase-apply
            echo "✓ تم حذف مجلدات rebase"
        fi
        echo ""
    elif [ "$choice" == "2" ]; then
        echo ""
        echo "محاولة إكمال الـ rebase..."
        git rebase --continue
        exit 0
    else
        echo "❌ اختيار غير صحيح"
        exit 1
    fi
fi

echo ""
echo "الخطوة 1: عرض الـ commits"
echo "----------------------------------------"
git log --oneline -5
echo ""

echo "الخطوة 2: بدء Interactive Rebase"
echo "----------------------------------------"
echo "سيتم فتح محرر. في المحرر:"
echo "  - ابحث عن: pick a6c500ce"
echo "  - غير 'pick' إلى 'edit'"
echo "  - احفظ وأغلق (في vim: اضغط i للكتابة، Esc للخروج، :wq للحفظ)"
echo ""
read -p "اضغط Enter للمتابعة..."

# بدء rebase من قبل commit المشكلة
git rebase -i 78e70773

if [ $? -ne 0 ]; then
    echo "❌ فشل الـ rebase"
    exit 1
fi

# التحقق من أننا في حالة rebase
if [ ! -d .git/rebase-merge ] && [ ! -d .git/rebase-apply ]; then
    echo "⚠️  الـ rebase لم يبدأ. ربما لم تغير 'pick' إلى 'edit'"
    exit 1
fi

echo ""
echo "الخطوة 3: إزالة الـ API Key من الملف"
echo "----------------------------------------"

# التحقق من وجود الملف
if [ ! -f "backend/core/settings.py" ]; then
    echo "⚠️  ملف backend/core/settings.py غير موجود"
    echo "ربما تم حذفه في commit لاحق"
    echo "سنستمر بدون تعديل الملف..."
else
    # إزالة الـ API Key من الملف
    # نبحث عن السطر الذي يحتوي على API Key ونستبدله
    if grep -q "SG\." backend/core/settings.py; then
        # استخدام sed لإزالة الـ API Key
        sed -i "s/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', 'SG\.[^']*')/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')/g" backend/core/settings.py
        sed -i "s/SENDGRID_API_KEY = os.getenv(\"SENDGRID_API_KEY\", \"SG\.[^\"]*\")/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')/g" backend/core/settings.py
        
        # إذا لم يعمل sed، نستخدم perl
        if grep -q "SG\." backend/core/settings.py; then
            perl -i -pe "s/SENDGRID_API_KEY = os\.getenv\(['\"]SENDGRID_API_KEY['\"], ['\"]SG\.[^'\"]*['\"]\)/SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')/g" backend/core/settings.py
        fi
        
        echo "✓ تم إزالة الـ API Key من الملف"
    else
        echo "✓ الملف لا يحتوي على API Key"
    fi
    
    # إضافة الملف المعدل
    git add backend/core/settings.py
fi

echo ""
echo "الخطوة 4: تعديل الـ commit"
echo "----------------------------------------"
git commit --amend --no-edit

if [ $? -ne 0 ]; then
    echo "❌ فشل تعديل الـ commit"
    exit 1
fi

echo ""
echo "الخطوة 5: إكمال الـ Rebase"
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
echo "الخطوة 6: التحقق من عدم وجود الـ secret"
echo "----------------------------------------"
if git log -p | grep -q "SG\."; then
    echo "⚠️  تحذير: لا يزال هناك API Key في التاريخ!"
    echo "يرجى التحقق يدوياً: git log -p | grep 'SG\\.'"
else
    echo "✓ لا يوجد API Keys في التاريخ"
fi

echo ""
echo "الخطوة 7: Push إلى GitHub"
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
    fi
else
    echo "يمكنك عمل push لاحقاً باستخدام:"
    echo "  git push --force-with-lease"
fi

echo ""
echo "========================================"
echo "تم الانتهاء!"
echo "========================================"

