from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import BookCategory, Article, ArticleComment
from .serializers import (
    BookCategorySerializer, ArticleSerializer, 
    ArticleCommentSerializer
)


class BookCategoryViewSet(viewsets.ModelViewSet):
    queryset = BookCategory.objects.all()
    serializer_class = BookCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.filter(status='published')
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['featured']
    search_fields = ['title', 'content', 'summary']
    ordering_fields = ['created_at', 'updated_at', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('author')

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        article = self.get_object()
        # Implement like functionality
        return Response({'status': 'liked'})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        article = self.get_object()
        # Implement unlike functionality
        return Response({'status': 'unliked'})


class ArticleCommentViewSet(viewsets.ModelViewSet):
    queryset = ArticleComment.objects.filter(is_approved=True)
    serializer_class = ArticleCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['article']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FeaturedArticlesView(generics.ListAPIView):
    queryset = Article.objects.filter(status='published', featured=True)
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RecentArticlesView(generics.ListAPIView):
    queryset = Article.objects.filter(status='published').order_by('-created_at')[:10]
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PopularArticlesView(generics.ListAPIView):
    queryset = Article.objects.filter(status='published').order_by('-views_count')[:10]
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]





class ArticleSearchView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return Article.objects.filter(
                Q(title__icontains=query) | 
                Q(content__icontains=query) | 
                Q(summary__icontains=query),
                status='published'
            ).order_by('-created_at')
        return Article.objects.none() 