from django.contrib import admin
from core.admin_mixins import ImportExportAdminMixin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib.admin import SimpleListFilter
from django.db.models import Count, Avg
from django.utils import timezone
from .models import (
    Quiz, Question, Answer, QuizAttempt, QuizUserAnswer,
    Exam, ExamQuestion, ExamAnswer, UserExamAttempt, UserExamAnswer,
    Assignment, AssignmentSubmission, AssignmentQuestion, AssignmentAnswer, AssignmentQuestionResponse
)


class QuizTypeFilter(SimpleListFilter):
    title = 'نوع الكويز'
    parameter_name = 'quiz_type'

    def lookups(self, request, model_admin):
        return (
            ('video', 'فيديو كويز'),
            ('module', 'كويز وحدة'),
            ('quick', 'كويز سريع'),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(quiz_type=self.value())
        return queryset


class PassedFilter(SimpleListFilter):
    title = 'حالة النجاح'
    parameter_name = 'passed'

    def lookups(self, request, model_admin):
        return (
            ('passed', 'ناجح'),
            ('failed', 'راسب'),
            ('pending', 'قيد التقييم'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'passed':
            return queryset.filter(passed=True)
        elif self.value() == 'failed':
            return queryset.filter(passed=False)
        elif self.value() == 'pending':
            return queryset.filter(passed__isnull=True)
        return queryset


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('text', 'question_type', 'points', 'order')
    ordering = ('order',)
    verbose_name = 'سؤال'
    verbose_name_plural = 'أسئلة'


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 2
    fields = ('text', 'is_correct', 'order')
    ordering = ('order',)
    verbose_name = 'إجابة'
    verbose_name_plural = 'إجابات'


class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 1
    fields = ('text', 'question_type', 'points', 'order')
    ordering = ('order',)
    verbose_name = 'سؤال امتحان'
    verbose_name_plural = 'أسئلة الامتحان'


class ExamAnswerInline(admin.TabularInline):
    model = ExamAnswer
    extra = 2
    fields = ('text', 'is_correct', 'order')
    ordering = ('order',)
    verbose_name = 'إجابة امتحان'
    verbose_name_plural = 'إجابات الامتحان'


class AssignmentQuestionInline(admin.StackedInline):
    model = AssignmentQuestion
    extra = 1
    fields = ('text', 'question_type', 'points', 'order', 'is_required')
    ordering = ('order',)
    verbose_name = 'سؤال واجب'
    verbose_name_plural = 'أسئلة الواجبات'
    
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        # إضافة help_text ديناميكي
        formset.form.base_fields['question_type'].help_text = (
            'ملاحظة: بعد حفظ الواجب، افتح كل سؤال على حدة لإضافة الإجابات (صح/خطأ أو خيارات متعددة)'
        )
        return formset


class AssignmentAnswerInline(admin.TabularInline):
    model = AssignmentAnswer
    extra = 2
    fields = ('text', 'is_correct', 'order')
    ordering = ('order',)
    verbose_name = 'إجابة واجب'
    verbose_name_plural = 'إجابات الواجبات'


@admin.register(Quiz)
class QuizAdmin(ImportExportAdminMixin, admin.ModelAdmin):
    list_display = (
        'title', 'quiz_type', 'course', 'module', 'questions_count', 
        'total_points', 'attempts_count', 'is_active', 'created_at'
    )
    list_filter = (QuizTypeFilter, 'is_active', 'created_at', 'course')
    search_fields = ('title', 'description', 'course__name', 'module__name')
    inlines = [QuestionInline]
    readonly_fields = ('created_at', 'updated_at', 'questions_count', 'total_points')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'description', 'quiz_type')
        }),
        ('الربط', {
            'fields': ('course', 'module')
        }),
        ('الإعدادات', {
            'fields': ('start_time', 'time_limit', 'pass_mark', 'is_active')
        }),
        ('الإحصائيات', {
            'fields': ('questions_count', 'total_points'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def questions_count(self, obj):
        count = obj.questions.count()
        if count > 0:
            url = reverse('admin:assignments_question_changelist') + f'?quiz__id__exact={obj.id}'
            return format_html('<a href="{}">{} سؤال</a>', url, count)
        return '0 سؤال'
    questions_count.short_description = 'عدد الأسئلة'
    
    def total_points(self, obj):
        return obj.get_total_points()
    total_points.short_description = 'إجمالي النقاط'
    
    def attempts_count(self, obj):
        count = obj.attempts.count()
        if count > 0:
            url = reverse('admin:assignments_quizattempt_changelist') + f'?quiz__id__exact={obj.id}'
            return format_html('<a href="{}">{} محاولة</a>', url, count)
        return '0 محاولة'
    attempts_count.short_description = 'المحاولات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('course', 'module').prefetch_related('questions', 'attempts')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'quiz', 'question_type', 'points', 'answers_count', 'order')
    list_filter = ('question_type', 'quiz__quiz_type', 'quiz__course')
    search_fields = ('text', 'quiz__title', 'explanation')
    inlines = [AnswerInline]
    
    fieldsets = (
        ('السؤال', {
            'fields': ('quiz', 'text', 'question_type', 'points', 'order')
        }),
        ('التفاصيل', {
            'fields': ('explanation', 'image')
        }),
    )
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'نص السؤال'
    
    def answers_count(self, obj):
        count = obj.answers.count()
        correct_count = obj.answers.filter(is_correct=True).count()
        return f'{count} ({correct_count} صحيحة)'
    answers_count.short_description = 'الإجابات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('quiz').prefetch_related('answers')


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'question_preview', 'is_correct', 'order')
    list_filter = ('is_correct', 'question__question_type')
    search_fields = ('text', 'question__text', 'explanation')
    
    def text_preview(self, obj):
        return obj.text[:40] + '...' if len(obj.text) > 40 else obj.text
    text_preview.short_description = 'نص الإجابة'
    
    def question_preview(self, obj):
        return obj.question.text[:30] + '...' if len(obj.question.text) > 30 else obj.question.text
    question_preview.short_description = 'السؤال'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('question')


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'quiz', 'attempt_number', 'final_score_display',
        'passed_status', 'is_manually_graded_display', 'is_grade_visible_display',
        'graded_by_display', 'start_time', 'duration'
    )
    list_filter = (PassedFilter, 'start_time', 'quiz__course', 'quiz__quiz_type', 'is_manually_graded', 'is_grade_visible')
    search_fields = ('user__username', 'quiz__title', 'user__first_name', 'user__last_name')
    readonly_fields = ('start_time', 'duration', 'score_display', 'final_score_display', 'answers_count', 'graded_by', 'graded_at')
    
    fieldsets = (
        ('معلومات المحاولة', {
            'fields': ('user', 'quiz', 'attempt_number')
        }),
        ('النتائج التلقائية', {
            'fields': ('score', 'passed', 'score_display')
        }),
        ('التعديل اليدوي للدرجة', {
            'fields': ('is_manually_graded', 'manual_grade', 'is_grade_visible', 'graded_by', 'graded_at')
        }),
        ('النتيجة النهائية', {
            'fields': ('final_score_display',)
        }),
        ('التوقيت', {
            'fields': ('start_time', 'end_time', 'duration')
        }),
        ('الإحصائيات', {
            'fields': ('answers_count',),
            'classes': ('collapse',)
        }),
    )
    
    def score_display(self, obj):
        if obj.score is not None:
            color = '#28a745' if obj.passed else '#dc3545'
            score_text = f"{obj.score:.1f}%"
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, 
                score_text
            )
        return 'غير محسوب'
    score_display.short_description = 'النتيجة التلقائية'
    
    def final_score_display(self, obj):
        final_score = obj.get_final_score()
        if final_score is not None:
            passed = final_score >= (obj.quiz.pass_mark if obj.quiz else 60)
            color = '#28a745' if passed else '#dc3545'
            score_text = f"{final_score:.1f}%"
            if obj.is_manually_graded:
                score_text += ' (معدلة)'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, 
                score_text
            )
        return 'غير محسوب'
    final_score_display.short_description = 'النتيجة النهائية'
    
    def is_manually_graded_display(self, obj):
        if obj.is_manually_graded:
            return format_html('<span style="color: #28a745;">✓ معدلة</span>')
        return format_html('<span style="color: #6c757d;">تلقائية</span>')
    is_manually_graded_display.short_description = 'نوع الدرجة'
    
    def is_grade_visible_display(self, obj):
        if obj.is_grade_visible:
            return format_html('<span style="color: #28a745;">✓ ظاهرة</span>')
        return format_html('<span style="color: #dc3545;">✗ مخفية</span>')
    is_grade_visible_display.short_description = 'ظاهرة للطالب'
    
    def graded_by_display(self, obj):
        if obj.graded_by:
            return f"{obj.graded_by.first_name} {obj.graded_by.last_name}".strip() or obj.graded_by.username
        return '-'
    graded_by_display.short_description = 'معدل بواسطة'
    
    def passed_status(self, obj):
        final_score = obj.get_final_score()
        if final_score is not None:
            passed = final_score >= (obj.quiz.pass_mark if obj.quiz else 60)
            if passed:
                return format_html('<span style="color: #28a745;">✅ ناجح</span>')
            else:
                return format_html('<span style="color: #dc3545;">❌ راسب</span>')
        return format_html('<span style="color: #6c757d;">⏳ قيد التقييم</span>')
    passed_status.short_description = 'حالة النجاح'
    
    def duration(self, obj):
        if obj.end_time and obj.start_time:
            duration = obj.end_time - obj.start_time
            minutes = int(duration.total_seconds() // 60)
            seconds = int(duration.total_seconds() % 60)
            return f'{minutes}:{seconds:02d}'
        return 'لم ينته'
    duration.short_description = 'المدة'
    
    def answers_count(self, obj):
        return obj.answers.count()
    answers_count.short_description = 'عدد الإجابات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user', 'quiz', 'graded_by').prefetch_related('answers')


