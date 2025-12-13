#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script لاختبار إرسال إشعار بانر
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.models import BannerNotification
from notifications.utils import send_banner_notification
from notifications.models import Notification

User = get_user_model()

def test_send_notification(email, title="Test Notification", message="This is a test notification", send_email=True):
    """إرسال إشعار اختباري"""
    
    print(f"Searching for user with email: {email}")
    
    # البحث عن المستخدم
    try:
        user = User.objects.get(email=email)
        print(f"Found user: {user.username} (ID: {user.id})")
    except User.DoesNotExist:
        print(f"ERROR: User with email {email} not found")
        return False
    except User.MultipleObjectsReturned:
        users = User.objects.filter(email=email)
        user = users.first()
        print(f"WARNING: Multiple users found, using: {user.username}")
    
    # التحقق من Profile
    if not hasattr(user, 'profile'):
        print(f"ERROR: User {user.username} does not have a profile")
        return False
    
    profile = user.profile
    print(f"User type: {profile.status}")
    
    # إنشاء BannerNotification
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = user
    
    banner = BannerNotification.objects.create(
        title=title,
        message=message,
        notification_type='banner_top',
        target_type='all_users',  # استخدام all_users لضمان الإرسال
        text_color='#000000',
        background_color='#FFD700',
        is_active=True,
        send_email=send_email,
        created_by=admin_user,
    )
    
    print(f"Created BannerNotification: {banner.id}")
    print(f"Target type: {banner.target_type}")
    print(f"Send email: {banner.send_email}")
    
    # إرسال الإشعار
    print("\nSending notification...")
    try:
        count = send_banner_notification(banner, force=True)
        print(f"SUCCESS: Sent notification to {count} user(s)")
        
        # التحقق من الإشعارات المُنشأة
        notifications = Notification.objects.filter(banner_notification=banner)
        print(f"\nCreated {notifications.count()} notification(s):")
        
        for notif in notifications:
            print(f"  - To: {notif.recipient.email}")
            print(f"    Read: {notif.is_read}, Email sent: {notif.email_sent}")
            if notif.email_sent:
                print(f"    Email sent successfully!")
        
        return True
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    email = 'askcrew.kw@gmail.com'
    title = "تعميم اختباري"
    message = "هذا تعميم اختباري لتجربة نظام الإشعارات في المنصة والبريد الإلكتروني"
    
    print("=" * 60)
    print("Testing Banner Notification System")
    print("=" * 60)
    
    success = test_send_notification(email, title, message, send_email=True)
    
    print("\n" + "=" * 60)
    if success:
        print("Test completed successfully!")
    else:
        print("Test failed!")
    print("=" * 60)


