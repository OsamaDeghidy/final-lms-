from django.contrib import admin
from .models import Division
from extras.admin import custom_admin_site


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'students_count', 'created_by', 'created_at')
    search_fields = ('name', 'organization__profile__name')
    list_filter = ('organization',)

# Register with custom admin site explicitly to ensure visibility
custom_admin_site.register(Division, DivisionAdmin)