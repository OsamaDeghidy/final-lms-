from datetime import datetime, timedelta
from django.db import models
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field
from django.utils import timezone
# from django.contrib.contenttypes.fields import GenericRelation
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

# Course and Module references are handled in individual field definitions

class Quiz(models.Model):
    QUIZ_TYPE_CHOICES = [
        ('video', 'فيديو كويز'),
        ('module', 'كويز وحدة'),
        ('quick', 'كويز سريع'),
    ]
    
    title = models.CharField(max_length=255, null=True, blank=True, verbose_name='العنوان')
    description = models.TextField(null=True, blank=True, verbose_name='الوصف')
    module = models.ForeignKey('content.Module', on_delete=models.CASCADE, null=True, blank=True, related_name='module_quizzes', verbose_name='الوحدة')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, null=True, blank=True, related_name='course_quizzes', verbose_name='الدورة')
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPE_CHOICES, default='video', verbose_name='نوع الكويز')
    start_time = models.DurationField(default=timedelta(seconds=0), null=True, blank=True, verbose_name='وقت البدء')
    time_limit = models.PositiveIntegerField(help_text='الحد الزمني بالدقائق', null=True, blank=True, verbose_name='الحد الزمني')
    pass_mark = models.FloatField(default=0, verbose_name='علامة النجاح')
    created_at = models.DateTimeField(auto_now_add=True, null=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, null=True, verbose_name='تاريخ التحديث')
    is_active = models.BooleanField(default=True, verbose_name='نشط')

    def __str__(self):
        if self.module:
            return f"Quiz for {self.module.name}"
        elif self.course:
            return f"Quiz for {self.course.title}"
        else:
            return f"Quiz: {self.title}"

    def get_total_questions(self):
        return self.questions.count()

    def get_total_points(self):
        return sum(question.points for question in self.questions.all())
    
    class Meta:
        verbose_name = 'كويز'
        verbose_name_plural = 'كويزات'


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'اختيار من متعدد'),
        ('true_false', 'صح أو خطأ'),
        ('short_answer', 'إجابة قصيرة'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions', verbose_name='الكويز')
    text = models.CharField(max_length=1000, verbose_name='نص السؤال')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice', verbose_name='نوع السؤال')
    points = models.PositiveIntegerField(default=1, verbose_name='النقاط')
    explanation = models.TextField(null=True, blank=True, help_text='شرح الإجابة الصحيحة', verbose_name='الشرح')
    image = models.ImageField(upload_to='question_images/', null=True, blank=True, verbose_name='الصورة')
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')

    class Meta:
        verbose_name = 'سؤال'
        verbose_name_plural = 'أسئلة'
        ordering = ['order']

    def __str__(self):
        return f"Question: {self.text[:50]}..."


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers', verbose_name='السؤال')
    text = models.CharField(max_length=1000, verbose_name='نص الإجابة')
    is_correct = models.BooleanField(default=False, verbose_name='صحيحة')
    explanation = models.TextField(null=True, blank=True, verbose_name='الشرح')
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')

    class Meta:
        verbose_name = 'إجابة'
        verbose_name_plural = 'إجابات'
        ordering = ['order']

    def __str__(self):
        return f"Answer: {self.text[:50]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts', verbose_name='المستخدم')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts', verbose_name='الكويز')
    start_time = models.DateTimeField(auto_now_add=True, verbose_name='وقت البدء')
    end_time = models.DateTimeField(null=True, blank=True, verbose_name='وقت الانتهاء')
    score = models.FloatField(null=True, blank=True, verbose_name='النتيجة')
    passed = models.BooleanField(null=True, blank=True, verbose_name='ناجح')
    attempt_number = models.PositiveIntegerField(default=1, verbose_name='رقم المحاولة')
    
    # Manual grading fields
    manual_grade = models.FloatField(null=True, blank=True, help_text='الدرجة المعدلة يدوياً من المدرس', verbose_name='الدرجة المعدلة يدوياً')
    is_manually_graded = models.BooleanField(default=False, help_text='هل تم تعديل الدرجة يدوياً؟', verbose_name='معدل يدوياً')
    is_grade_visible = models.BooleanField(default=False, help_text='هل الدرجة ظاهرة للطالب؟', verbose_name='الدرجة ظاهرة')
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_quiz_attempts', help_text='المدرس الذي عدل الدرجة', verbose_name='معدل بواسطة')
    graded_at = models.DateTimeField(null=True, blank=True, help_text='تاريخ تعديل الدرجة', verbose_name='تاريخ التعديل')

    class Meta:
        verbose_name = 'محاولة كويز'
        verbose_name_plural = 'محاولات الكويز'
        unique_together = ['user', 'quiz', 'attempt_number']

    def __str__(self):
        return f"{self.user.username} - {self.quiz} - Attempt {self.attempt_number}"

    def get_final_score(self):
        """إرجاع الدرجة النهائية (المعدلة يدوياً إن وجدت، وإلا الدرجة المحسوبة)"""
        return self.manual_grade if self.is_manually_graded and self.manual_grade is not None else self.score

    def calculate_score(self):
        """Calculate score based on correct answers"""
        total_points = 0
        earned_points = 0
        
        for answer in self.answers.all():
            total_points += answer.question.points
            earned_points += answer.points_earned
        
        if total_points > 0:
            self.score = (earned_points / total_points) * 100
        else:
            self.score = 0
        
        # لا نعدل passed إذا كانت الدرجة معدلة يدوياً
        if not self.is_manually_graded:
            self.passed = self.score >= self.quiz.pass_mark
        
        self.save(update_fields=['score', 'passed'])
        
        # Update module progress if quiz is associated with a module
        if hasattr(self.quiz, 'module') and self.quiz.module:
            from content.models import ModuleProgress
            try:
                module_progress = ModuleProgress.objects.get(
                    user=self.user,
                    module=self.quiz.module
                )
                final_score = self.get_final_score()
                module_progress.mark_quiz_completed(score=final_score)
            except ModuleProgress.DoesNotExist:
                pass


class QuizUserAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers', verbose_name='المحاولة')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, verbose_name='السؤال')
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True, verbose_name='الإجابة المختارة')
    text_answer = models.TextField(null=True, blank=True, verbose_name='الإجابة النصية')  # للأسئلة ذات الإجابات القصيرة
    is_correct = models.BooleanField(null=True, blank=True, verbose_name='صحيحة')
    points_earned = models.FloatField(default=0, verbose_name='النقاط المكتسبة')

    class Meta:
        verbose_name = 'إجابة كويز'
        verbose_name_plural = 'إجابات الكويز'

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.text[:30]}..."


