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
    
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    module = models.ForeignKey('content.Module', on_delete=models.CASCADE, null=True, blank=True, related_name='module_quizzes')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, null=True, blank=True, related_name='course_quizzes')
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPE_CHOICES, default='video')
    start_time = models.DurationField(default=timedelta(seconds=0), null=True, blank=True)
    time_limit = models.PositiveIntegerField(help_text='Time limit in minutes', null=True, blank=True)
    pass_mark = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    is_active = models.BooleanField(default=True)

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


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'اختيار من متعدد'),
        ('true_false', 'صح أو خطأ'),
        ('short_answer', 'إجابة قصيرة'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=1000)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    points = models.PositiveIntegerField(default=1)
    explanation = models.TextField(null=True, blank=True, help_text='شرح الإجابة الصحيحة')
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question: {self.text[:50]}..."


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=1000)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Answer: {self.text[:50]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(null=True, blank=True)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ['user', 'quiz', 'attempt_number']

    def __str__(self):
        return f"{self.user.username} - {self.quiz} - Attempt {self.attempt_number}"

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
                module_progress.mark_quiz_completed(score=self.score)
            except ModuleProgress.DoesNotExist:
                pass


class QuizUserAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=True, blank=True)
    text_answer = models.TextField(null=True, blank=True)  # للأسئلة ذات الإجابات القصيرة
    is_correct = models.BooleanField(null=True, blank=True)
    points_earned = models.FloatField(default=0)

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.text[:30]}..."


class Exam(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='exams')
    module = models.ForeignKey('content.Module', on_delete=models.CASCADE, null=True, blank=True, related_name='module_exams')
    description = CKEditor5Field(null=True, blank=True)
    time_limit = models.PositiveIntegerField(help_text='وقت الامتحان بالدقائق', null=True, blank=True)
    pass_mark = models.FloatField(default=60.0, help_text='النسبة المئوية للنجاح')
    is_final = models.BooleanField(default=False, help_text='هل هذا امتحان نهائي للدورة؟')
    total_points = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    allow_multiple_attempts = models.BooleanField(default=False)
    max_attempts = models.PositiveIntegerField(default=1)
    show_answers_after = models.BooleanField(default=False, help_text='إظهار الإجابات الصحيحة بعد الانتهاء')
    randomize_questions = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class ExamQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'اختيار من متعدد'),
        ('true_false', 'صح أو خطأ'),
        ('short_answer', 'إجابة قصيرة'),
    ]
    
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    points = models.PositiveIntegerField(default=1)
    explanation = models.TextField(null=True, blank=True, help_text='شرح الإجابة الصحيحة')
    image = models.ImageField(upload_to='exam_question_images/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exam.title} - Question: {self.text[:50]}..."


class ExamAnswer(models.Model):
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=1000)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Answer: {self.text[:50]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class UserExamAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(null=True, blank=True)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ['user', 'exam', 'attempt_number']

    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - Attempt {self.attempt_number}"

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
                module_progress.mark_quiz_completed(score=self.score)
            except ModuleProgress.DoesNotExist:
                pass


class UserExamAnswer(models.Model):
    attempt = models.ForeignKey(UserExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(ExamAnswer, on_delete=models.CASCADE, null=True, blank=True)
    text_answer = models.TextField(null=True, blank=True)  # للأسئلة ذات الإجابات القصيرة
    is_correct = models.BooleanField(null=True, blank=True)
    points_earned = models.FloatField(default=0)

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.text[:30]}..."


class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assignments')
    module = models.ForeignKey('content.Module', on_delete=models.CASCADE, related_name='assignments', null=True, blank=True)
    
    # Assignment settings
    due_date = models.DateTimeField()
    points = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    allow_late_submissions = models.BooleanField(default=False)
    late_submission_penalty = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Assignment type and content
    has_questions = models.BooleanField(default=False, help_text='هل يحتوي الواجب على أسئلة؟')
    has_file_upload = models.BooleanField(default=False, help_text='هل يسمح برفع ملفات؟')
    assignment_file = models.FileField(upload_to='assignment_files/', null=True, blank=True, help_text='ملف الواجب المرفق')
    
    # Status and metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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
        ordering = ['-created_at']


class AssignmentQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'اختيار من متعدد'),
        ('true_false', 'صح أو خطأ'),
        ('short_answer', 'إجابة قصيرة'),
        ('essay', 'مقال'),
        ('file_upload', 'رفع ملف'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(help_text='نص السؤال')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='essay')
    points = models.PositiveIntegerField(default=1, help_text='الدرجة المخصصة لهذا السؤال')
    explanation = models.TextField(null=True, blank=True, help_text='شرح السؤال أو الإجابة النموذجية')
    image = models.ImageField(upload_to='assignment_question_images/', null=True, blank=True, help_text='صورة توضيحية للسؤال')
    order = models.PositiveIntegerField(default=0, help_text='ترتيب السؤال')
    is_required = models.BooleanField(default=True, help_text='هل السؤال إجباري؟')
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.assignment.title} - Question {self.order}: {self.text[:50]}..."


class AssignmentAnswer(models.Model):
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=1000, help_text='نص الإجابة')
    is_correct = models.BooleanField(default=False, help_text='هل هذه الإجابة صحيحة؟')
    explanation = models.TextField(null=True, blank=True, help_text='شرح الإجابة')
    order = models.PositiveIntegerField(default=0, help_text='ترتيب الإجابة')
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Answer: {self.text[:50]}... ({'Correct' if self.is_correct else 'Incorrect'})"


class AssignmentSubmission(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'مُرسل'),
        ('graded', 'مُقيم'),
        ('returned', 'مُعاد للمراجعة'),
    ]
    
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    submission_text = models.TextField(blank=True, help_text='النص المكتوب للإجابة')
    
    # File submission
    submitted_file = models.FileField(upload_to='assignment_submissions/', null=True, blank=True, help_text='الملف المرفوع')
    
    # Grading
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_assignments')
    graded_at = models.DateTimeField(null=True, blank=True)
    
    # Submission tracking
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.pk:  # Only on creation
            self.is_late = timezone.now() > self.assignment.due_date
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.assignment.title} - {self.user.username}"
    
    class Meta:
        unique_together = ['assignment', 'user']
        ordering = ['-submitted_at']


class AssignmentQuestionResponse(models.Model):
    submission = models.ForeignKey(AssignmentSubmission, on_delete=models.CASCADE, related_name='question_responses')
    question = models.ForeignKey(AssignmentQuestion, on_delete=models.CASCADE)
    text_answer = models.TextField(null=True, blank=True, help_text='الإجابة النصية')
    selected_answer = models.ForeignKey(AssignmentAnswer, on_delete=models.CASCADE, null=True, blank=True, help_text='الإجابة المختارة')
    file_answer = models.FileField(upload_to='assignment_question_files/', null=True, blank=True, help_text='الملف المرفوع كإجابة')
    points_earned = models.FloatField(default=0, help_text='الدرجة المكتسبة')
    feedback = models.TextField(blank=True, help_text='ملاحظات المدرس على الإجابة')
    
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