from django.apps import AppConfig


class CircularsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'circulars'
    
    def ready(self):
        import circulars.signals  # noqa
    verbose_name = 'إدارة التعاميم'