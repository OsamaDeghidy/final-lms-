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
        (1, '1 - ضعيف'),
        (2, '2 - مقبول'),
        (3, '3 - جيد'),
        (4, '4 - جيد جداً'),
        (5, '5 - ممتاز'),
    ]
    
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='reviews', verbose_name='الدورة')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_reviews', verbose_name='المستخدم')
    rating = models.IntegerField(choices=RATING_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name='التقييم')
    review_text = models.TextField(null=True, blank=True, verbose_name='نص التقييم')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    is_approved = models.BooleanField(default=True, verbose_name='موافق عليه')
    likes = models.ManyToManyField(User, through='ReviewLike', related_name='liked_reviews', verbose_name='الإعجابات')
    
    class Meta:
        verbose_name = 'تقييم دورة'
        verbose_name_plural = 'تقييمات الدورات'
        unique_together = ('course', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s review for {self.course.title}"
    
    def save(self, *args, **kwargs):
        print(f"=== MODEL SAVE DEBUG ===")
        print(f"Review ID: {getattr(self, 'id', 'NEW')}")
        print(f"Rating: {self.rating}")
        print(f"Review Text: '{self.review_text}'")
        print(f"User: {self.user}")
        print(f"Course: {self.course}")
        print(f"=========================")
        
        # Update course rating when review is saved
        super().save(*args, **kwargs)
        self.update_course_rating()
    
    def update_course_rating(self):
        """Update the course's average rating"""
        self.course.update_statistics()
    
    @property
    def like_count(self):
        """Get the number of likes for this review"""
        return self.likes.count()
    
    def is_liked_by_user(self, user=None):
        """Check if this review is liked by a specific user"""
        if not user:
            return False
        return self.likes.filter(user=user).exists()


class ReviewReply(models.Model):
    """Replies to course reviews"""
    review = models.ForeignKey(CourseReview, on_delete=models.CASCADE, related_name='replies', verbose_name='التقييم')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_replies', verbose_name='المستخدم')
    reply_text = models.TextField(verbose_name='نص الرد')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    is_approved = models.BooleanField(default=True, verbose_name='موافق عليه')
    
    class Meta:
        verbose_name = 'رد على التقييم'
        verbose_name_plural = 'ردود التقييمات'
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


class ReviewLike(models.Model):
    """Like system for reviews"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.ForeignKey(CourseReview, on_delete=models.CASCADE, related_name='review_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'review')
    
    def __str__(self):
        return f"{self.user.username} likes {self.review}"


# Signals
@receiver(post_save, sender=CourseReview)
def update_course_rating_on_save(sender, instance, **kwargs):
    """Update course rating when a review is saved"""
    instance.course.update_statistics()

@receiver(post_save, sender=ReviewReply)
def send_reply_notification(sender, instance, created, **kwargs):
    """Send notification when a reply is posted"""
    if created:
        # Here you would implement notification logic
        # For example, send email or in-app notification to the review author
        pass
