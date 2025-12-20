from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse, Http404
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from courses.models import Course, Enrollment
from assignments.models import Assignment, AssignmentSubmission
from content.models import Lesson
from users.models import Student, Instructor
from meetings.models import Meeting
from articles.models import Article
from store.models import Order
from store.models_payment import Transaction
from reviews.models import CourseReview
from certificates.models import Certificate

def _format_certificate_lines(certificate):
    """تجهيز نص القالب بنفس منطق معاينة الواجهة الأمامية"""
    try:
        template = certificate.get_template_or_default()
    except Exception:
        template = certificate.template

    # نص القالب أو نص افتراضي
    default_text = (
        "هذا يشهد بأن\n"
        "{student_name}\n"
        "قد أكمل(ت) برنامجًا تدريبيًا بعنوان\n"
        "{course_name}\n"
        "بتاريخ {completion_date}"
    )
    raw_text = (getattr(template, 'certificate_text', None) or default_text)

    # تجهيز القيم
    student_name = certificate.student_name or certificate.user.get_full_name()
    course_name = certificate.course_title or certificate.course.title
    mapping = {
        'student_name': student_name or 'اسم الطالب',
        'national_id': certificate.national_id or 'غير متوفر',
        'course_name': course_name or 'اسم الدورة',
        'duration_days': certificate.duration_days if certificate.duration_days is not None else 'غير محدد',
        'duration_hours': certificate.course_duration_hours if certificate.course_duration_hours is not None else 'غير محدد',
        'start_date': certificate.start_date.strftime('%Y-%m-%d') if certificate.start_date else 'غير محدد',
        'end_date': certificate.end_date.strftime('%Y-%m-%d') if certificate.end_date else 'غير محدد',
        'start_date_hijri': certificate.start_date_hijri or 'غير محدد',
        'end_date_hijri': certificate.end_date_hijri or 'غير محدد',
        'completion_date': (certificate.completion_date or certificate.date_issued).strftime('%Y-%m-%d'),
        'institution_name': certificate.institution_name or (getattr(template, 'institution_name', '') or ''),
        'final_grade': certificate.final_grade if certificate.final_grade is not None else '',
        'course_duration': certificate.course_duration_hours if certificate.course_duration_hours is not None else ''
    }

    try:
        formatted_text = raw_text.format(**mapping)
    except Exception:
        # في حال وجود متغيرات غير متوافقة، نستخدم استبدال بسيط
        formatted_text = raw_text
        for k, v in mapping.items():
            formatted_text = formatted_text.replace(f'{{{k}}}', str(v))

    lines = [line.strip() for line in formatted_text.split('\n') if line.strip()]
    formatted_lines = []
    for idx, line in enumerate(lines):
        is_highlight = (student_name and student_name in line) or (course_name and course_name in line)
        # تحديد إذا كان هذا السطر الأول الذي يحتوي على "يشهد"
        is_first_line = idx == 0 and 'يشهد' in line
        formatted_lines.append({
            'text': line, 
            'highlight': is_highlight,
            'is_first_line': is_first_line
        })

    # خلفية القالب والشعار
    bg_image_url = getattr(template, 'template_file', None).url if getattr(template, 'template_file', None) else None
    logo_url = getattr(template, 'institution_logo', None).url if getattr(template, 'institution_logo', None) else None

    return {
        'formatted_lines': formatted_lines,
        'bg_image_url': bg_image_url,
        'logo_url': logo_url,
        'include_grade': getattr(template, 'include_grade', False),
    }

def certificate_verify_page(request, verification_code):
    """صفحة عامة لعرض تفاصيل الشهادة عبر رمز التحقق"""
    try:
        certificate = get_object_or_404(Certificate, verification_code=verification_code)
        # تجهيز النص والخلفية والشعار مثل صفحة المعاينة في الفرونت
        fmt = _format_certificate_lines(certificate)
        verification_url = certificate.get_verification_url()
        context = {
            'certificate': certificate,
            'verification_url': verification_url,
            **fmt,
        }
        return render(request, 'certificates/verify.html', context)
    except Exception:
        # في حال حدوث خطأ غير متوقع
        return render(request, 'certificates/verify.html', {
            'certificate': None,
            'error': 'حدث خطأ أثناء عرض الشهادة. الرجاء المحاولة لاحقًا.'
        })


