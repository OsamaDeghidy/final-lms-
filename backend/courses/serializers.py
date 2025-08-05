from rest_framework import serializers
from .models import Course, Category, Tags, Enrollment
from users.models import Instructor
from django.db.models import Count


class CategorySerializer(serializers.ModelSerializer):
    courses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'courses_count']
        read_only_fields = ['id']
    
    def get_courses_count(self, obj):
        return obj.courses.filter(status='published').count()


class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']


class CourseBasicSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructors = serializers.SerializerMethodField()
    tags = TagsSerializer(many=True, read_only=True)
    enrolled_count = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'small_description', 'image', 'price',
            'category', 'category_name', 'instructors', 'tags',
            'level', 'status', 'is_complete_course', 'created_at', 'rating', 'enrolled_count'
        ]
        read_only_fields = ['id', 'created_at', 'rating']
    
    def get_instructors(self, obj):
        instructors = []
        for instructor in obj.instructors.all():
            if hasattr(instructor, 'profile') and instructor.profile:
                instructors.append({
                    'id': instructor.id,
                    'name': instructor.profile.name
                })
        return instructors
    
    def get_enrolled_count(self, obj):
        return obj.enroller_user.count()
    
    def get_rating(self, obj):
        from django.db.models import Avg
        reviews = obj.reviews.all()
        if reviews.exists():
            return reviews.aggregate(avg_rating=Avg('rating'))['avg_rating']
        return 0.0


class CourseInstructorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    bio = serializers.CharField(allow_null=True)
    profile_pic = serializers.URLField(allow_null=True)

class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    instructors = serializers.SerializerMethodField()
    tags = TagsSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'small_description', 'image', 'video_url',
            'price', 'category', 'instructors', 'tags', 'level', 'status', 'is_complete_course', 'created_at',
            'updated_at', 'is_enrolled'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_instructors(self, obj):
        instructors = []
        for instructor in obj.instructors.all():
            if hasattr(instructor, 'profile') and instructor.profile:
                instructors.append({
                    'id': instructor.id,
                    'name': instructor.profile.name,
                    'bio': instructor.profile.bio,
                    'profile_pic': instructor.profile.profile_pic.url if instructor.profile.profile_pic else None
                })
        return instructors
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.enroller_user.filter(id=request.user.id).exists()
        return False


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'short_description', 'subtitle', 'category', 
            'tags', 'level', 'status', 'language', 'price', 'is_free', 'is_complete_course',
            'requirements', 'what_you_will_learn', 'target_audience'
        ]
        extra_kwargs = {
            'status': {'default': 'draft'},
            'is_free': {'default': True},
            'is_complete_course': {'default': True},
        }
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        
        # Set instructor from request user
        user = self.context['request'].user
        try:
            instructor = Instructor.objects.get(profile__user=user)
        except Instructor.DoesNotExist:
            raise serializers.ValidationError("User is not an instructor")
        
        # Create the course
        course = Course.objects.create(**validated_data)
        
        # Add the instructor to the course
        course.instructors.add(instructor)
        
        # Add tags if any
        if tags_data:
            course.tags.set(tags_data)
            
        return course


class CourseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'name', 'description', 'small_description', 'image', 'video_url',
            'price', 'category', 'tags', 'level', 'status', 'is_complete_course'
        ]
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tags_data is not None:
            instance.tags.set(tags_data)
        
        return instance


class CourseEnrollmentSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    
    def validate_course_id(self, value):
        try:
            course = Course.objects.get(id=value, status='published')
            return course
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found or not published")
    
    def save(self, user):
        course = self.validated_data['course_id']
        
        # Check if already enrolled
        if course.enroller_user.filter(id=user.id).exists():
            raise serializers.ValidationError("You are already enrolled in this course")
        
        # Create enrollment
        enrollment, created = Enrollment.objects.get_or_create(
            course=course,
            student=user,
            defaults={'status': 'active'}
        )
        
        return enrollment


class DashboardStatsSerializer(serializers.Serializer):
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    recent_enrollments = serializers.ListField()
    popular_courses = serializers.ListField()


class SearchSerializer(serializers.Serializer):
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.IntegerField(required=False)
    level = serializers.ChoiceField(choices=Course.LEVEL_CHOICES, required=False)
    min_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    tags = serializers.ListField(child=serializers.IntegerField(), required=False)
    instructor = serializers.IntegerField(required=False)
    sort_by = serializers.ChoiceField(
        choices=['name', '-name', 'created_at', '-created_at', 'price', '-price', 'rating', '-rating'],
        required=False,
        default='-created_at'
    ) 
