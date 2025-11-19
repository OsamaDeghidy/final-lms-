from django.contrib import admin
from django.contrib import messages
from .models import Division
from users.models import Student
from extras.admin import custom_admin_site


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'students_count', 'created_by', 'created_at')
    search_fields = ('name', 'organization__profile__name')
    list_filter = ('organization',)
    filter_horizontal = ('students',)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        """عرض فقط الطلاب الذين لم يسجلوا في أي شعبة (باستثناء الشعبة الحالية)"""
        if db_field.name == 'students':
            # احصل على ID الشعبة الحالية من URL
            division_id = None
            if hasattr(request, 'resolver_match') and request.resolver_match:
                division_id = request.resolver_match.kwargs.get('object_id')
            
            if division_id:
                # عند التعديل: اعرض الطلاب غير المسجلين في أي شعبة + الطلاب المسجلين في هذه الشعبة
                current_division = Division.objects.get(pk=division_id)
                # الطلاب المسجلين في شعب أخرى (غير هذه الشعبة)
                students_in_other_divisions = Student.objects.filter(
                    divisions__isnull=False
                ).exclude(
                    divisions=current_division
                ).distinct()
                
                # جميع الطلاب - الطلاب المسجلين في شعب أخرى = الطلاب المتاحين
                available_students = Student.objects.select_related('profile').exclude(
                    id__in=students_in_other_divisions.values_list('id', flat=True)
                )
            else:
                # عند الإنشاء: اعرض فقط الطلاب غير المسجلين في أي شعبة
                students_in_divisions = Student.objects.filter(
                    divisions__isnull=False
                ).distinct()
                
                available_students = Student.objects.select_related('profile').exclude(
                    id__in=students_in_divisions.values_list('id', flat=True)
                )
            
            kwargs['queryset'] = available_students
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        """حفظ النموذج"""
        super().save_model(request, obj, form, change)

    def save_m2m(self, request, form, formsets, change):
        """تأكد من أن كل طالب في شعبة واحدة فقط عند حفظ العلاقات ManyToMany"""
        super().save_m2m(request, form, formsets, change)
        
        # بعد حفظ العلاقات، تأكد من أن كل طالب في شعبة واحدة فقط
        obj = form.instance
        removed_students = []
        
        for student in obj.students.all():
            other_divisions = Division.objects.exclude(pk=obj.pk).filter(students=student)
            if other_divisions.exists():
                removed_divisions = []
                for other_division in other_divisions:
                    other_division.students.remove(student)
                    removed_divisions.append(other_division.name)
                
                if removed_divisions:
                    student_name = student.profile.name if student.profile else str(student)
                    removed_students.append({
                        'student': student_name,
                        'divisions': ', '.join(removed_divisions)
                    })
        
        if removed_students:
            warning_msg = 'تم إزالة بعض الطلاب من شعب أخرى لضمان أن كل طالب في شعبة واحدة فقط:\n'
            for item in removed_students:
                warning_msg += f"- {item['student']}: تم إزالته من {item['divisions']}\n"
            messages.warning(request, warning_msg)

# Register with custom admin site explicitly to ensure visibility
custom_admin_site.register(Division, DivisionAdmin)