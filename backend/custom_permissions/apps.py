from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class CustomPermissionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'custom_permissions'
    verbose_name = _('الصلاحيات المخصصة')
    
    def ready(self):
        import custom_permissions.signals 