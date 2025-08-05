from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q
from django.utils import timezone

from courses.models import Course
from users.models import User
from .models import CourseReview, ReviewReply, Comment, CommentLike
from .serializers import (
    ReviewCreateSerializer, ReviewSerializer, ReviewReplySerializer,
    CommentSerializer, CommentCreateSerializer, CommentLikeSerializer
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request, course_id):
    """إنشاء تقييم للدورة"""
    course = get_object_or_404(Course, id=course_id)
    
    # Check if user is enrolled
    if not course.enroller_user.filter(id=request.user.id).exists():
        return Response({
            'error': 'يجب أن تكون مسجلاً في الدورة لتتمكن من تقييمها'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if user already reviewed
    if CourseReview.objects.filter(course=course, user=request.user).exists():
        return Response({
            'error': 'لقد قمت بتقييم هذه الدورة بالفعل'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = request.data.copy()
    data['course'] = course.id
    
    serializer = ReviewCreateSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        review = serializer.save()
        return Response({
            'message': 'تم إضافة تقييمك بنجاح',
            'review': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'بيانات غير صحيحة',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def course_reviews(request, course_id):
    """جلب تقييمات الدورة"""
    course = get_object_or_404(Course, id=course_id)
    reviews = course.reviews.all().order_by('-created_at')
    
    # Pagination
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(reviews, request)
    
    serializer = ReviewSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# Review Management
class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or delete a review"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return CourseReview.objects.all()
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own reviews.")
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own reviews.")
        instance.delete()


# Review Replies
class ReviewReplyListCreateView(generics.ListCreateAPIView):
    """View to list and create replies to a review"""
    serializer_class = ReviewReplySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        review_id = self.kwargs['review_id']
        return ReviewReply.objects.filter(
            review_id=review_id,
            is_approved=True
        ).order_by('created_at')
    
    def perform_create(self, serializer):
        review = get_object_or_404(CourseReview, id=self.kwargs['review_id'])
        serializer.save(
            review=review,
            user=self.request.user
        )


class ReviewReplyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or delete a reply"""
    serializer_class = ReviewReplySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReviewReply.objects.filter(
            review_id=self.kwargs['review_id'],
            is_approved=True
        )
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own replies.")
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own replies.")
        instance.delete()


# Comments
class CommentListCreateView(generics.ListCreateAPIView):
    """View to list and create comments on a course"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Comment.objects.filter(
            course_id=course_id,
            parent__isnull=True,  # Only top-level comments
            is_active=True
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        parent_id = self.request.data.get('parent_id')
        parent = None
        
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id)
            if parent.course_id != course.id:
                raise serializers.ValidationError("Parent comment must be from the same course.")
        
        serializer.save(
            course=course,
            user=self.request.user,
            parent=parent
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or delete a comment"""
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(
            course_id=self.kwargs['course_id'],
            is_active=True
        )
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own comments.")
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own comments.")
        instance.is_active = False
        instance.save()


# Comment Likes
class CommentLikeView(generics.CreateAPIView, generics.DestroyAPIView):
    """View to like or unlike a comment"""
    serializer_class = CommentLikeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CommentLike.objects.filter(
            comment_id=self.kwargs['comment_id'],
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        comment = get_object_or_404(
            Comment,
            id=self.kwargs['comment_id'],
            is_active=True
        )
        
        if comment.user == self.request.user:
            raise serializers.ValidationError("You cannot like your own comment.")
        
        if self.get_queryset().exists():
            raise serializers.ValidationError("You have already liked this comment.")
        
        serializer.save(
            comment=comment,
            user=self.request.user
        )
    
    def delete(self, request, *args, **kwargs):
        like = self.get_queryset().first()
        if like:
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Like not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# Moderation
class ReviewModerationView(generics.UpdateAPIView):
    """Moderate a review (approve/reject)"""
    permission_classes = [IsAdminUser]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        return CourseReview.objects.all()
    
    def patch(self, request, *args, **kwargs):
        review = self.get_object()
        action = request.data.get('action')
        
        if action == 'approve':
            review.is_approved = True
            review.save()
            return Response({"status": "Review approved"})
        elif action == 'reject':
            review.is_approved = False
            review.save()
            return Response({"status": "Review rejected"})
        
        return Response(
            {"error": "Invalid action. Use 'approve' or 'reject'"},
            status=status.HTTP_400_BAD_REQUEST
        )


class ReplyModerationView(generics.UpdateAPIView):
    """Moderate a reply (approve/reject)"""
    permission_classes = [IsAdminUser]
    serializer_class = ReviewReplySerializer
    
    def get_queryset(self):
        return ReviewReply.objects.all()
    
    def patch(self, request, *args, **kwargs):
        reply = self.get_object()
        action = request.data.get('action')
        
        if action == 'approve':
            reply.is_approved = True
            reply.save()
            return Response({"status": "Reply approved"})
        elif action == 'reject':
            reply.is_approved = False
            reply.save()
            return Response({"status": "Reply rejected"})
        
        return Response(
            {"error": "Invalid action. Use 'approve' or 'reject'"},
            status=status.HTTP_400_BAD_REQUEST
        )
