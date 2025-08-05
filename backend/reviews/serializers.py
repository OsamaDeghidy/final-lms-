from rest_framework import serializers
from django.utils import timezone
from django.db.models import Avg, Count
from courses.models import Course
from users.models import User
from .models import CourseReview, ReviewReply, Comment, CommentLike


class ReviewReplySerializer(serializers.ModelSerializer):
    """Serializer for review replies"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_image = serializers.ImageField(source='user.profile.image_profile', read_only=True)
    
    class Meta:
        model = ReviewReply
        fields = [
            'id', 'user', 'user_name', 'user_image', 'review', 'reply_text',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']


class ReviewSerializer(serializers.ModelSerializer):
    """Basic serializer for course reviews"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_image = serializers.ImageField(source='user.profile.image_profile', read_only=True)
    replies = ReviewReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseReview
        fields = [
            'id', 'user', 'user_name', 'user_image', 'course', 'rating', 'review_text',
            'created_at', 'updated_at', 'replies', 'replies_count', 'is_owner'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_replies_count(self, obj):
        return obj.replies.count()
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new review"""
    class Meta:
        model = CourseReview
        fields = ['course', 'rating', 'review_text']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate(self, data):
        user = self.context['request'].user
        course = data['course']
        
        # Check if user is enrolled in the course
        if not course.enrollments.filter(student=user, status__in=['active', 'completed']).exists():
            raise serializers.ValidationError("You must be enrolled in this course to leave a review.")
        
        # Check if user has already reviewed this course
        if CourseReview.objects.filter(user=user, course=course).exists():
            raise serializers.ValidationError("You have already reviewed this course.")
        
        return data
    
    def create(self, validated_data):
        review = CourseReview.objects.create(
            user=self.context['request'].user,
            **validated_data
        )
        # Update course average rating
        review.course.update_average_rating()
        return review


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a review"""
    class Meta:
        model = CourseReview
        fields = ['rating', 'review_text']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def update(self, instance, validated_data):
        instance.rating = validated_data.get('rating', instance.rating)
        instance.review_text = validated_data.get('review_text', instance.review_text)
        instance.updated_at = timezone.now()
        instance.save()
        
        # Update course average rating
        instance.course.update_average_rating()
        
        return instance


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments with nested replies"""
    user_name = serializers.CharField(source='user.profile.name', read_only=True)
    user_image = serializers.ImageField(source='user.profile.image_profile', read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_name', 'user_image', 'course', 'content',
            'created_at', 'updated_at', 'likes_count', 'is_liked',
            'replies', 'replies_count', 'is_owner', 'is_active', 'parent'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_replies(self, obj):
        # Only get direct replies (one level deep)
        replies = obj.replies.filter(is_active=True).order_by('created_at')
        serializer = CommentSerializer(
            replies, many=True, context=self.context)
        return serializer.data
    
    def get_replies_count(self, obj):
        return obj.replies.filter(is_active=True).count()
    
    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new comment"""
    class Meta:
        model = Comment
        fields = ['course', 'content', 'parent']
    
    def validate(self, data):
        # Check if content type and object_id are valid
        course = data['course']
        user = self.context['request'].user
        
        # Verify the user has access to the course
        if not course.enrollments.filter(student=user, status__in=['active', 'completed']).exists():
            raise serializers.ValidationError("You must be enrolled in this course to comment.")
        
        # Check if parent comment exists and is accessible
        if 'parent' in data:
            parent = data['parent']
            if not parent.is_active:
                raise serializers.ValidationError("Parent comment is not active.")
        
        return data
    
    def create(self, validated_data):
        return Comment.objects.create(
            user=self.context['request'].user,
            **validated_data
        )


    
    def create(self, validated_data):
        return SubComment.objects.create(
            user=self.context['request'].user,
            **validated_data
        )


class LikeSerializer(serializers.Serializer):
    """Base serializer for like actions"""
    def create(self, validated_data):
        user = self.context['request'].user
        instance = self.Meta.model.objects.create(
            user=user,
            **{f"{self.Meta.related_field}": validated_data['object_id']}
        )
        return instance
    
    def validate(self, data):
        object_id = data['object_id']
        user = self.context['request'].user
        
        # Check if the like already exists
        if self.Meta.model.objects.filter(
            user=user,
            **{f"{self.Meta.related_field}": object_id}
        ).exists():
            raise serializers.ValidationError("You have already liked this item.")
        
        return data
    
    class Meta:
        abstract = True


class CommentLikeSerializer(LikeSerializer):
    """Serializer for liking a comment"""
    class Meta(LikeSerializer.Meta):
        model = CommentLike
        related_field = 'comment'


# Removed SubCommentLikeSerializer as we're using CommentLike for all comment likes
        related_field = 'sub_comment'
