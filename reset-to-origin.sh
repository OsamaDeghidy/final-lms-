#!/bin/bash

# سكريبت للرجوع إلى آخر commit مرفوع على origin/main مع الحفاظ على الكود المحلي

echo "========================================"
echo "الرجوع إلى آخر commit مرفوع على origin/main"
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

# إلغاء أي rebase قائم
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
    echo "⚠️  يوجد rebase قائم، جاري إلغاؤه..."
    git rebase --abort 2>/dev/null || rm -fr .git/rebase-merge .git/rebase-apply
    echo "✓ تم إلغاء الـ rebase"
    echo ""
fi

# عرض الـ commits الحالية
echo "الـ commits الحالية:"
echo "----------------------------------------"
git log --oneline -5
echo ""

# عرض آخر commit على origin/main
echo "آخر commit على origin/main:"
echo "----------------------------------------"
git log origin/main --oneline -1
echo ""

# التحقق من وجود origin/main
if ! git rev-parse --verify origin/main >/dev/null 2>&1; then
    echo "❌ خطأ: origin/main غير موجود"
    echo "جاري البحث عن آخر commit..."
    LAST_COMMIT=$(git log --oneline -1 | awk '{print $1}')
    echo "آخر commit محلي: $LAST_COMMIT"
    read -p "هل تريد الرجوع إلى هذا الـ commit؟ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    TARGET_COMMIT=$LAST_COMMIT
else
    TARGET_COMMIT=$(git rev-parse origin/main)
    echo "سيتم الرجوع إلى: $TARGET_COMMIT"
    echo "Commit: $(git log origin/main --oneline -1)"
fi

echo ""
echo "⚠️  تحذير: سيتم حذف الـ commits المحلية التالية:"
echo "----------------------------------------"
git log --oneline $TARGET_COMMIT..HEAD
echo ""

read -p "هل أنت متأكد؟ سيتم حفظ التغييرات في working directory (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "تم الإلغاء"
    exit 0
fi

echo ""
echo "الخطوة 1: حفظ التغييرات الحالية..."
echo "----------------------------------------"

# حفظ التغييرات في stash (اختياري - للاحتياط)
git stash push -m "Auto-stash before reset to origin/main - $(date)"

echo "✓ تم حفظ التغييرات في stash"
echo ""

echo "الخطوة 2: الرجوع إلى origin/main (مع الحفاظ على التغييرات المحلية)..."
echo "----------------------------------------"

# Reset soft - يحافظ على التغييرات في working directory
git reset --soft $TARGET_COMMIT

if [ $? -eq 0 ]; then
    echo "✓ تم الرجوع إلى origin/main"
    echo ""
    echo "الـ commits المحلية تم حذفها من التاريخ"
    echo "لكن جميع التغييرات موجودة في working directory"
    echo ""
    
    echo "الخطوة 3: عرض حالة Git..."
    echo "----------------------------------------"
    git status
    echo ""
    
    echo "✅ تم بنجاح!"
    echo ""
    echo "ملاحظات:"
    echo "- جميع التغييرات موجودة في working directory"
    echo "- يمكنك مراجعة التغييرات بـ: git status"
    echo "- إذا أردت استرجاع التغييرات المحفوظة: git stash pop"
    echo "- إذا أردت commit جديد: git add . && git commit -m 'your message'"
    
else
    echo "❌ فشل الـ reset"
    exit 1
fi

echo ""
echo "========================================"
echo "تم الانتهاء!"
echo "========================================"

