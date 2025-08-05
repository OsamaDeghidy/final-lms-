from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import CustomPermission


@admin.register(CustomPermission)
class CustomPermissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'permission_code', 'is_active', 'created_at']
    list_filter = ['permission_code', 'is_active', 'created_at']
    search_fields = ['user__username', 'user__email', 'permission_code']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('المستخدم'), {
            'fields': ('user',)
        }),
        (_('الصلاحية'), {
            'fields': ('permission_code', 'is_active')
        }),
        (_('التواريخ'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        return request.user.is_superuser
    
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser 