# سكريبت لإزالة ملفات الإعدادات من Git
# قم بتشغيل هذا السكريبت من مجلد المشروع

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "إزالة ملفات الإعدادات من Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود Git
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host "خطأ: Git غير مثبت أو غير موجود في PATH" -ForegroundColor Red
    Write-Host "يرجى تثبيت Git من: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "أو استخدم Git Bash أو GitHub Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ تم العثور على Git" -ForegroundColor Green
Write-Host ""

# التحقق من أننا في مستودع Git
if (-not (Test-Path .git)) {
    Write-Host "خطأ: هذا المجلد ليس مستودع Git" -ForegroundColor Red
    exit 1
}

Write-Host "الخطوة 1: إزالة ملفات الإعدادات من Git tracking..." -ForegroundColor Yellow

# إزالة ملفات الإعدادات من Git (مع الاحتفاظ بها محلياً)
$settingsFiles = @(
    "backend/settings.py",
    "backend/core/settings.py"
)

foreach ($file in $settingsFiles) {
    if (Test-Path $file) {
        Write-Host "  - إزالة $file من Git..." -ForegroundColor Gray
        git rm --cached $file 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ تم إزالة $file" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $file غير موجود في Git أو تم إزالته مسبقاً" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "الخطوة 2: إضافة .gitignore..." -ForegroundColor Yellow
git add .gitignore
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ تم إضافة .gitignore" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "الخطوات التالية:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. إذا كانت ملفات الإعدادات في آخر commit فقط:" -ForegroundColor White
Write-Host "   git commit --amend --no-edit" -ForegroundColor Gray
Write-Host ""
Write-Host "2. إذا كانت ملفات الإعدادات في commit أقدم:" -ForegroundColor White
Write-Host "   git log --oneline" -ForegroundColor Gray
Write-Host "   git rebase -i HEAD~2" -ForegroundColor Gray
Write-Host "   (ثم اتبع التعليمات في الملف GIT_FIX_INSTRUCTIONS.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. بعد التعديل، قم بـ push:" -ForegroundColor White
Write-Host "   git push" -ForegroundColor Gray
Write-Host "   (أو git push --force إذا كنت قد push مسبقاً)" -ForegroundColor Gray
Write-Host ""

