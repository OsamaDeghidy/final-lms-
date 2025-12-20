# سكريبت لإصلاح مشكلة SendGrid API Key في Git
# قم بتشغيل هذا السكريبت من مجلد المشروع في Git Bash

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "إصلاح مشكلة SendGrid API Key في Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  هذا السكريبت يجب تشغيله من Git Bash وليس PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "الخطوات المطلوبة:" -ForegroundColor White
Write-Host ""
Write-Host "1. افتح Git Bash في مجلد المشروع" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. إلغاء الـ Rebase الحالي:" -ForegroundColor Cyan
Write-Host "   git rebase --abort" -ForegroundColor Gray
Write-Host ""
Write-Host "3. بدء Interactive Rebase:" -ForegroundColor Cyan
Write-Host "   git rebase -i 78e70773" -ForegroundColor Gray
Write-Host ""
Write-Host "4. في المحرر:" -ForegroundColor Cyan
Write-Host "   - ابحث عن: pick a6c500ce" -ForegroundColor Gray
Write-Host "   - غير 'pick' إلى 'edit'" -ForegroundColor Gray
Write-Host "   - احفظ وأغلق (في vim: Esc ثم :wq ثم Enter)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. بعد الخروج من المحرر:" -ForegroundColor Cyan
Write-Host "   git add backend/core/settings.py" -ForegroundColor Gray
Write-Host "   git commit --amend --no-edit" -ForegroundColor Gray
Write-Host "   git rebase --continue" -ForegroundColor Gray
Write-Host ""
Write-Host "6. إذا ظهر commit آخر، كرر:" -ForegroundColor Cyan
Write-Host "   git rebase --continue" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Push:" -ForegroundColor Cyan
Write-Host "   git push --force-with-lease" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ملاحظة: تم إصلاح ملف settings.py بالفعل" -ForegroundColor Green
Write-Host "الآن نحتاج فقط إلى إزالة الـ secret من التاريخ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

