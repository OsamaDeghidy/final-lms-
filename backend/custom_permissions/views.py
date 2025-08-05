from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from .models import CustomPermission
from .decorators import has_permission


def is_superuser(user):
    """Check if user is superuser"""
    return user.is_superuser


@user_passes_test(is_superuser)
def user_permissions_view(request, user_id=None):
    """
    View for managing user permissions
    """
    # Get all staff users
    users = User.objects.filter(is_staff=True).order_by('username')
    selected_user = None
    user_permissions = []
    
    if user_id:
        selected_user = get_object_or_404(User, id=user_id, is_staff=True)
        # Get current permissions for the selected user
        user_permissions = CustomPermission.get_user_permissions(selected_user)
    
    if request.method == 'POST':
        return handle_permissions_save(request)
    
    context = {
        'users': users,
        'selected_user': selected_user,
        'user_permissions': list(user_permissions),
        'permission_choices': CustomPermission.PERMISSION_CHOICES,
    }
    
    return render(request, 'admin/permissions/user_permissions.html', context)


@csrf_exempt
@require_http_methods(["POST"])
@user_passes_test(is_superuser)
def handle_permissions_save(request):
    """
    Handle saving permissions via AJAX
    """
    try:
        user_id = request.POST.get('user_id')
        if not user_id:
            return JsonResponse({'success': False, 'error': _('معرف المستخدم مطلوب')})
        
        user = get_object_or_404(User, id=user_id, is_staff=True)
        permissions = request.POST.getlist('permissions')
        
        with transaction.atomic():
            # Delete existing permissions for this user
            CustomPermission.objects.filter(user=user).delete()
            
            # Add new permissions
            for permission_code in permissions:
                CustomPermission.objects.create(
                    user=user,
                    permission_code=permission_code
                )
        
        return JsonResponse({
            'success': True,
            'message': _('تم حفظ الصلاحيات بنجاح')
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })


@user_passes_test(is_superuser)
def user_permissions_list(request):
    """
    List all users with their permissions
    """
    users = User.objects.filter(is_staff=True).prefetch_related('custom_permissions')
    
    context = {
        'users': users,
    }
    
    return render(request, 'admin/permissions/user_permissions_list.html', context)


@has_permission('view_articles')
def example_protected_view(request):
    """
    Example of a protected view using custom permissions
    """
    return JsonResponse({'message': 'This view is protected by custom permissions'})


# Utility views for permission checking
def check_user_permissions(request, user_id):
    """
    Check what permissions a user has
    """
    if not request.user.is_superuser:
        return JsonResponse({'error': _('غير مصرح')}, status=403)
    
    user = get_object_or_404(User, id=user_id)
    permissions = CustomPermission.get_user_permissions(user)
    
    return JsonResponse({
        'user_id': user_id,
        'username': user.username,
        'permissions': list(permissions)
    })


def bulk_permissions_update(request):
    """
    Bulk update permissions for multiple users
    """
    if not request.user.is_superuser:
        return JsonResponse({'error': _('غير مصرح')}, status=403)
    
    if request.method == 'POST':
        try:
            data = request.POST
            user_ids = data.getlist('user_ids')
            permissions = data.getlist('permissions')
            action = data.get('action')  # 'add' or 'remove'
            
            with transaction.atomic():
                for user_id in user_ids:
                    user = get_object_or_404(User, id=user_id, is_staff=True)
                    
                    if action == 'add':
                        # Add permissions
                        for permission_code in permissions:
                            CustomPermission.objects.get_or_create(
                                user=user,
                                permission_code=permission_code,
                                defaults={'is_active': True}
                            )
                    elif action == 'remove':
                        # Remove permissions
                        CustomPermission.objects.filter(
                            user=user,
                            permission_code__in=permissions
                        ).delete()
            
            return JsonResponse({
                'success': True,
                'message': _('تم تحديث الصلاحيات بنجاح')
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'error': _('طريقة طلب غير صحيحة')}, status=405) 