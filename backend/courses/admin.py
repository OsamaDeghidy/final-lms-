from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Avg

from .models import Category, Tags, Course, Enrollment

# Unregister any models that might be registered by default or other apps
try:
    admin.site.unregister(Category)
except Exception:
    pass

try:
    admin.site.unregister(Tags)
except Exception:
    pass

try:
    admin.site.unregister(Course)
except Exception:
    pass

try:
    admin.site.unregister(Enrollment)
except Exception:
    pass



class PublishedFilter(SimpleListFilter):
    title = 'حالة النشر'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('published', 'منشور'),
            ('pending', 'قيد الانتظار'),
            ('draft', 'مسودة'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'published':
            return queryset.filter(status='published')
        elif self.value() == 'pending':
            return queryset.filter(status='pending')
        elif self.value() == 'draft':
            return queryset.filter(status='draft')
        return queryset


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_default', 'course_count', 'created_at')
    list_filter = ('is_default', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    
    def course_count(self, obj):
        count = obj.courses.count()
        if count > 0:
            url = reverse('admin:courses_course_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} دورة</a>', url, count)
        return '0 دورة'
    course_count.short_description = 'عدد الدورات'
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of default categories"""
        if obj and obj.is_default:
            return False
        return super().has_delete_permission(request, obj)
    
    def get_actions(self, request):
        """Remove delete action for default categories"""
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions


@admin.register(Tags)
class TagsAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_count')
    search_fields = ('name',)
    
    def course_count(self, obj):
        return obj.courses.count()
    course_count.short_description = 'عدد الدورات'

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'get_instructors', 'get_category_name', 'level', 'status', 'get_course_type', 'price', 
        'enrollment_count_display', 'created_at'
    )
    list_filter = (
        PublishedFilter, 'level', 'category', 'status', 'is_active', 'is_featured', 'is_certified', 'is_complete_course'
    )
    search_fields = ('title', 'instructors__profile__name', 'description', 'short_description')
    filter_horizontal = ('tags', 'instructors')
    readonly_fields = (
        'created_at', 'updated_at', 'enrollment_count_display', 'slug',
        'total_enrollments', 'average_rating'
    )
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'title', 'slug', 'subtitle', 'description', 'short_description',
                'category', 'tags', 'instructors', 'organization'
            )
        }),
        ('Course Type', {
            'fields': ('is_complete_course',),
            'description': 'Check if this is a complete course with full content. Uncheck if this is just a course announcement/preview.'
        }),
        ('Media & Content', {
            'fields': (
                'image', 'promotional_video', 'syllabus_pdf', 'materials_pdf'
            )
        }),
        ('Course Details', {
            'fields': (
                'level', 'language', 'status', 'is_active', 'is_featured',
                'is_certified', 'is_free'
            )
        }),
        ('Pricing', {
            'fields': ('price', 'discount_price'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('total_enrollments', 'average_rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_instructors(self, obj):
        return ", ".join([i.profile.name for i in obj.instructors.all() if hasattr(i, 'profile')])
    get_instructors.short_description = 'Instructors'
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'N/A'
    get_category_name.short_description = 'Category'
    get_category_name.admin_order_field = 'category__name'
    
    def get_course_type(self, obj):
        if obj.is_complete_course:
            return format_html('<span style="color: green;">✓ Complete Course</span>')
        else:
            return format_html('<span style="color: orange;">📢 Announcement</span>')
    get_course_type.short_description = 'Course Type'
    get_course_type.admin_order_field = 'is_complete_course'
    
    def enrollment_count_display(self, obj):
        return obj.students.count()
    enrollment_count_display.short_description = 'Enrollments'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('category', 'organization') \
            .prefetch_related('tags', 'instructors', 'instructors__profile') \
            .annotate(
                enrollment_count=Count('students', distinct=True),
                avg_rating=Avg('reviews__rating')
            )
    
    def total_enrollments(self, obj):
        return obj.students.count()
    total_enrollments.short_description = 'Total Enrollments'
    
    def average_rating(self, obj):
        if hasattr(obj, 'avg_rating'):
            return f"{obj.avg_rating:.1f}/5.0" if obj.avg_rating is not None else 'N/A'
        return 'N/A'
    average_rating.short_description = 'Average Rating'

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('course', 'student', 'status', 'enrollment_date', 'last_accessed')
    list_filter = ('status', 'enrollment_date', 'course')
    search_fields = ('course__name', 'student__username', 'student__first_name', 'student__last_name')
    readonly_fields = ('enrollment_date',)
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('course', 'student')


# Comment and SubComment admin classes moved to reviews app