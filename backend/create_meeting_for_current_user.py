#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from meetings.models import Meeting, Participant, MeetingChat
from users.models import Profile, Student, Instructor
from datetime import datetime, timedelta

def create_meeting_for_current_user():
    print("=== إنشاء اجتماع للحساب الحالي ===\n")
    
    # عرض جميع المستخدمين المتاحين
    print("1. المستخدمين المتاحين:")
    users = User.objects.all().order_by('id')
    for user in users:
        print(f"   ID: {user.id} - Username: {user.username} - Email: {user.email}")
    
    print("\n2. اختر المستخدم الذي تريد إنشاء الاجتماع له:")
    print("   (أدخل ID المستخدم أو username)")
    
    # يمكنك تعديل هذا حسب الحساب الذي تريد استخدامه
    target_username = input("   أدخل username: ").strip()
    
    try:
        if target_username.isdigit():
            target_user = User.objects.get(id=int(target_username))
        else:
            target_user = User.objects.get(username=target_username)
        
        print(f"   ✅ تم اختيار المستخدم: {target_user.username} (ID: {target_user.id})")
        
    except User.DoesNotExist:
        print(f"   ❌ المستخدم غير موجود: {target_username}")
        return
    
    # إنشاء اجتماع جديد
    print(f"\n3. إنشاء اجتماع جديد للمستخدم {target_user.username}:")
    
    meeting_title = f"محاضرة خاصة لـ {target_user.username}"
    meeting, created = Meeting.objects.create(
        title=meeting_title,
        description=f'محاضرة خاصة للمستخدم {target_user.username}',
        meeting_type='LIVE',
        start_time=datetime.now() - timedelta(hours=1),
        duration=timedelta(hours=2),
        creator=target_user,
        is_active=True,
        is_live_started=True,
        live_started_at=datetime.now() - timedelta(minutes=30),
        max_participants=50
    )
    
    print(f"   ✅ تم إنشاء الاجتماع: {meeting.title}")
    print(f"   المعرف: {meeting.id}")
    print(f"   المنشئ: {meeting.creator.username}")
    
    # إضافة المنشئ كمشارك
    creator_participant, created = Participant.objects.create(
        meeting=meeting,
        user=target_user,
        attendance_status='attending',
        joined_at=datetime.now() - timedelta(minutes=30),
        is_attending=True
    )
    
    print(f"   ✅ تم إضافة {target_user.username} كمشارك")
    
    # إضافة رسالة ترحيب
    welcome_message, created = MeetingChat.objects.create(
        meeting=meeting,
        user=target_user,
        message=f'أهلاً وسهلاً بك في محاضرتك الخاصة، {target_user.username}!',
        timestamp=datetime.now() - timedelta(minutes=25)
    )
    
    print(f"   ✅ تم إضافة رسالة ترحيب")
    
    print(f"\n=== انتهى إنشاء الاجتماع ===")
    print(f"\nيمكنك الآن اختبار النظام باستخدام:")
    print(f"- معرف الاجتماع: {meeting.id}")
    print(f"- رابط المعلم: /teacher/meetings/live/{meeting.id}")
    print(f"- رابط الطالب: /student/meetings/live/{meeting.id}")
    print(f"\nبيانات تسجيل الدخول:")
    print(f"- المستخدم: {target_user.username}")
    print(f"- كلمة المرور: (كلمة المرور الخاصة بك)")
    
    return meeting.id

if __name__ == '__main__':
    meeting_id = create_meeting_for_current_user()
    if meeting_id:
        print(f"\n🎉 تم إنشاء الاجتماع بنجاح! معرف الاجتماع: {meeting_id}")