@admin.register(Exam)
class ExamAdmin(ImportExportAdminMixin, admin.ModelAdmin):
    list_display = (
        'title', 'course', 'module', 'is_final', 'questions_count',
        'attempts_count', 'pass_rate', 'is_active', 'start_date'
    )
    list_filter = ('is_final', 'is_active', 'created_at', 'course', 'start_date')
    search_fields = ('title', 'description', 'course__name', 'module__name')
    inlines = [ExamQuestionInline]
    readonly_fields = ('created_at', 'updated_at', 'questions_count', 'attempts_count', 'pass_rate')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'course', 'module', 'description')
        }),
        ('إعدادات الامتحان', {
            'fields': (
                ('time_limit', 'pass_mark', 'total_points'),
                ('is_final', 'is_active'),
                ('allow_multiple_attempts', 'max_attempts'),
                ('show_answers_after', 'randomize_questions')
            )
        }),
        ('التوقيت', {
            'fields': ('start_date', 'end_date')
        }),
        ('الإحصائيات', {
            'fields': ('questions_count', 'attempts_count', 'pass_rate'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def questions_count(self, obj):
        count = obj.questions.count()
        if count > 0:
            url = reverse('admin:assignments_examquestion_changelist') + f'?exam__id__exact={obj.id}'
            return format_html('<a href="{}">{} سؤال</a>', url, count)
        return '0 سؤال'
    questions_count.short_description = 'عدد الأسئلة'
    
    def attempts_count(self, obj):
        count = obj.attempts.count()
        if count > 0:
            url = reverse('admin:assignments_userexamattempt_changelist') + f'?exam__id__exact={obj.id}'
            return format_html('<a href="{}">{} محاولة</a>', url, count)
        return '0 محاولة'
    attempts_count.short_description = 'المحاولات'
    
    def pass_rate(self, obj):
        total_attempts = obj.attempts.count()
        if total_attempts > 0:
            passed_attempts = obj.attempts.filter(passed=True).count()
            rate = (passed_attempts / total_attempts) * 100
            color = '#28a745' if rate >= 70 else '#ffc107' if rate >= 50 else '#dc3545'
            formatted_rate = f"{rate:.1f}%"
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, formatted_rate
            )
        return '0%'
    pass_rate.short_description = 'معدل النجاح'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('course', 'module').prefetch_related('questions', 'attempts')


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'exam', 'question_type', 'points', 'answers_count', 'order')
    list_filter = ('question_type', 'exam__course', 'exam__is_final')
    search_fields = ('text', 'exam__title', 'explanation')
    inlines = [ExamAnswerInline]
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'نص السؤال'
    
    def answers_count(self, obj):
        count = obj.answers.count()
        correct_count = obj.answers.filter(is_correct=True).count()
        return f'{count} ({correct_count} صحيحة)'
    answers_count.short_description = 'الإجابات'


@admin.register(UserExamAttempt)
class UserExamAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'exam', 'attempt_number', 'final_score_display',
        'passed_status', 'is_manually_graded_display', 'is_grade_visible_display',
        'graded_by_display', 'start_time', 'duration'
    )
    list_filter = (PassedFilter, 'start_time', 'exam__course', 'exam__is_final', 'is_manually_graded', 'is_grade_visible')
    search_fields = ('user__username', 'exam__title', 'user__first_name', 'user__last_name')
    readonly_fields = ('start_time', 'duration', 'score_display', 'final_score_display', 'answers_count', 'graded_by', 'graded_at')
    
    fieldsets = (
        ('معلومات المحاولة', {
            'fields': ('user', 'exam', 'attempt_number')
        }),
        ('النتائج التلقائية', {
            'fields': ('score', 'passed', 'score_display')
        }),
        ('التعديل اليدوي للدرجة', {
            'fields': ('is_manually_graded', 'manual_grade', 'is_grade_visible', 'graded_by', 'graded_at')
        }),
        ('النتيجة النهائية', {
            'fields': ('final_score_display',)
        }),
        ('التوقيت', {
            'fields': ('start_time', 'end_time', 'duration')
        }),
        ('الإحصائيات', {
            'fields': ('answers_count',),
            'classes': ('collapse',)
        }),
    )
    
    def score_display(self, obj):
        if obj.score is not None:
            color = '#28a745' if obj.passed else '#dc3545'
            score_text = f"{obj.score:.1f}%"
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, 
                score_text
            )
        return 'غير محسوب'
    score_display.short_description = 'النتيجة التلقائية'
    
    def final_score_display(self, obj):
        final_score = obj.get_final_score()
        if final_score is not None:
            passed = final_score >= (obj.exam.pass_mark if obj.exam else 60)
            color = '#28a745' if passed else '#dc3545'
            score_text = f"{final_score:.1f}%"
            if obj.is_manually_graded:
                score_text += ' (معدلة)'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color, 
                score_text
            )
        return 'غير محسوب'
    final_score_display.short_description = 'النتيجة النهائية'
    
    def is_manually_graded_display(self, obj):
        if obj.is_manually_graded:
            return format_html('<span style="color: #28a745;">✓ معدلة</span>')
        return format_html('<span style="color: #6c757d;">تلقائية</span>')
    is_manually_graded_display.short_description = 'نوع الدرجة'
    
    def is_grade_visible_display(self, obj):
        if obj.is_grade_visible:
            return format_html('<span style="color: #28a745;">✓ ظاهرة</span>')
        return format_html('<span style="color: #dc3545;">✗ مخفية</span>')
    is_grade_visible_display.short_description = 'ظاهرة للطالب'
    
    def graded_by_display(self, obj):
        if obj.graded_by:
            return f"{obj.graded_by.first_name} {obj.graded_by.last_name}".strip() or obj.graded_by.username
        return '-'
    graded_by_display.short_description = 'معدل بواسطة'
    
    def passed_status(self, obj):
        final_score = obj.get_final_score()
        if final_score is not None:
            passed = final_score >= (obj.exam.pass_mark if obj.exam else 60)
            if passed:
                return format_html('<span style="color: #28a745;">✅ ناجح</span>')
            else:
                return format_html('<span style="color: #dc3545;">❌ راسب</span>')
        return format_html('<span style="color: #6c757d;">⏳ قيد التقييم</span>')
    passed_status.short_description = 'حالة النجاح'
    
    def duration(self, obj):
        if obj.end_time and obj.start_time:
            duration = obj.end_time - obj.start_time
            minutes = int(duration.total_seconds() // 60)
            seconds = int(duration.total_seconds() % 60)
            return f'{minutes}:{seconds:02d}'
        return 'لم ينته'
    duration.short_description = 'المدة'
    
    def answers_count(self, obj):
        return obj.answers.count()
    answers_count.short_description = 'عدد الإجابات'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('user', 'exam', 'graded_by').prefetch_related('answers')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'course', 'module', 'due_date', 'points',
        'submissions_count', 'questions_count', 'overdue_status', 'is_active'
    )
    list_filter = ('is_active', 'due_date', 'course', 'allow_late_submissions', 'has_questions', 'has_file_upload')
    search_fields = ('title', 'description', 'course__name', 'module__name')
    readonly_fields = ('created_at', 'updated_at', 'submissions_count', 'questions_count', 'overdue_status')
    inlines = [AssignmentQuestionInline]
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'description', 'course', 'module')
        }),
        ('نوع الواجب', {
            'fields': (
                ('has_questions', 'has_file_upload'),
                'assignment_file'
            )
        }),
        ('إعدادات التسليم', {
            'fields': (
                'due_date', 'points',
                ('allow_late_submissions', 'late_submission_penalty')
            )
        }),
        ('الحالة', {
            'fields': ('is_active',)
        }),
        ('الإحصائيات', {
            'fields': ('submissions_count', 'questions_count', 'overdue_status'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def submissions_count(self, obj):
        count = obj.submissions.count()
        if count > 0:
            url = reverse('admin:assignments_assignmentsubmission_changelist') + f'?assignment__id__exact={obj.id}'
            return format_html('<a href="{}">{} تسليم</a>', url, count)
        return '0 تسليم'
    submissions_count.short_description = 'التسليمات'
    
    def questions_count(self, obj):
        count = obj.questions.count()
        if count > 0:
            url = reverse('admin:assignments_assignmentquestion_changelist') + f'?assignment__id__exact={obj.id}'
            return format_html('<a href="{}">{} سؤال</a>', url, count)
        return '0 سؤال'
    questions_count.short_description = 'عدد الأسئلة'
    
    def overdue_status(self, obj):
        if obj.is_overdue():
            return format_html('<span style="color: #dc3545;">⏰ منتهي الصلاحية</span>')
        else:
            return format_html('<span style="color: #28a745;">⏰ ساري</span>')
    overdue_status.short_description = 'حالة الموعد'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('course', 'module').prefetch_related('submissions')


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'assignment', 'user', 'status', 'grade_display',
        'submitted_at', 'is_late', 'graded_by', 'graded_at'
    )
    list_filter = ('status', 'is_late', 'submitted_at', 'assignment__course')
    search_fields = (
        'assignment__title', 'user__username', 'user__first_name', 
        'user__last_name', 'submission_text'
    )
    readonly_fields = ('submitted_at', 'is_late')
    
    fieldsets = (
        ('معلومات التسليم', {
            'fields': ('assignment', 'user', 'submission_text', 'submitted_file')
        }),
        ('التقييم', {
            'fields': ('status', 'grade', 'feedback', 'graded_by', 'graded_at')
        }),
        ('معلومات إضافية', {
            'fields': ('submitted_at', 'is_late'),
            'classes': ('collapse',)
        }),
    )
    
    def grade_display(self, obj):
        if obj.grade is not None:
            try:
                grade = float(obj.grade)
                total_points = float(obj.assignment.points)
                percentage = (grade / total_points) * 100
                
                if percentage >= 90:
                    color = '#28a745'
                elif percentage >= 70:
                    color = '#ffc107'
                else:
                    color = '#dc3545'
                
                return format_html(
                    '<span style="color: {}; font-weight: bold;">{}/{} ({}%)</span>',
                    color, 
                    str(round(grade, 1)), 
                    str(round(total_points, 1)), 
                    str(round(percentage, 1))
                )
            except (ValueError, TypeError, ZeroDivisionError):
                return format_html('<span style="color: #dc3545;">خطأ في البيانات</span>')
        return format_html('<span style="color: #6c757d;">غير مقيم</span>')
    grade_display.short_description = 'الدرجة'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('assignment', 'user', 'graded_by')


@admin.register(AssignmentQuestion)
class AssignmentQuestionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'assignment', 'question_type', 'points', 'answers_count', 'manage_answers', 'order', 'is_required')
    list_filter = ('question_type', 'is_required', 'assignment__course')
    search_fields = ('text', 'assignment__title', 'explanation')
    inlines = [AssignmentAnswerInline]
    
    def manage_answers(self, obj):
        """رابط مباشر لإدارة الإجابات"""
        url = reverse('admin:assignments_assignmentquestion_change', args=[obj.pk])
        return format_html(
            '<a href="{}" class="button" style="padding: 4px 8px; background-color: #417690; color: white; text-decoration: none; border-radius: 3px; font-size: 11px;">📝 إدارة الإجابات</a>',
            url
        )
    manage_answers.short_description = 'إدارة الإجابات'
    
    fieldsets = (
        ('السؤال', {
            'fields': ('assignment', 'text', 'question_type', 'points', 'order', 'is_required')
        }),
        ('التفاصيل', {
            'fields': ('explanation', 'image')
        }),
    )
    
    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'نص السؤال'
    
    def answers_count(self, obj):
        count = obj.answers.count()
        correct_count = obj.answers.filter(is_correct=True).count()
        return f'{count} ({correct_count} صحيحة)'
    answers_count.short_description = 'الإجابات'


@admin.register(AssignmentAnswer)
class AssignmentAnswerAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'question_preview', 'is_correct', 'order')
    list_filter = ('is_correct', 'question__question_type')
    search_fields = ('text', 'question__text', 'explanation')
    
    def text_preview(self, obj):
        return obj.text[:40] + '...' if len(obj.text) > 40 else obj.text
    text_preview.short_description = 'نص الإجابة'
    
    def question_preview(self, obj):
        return obj.question.text[:30] + '...' if len(obj.question.text) > 30 else obj.question.text
    question_preview.short_description = 'السؤال'


@admin.register(AssignmentQuestionResponse)
class AssignmentQuestionResponseAdmin(admin.ModelAdmin):
    list_display = ('submission_preview', 'question_preview', 'points_earned', 'has_file')
    list_filter = ('question__question_type', 'submission__assignment__course')
    search_fields = ('text_answer', 'question__text', 'submission__user__username')
    
    def submission_preview(self, obj):
        return f"{obj.submission.user.username} - {obj.submission.assignment.title}"
    submission_preview.short_description = 'التسليم'
    
    def question_preview(self, obj):
        return obj.question.text[:30] + '...' if len(obj.question.text) > 30 else obj.question.text
    question_preview.short_description = 'السؤال'
    
    def has_file(self, obj):
        return 'نعم' if obj.file_answer else 'لا'
    has_file.short_description = 'يحتوي على ملف'


# Register remaining models with basic admin
admin.site.register(QuizUserAnswer)
admin.site.register(ExamAnswer)
admin.site.register(UserExamAnswer)