def certificate_pdf_preview(request, verification_code):
    """صفحة معاينة PDF قبل التحميل"""
    try:
        certificate = get_object_or_404(Certificate, verification_code=verification_code)
        # تجهيز النص والخلفية والشعار مثل صفحة المعاينة في الفرونت
        fmt = _format_certificate_lines(certificate)
        verification_url = certificate.get_verification_url()
        context = {
            'certificate': certificate,
            'verification_url': verification_url,
            **fmt,
        }
        return render(request, 'certificates/pdf_preview.html', context)
    except Exception:
        # في حال حدوث خطأ غير متوقع
        return render(request, 'certificates/pdf_preview.html', {
            'certificate': None,
            'error': 'حدث خطأ أثناء عرض الشهادة. الرجاء المحاولة لاحقًا.'
        })


@login_required
def bulk_certificates_download(request):
    """صفحة تحميل الشهادات بشكل جماعي"""
    from django.core.paginator import Paginator
    import json
    
    # الحصول على جميع الشهادات المتاحة للمستخدم
    certificates = Certificate.objects.select_related('course', 'user', 'template').all().order_by('-date_issued')
    
    # إذا كان المستخدم ليس superuser، نعرض فقط شهاداته
    if not request.user.is_superuser:
        certificates = certificates.filter(user=request.user)
    
    # Pagination - 50 شهادة في الصفحة
    paginator = Paginator(certificates, 50)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    # تجهيز بيانات كل شهادة في الصفحة الحالية فقط
    certificates_data = []
    for cert in page_obj:
        fmt = _format_certificate_lines(cert)
        certificates_data.append({
            'certificate': cert,
            **fmt,
        })
    
    # تجهيز JSON للشهادات المحددة فقط (للأداء)
    certificates_json = {}
    for cert_data in certificates_data:
        cert = cert_data['certificate']
        certificates_json[cert.id] = {
            'id': cert.id,
            'student_name': cert.student_name,
            'course_title': cert.course_title,
            'verification_code': cert.verification_code,
            'formatted_lines': cert_data['formatted_lines'],
            'bg_image_url': cert_data.get('bg_image_url'),
            'logo_url': cert_data.get('logo_url'),
        }
    
    context = {
        'certificates_data': certificates_data,
        'page_obj': page_obj,
        'certificates_json': json.dumps(certificates_json, ensure_ascii=False),
        'base_url': request.build_absolute_uri('/').rstrip('/'),
    }
    return render(request, 'certificates/bulk_download.html', context)


def download_certificate_pdf(request, certificate_id):
    """تحميل الشهادة كملف PDF"""
    try:
        certificate = get_object_or_404(Certificate, id=certificate_id)
        
        # إنشاء PDF مباشرة من القالب HTML
        from certificates.utils import generate_certificate_pdf, REPORTLAB_AVAILABLE
        
        if not REPORTLAB_AVAILABLE:
            return HttpResponse(
                'خطأ: مكتبة ReportLab غير مثبتة. يرجى تثبيتها باستخدام: pip install reportlab',
                status=500,
                content_type='text/plain; charset=utf-8'
            )
        
        try:
            # إنشاء PDF مباشرة
            pdf_buffer = generate_certificate_pdf(certificate)
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            safe_name = certificate.student_name.replace('/', '_').replace('\\', '_') if certificate.student_name else 'unknown'
            response['Content-Disposition'] = f'attachment; filename="certificate_{certificate.certificate_id}_{safe_name}.pdf"'
            return response
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error generating PDF for certificate {certificate.id}: {str(e)}")
            return HttpResponse(
                f'حدث خطأ أثناء إنشاء PDF: {str(e)}',
                status=500,
                content_type='text/plain; charset=utf-8'
            )
            
    except Certificate.DoesNotExist:
        raise Http404("الشهادة غير موجودة")

