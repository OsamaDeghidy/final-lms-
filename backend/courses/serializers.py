from rest_framework import serializers
from .models import Course, Category, Tag, Enrollment
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
        model = Tag
        fields = ['id', 'name']
        read_only_fields = ['id']


class CourseBasicSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructors = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description', 'short_description', 'image', 'price',
            'discount_price', 'category', 'category_name', 'instructors', 'tags',
            'level', 'status', 'is_complete_course', 'created_at', 'rating', 'enrolled_count',
            'is_free', 'is_featured', 'is_certified', 'total_enrollments', 'average_rating'
        ]
        read_only_fields = ['id', 'created_at', 'rating', 'total_enrollments', 'average_rating']
    
    def get_instructors(self, obj):
        instructors = []
        try:
            for instructor in obj.instructors.all():
                try:
                    if hasattr(instructor, 'profile') and instructor.profile:
                        instructors.append({
                            'id': instructor.id,
                            'name': instructor.profile.name or '',
                            'bio': instructor.profile.shortBio or '',  # Changed from bio to shortBio
                            'profile_pic': instructor.profile.image_profile.url if instructor.profile.image_profile else None  # Changed from profile_pic to image_profile
                        })
                    else:
                        # If instructor doesn't have a profile, still include basic info
                        instructors.append({
                            'id': instructor.id,
                            'name': str(instructor),
                            'bio': '',
                            'profile_pic': None
                        })
                except Exception as e:
                    # Log the error but continue with other instructors
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error processing instructor {instructor.id}: {str(e)}")
                    continue
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in get_instructors: {str(e)}")
        return instructors
    
    def get_tags(self, obj):
        try:
            return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in get_tags: {str(e)}")
            return []
    
    def get_enrolled_count(self, obj):
        return obj.total_enrollments
    
    def get_rating(self, obj):
        return obj.average_rating


class CourseInstructorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    bio = serializers.CharField(allow_null=True)
    profile_pic = serializers.URLField(allow_null=True)

class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    instructors = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description', 'short_description', 'image', 'promotional_video',
            'price', 'discount_price', 'category', 'instructors', 'tags', 'level', 'status', 
            'is_complete_course', 'created_at', 'updated_at', 'is_enrolled', 'is_free', 
            'is_featured', 'is_certified', 'total_enrollments', 'average_rating', 'language',
            'syllabus_pdf', 'materials_pdf'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_enrollments', 'average_rating']
    
    def get_instructors(self, obj):
        instructors = []
        try:
            for instructor in obj.instructors.all():
                try:
                    if hasattr(instructor, 'profile') and instructor.profile:
                        instructors.append({
                            'id': instructor.id,
                            'name': instructor.profile.name or '',
                            'bio': instructor.profile.shortBio or '',  # Changed from bio to shortBio
                            'profile_pic': instructor.profile.image_profile.url if instructor.profile.image_profile else None  # Changed from profile_pic to image_profile
                        })
                    else:
                        # If instructor doesn't have a profile, still include basic info
                        instructors.append({
                            'id': instructor.id,
                            'name': str(instructor),
                            'bio': '',
                            'profile_pic': None
                        })
                except Exception as e:
                    # Log the error but continue with other instructors
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error processing instructor {instructor.id}: {str(e)}")
                    continue
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in get_instructors: {str(e)}")
        return instructors
    
    def get_tags(self, obj):
        try:
            return [{'id': tag.id, 'name': tag.name} for tag in obj.tags.all()]
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in get_tags: {str(e)}")
            return []
    
    def get_is_enrolled(self, obj):
        try:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                return obj.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists()
            return False
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in get_is_enrolled: {str(e)}")
            return False


class CourseCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    syllabus_pdf = serializers.FileField(required=False, allow_null=True)
    materials_pdf = serializers.FileField(required=False, allow_null=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    
    class Meta:
        model = Course
        fields = [
            'title', 'subtitle', 'description', 'short_description', 'category', 
            'tags', 'level', 'status', 'language', 'price', 'discount_price', 'is_free', 
            'is_complete_course', 'is_featured', 'is_certified', 'image', 
            'promotional_video', 'syllabus_pdf', 'materials_pdf'
        ]
        extra_kwargs = {
            'status': {'default': 'draft'},
            'is_free': {'default': False},
            'is_complete_course': {'default': True},
            'is_featured': {'default': False},
            'is_certified': {'default': False},
        }
    
    def validate(self, data):
        # Ensure free courses have price 0
        if data.get('is_free', False):
            data['price'] = 0
            data['discount_price'] = None
        
        # Validate discount price
        if data.get('discount_price') and data.get('price'):
            if data['discount_price'] >= data['price']:
                raise serializers.ValidationError("Discount price must be less than regular price")
        
        return data
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        
        # Set instructor from request user
        user = self.context['request'].user
        try:
            # Check if user is an instructor
            if hasattr(user, 'profile'):
                if user.profile.status == 'Instructor':
                    instructor = Instructor.objects.get(profile=user.profile)
                elif user.is_staff or user.profile.status == 'Admin':
                    # For staff/admin, we'll create a course without instructor for now
                    instructor = None
                else:
                    raise serializers.ValidationError("User is not authorized to create courses")
            else:
                raise serializers.ValidationError("User profile not found")
        except Instructor.DoesNotExist:
            raise serializers.ValidationError("Instructor profile not found")
        
        try:
            # Create the course
            course = Course.objects.create(**validated_data)
            
            # Add the instructor to the course if exists
            if instructor:
                course.instructors.add(instructor)
            
            # Add tags if any
            if tags_data:
                for tag_name in tags_data:
                    try:
                        # Try to get existing tag first
                        tag = Tag.objects.filter(name__iexact=tag_name).first()
                        if not tag:
                            # Create new tag with unique slug
                            tag = Tag.objects.create(name=tag_name)
                        course.tags.add(tag)
                    except Exception as e:
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.error(f"Error creating/adding tag {tag_name}: {str(e)}")
                        continue
            
            return course
        except Exception as e:
            # Log the error and re-raise it
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating course: {str(e)}", exc_info=True)
            raise


class CourseUpdateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    syllabus_pdf = serializers.FileField(required=False, allow_null=True)
    materials_pdf = serializers.FileField(required=False, allow_null=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    
    class Meta:
        model = Course
        fields = [
            'title', 'subtitle', 'description', 'short_description', 'category', 
            'tags', 'level', 'status', 'language', 'price', 'discount_price', 'is_free', 
            'is_complete_course', 'is_featured', 'is_certified', 'image', 
            'promotional_video', 'syllabus_pdf', 'materials_pdf'
        ]
    
    def update(self, instance, validated_data):
        try:
            tags_data = validated_data.pop('tags', None)
            
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            if tags_data is not None:
                # Clear existing tags and add new ones
                instance.tags.clear()
                for tag_name in tags_data:
                    try:
                        # Try to get existing tag first
                        tag = Tag.objects.filter(name__iexact=tag_name).first()
                        if not tag:
                            # Create new tag with unique slug
                            tag = Tag.objects.create(name=tag_name)
                        instance.tags.add(tag)
                    except Exception as e:
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.error(f"Error creating/adding tag {tag_name}: {str(e)}")
                        continue
            
            return instance
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating course: {str(e)}", exc_info=True)
            raise


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
