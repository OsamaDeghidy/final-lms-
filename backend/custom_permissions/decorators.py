from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages
from django.http import JsonResponse
from django.utils.translation import gettext_lazy as _
from .models import CustomPermission


def has_permission(permission_code):
    """
    Decorator to check if user has specific permission
    Usage: @has_permission('view_articles')
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                if request.is_ajax():
                    return JsonResponse({'error': _('يجب تسجيل الدخول أولاً')}, status=401)
                return redirect('admin:login')
            
            # Check if user has permission
            has_perm = CustomPermission.has_permission(request.user, permission_code)
            
            if not has_perm:
                if request.is_ajax():
                    return JsonResponse({'error': _('ليس لديك صلاحية للوصول لهذه الصفحة')}, status=403)
                messages.error(request, _('ليس لديك صلاحية للوصول لهذه الصفحة'))
                return redirect('admin:index')
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def has_any_permission(permission_codes):
    """
    Decorator to check if user has any of the specified permissions
    Usage: @has_any_permission(['view_articles', 'edit_articles'])
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                if request.is_ajax():
                    return JsonResponse({'error': _('يجب تسجيل الدخول أولاً')}, status=401)
                return redirect('admin:login')
            
            # Check if user has any of the permissions
            has_perm = CustomPermission.has_any_permission(request.user, permission_codes)
            
            if not has_perm:
                if request.is_ajax():
                    return JsonResponse({'error': _('ليس لديك صلاحية للوصول لهذه الصفحة')}, status=403)
                messages.error(request, _('ليس لديك صلاحية للوصول لهذه الصفحة'))
                return redirect('admin:index')
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def has_all_permissions(permission_codes):
    """
    Decorator to check if user has all of the specified permissions
    Usage: @has_all_permissions(['view_articles', 'edit_articles'])
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                if request.is_ajax():
                    return JsonResponse({'error': _('يجب تسجيل الدخول أولاً')}, status=401)
                return redirect('admin:login')
            
            # Check if user has all permissions
            has_perm = CustomPermission.has_all_permissions(request.user, permission_codes)
            
            if not has_perm:
                if request.is_ajax():
                    return JsonResponse({'error': _('ليس لديك صلاحية للوصول لهذه الصفحة')}, status=403)
                messages.error(request, _('ليس لديك صلاحية للوصول لهذه الصفحة'))
                return redirect('admin:index')
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


def permission_required(permission_code):
    """
    Alternative decorator name for has_permission
    """
    return has_permission(permission_code)


def permissions_required(permission_codes, require_all=True):
    """
    Decorator to check multiple permissions
    Usage: @permissions_required(['view_articles', 'edit_articles'], require_all=True)
    """
    if require_all:
        return has_all_permissions(permission_codes)
    else:
        return has_any_permission(permission_codes) 