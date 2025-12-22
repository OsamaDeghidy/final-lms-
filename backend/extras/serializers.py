from rest_framework import serializers
from .models import Banner, CourseCollection
from courses.serializers import CourseBasicSerializer


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for Banner model"""
    image_url = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'description', 'image', 'image_url', 'url',
            'is_active', 'banner_type', 'display_order',
            'start_date', 'end_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Fallback if no request context (shouldn't happen in normal API usage)
            return obj.image.url
        return None
    
    def get_is_active(self, obj):
        """Check if banner is currently active based on dates"""
        return obj.is_active_now()


class CourseCollectionListSerializer(serializers.ModelSerializer):
    """Serializer for listing course collections"""
    course_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CourseCollection
        fields = [
            'id', 'name', 'slug', 'description',
            'is_featured', 'display_order', 'course_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
        lookup_field = 'slug'
        extra_kwargs = {
            'url': {'lookup_field': 'slug'}
        }


class CourseCollectionDetailSerializer(CourseCollectionListSerializer):
    """Detailed serializer for course collections with nested courses"""
    courses = CourseBasicSerializer(many=True, read_only=True)
    
    class Meta(CourseCollectionListSerializer.Meta):
        fields = CourseCollectionListSerializer.Meta.fields + ['courses']
