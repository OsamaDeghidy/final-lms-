from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.cache import cache
from .models import CustomPermission


@receiver(post_save, sender=CustomPermission)
def clear_user_permissions_cache(sender, instance, **kwargs):
    """
    Clear cache when permissions are saved
    """
    cache_key = f"user_permissions_{instance.user.id}"
    cache.delete(cache_key)


@receiver(post_delete, sender=CustomPermission)
def clear_user_permissions_cache_on_delete(sender, instance, **kwargs):
    """
    Clear cache when permissions are deleted
    """
    cache_key = f"user_permissions_{instance.user.id}"
    cache.delete(cache_key)


@receiver(post_save, sender=User)
def clear_user_cache_on_user_save(sender, instance, **kwargs):
    """
    Clear cache when user is saved
    """
    cache_key = f"user_permissions_{instance.id}"
    cache.delete(cache_key) 