class Exam(models.Model):
    title = models.CharField(max_length=255, verbose_name='العنوان')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='exams', verbose_name='الدورة')
    module = models.ForeignKey('content.Module', on_delete=models.CASCADE, null=True, blank=True, related_name='module_exams', verbose_name='الوحدة')
    description = CKEditor5Field(null=True, blank=True, verbose_name='الوصف')
    time_limit = models.PositiveIntegerField(help_text='وقت الامتحان بالدقائق', null=True, blank=True, verbose_name='الحد الزمني')
    pass_mark = models.FloatField(default=60.0, help_text='النسبة المئوية للنجاح', verbose_name='علامة النجاح')
    is_final = models.BooleanField(default=False, help_text='هل هذا امتحان نهائي للدورة؟', verbose_name='امتحان نهائي')
    total_points = models.PositiveIntegerField(default=100, verbose_name='إجمالي النقاط')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    start_date = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ البدء')
    end_date = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ الانتهاء')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    allow_multiple_attempts = models.BooleanField(default=False, verbose_name='السماح بمحاولات متعددة')
    max_attempts = models.PositiveIntegerField(default=1, verbose_name='الحد الأقصى للمحاولات')
    show_answers_after = models.BooleanField(default=False, help_text='إظهار الإجابات الصحيحة بعد الانتهاء', verbose_name='إظهار الإجابات بعد الانتهاء')
    randomize_questions = models.BooleanField(default=False, verbose_name='ترتيب الأسئلة عشوائياً')

    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    class Meta:
        verbose_name = 'امتحان'
        verbose_name_plural = 'امتحانات'


class ExamQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'اختيار من متعدد'),
        ('true_false', 'صح أو خطأ'),
        ('short_answer', 'إجابة قصيرة'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions', verbose_name='الامتحان')
    text = models.TextField(verbose_name='نص السؤال')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice', verbose_name='نوع السؤال')
    points = models.PositiveIntegerField(default=1, verbose_name='النقاط')
    explanation = models.TextField(null=True, blank=True, help_text='شرح الإجابة الصحيحة', verbose_name='الشرح')
    image = models.ImageField(upload_to='exam_question_images/', null=True, blank=True, verbose_name='الصورة')
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')

    class Meta:
        verbose_name = 'سؤال امتحان'
        verbose_name_plural = 'أسئلة الامتحان'
        ordering = ['order']

    def __str__(self):
        return f"{self.exam.title} - Question: {self.text[:50]}..."


class ExamAnswer(models.Model):
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='answers', verbose_name='السؤال')
    text = models.CharField(max_length=1000, verbose_name='نص الإجابة')
    is_correct = models.BooleanField(default=False, verbose_name='صحيحة')
    explanation = models.TextField(null=True, blank=True, verbose_name='الشرح')
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')

    class Meta:
        verbose_name = 'إجابة امتحان'
        verbose_name_plural = 'إجابات الامتحان'
        ordering = ['order']

    def __str__(self):
        return f"Answer: {self.text[:50]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class UserExamAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts', verbose_name='المستخدم')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts', verbose_name='الامتحان')
    start_time = models.DateTimeField(auto_now_add=True, verbose_name='وقت البدء')
    end_time = models.DateTimeField(null=True, blank=True, verbose_name='وقت الانتهاء')
    score = models.FloatField(null=True, blank=True, verbose_name='النتيجة')
    passed = models.BooleanField(null=True, blank=True, verbose_name='ناجح')
    attempt_number = models.PositiveIntegerField(default=1, verbose_name='رقم المحاولة')
    
    # Manual grading fields
    manual_grade = models.FloatField(null=True, blank=True, help_text='الدرجة المعدلة يدوياً من المدرس', verbose_name='الدرجة المعدلة يدوياً')
    is_manually_graded = models.BooleanField(default=False, help_text='هل تم تعديل الدرجة يدوياً؟', verbose_name='معدل يدوياً')
    is_grade_visible = models.BooleanField(default=False, help_text='هل الدرجة ظاهرة للطالب؟', verbose_name='الدرجة ظاهرة')
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_exam_attempts', help_text='المدرس الذي عدل الدرجة', verbose_name='معدل بواسطة')
    graded_at = models.DateTimeField(null=True, blank=True, help_text='تاريخ تعديل الدرجة', verbose_name='تاريخ التعديل')

    class Meta:
        verbose_name = 'محاولة امتحان'
        verbose_name_plural = 'محاولات الامتحان'
        unique_together = ['user', 'exam', 'attempt_number']

    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - Attempt {self.attempt_number}"

    def get_final_score(self):
        """إرجاع الدرجة النهائية (المعدلة يدوياً إن وجدت، وإلا الدرجة المحسوبة)"""
        return self.manual_grade if self.is_manually_graded and self.manual_grade is not None else self.score

    def calculate_score(self):
        # حساب النتيجة بناءً على الإجابات
        total_points = 0
        earned_points = 0
        
        for answer in self.answers.all():
            total_points += answer.question.points
            earned_points += answer.points_earned
        
        if total_points > 0:
            self.score = (earned_points / total_points) * 100
        else:
            self.score = 0
        
        # لا نعدل passed إذا كانت الدرجة معدلة يدوياً
        if not self.is_manually_graded:
            self.passed = self.score >= self.exam.pass_mark
        
        self.save(update_fields=['score', 'passed'])
        
        # Update module progress if exam is associated with a module
        if hasattr(self.exam, 'module') and self.exam.module:
            from content.models import ModuleProgress
            try:
                module_progress = ModuleProgress.objects.get(
                    user=self.user,
                    module=self.exam.module
                )
                final_score = self.get_final_score()
                module_progress.mark_quiz_completed(score=final_score)
            except ModuleProgress.DoesNotExist:
                pass


class UserExamAnswer(models.Model):
    attempt = models.ForeignKey(UserExamAttempt, on_delete=models.CASCADE, related_name='answers', verbose_name='المحاولة')
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, verbose_name='السؤال')
    selected_answer = models.ForeignKey(ExamAnswer, on_delete=models.CASCADE, null=True, blank=True, verbose_name='الإجابة المختارة')
    text_answer = models.TextField(null=True, blank=True, verbose_name='الإجابة النصية')  # للأسئلة ذات الإجابات القصيرة
    is_correct = models.BooleanField(null=True, blank=True, verbose_name='صحيحة')
    points_earned = models.FloatField(default=0, verbose_name='النقاط المكتسبة')

    class Meta:
        verbose_name = 'إجابة امتحان'
        verbose_name_plural = 'إجابات الامتحان'

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.text[:30]}..."


class Assignment(models.Model):
    title = models.CharField(max_length=200, verbose_name='العنوان')
    description = models.TextField(verbose_name='الوصف')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments', verbose_name='الدورة')
    module = models.ForeignKey('content.Module', on_delete=models.CASCADE, related_name='assignments', null=True, blank=True, verbose_name='الوحدة')
    
    # Assignment settings
    due_date = models.DateTimeField(verbose_name='تاريخ الاستحقاق')
    points = models.DecimalField(max_digits=5, decimal_places=2, default=100, verbose_name='النقاط')
    allow_late_submissions = models.BooleanField(default=False, verbose_name='السماح بالتسليم المتأخر')
    late_submission_penalty = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='عقوبة التسليم المتأخر')
    
    # Assignment type and content
    has_questions = models.BooleanField(default=False, help_text='هل يحتوي الواجب على أسئلة؟', verbose_name='يحتوي على أسئلة')
    has_file_upload = models.BooleanField(default=False, help_text='هل يسمح برفع ملفات؟', verbose_name='يسمح برفع ملفات')
    assignment_file = models.FileField(upload_to='assignment_files/', null=True, blank=True, help_text='ملف الواجب المرفق', verbose_name='ملف الواجب')
    
    # Status and metadata
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"
    
    def is_overdue(self):
        if self.due_date is None:
            return False
        return timezone.now() > self.due_date
    
    def get_submissions_count(self):
        return self.submissions.count()
    
    def get_questions_count(self):
        return self.questions.count()
    
    def get_total_points(self):
        """إجمالي الدرجات المخصصة للواجب"""
        if self.has_questions:
            return sum(question.points for question in self.questions.all())
        return self.points
    
    def can_submit_file(self):
        """هل يمكن رفع ملف لهذا الواجب؟"""
        return self.has_file_upload or any(q.question_type == 'file_upload' for q in self.questions.all())
    
    class Meta:
        verbose_name = 'واجب'
        verbose_name_plural = 'واجبات'
        ordering = ['-created_at']


class AssignmentQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'اختيار من متعدد'),
        ('true_false', 'صح أو خطأ'),
        ('short_answer', 'إجابة قصيرة'),
        ('essay', 'مقال'),
        ('file_upload', 'رفع ملف'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='questions', verbose_name='الواجب')
    text = models.TextField(help_text='نص السؤال', verbose_name='نص السؤال')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='essay', verbose_name='نوع السؤال')
    points = models.PositiveIntegerField(default=1, help_text='الدرجة المخصصة لهذا السؤال', verbose_name='النقاط')
    explanation = models.TextField(null=True, blank=True, help_text='شرح السؤال أو الإجابة النموذجية', verbose_name='الشرح')
    image = models.ImageField(upload_to='assignment_question_images/', null=True, blank=True, help_text='صورة توضيحية للسؤال', verbose_name='الصورة')
    order = models.PositiveIntegerField(default=0, help_text='ترتيب السؤال', verbose_name='الترتيب')
    is_required = models.BooleanField(default=True, help_text='هل السؤال إجباري؟', verbose_name='إجباري')
    
    class Meta:
        verbose_name = 'سؤال واجب'
        verbose_name_plural = 'أسئلة الواجبات'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.assignment.title} - Question {self.order}: {self.text[:50]}..."


