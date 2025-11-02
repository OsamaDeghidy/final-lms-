from django.contrib import admin
from .models import Circular
from extras.admin import custom_admin_site


@admin.register(Circular)
class CircularAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'recipients_count', 'show_on_homepage', 'publish_at', 'created_at')
    search_fields = ('title',)
    list_filter = ('status', 'show_on_homepage')

# Register with custom admin site explicitly to ensure visibility
custom_admin_site.register(Circular, CircularAdmin)