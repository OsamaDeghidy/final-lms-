"""
أمثلة على استخدام نظام الصلاحيات المخصصة
Examples for using the custom permissions system
"""

from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from .decorators import has_permission, has_any_permission, has_all_permissions
from .models import CustomPermission


# مثال 1: حماية صفحة عرض المقالات
@has_permission('view_articles')
def articles_list(request):
    """
    عرض قائمة المقالات - يتطلب صلاحية view_articles
    """
    from articles.models import Article
    
    articles = Article.objects.all()
    return render(request, 'articles/list.html', {
        'articles': articles,
        'title': 'قائمة المقالات'
    })


# مثال 2: حماية صفحة إضافة مقال جديد
@has_permission('add_articles')
def add_article(request):
    """
    إضافة مقال جديد - يتطلب صلاحية add_articles
    """
    if request.method == 'POST':
        # معالجة البيانات المرسلة
        title = request.POST.get('title')
        content = request.POST.get('content')
        
        if title and content:
            from articles.models import Article
            article = Article.objects.create(
                title=title,
                content=content,
                author=request.user
            )
            messages.success(request, 'تم إضافة المقال بنجاح')
            return redirect('articles:detail', article.id)
        else:
            messages.error(request, 'يرجى ملء جميع الحقول المطلوبة')
    
    return render(request, 'articles/add.html', {
        'title': 'إضافة مقال جديد'
    })


# مثال 3: حماية صفحة تعديل المقال
@has_permission('edit_articles')
def edit_article(request, article_id):
    """
    تعديل مقال - يتطلب صلاحية edit_articles
    """
    from articles.models import Article
    from django.shortcuts import get_object_or_404
    
    article = get_object_or_404(Article, id=article_id)
    
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        
        if title and content:
            article.title = title
            article.content = content
            article.save()
            messages.success(request, 'تم تحديث المقال بنجاح')
            return redirect('articles:detail', article.id)
        else:
            messages.error(request, 'يرجى ملء جميع الحقول المطلوبة')
    
    return render(request, 'articles/edit.html', {
        'article': article,
        'title': 'تعديل المقال'
    })


# مثال 4: حماية صفحة حذف المقال
@has_permission('delete_articles')
def delete_article(request, article_id):
    """
    حذف مقال - يتطلب صلاحية delete_articles
    """
    from articles.models import Article
    from django.shortcuts import get_object_or_404
    
    article = get_object_or_404(Article, id=article_id)
    
    if request.method == 'POST':
        article.delete()
        messages.success(request, 'تم حذف المقال بنجاح')
        return redirect('articles:list')
    
    return render(request, 'articles/delete_confirm.html', {
        'article': article,
        'title': 'تأكيد حذف المقال'
    })


# مثال 5: حماية صفحة إدارة الكورسات (أي صلاحية من الصلاحيات المطلوبة)
@has_any_permission(['view_all_courses', 'view_my_courses'])
def courses_management(request):
    """
    إدارة الكورسات - يتطلب إحدى صلاحيات عرض الكورسات
    """
    from courses.models import Course
    
    # التحقق من نوع الصلاحية لتحديد الكورسات المعروضة
    if CustomPermission.has_permission(request.user, 'view_all_courses'):
        courses = Course.objects.all()
        title = 'إدارة جميع الكورسات'
    else:
        courses = Course.objects.filter(instructor=request.user)
        title = 'إدارة كورساتي'
    
    return render(request, 'courses/management.html', {
        'courses': courses,
        'title': title
    })


# مثال 6: حماية صفحة إضافة كورس (جميع الصلاحيات مطلوبة)
@has_all_permissions(['add_all_courses', 'edit_all_courses'])
def add_course_full_access(request):
    """
    إضافة كورس مع صلاحيات كاملة - يتطلب جميع الصلاحيات المحددة
    """
    if request.method == 'POST':
        # معالجة إضافة الكورس
        pass
    
    return render(request, 'courses/add_full_access.html', {
        'title': 'إضافة كورس جديد'
    })


# مثال 7: API endpoint محمي
@has_permission('view_orders')
def orders_api(request):
    """
    API لعرض الطلبات - يتطلب صلاحية view_orders
    """
    from store.models import Order
    
    orders = Order.objects.all()
    data = []
    
    for order in orders:
        data.append({
            'id': order.id,
            'customer': order.customer.username,
            'total': order.total,
            'status': order.status,
            'created_at': order.created_at.isoformat()
        })
    
    return JsonResponse({
        'success': True,
        'data': data
    })


# مثال 8: التحقق من الصلاحيات في الكود
def dashboard_view(request):
    """
    لوحة التحكم - يعرض أقسام مختلفة بناءً على الصلاحيات
    """
    context = {
        'title': 'لوحة التحكم',
        'sections': []
    }
    
    # التحقق من صلاحيات المقالات
    if CustomPermission.has_permission(request.user, 'view_articles'):
        context['sections'].append({
            'title': 'المقالات',
            'url': 'articles:list',
            'icon': 'fas fa-newspaper'
        })
    
    # التحقق من صلاحيات الكورسات
    if CustomPermission.has_any_permission(request.user, ['view_all_courses', 'view_my_courses']):
        context['sections'].append({
            'title': 'الكورسات',
            'url': 'courses:list',
            'icon': 'fas fa-book'
        })
    
    # التحقق من صلاحيات الطلبات
    if CustomPermission.has_permission(request.user, 'view_orders'):
        context['sections'].append({
            'title': 'الطلبات',
            'url': 'store:orders',
            'icon': 'fas fa-shopping-cart'
        })
    
    # التحقق من صلاحيات المستخدمين
    if CustomPermission.has_any_permission(request.user, ['view_instructors', 'view_students']):
        context['sections'].append({
            'title': 'المستخدمين',
            'url': 'users:list',
            'icon': 'fas fa-users'
        })
    
    return render(request, 'dashboard/index.html', context)


