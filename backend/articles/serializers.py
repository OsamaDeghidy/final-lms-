from rest_framework import serializers
from .models import BookCategory, Article, ArticleComment


class BookCategorySerializer(serializers.ModelSerializer):
    articles_count = serializers.SerializerMethodField()

    class Meta:
        model = BookCategory
        fields = ['id', 'name', 'description', 'created_at', 'articles_count']
        read_only_fields = ['created_at']

    def get_articles_count(self, obj):
        return obj.articles.filter(is_published=True).count()


class ArticleCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    likes_count = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = ArticleComment
        fields = [
            'id', 'article', 'author', 'author_name', 'content', 
            'is_approved', 'likes_count', 'replies_count', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'is_approved']

    def get_likes_count(self, obj):
        return getattr(obj, 'likes', []).count() if hasattr(obj, 'likes') else 0

    def get_replies_count(self, obj):
        return getattr(obj, 'replies', []).count() if hasattr(obj, 'replies') else 0


class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'author', 'author_name', 
            'content', 'excerpt', 'featured_image', 
            'is_published', 'is_featured', 'allow_comments',
            'meta_description', 'views', 'comments_count', 'likes_count',
            'reading_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'slug', 'views', 'created_at', 'updated_at']

    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()

    def get_likes_count(self, obj):
        return getattr(obj, 'likes', []).count() if hasattr(obj, 'likes') else 0

    def get_reading_time(self, obj):
        if obj.content:
            # تقدير وقت القراءة (200 كلمة في الدقيقة)
            word_count = len(obj.content.split())
            minutes = max(1, word_count // 200)
            return f'{minutes} دقيقة'
        return '0 دقيقة'

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data) 