class AssignmentAnswer(models.Model):
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE, related_name='answers', verbose_name='السؤال')
    text = models.CharField(max_length=1000, help_text='نص الإجابة', verbose_name='نص الإجابة')
    is_correct = models.BooleanField(default=False, help_text='هل هذه الإجابة صحيحة؟', verbose_name='صحيحة')
    explanation = models.TextField(null=True, blank=True, help_text='شرح الإجابة', verbose_name='الشرح')
    order = models.PositiveIntegerField(default=0, help_text='ترتيب الإجابة', verbose_name='الترتيب')
    
    class Meta:
        verbose_name = 'إجابة واجب'
        verbose_name_plural = 'إجابات الواجبات'
        ordering = ['order']
    
    def __str__(self):
        return f"Answer: {self.text[:50]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'مُرسل'),
        ('graded', 'مُقيم'),
        ('returned', 'مُعاد للمراجعة'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions', verbose_name='الواجب')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions', verbose_name='المستخدم')
    submission_text = models.TextField(blank=True, help_text='النص المكتوب للإجابة', verbose_name='نص التسليم')
    
    # File submission
    submitted_file = models.FileField(upload_to='assignment_submissions/', null=True, blank=True, help_text='الملف المرفوع', verbose_name='الملف المرفوع')
    
    # Grading
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted', verbose_name='الحالة')
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='الدرجة')
    feedback = models.TextField(blank=True, verbose_name='التعليقات')
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_assignments', verbose_name='معدل بواسطة')
    graded_at = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ التقييم')
    
    # Submission tracking
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ التسليم')
    is_late = models.BooleanField(default=False, verbose_name='متأخر')
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.is_late = timezone.now() > self.assignment.due_date
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.assignment.title} - {self.user.username}"
    
    class Meta:
        verbose_name = 'تسليم واجب'
        verbose_name_plural = 'تسليمات الواجبات'
        unique_together = ['assignment', 'user']
        ordering = ['-submitted_at']


class AssignmentQuestionResponse(models.Model):
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, related_name='question_responses', verbose_name='التسليم')
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE, verbose_name='السؤال')
    text_answer = models.TextField(null=True, blank=True, help_text='الإجابة النصية', verbose_name='الإجابة النصية')
    selected_answer = models.ForeignKey(AssignmentAnswer, on_delete=models.CASCADE, null=True, blank=True, help_text='الإجابة المختارة', verbose_name='الإجابة المختارة')
    file_answer = models.FileField(upload_to='assignment_question_files/', null=True, blank=True, help_text='الملف المرفوع كإجابة', verbose_name='الملف المرفوع')
    points_earned = models.FloatField(default=0, help_text='الدرجة المكتسبة', verbose_name='الدرجة المكتسبة')
    feedback = models.TextField(blank=True, help_text='ملاحظات المدرس على الإجابة', verbose_name='التعليقات')
    
    class Meta:
        verbose_name = 'إجابة سؤال واجب'
        verbose_name_plural = 'إجابات أسئلة الواجبات'
    
    def __str__(self):
        return f"{self.submission.user.username} - {self.question.text[:30]}..."


# Signals to update module progress when quiz is completed
@receiver(post_save, sender=QuizAttempt)
def update_progress_on_quiz_completion(sender, instance, created, **kwargs):
    """Update module progress when quiz is completed"""
    if instance.end_time and instance.quiz.module:
        try:
            from content.models import ModuleProgress
            progress = ModuleProgress.objects.get(
                user=instance.user,
                module=instance.quiz.module
            )
            if instance.passed:
                progress.mark_quiz_completed()
        except ModuleProgress.DoesNotExist:
            pass


@receiver(post_save, sender=AssignmentSubmission)
def update_progress_on_assignment_submission(sender, instance, created, **kwargs):
    """Update module progress when assignment is submitted"""
    if created and instance.assignment.module:
        try:
            from courses.models import ContentProgress
            ContentProgress.objects.get_or_create(
                user=instance.user,
                course=instance.assignment.course,
                content_type='assignment',
                content_id=str(instance.assignment.id),
                defaults={'completed': True}
            )
        except Exception as e:
            print(f"Error updating assignment progress: {e}") 