from rest_framework import serializers
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from courses.models import Course, Enrollment
from content.models import Module, UserProgress, ModuleProgress, Lesson, LessonResource
from users.models import User


class ModuleProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for tracking module progress
    """
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    total_lessons = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ModuleProgress
        fields = [
            'id', 'user', 'module', 'module_title', 'course_title',
            'is_completed', 'completed_at', 'last_accessed', 'created_at',
            'total_lessons', 'completed_lessons', 'progress_percentage'
        ]
        read_only_fields = [
            'id', 'user', 'module_title', 'course_title', 'completed_at',
            'last_accessed', 'created_at', 'total_lessons', 'completed_lessons',
            'progress_percentage'
        ]
    
    def get_total_lessons(self, obj):
        """Get total number of lessons in the module"""
        return obj.module.lessons.count()
    
    def get_completed_lessons(self, obj):
        """Get number of completed lessons in the module"""
        return obj.module.lessons.filter(
            userprogress__user=obj.user,
            userprogress__is_completed=True
        ).count()
    
    def get_progress_percentage(self, obj):
        """Calculate progress percentage"""
        total = self.get_total_lessons(obj)
        if total == 0:
            return 0
        completed = self.get_completed_lessons(obj)
        return int((completed / total) * 100)


class ModuleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new module"""
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'course', 'number', 'description', 'video', 
            'video_duration', 'pdf', 'note', 'is_active', 'order'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        # Ensure order is unique for the course
        if 'order' in data and 'course' in data:
            if Module.objects.filter(course=data['course'], order=data['order']).exists():
                raise serializers.ValidationError({
                    'order': 'A module with this order already exists for this course.'
                })
        return data


class ModuleBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for Module model"""
    course_name = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Module
        fields = [
            'id', 'name', 'description', 'course', 'course_name',
            'order', 'is_active', 'created_at', 'video_duration'
        ]
        read_only_fields = ['id', 'created_at', 'course_name']


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Module model with user progress"""
    course_name = serializers.CharField(source='course.title', read_only=True)
    user_progress = serializers.SerializerMethodField()
    lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description', 'course', 'course_name', 'order',
            'is_active', 'created_at', 'updated_at', 'user_progress', 'lessons',
            'duration_minutes'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = ModuleProgress.objects.get(
                    user=request.user,
                    module=obj
                )
                return {
                    'is_completed': progress.is_completed,
                    'completed_at': progress.completed_at,
                    'progress_percentage': progress.progress_percentage,
                    'video_watched': progress.video_watched,
                    'pdf_viewed': progress.pdf_viewed,
                    'notes_read': progress.notes_read,
                    'quiz_completed': progress.quiz_completed
                }
            except ModuleProgress.DoesNotExist:
                pass
        return None
    
    def get_lessons(self, obj):
        from .serializers import LessonSerializer
        lessons = obj.lessons.all().order_by('order')
        return LessonSerializer(lessons, many=True, context=self.context).data


class LessonBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for Lesson model"""
    module_title = serializers.CharField(source='module.title', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'module', 'module_title',
            'order', 'is_active', 'created_at', 'duration_minutes'
        ]
        read_only_fields = ['id', 'created_at']


class LessonDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Lesson model with content and progress"""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_id = serializers.IntegerField(source='module.course_id', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'module', 'module_title', 'order',
            'is_active', 'created_at', 'updated_at', 'duration_minutes',
            'video_url', 'video_duration', 'content', 'resources', 'course_id',
            'course_title', 'user_progress'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = ModuleProgress.objects.get(
                    user=request.user,
                    module=obj.module
                )
                return {
                    'is_completed': progress.is_completed,
                    'video_watched': progress.video_watched,
                    'pdf_viewed': progress.pdf_viewed,
                    'notes_read': progress.notes_read,
                    'quiz_completed': progress.quiz_completed
                }
            except ModuleProgress.DoesNotExist:
                pass
        return None


class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for user progress tracking"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'course', 'course_title', 'module', 'module_title',
            'video_watched', 'pdf_viewed', 'notes_read', 'quiz_completed',
            'is_completed', 'completed_at', 'created_at', 'updated_at',
            'progress_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress_percentage']


class ProgressUpdateSerializer(serializers.Serializer):
    """Serializer for updating user progress"""
    content_type = serializers.ChoiceField(
        choices=['video', 'pdf', 'notes', 'quiz'],
        required=True
    )
    completed = serializers.BooleanField(default=True)
    
    def validate_content_type(self, value):
        valid_types = ['video', 'pdf', 'notes', 'quiz']
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Content type must be one of {', '.join(valid_types)}"
            )
        return value
    
    def save(self, user, module):
        content_type = self.validated_data['content_type']
        completed = self.validated_data['completed']
        
        # Get or create user progress for this module
        progress, created = ModuleProgress.objects.get_or_create(
            user=user,
            module=module,
            defaults={
                'video_watched': False,
                'pdf_viewed': False,
                'notes_read': False,
                'quiz_completed': False
            }
        )
        
        # Update the appropriate field
        if content_type == 'video':
            progress.video_watched = completed
        elif content_type == 'pdf':
            progress.pdf_viewed = completed
        elif content_type == 'notes':
            progress.notes_read = completed
        elif content_type == 'quiz':
            progress.quiz_completed = completed
        
        # Update completion status
        progress.update_completion_status()
        progress.save()
        
        # Update course enrollment progress
        self.update_course_progress(user, module.course)
        
        return progress
    
    def update_course_progress(self, user, course):
        """Update the overall course progress"""
        from .models import ModuleProgress
        
        # Get all modules for the course
        modules = course.modules.all()
        total_modules = modules.count()
        
        if total_modules == 0:
            return 0
        
        # Get user's progress for all modules in this course
        completed_modules = ModuleProgress.objects.filter(
            user=user,
            module__in=modules,
            is_completed=True
        ).count()
        
        # Calculate progress percentage
        progress_percentage = int((completed_modules / total_modules) * 100)
        
        # Update course enrollment progress
        enrollment = course.enrollments.filter(student=user).first()
        if enrollment:
            enrollment.progress = progress_percentage
            if progress_percentage >= 100:
                enrollment.status = 'completed'
                enrollment.completion_date = timezone.now()
            enrollment.save()
        
        return progress_percentage


class ModuleSearchSerializer(serializers.ModelSerializer):
    """Serializer for module search results"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description', 'course', 'course_title',
            'created_at', 'updated_at', 'content_type'
        ]
        read_only_fields = ['content_type']
    
    def get_content_type(self, obj):
        return 'module'


class LessonSearchSerializer(serializers.ModelSerializer):
    """Serializer for lesson search results"""
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'content', 'module', 'module_title',
            'course_title', 'created_at', 'updated_at', 'content_type'
        ]
        read_only_fields = ['content_type']
    
    def get_content_type(self, obj):
        return 'lesson'


class ResourceSearchSerializer(serializers.ModelSerializer):
    """Serializer for resource search results"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    module_title = serializers.CharField(source='lesson.module.title', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)
    content_type = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonResource
        fields = [
            'id', 'title', 'description', 'file', 'url', 'lesson', 'lesson_title',
            'module_title', 'course_title', 'created_at', 'updated_at', 'content_type'
        ]
        read_only_fields = ['content_type']
    
    def get_content_type(self, obj):
        return 'resource'