# مثال 9: حماية صفحة إعدادات النظام
@has_all_permissions(['view_settings', 'edit_settings'])
def system_settings(request):
    """
    إعدادات النظام - يتطلب صلاحيات عرض وتعديل الإعدادات
    """
    if request.method == 'POST':
        # حفظ الإعدادات
        messages.success(request, 'تم حفظ الإعدادات بنجاح')
        return redirect('settings:index')
    
    return render(request, 'settings/index.html', {
        'title': 'إعدادات النظام'
    })


# مثال 10: حماية صفحة التقارير
@has_any_permission(['view_orders', 'view_payments', 'view_coupons'])
def financial_reports(request):
    """
    التقارير المالية - يتطلب إحدى صلاحيات البيانات المالية
    """
    context = {
        'title': 'التقارير المالية',
        'reports': []
    }
    
    # إضافة تقارير بناءً على الصلاحيات
    if CustomPermission.has_permission(request.user, 'view_orders'):
        context['reports'].append({
            'title': 'تقرير الطلبات',
            'url': 'reports:orders',
            'icon': 'fas fa-shopping-cart'
        })
    
    if CustomPermission.has_permission(request.user, 'view_payments'):
        context['reports'].append({
            'title': 'تقرير المدفوعات',
            'url': 'reports:payments',
            'icon': 'fas fa-credit-card'
        })
    
    if CustomPermission.has_permission(request.user, 'view_coupons'):
        context['reports'].append({
            'title': 'تقرير الكوبونات',
            'url': 'reports:coupons',
            'icon': 'fas fa-ticket-alt'
        })
    
    return render(request, 'reports/financial.html', context)


# مثال 11: Middleware للتحقق من الصلاحيات
class PermissionMiddleware:
    """
    Middleware للتحقق من الصلاحيات في كل طلب
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # التحقق من الصلاحيات قبل معالجة الطلب
        if request.user.is_authenticated:
            # يمكن إضافة منطق إضافي هنا
            pass
        
        response = self.get_response(request)
        return response


# مثال 12: Template Filter للتحقق من الصلاحيات
def has_permission_filter(user, permission_code):
    """
    Template Filter للتحقق من الصلاحيات في Templates
    """
    return CustomPermission.has_permission(user, permission_code)


# مثال 13: Context Processor لإضافة الصلاحيات للـ Templates
def permissions_context_processor(request):
    """
    Context Processor لإضافة معلومات الصلاحيات لجميع Templates
    """
    if request.user.is_authenticated:
        user_permissions = CustomPermission.get_user_permissions(request.user)
        return {
            'user_permissions': user_permissions,
            'has_article_permissions': CustomPermission.has_any_permission(
                request.user, 
                ['view_articles', 'add_articles', 'edit_articles', 'delete_articles']
            ),
            'has_course_permissions': CustomPermission.has_any_permission(
                request.user, 
                ['view_all_courses', 'view_my_courses', 'add_all_courses', 'add_my_courses']
            ),
            'has_financial_permissions': CustomPermission.has_any_permission(
                request.user, 
                ['view_orders', 'view_payments', 'view_coupons']
            ),
        }
    return {}


# مثال 14: إنشاء مستخدم مع صلاحيات محددة
def create_user_with_permissions(username, email, password, permissions):
    """
    إنشاء مستخدم جديد مع صلاحيات محددة
    """
    from django.contrib.auth.models import User
    
    # إنشاء المستخدم
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=True
    )
    
    # إضافة الصلاحيات
    for permission_code in permissions:
        CustomPermission.objects.create(
            user=user,
            permission_code=permission_code
        )
    
    return user


# مثال 15: تحديث صلاحيات مستخدم موجود
def update_user_permissions(user, permissions):
    """
    تحديث صلاحيات مستخدم موجود
    """
    # حذف الصلاحيات الحالية
    CustomPermission.objects.filter(user=user).delete()
    
    # إضافة الصلاحيات الجديدة
    for permission_code in permissions:
        CustomPermission.objects.create(
            user=user,
            permission_code=permission_code
        )
    
    return user


# مثال 16: التحقق من صلاحيات مجموعة مستخدمين
def check_users_permissions(users, permission_code):
    """
    التحقق من صلاحيات مجموعة مستخدمين
    """
    results = {}
    
    for user in users:
        has_perm = CustomPermission.has_permission(user, permission_code)
        results[user.username] = has_perm
    
    return results


# مثال 17: إنشاء تقرير الصلاحيات
def generate_permissions_report():
    """
    إنشاء تقرير شامل لجميع الصلاحيات
    """
    from django.contrib.auth.models import User
    
    report = {
        'total_users': User.objects.filter(is_staff=True).count(),
        'permissions_summary': {},
        'users_permissions': {}
    }
    
    # إحصائيات الصلاحيات
    for choice in CustomPermission.PERMISSION_CHOICES:
        permission_code = choice[0]
        count = CustomPermission.objects.filter(
            permission_code=permission_code,
            is_active=True
        ).count()
        report['permissions_summary'][permission_code] = count
    
    # صلاحيات كل مستخدم
    staff_users = User.objects.filter(is_staff=True)
    for user in staff_users:
        permissions = CustomPermission.get_user_permissions(user)
        report['users_permissions'][user.username] = list(permissions)
    
    return report 