@login_required
def student_dashboard_stats(request):
    """إحصائيات لوحة تحكم الطالب"""
    if not hasattr(request.user, 'student'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    student = request.user.student
    
    # Try cache first (user-scoped)
    cache_key = f"student_dashboard_stats:{student.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse(cached)
    
    # المقررات المسجلة
    enrolled_courses = Enrollment.objects.filter(student=student, is_active=True).count()
    
    # الدروس المكتملة
    completed_lessons = Lesson.objects.filter(
        course__enrollments__student=student,
        course__enrollments__is_active=True
    ).count()
    
    # الواجبات المعلقة
    pending_assignments = Assignment.objects.filter(
        course__enrollments__student=student,
        course__enrollments__is_active=True,
        due_date__gte=timezone.now()
    ).exclude(
        submissions__student=student
    ).count()
    
    # متوسط الدرجات
    average_grade = AssignmentSubmission.objects.filter(
        student=student,
        grade__isnull=False
    ).aggregate(avg_grade=Avg('grade'))['avg_grade'] or 0
    
    # النقاط الإجمالية
    total_points = student.points or 0
    
    # أيام التعلم المتتالية
    learning_streak = student.learning_streak or 0
    
    # الشهادات
    certificates = Certificate.objects.filter(student=student).count()
    
    data = {
        'enrolledCourses': enrolled_courses,
        'completedLessons': completed_lessons,
        'pendingAssignments': pending_assignments,
        'averageGrade': round(average_grade, 1),
        'totalPoints': total_points,
        'learningStreak': learning_streak,
        'certificates': certificates
    }
    # Cache for 2 minutes
    cache.set(cache_key, data, timeout=120)
    return JsonResponse(data)

@login_required
def teacher_dashboard_stats(request):
    """إحصائيات لوحة تحكم المعلم"""
    if not hasattr(request.user, 'instructor'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    instructor = request.user.instructor
    
    # Try cache first (user-scoped)
    cache_key = f"teacher_dashboard_stats:{instructor.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse(cached)
    
    # إجمالي المقررات
    total_courses = Course.objects.filter(instructor=instructor).count()
    
    # إجمالي الطلاب
    total_students = Enrollment.objects.filter(
        course__instructor=instructor,
        is_active=True
    ).values('student').distinct().count()
    
    # إجمالي الإيرادات
    total_revenue = Transaction.objects.filter(
        order__course__instructor=instructor,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # متوسط التقييم
    average_rating = CourseReview.objects.filter(
        course__instructor=instructor
    ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    # الواجبات المعلقة
    pending_assignments = AssignmentSubmission.objects.filter(
        assignment__course__instructor=instructor,
        grade__isnull=True
    ).count()
    
    # المحاضرات القادمة
    upcoming_meetings = Meeting.objects.filter(
        instructor=instructor,
        start_time__gte=timezone.now()
    ).count()
    
    # التسجيلات الجديدة (هذا الأسبوع)
    week_ago = timezone.now() - timedelta(days=7)
    recent_enrollments = Enrollment.objects.filter(
        course__instructor=instructor,
        enrolled_at__gte=week_ago
    ).count()
    
    data = {
        'totalCourses': total_courses,
        'totalStudents': total_students,
        'totalRevenue': total_revenue,
        'averageRating': round(average_rating, 1),
        'pendingAssignments': pending_assignments,
        'upcomingMeetings': upcoming_meetings,
        'recentEnrollments': recent_enrollments
    }
    # Cache for 2 minutes
    cache.set(cache_key, data, timeout=120)
    return JsonResponse(data)

@login_required
def student_courses(request):
    """المقررات النشطة للطالب"""
    if not hasattr(request.user, 'student'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    student = request.user.student
    
    # Try cache first (user-scoped)
    cache_key = f"student_courses:{student.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse(cached, safe=False)
    enrollments = Enrollment.objects.filter(
        student=student,
        is_active=True
    ).select_related('course', 'course__instructor').prefetch_related('course__lessons', 'course__meetings')
    
    courses_data = []
    for enrollment in enrollments:
        course = enrollment.course
        
        # حساب التقدم
        total_lessons = course.lessons.count()
        completed_lessons = course.lessons.filter(
            views__student=student
        ).count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # الجلسة القادمة
        next_meeting = course.meetings.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        
        courses_data.append({
            'id': course.id,
            'name': course.title,
            'teacher': course.instructor.user.get_full_name(),
            'progress': round(progress, 1),
            'nextSession': next_meeting.start_time.strftime('%Y-%m-%d %H:%M') if next_meeting else 'لا توجد جلسات قادمة',
            'color': 'primary'
        })
    
    # Cache for 3 minutes
    cache.set(cache_key, courses_data, timeout=180)
    return JsonResponse(courses_data, safe=False)

@login_required
def teacher_courses(request):
    """المقررات النشطة للمعلم"""
    if not hasattr(request.user, 'instructor'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    instructor = request.user.instructor
    
    # Try cache first (user-scoped)
    cache_key = f"teacher_courses:{instructor.id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return JsonResponse(cached, safe=False)
    courses = Course.objects.filter(instructor=instructor).prefetch_related(
        'assignments', 'enrollments', 'meetings', 'lessons'
    )
    
    courses_data = []
    for course in courses:
        # عدد الطلاب
        students_count = course.enrollments.filter(is_active=True).count()
        
        # عدد الواجبات
        assignments_count = course.assignments.count()
        
        # متوسط تقدم الطلاب
        enrollments = course.enrollments.filter(is_active=True)
        total_progress = 0
        for enrollment in enrollments:
            total_lessons = course.lessons.count()
            completed_lessons = course.lessons.filter(
                views__student=enrollment.student
            ).count()
            if total_lessons > 0:
                total_progress += (completed_lessons / total_lessons * 100)
        
        avg_progress = total_progress / enrollments.count() if enrollments.count() > 0 else 0
        
        # الواجبات المعلقة
        pending_assignments = AssignmentSubmission.objects.filter(
            assignment__course=course,
            grade__isnull=True
        ).count()
        
        # الجلسة القادمة
        next_meeting = course.meetings.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        
        courses_data.append({
            'id': course.id,
            'name': course.title,
            'students': students_count,
            'assignments': assignments_count,
            'progress': round(avg_progress, 1),
            'pendingAssignments': pending_assignments,
            'nextClass': next_meeting.start_time.strftime('%Y-%m-%d %H:%M') if next_meeting else 'لا توجد جلسات قادمة',
            'color': 'primary'
        })
    
    # Cache for 3 minutes
    cache.set(cache_key, courses_data, timeout=180)
    return JsonResponse(courses_data, safe=False)

@login_required
def student_progress(request):
    """تقدم الطلاب للمعلم"""
    if not hasattr(request.user, 'instructor'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    instructor = request.user.instructor
    enrollments = Enrollment.objects.filter(
        course__instructor=instructor,
        is_active=True
    ).select_related('student', 'student__user', 'course').prefetch_related('course__lessons')
    
    students_data = []
    for enrollment in enrollments:
        student = enrollment.student
        course = enrollment.course
        
        # حساب التقدم
        total_lessons = course.lessons.count()
        completed_lessons = course.lessons.filter(
            views__student=student
        ).count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # متوسط الدرجات
        avg_grade = AssignmentSubmission.objects.filter(
            student=student,
            assignment__course=course,
            grade__isnull=False
        ).aggregate(avg=Avg('grade'))['avg'] or 0
        
        # تحديد التقدير
        if avg_grade >= 90:
            grade = 'ممتاز'
        elif avg_grade >= 80:
            grade = 'جيد جداً'
        elif avg_grade >= 70:
            grade = 'جيد'
        else:
            grade = 'مقبول'
        
        students_data.append({
            'id': student.id,
            'name': student.user.get_full_name(),
            'progress': round(progress, 1),
            'grade': grade
        })
    
    # ترتيب حسب التقدم
    students_data.sort(key=lambda x: x['progress'], reverse=True)
    
    return JsonResponse(students_data[:8], safe=False)  # أعلى 8 طلاب

@login_required
def recent_activity(request):
    """النشاطات الأخيرة"""
    user = request.user
    
    activities = []
    
    if hasattr(user, 'student'):
        # نشاطات الطالب
        # آخر الدروس المشاهدة
        recent_lessons = Lesson.objects.filter(
            views__student=user.student
        ).order_by('-views__viewed_at')[:5]
        
        for lesson in recent_lessons:
            activities.append({
                'id': f'lesson_{lesson.id}',
                'type': 'lesson',
                'title': f'شاهد درس: {lesson.title}',
                'description': f'مقرر: {lesson.course.title}',
                'time': lesson.views.filter(student=user.student).first().viewed_at.strftime('%Y-%m-%d %H:%M'),
                'course': lesson.course.title
            })
        
        # آخر الواجبات المقدمة
        recent_submissions = AssignmentSubmission.objects.filter(
            student=user.student
        ).order_by('-submitted_at')[:5]
        
        for submission in recent_submissions:
            activities.append({
                'id': f'submission_{submission.id}',
                'type': 'assignment',
                'title': f'قدم واجب: {submission.assignment.title}',
                'description': f'مقرر: {submission.assignment.course.title}',
                'time': submission.submitted_at.strftime('%Y-%m-%d %H:%M'),
                'course': submission.assignment.course.title
            })
    
    elif hasattr(user, 'instructor'):
        # نشاطات المعلم
        # آخر المقررات المنشأة
        recent_courses = Course.objects.filter(
            instructor=user.instructor
        ).order_by('-created_at')[:5]
        
        for course in recent_courses:
            activities.append({
                'id': f'course_{course.id}',
                'type': 'course',
                'title': f'أنشأ مقرر: {course.title}',
                'description': f'عدد الطلاب: {course.enrollments.filter(is_active=True).count()}',
                'time': course.created_at.strftime('%Y-%m-%d %H:%M')
            })
        
        # آخر الواجبات المنشأة
        recent_assignments = Assignment.objects.filter(
            course__instructor=user.instructor
        ).order_by('-created_at')[:5]
        
        for assignment in recent_assignments:
            activities.append({
                'id': f'assignment_{assignment.id}',
                'type': 'assignment',
                'title': f'أنشأ واجب: {assignment.title}',
                'description': f'مقرر: {assignment.course.title}',
                'time': assignment.created_at.strftime('%Y-%m-%d %H:%M'),
                'course': assignment.course.title
            })
    
    # ترتيب حسب التاريخ
    activities.sort(key=lambda x: x['time'], reverse=True)
    
    return JsonResponse(activities[:10], safe=False)

@login_required
def upcoming_assignments(request):
    """الواجبات القادمة"""
    user = request.user
    
    if hasattr(user, 'student'):
        # واجبات الطالب القادمة
        assignments = Assignment.objects.filter(
            course__enrollments__student=user.student,
            course__enrollments__is_active=True,
            due_date__gte=timezone.now()
        ).exclude(
            submissions__student=user.student
        ).order_by('due_date')[:10]
        
        assignments_data = []
        for assignment in assignments:
            assignments_data.append({
                'id': assignment.id,
                'type': 'assignment',
                'title': assignment.title,
                'description': f'مقرر: {assignment.course.title}',
                'time': assignment.due_date.strftime('%Y-%m-%d %H:%M'),
                'course': assignment.course.title
            })
        
        return JsonResponse(assignments_data, safe=False)
    
    return JsonResponse([], safe=False)

@login_required
def upcoming_meetings(request):
    """المحاضرات القادمة"""
    user = request.user
    
    if hasattr(user, 'student'):
        # محاضرات الطالب القادمة
        meetings = Meeting.objects.filter(
            course__enrollments__student=user.student,
            course__enrollments__is_active=True,
            start_time__gte=timezone.now()
        ).order_by('start_time')[:10]
        
        meetings_data = []
        for meeting in meetings:
            meetings_data.append({
                'id': meeting.id,
                'type': 'meeting',
                'title': meeting.title,
                'description': f'مقرر: {meeting.course.title}',
                'time': meeting.start_time.strftime('%Y-%m-%d %H:%M'),
                'course': meeting.course.title
            })
        
        return JsonResponse(meetings_data, safe=False)
    
    return JsonResponse([], safe=False)

@login_required
def achievements(request):
    """الإنجازات"""
    user = request.user
    
    if not hasattr(user, 'student'):
        return JsonResponse([], safe=False)
    
    student = user.student
    
    achievements_data = [
        {
            'id': 1,
            'title': 'المثابر',
            'description': 'أكمل 5 أيام متتالية من التعلم',
            'progress': min(student.learning_streak * 20, 100),
            'color': 'warning',
            'reward': '50 نقطة'
        },
        {
            'id': 2,
            'title': 'الطموح',
            'description': 'احصل على درجة A+ في أي مادة',
            'progress': 75,
            'color': 'info',
            'reward': '100 نقطة'
        },
        {
            'id': 3,
            'title': 'المجتهد',
            'description': 'أكمل 10 واجبات',
            'progress': 30,
            'color': 'success',
            'reward': '75 نقطة'
        }
    ]
    
    return JsonResponse(achievements_data, safe=False)

@login_required
def recent_announcements(request):
    """الإعلانات الأخيرة"""
    user = request.user
    
    if hasattr(user, 'instructor'):
        # إعلانات المعلم
        announcements = Article.objects.filter(
            author=user.instructor
        ).order_by('-created_at')[:10]
        
        announcements_data = []
        for announcement in announcements:
            announcements_data.append({
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content[:100] + '...' if len(announcement.content) > 100 else announcement.content,
                'date': announcement.created_at.strftime('%Y-%m-%d'),
                'read': True,
                'course': announcement.category.name if announcement.category else 'عام'
            })
        
        return JsonResponse(announcements_data, safe=False)
    
    return JsonResponse([], safe=False)

