#!/bin/bash

# سكريبت للتحقق من حالة rebase وإصلاحها

echo "========================================"
echo "فحص حالة Rebase"
echo "========================================"
echo ""

# التحقق من وجود rebase
if [ -d .git/rebase-merge ]; then
    echo "⚠️  يوجد rebase قائم في .git/rebase-merge"
    echo ""
    echo "الملفات الموجودة:"
    ls -la .git/rebase-merge/
    echo ""
    
    if [ -f .git/rebase-merge/head-name ]; then
        echo "الفرع الحالي:"
        cat .git/rebase-merge/head-name
        echo ""
    fi
    
    if [ -f .git/rebase-merge/onto ]; then
        echo "الـ commit المستهدف:"
        cat .git/rebase-merge/onto
        echo ""
    fi
    
    echo "الخيارات:"
    echo "1. إكمال الـ rebase: git rebase --continue"
    echo "2. إلغاء الـ rebase: git rebase --abort"
    echo "3. حذف مجلد rebase يدوياً: rm -fr .git/rebase-merge"
    echo ""
    
elif [ -d .git/rebase-apply ]; then
    echo "⚠️  يوجد rebase قائم في .git/rebase-apply"
    echo ""
    echo "الخيارات:"
    echo "1. إكمال الـ rebase: git rebase --continue"
    echo "2. إلغاء الـ rebase: git rebase --abort"
    echo "3. حذف مجلد rebase يدوياً: rm -fr .git/rebase-apply"
    echo ""
else
    echo "✓ لا يوجد rebase قائم"
fi

