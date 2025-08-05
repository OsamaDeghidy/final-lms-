from django.db import models
from django.db.models import Avg
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

class CourseReview(models.Model):
    """User reviews for courses"""
    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]
    
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_reviews')
    rating = models.IntegerField(choices=RATING_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('course', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s review for {self.course.title}"
    
    def save(self, *args, **kwargs):
        # Update course rating when review is saved
        super().save(*args, **kwargs)
        self.update_course_rating()
    
    def update_course_rating(self):
        """Update the course's average rating"""
        reviews = CourseReview.objects.filter(course=self.course, is_approved=True)
        if reviews.exists():
            avg_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating']
            self.course.average_rating = round(avg_rating, 1)
            self.course.save(update_fields=['average_rating'])


class ReviewReply(models.Model):
    """Replies to course reviews"""
    review = models.ForeignKey(CourseReview, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_replies')
    reply_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = 'Review Replies'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Reply by {self.user.username} on {self.review}"


class Comment(models.Model):
    """Comments on courses for discussion"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_comments')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    likes = models.ManyToManyField(User, through='CommentLike', related_name='liked_comments')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.course.title}"
    
    @property
    def is_reply(self):
        """Check if this is a reply to another comment"""
        return self.parent is not None
    
    @property
    def like_count(self):
        """Get the number of likes for this comment"""
        return self.likes.count()


class CommentLike(models.Model):
    """Like system for comments"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='comment_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'comment')
    
    def __str__(self):
        return f"{self.user.username} likes {self.comment}"


# Signals
@receiver(post_save, sender=CourseReview)
def update_course_rating_on_save(sender, instance, **kwargs):
    """Update course rating when a review is saved"""
    instance.update_course_rating()

@receiver(post_save, sender=ReviewReply)
def send_reply_notification(sender, instance, created, **kwargs):
    """Send notification when a reply is posted"""
    if created:
        # Here you would implement notification logic
        # For example, send email or in-app notification to the review author
        pass
