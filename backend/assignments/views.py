from rest_framework import status, generics, permissions, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, F, Sum, Max
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db import transaction
from django.core.exceptions import PermissionDenied
from django.core.exceptions import ValidationError
from datetime import timedelta, datetime
import logging

from .models import (
    Quiz, Question, Answer, QuizAttempt, QuizUserAnswer,
    Exam, ExamQuestion, ExamAnswer, UserExamAttempt, UserExamAnswer,
    Assignment, AssignmentQuestion, AssignmentAnswer, AssignmentSubmission, AssignmentQuestionResponse
)
from .serializers import (
    QuizBasicSerializer, QuizDetailSerializer, QuizDetailForTeacherSerializer, QuizCreateSerializer, QuizUpdateSerializer,
    QuizQuestionSerializer, QuizQuestionForTeacherSerializer, QuizQuestionCreateSerializer, QuizQuestionUpdateSerializer,
    QuizAnswerSerializer, QuizAnswerForTeacherSerializer, QuizAnswerCreateSerializer, QuizAnswerUpdateSerializer,
    QuizAttemptSerializer, QuizAttemptCreateSerializer, QuizAttemptDetailSerializer,
    QuizUserAnswerSerializer, QuizUserAnswerCreateSerializer, QuizUserAnswerDetailSerializer, QuizUserAnswerResultSerializer,
    QuizQuestionWithAnswersSerializer, QuizAnswersSubmitSerializer,
    ExamBasicSerializer, ExamDetailSerializer, ExamCreateSerializer, ExamQuestionSerializer, ExamAnswerSerializer,
    ExamAnswerForTeacherSerializer, ExamQuestionWithAnswersSerializer, ExamQuestionWithAnswersForTeacherSerializer, 
    ExamQuestionDetailSerializer, ExamQuestionCreateSerializer, ExamAnswerCreateSerializer, UserExamAttemptSerializer, 
    UserExamAttemptCreateSerializer, UserExamAnswerSerializer, UserExamAttemptDetailSerializer, UserExamAnswerCreateSerializer, UserExamAnswerDetailSerializer,
    ExamAnswerForResultSerializer, ExamQuestionForResultSerializer, UserExamAnswerResultSerializer,
    AssignmentBasicSerializer, AssignmentDetailSerializer, AssignmentCreateSerializer, 
    AssignmentQuestionSerializer, AssignmentSubmissionSerializer, AssignmentAnswerSerializer,
    AssignmentQuestionWithAnswersSerializer, AssignmentSubmissionGradeSerializer, 
    AssignmentSubmissionCreateSerializer, AssignmentQuestionResponseSerializer,
    AssignmentStudentSerializer
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_data(request, quiz_id):
    """جلب بيانات الكويز مع الأسئلة والإجابات"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id, is_active=True)
        
        # Check if user is enrolled in the course
        if quiz.course:
            from courses.models import Enrollment
            enrollment = Enrollment.objects.filter(
                student=request.user,
                course=quiz.course,
                status__in=['active', 'completed']
            ).first()
            
            if not enrollment:
                return Response({
                    'error': 'أنت غير مسجل في هذه الدورة'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's previous attempts
        attempts = QuizAttempt.objects.filter(
            user=request.user,
            quiz=quiz
        ).order_by('-attempt_number')
        
        quiz_data = {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'time_limit': quiz.time_limit,
            'pass_mark': quiz.pass_mark,
            'total_questions': quiz.get_total_questions(),
            'total_points': quiz.get_total_points(),
            'previous_attempts': [
                {
                    'attempt_number': attempt.attempt_number,
                    'score': attempt.score,
                    'passed': attempt.passed,
                    'start_time': attempt.start_time,
                    'end_time': attempt.end_time
                }
                for attempt in attempts[:5]
            ],
            'questions': []
        }
        
        # Get questions and answers
        questions = quiz.questions.all().order_by('order')
        for question in questions:
            question_data = {
                'id': question.id,
                'text': question.text,
                'question_type': question.question_type,
                'points': question.points,
                'explanation': question.explanation,
                'image': question.image.url if question.image else None,
                'order': question.order,
                'answers': []
            }
            
            # Get answers (without correct flag for security)
            answers = question.answers.all().order_by('order')
            for answer in answers:
                question_data['answers'].append({
                    'id': answer.id,
                    'text': answer.text,
                    'explanation': answer.explanation,
                    'order': answer.order
                })
            
            quiz_data['questions'].append(question_data)
        
        return Response(quiz_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_quiz_data: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء جلب بيانات الكويز',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_attempt(request, quiz_id):
    """تقديم محاولة كويز"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id, is_active=True)
        
        # Check enrollment
        if quiz.course:
            from courses.models import Enrollment
            enrollment = Enrollment.objects.filter(
                student=request.user,
                course=quiz.course,
                status__in=['active', 'completed']
            ).first()
            
            if not enrollment:
                return Response({
                    'error': 'أنت غير مسجل في هذه الدورة'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Get or create attempt
        attempt_number = QuizAttempt.objects.filter(
            user=request.user,
            quiz=quiz
        ).count() + 1
        
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            attempt_number=attempt_number
        )
        
        # Process answers
        answers_data = request.data.get('answers', [])
        total_points = 0
        earned_points = 0
        
        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            selected_answer_id = answer_data.get('selected_answer_id')
            text_answer = answer_data.get('text_answer')
            
            question = get_object_or_404(Question, id=question_id, quiz=quiz)
            
            # Create user answer
            user_answer = QuizUserAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_answer_id=selected_answer_id if selected_answer_id else None,
                text_answer=text_answer if text_answer else None
            )
            
            # Check if answer is correct
            is_correct = False
            if question.question_type == 'multiple_choice' and selected_answer_id:
                selected_answer = Answer.objects.get(id=selected_answer_id)
                is_correct = selected_answer.is_correct
            elif question.question_type == 'true_false' and selected_answer_id:
                selected_answer = Answer.objects.get(id=selected_answer_id)
                is_correct = selected_answer.is_correct
            elif question.question_type == 'short_answer' and text_answer:
                correct_answers = Answer.objects.filter(question=question, is_correct=True)
                is_correct = any(
                    text_answer.lower().strip() == correct.text.lower().strip()
                    for correct in correct_answers
                )
            
            user_answer.is_correct = is_correct
            user_answer.points_earned = question.points if is_correct else 0
            user_answer.save()
            
            total_points += question.points
            if is_correct:
                earned_points += question.points
        
        # Calculate score and complete attempt
        score = (earned_points / total_points * 100) if total_points > 0 else 0
        passed = score >= quiz.pass_mark
        
        attempt.score = score
        attempt.passed = passed
        attempt.end_time = timezone.now()
        attempt.save()
        
        return Response({
            'attempt_id': attempt.id,
            'score': score,
            'passed': passed,
            'total_points': total_points,
            'earned_points': earned_points,
            'pass_mark': quiz.pass_mark,
            'attempt_number': attempt_number
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in submit_quiz_attempt: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء تقديم الكويز',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exam_data(request, exam_id):
    """جلب بيانات الامتحان"""
    try:
        exam = get_object_or_404(Exam, id=exam_id, is_active=True)
        
        # Check enrollment
        from courses.models import Enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=exam.course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's attempts
        attempts = UserExamAttempt.objects.filter(
            user=request.user,
            exam=exam
        ).order_by('-attempt_number')
        
        # Check if user can take the exam
        can_take = True
        if not exam.allow_multiple_attempts and attempts.exists():
            can_take = False
        elif exam.max_attempts and attempts.count() >= exam.max_attempts:
            can_take = False
        
        exam_data = {
            'id': exam.id,
            'title': exam.title,
            'description': exam.description,
            'time_limit': exam.time_limit,
            'pass_mark': exam.pass_mark,
            'is_final': exam.is_final,
            'total_points': exam.total_points,
            'total_questions': exam.questions.count(),
            'allow_multiple_attempts': exam.allow_multiple_attempts,
            'max_attempts': exam.max_attempts,
            'show_answers_after': exam.show_answers_after,
            'can_take': can_take,
            'previous_attempts': [
                {
                    'id': attempt.id,
                    'attempt_number': attempt.attempt_number,
                    'score': attempt.score,
                    'passed': attempt.passed,
                    'start_time': attempt.start_time,
                    'end_time': attempt.end_time
                }
                for attempt in attempts
            ],
            'questions': []
        }
        
        # Get questions and answers
        questions = exam.questions.all().order_by('order')
        for question in questions:
            question_data = {
                'id': question.id,
                'text': question.text,
                'question_type': question.question_type,
                'points': question.points,
                'explanation': question.explanation,
                'image': question.image.url if question.image else None,
                'order': question.order,
                'answers': []
            }
            
            # Get answers
            answers = question.answers.all().order_by('order')
            for answer in answers:
                question_data['answers'].append({
                    'id': answer.id,
                    'text': answer.text,
                    'explanation': answer.explanation,
                    'order': answer.order
                })
            
            exam_data['questions'].append(question_data)
        
        return Response(exam_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_exam_data: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء جلب بيانات الامتحان',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_exam_attempt(request, exam_id):
    """تقديم محاولة امتحان"""
    try:
        exam = get_object_or_404(Exam, id=exam_id, is_active=True)
        
        # Check enrollment
        from courses.models import Enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=exam.course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user can take the exam
        attempts = UserExamAttempt.objects.filter(user=request.user, exam=exam)
        if not exam.allow_multiple_attempts and attempts.exists():
            return Response({
                'error': 'لا يمكنك تقديم هذا الامتحان مرة أخرى'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if exam.max_attempts and attempts.count() >= exam.max_attempts:
            return Response({
                'error': 'لقد استنفذت عدد المحاولات المسموحة'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create attempt
        attempt_number = attempts.count() + 1
        attempt = UserExamAttempt.objects.create(
            user=request.user,
            exam=exam,
            attempt_number=attempt_number
        )
        
        # Process answers
        answers_data = request.data.get('answers', [])
        total_points = 0
        earned_points = 0
        
        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            selected_answer_id = answer_data.get('selected_answer_id')
            text_answer = answer_data.get('text_answer')
            
            question = get_object_or_404(ExamQuestion, id=question_id, exam=exam)
            
            # Create user answer
            user_answer = UserExamAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_answer_id=selected_answer_id if selected_answer_id else None,
                text_answer=text_answer if text_answer else None
            )
            
            # Check if answer is correct
            is_correct = False
            if question.question_type == 'multiple_choice' and selected_answer_id:
                selected_answer = ExamAnswer.objects.get(id=selected_answer_id)
                is_correct = selected_answer.is_correct
            elif question.question_type == 'true_false' and selected_answer_id:
                selected_answer = ExamAnswer.objects.get(id=selected_answer_id)
                is_correct = selected_answer.is_correct
            elif question.question_type == 'short_answer' and text_answer:
                correct_answers = ExamAnswer.objects.filter(question=question, is_correct=True)
                is_correct = any(
                    text_answer.lower().strip() == correct.text.lower().strip()
                    for correct in correct_answers
                )
            
            user_answer.is_correct = is_correct
            user_answer.points_earned = question.points if is_correct else 0
            user_answer.save()
            
            total_points += question.points
            if is_correct:
                earned_points += question.points
        
        # Calculate score and complete attempt
        score = (earned_points / total_points * 100) if total_points > 0 else 0
        passed = score >= exam.pass_mark
        
        attempt.score = score
        attempt.passed = passed
        attempt.end_time = timezone.now()
        attempt.save()
        
        return Response({
            'attempt_id': attempt.id,
            'score': score,
            'passed': passed,
            'total_points': total_points,
            'earned_points': earned_points,
            'pass_mark': exam.pass_mark,
            'attempt_number': attempt_number
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in submit_exam_attempt: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء تقديم الامتحان',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assignment_data(request, assignment_id):
    """جلب بيانات الواجب"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id, is_active=True)
        
        # Check enrollment
        from courses.models import Enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=assignment.course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's submission
        submission = AssignmentSubmission.objects.filter(
            user=request.user,
            assignment=assignment
        ).first()
        
        assignment_data = {
            'id': assignment.id,
            'title': assignment.title,
            'description': assignment.description,
            'due_date': assignment.due_date,
            'points': assignment.points,
            'allow_late_submissions': assignment.allow_late_submissions,
            'has_questions': assignment.has_questions,
            'has_file_upload': assignment.has_file_upload,
            'assignment_file': assignment.assignment_file.url if assignment.assignment_file else None,
            'total_questions': assignment.get_questions_count(),
            'is_overdue': assignment.is_overdue(),
            'submitted': submission is not None,
            'submission': None
        }
        
        if submission:
            assignment_data['submission'] = {
                'id': submission.id,
                'submission_text': submission.submission_text,
                'submitted_file': submission.submitted_file.url if submission.submitted_file else None,
                'status': submission.status,
                'grade': submission.grade,
                'feedback': submission.feedback,
                'submitted_at': submission.submitted_at,
                'is_late': submission.is_late
            }
        
        # Get questions if assignment has questions
        if assignment.has_questions:
            assignment_data['questions'] = []
            questions = assignment.questions.all().order_by('order')
            for question in questions:
                question_data = {
                    'id': question.id,
                    'text': question.text,
                    'question_type': question.question_type,
                    'points': question.points,
                    'explanation': question.explanation,
                    'image': question.image.url if question.image else None,
                    'order': question.order,
                    'is_required': question.is_required,
                    'answers': []
                }
                
                # Get answers for multiple choice questions
                if question.question_type == 'multiple_choice':
                    answers = question.answers.all().order_by('order')
                    for answer in answers:
                        question_data['answers'].append({
                            'id': answer.id,
                            'text': answer.text,
                            'explanation': answer.explanation,
                            'order': answer.order
                        })
                
                assignment_data['questions'].append(question_data)
        
        return Response(assignment_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in get_assignment_data: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء جلب بيانات الواجب',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request, assignment_id):
    """تقديم واجب"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id, is_active=True)
        
        # Check enrollment
        from courses.models import Enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=assignment.course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already submitted
        existing_submission = AssignmentSubmission.objects.filter(
            user=request.user,
            assignment=assignment
        ).first()
        
        if existing_submission:
            return Response({
                'error': 'لقد قمت بتقديم هذا الواجب مسبقاً'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create submission
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            user=request.user,
            submission_text=request.data.get('submission_text', ''),
            submitted_file=request.FILES.get('submitted_file')
        )
        
        # Update module progress if assignment is associated with a module
        if hasattr(assignment, 'module') and assignment.module:
            from content.models import ModuleProgress
            try:
                module_progress = ModuleProgress.objects.get(
                    user=request.user,
                    module=assignment.module
                )
                # Mark assignment as completed (you might want to add an assignment_completed field)
                # For now, we'll just update the completion status
                module_progress.update_completion_status()
            except ModuleProgress.DoesNotExist:
                pass
        
        # Process question responses if assignment has questions
        if assignment.has_questions:
            question_responses = request.data.get('question_responses', [])
            for response_data in question_responses:
                question_id = response_data.get('question_id')
                text_answer = response_data.get('text_answer')
                selected_answer_id = response_data.get('selected_answer_id')
                file_answer = request.FILES.get(f'file_answer_{question_id}')
                
                question = get_object_or_404(AssignmentQuestion, id=question_id, assignment=assignment)
                
                AssignmentQuestionResponse.objects.create(
                    submission=submission,
                    question=question,
                    text_answer=text_answer,
                    selected_answer_id=selected_answer_id,
                    file_answer=file_answer
                )
        
        return Response({
            'submission_id': submission.id,
            'status': submission.status,
            'submitted_at': submission.submitted_at,
            'is_late': submission.is_late
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in submit_assignment: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء تقديم الواجب',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ViewSets for assignments
class AssignmentViewSet(ModelViewSet):
    """ViewSet for Assignment model"""
    queryset = Assignment.objects.select_related('course', 'module').prefetch_related('questions', 'submissions')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'module', 'is_active', 'has_questions', 'has_file_upload']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'title']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    
    def get_serializer_class(self):
        if self.action == 'list':
            # Use different serializer for students vs teachers
            user = self.request.user
            if hasattr(user, 'student'):
                return AssignmentStudentSerializer
            return AssignmentBasicSerializer
        elif self.action == 'retrieve':
            return AssignmentDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return AssignmentCreateSerializer
        return AssignmentBasicSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user role
        user = self.request.user
        if hasattr(user, 'instructor'):
            # Teachers can see assignments from their courses
            queryset = queryset.filter(course__instructor=user)
        elif hasattr(user, 'student'):
            # Students can see assignments from enrolled courses
            from courses.models import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                student=user, 
                status__in=['active', 'completed']
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(course_id__in=enrolled_courses)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for this assignment"""
        assignment = self.get_object()
        submissions = assignment.submissions.select_related('user').all()
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def questions_with_answers(self, request, pk=None):
        """Get assignment questions with their answers"""
        assignment = self.get_object()
        questions = assignment.questions.prefetch_related('answers').order_by('order')
        serializer = AssignmentQuestionWithAnswersSerializer(questions, many=True)
        return Response(serializer.data)


class AssignmentQuestionViewSet(ModelViewSet):
    """ViewSet for AssignmentQuestion model"""
    queryset = AssignmentQuestion.objects.select_related('assignment').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['assignment', 'question_type', 'is_required']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']  # Explicitly allow POST

    def get_serializer_class(self):
        return AssignmentQuestionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by assignment if provided
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see questions from their course assignments
                # Use instructors (ManyToManyField) instead of instructor (ForeignKey)
                queryset = queryset.filter(assignment__course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see questions from enrolled course assignments
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(assignment__course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(assignment__course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(assignment__course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Auto-assign order if not provided
        if 'order' not in serializer.validated_data or serializer.validated_data.get('order') in [None, 0]:
            assignment = serializer.validated_data['assignment']
            max_order = assignment.questions.aggregate(max_o=Max('order')).get('max_o') or 0
            serializer.validated_data['order'] = max_order + 1
        
        # Check if user has permission to create questions for this assignment
        user = self.request.user
        assignment = serializer.validated_data['assignment']
        
        # Check if user is instructor through Profile
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # For instructors, check if they own the course
                # Use instructors (ManyToManyField) instead of instructor (ForeignKey)
                if not assignment.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only create questions for your own course assignments")
            else:
                raise PermissionDenied("Only instructors can create assignment questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not assignment.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only create questions for your own course assignments")
            else:
                raise PermissionDenied("Only instructors can create assignment questions")
        
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class AssignmentSubmissionViewSet(ModelViewSet):
    """ViewSet for AssignmentSubmission model"""
    queryset = AssignmentSubmission.objects.select_related('assignment', 'user').prefetch_related('question_responses')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['assignment', 'user', 'status', 'is_late']
    ordering_fields = ['submitted_at', 'graded_at']
    ordering = ['-submitted_at']

    def get_serializer_class(self):
        if self.action == 'grade':
            return AssignmentSubmissionGradeSerializer
        elif self.action == 'create':
            return AssignmentSubmissionCreateSerializer
        return AssignmentSubmissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by assignment if provided
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        
        # Filter by user if provided
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by user role
        user = self.request.user
        if hasattr(user, 'instructor'):
            # Teachers can see submissions from their courses
            queryset = queryset.filter(assignment__course__instructor=user)
        elif hasattr(user, 'student'):
            # Students can only see their own submissions
            queryset = queryset.filter(user=user)
        
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'non_field_errors': [str(e)]},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def perform_create(self, serializer):
        # Check if user already submitted this assignment
        assignment = serializer.validated_data.get('assignment')
        user = self.request.user
        
        existing_submission = AssignmentSubmission.objects.filter(
            user=user,
            assignment=assignment
        ).first()
        
        if existing_submission:
            raise ValidationError('لقد قمت بتقديم هذا الواجب مسبقاً')
        
        # Create the submission
        submission = serializer.save(user=user)
        
        # Handle question responses if present
        question_responses_data = serializer.validated_data.get('question_responses', '[]')
        if question_responses_data and question_responses_data != '[]':
            serializer.create_question_responses(submission, question_responses_data)
    
    @action(detail=True, methods=['patch'])
    def grade(self, request, pk=None):
        """Grade a submission"""
        submission = self.get_object()
        serializer = AssignmentSubmissionGradeSerializer(
            submission, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my(self, request):
        """Get current user's submissions"""
        queryset = self.get_queryset().filter(user=request.user)
        serializer = AssignmentSubmissionSerializer(queryset, many=True)
        return Response(serializer.data)


class AssignmentAnswerViewSet(ModelViewSet):
    """ViewSet for AssignmentAnswer model"""
    queryset = AssignmentAnswer.objects.select_related('question').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['question', 'is_correct']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']  # Explicitly allow POST

    def get_serializer_class(self):
        return AssignmentAnswerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by question if provided
        question_id = self.request.query_params.get('question')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see answers from their course assignment questions
                # Use instructors (ManyToManyField) instead of instructor (ForeignKey)
                queryset = queryset.filter(question__assignment__course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see answers from enrolled course assignment questions
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(question__assignment__course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(question__assignment__course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(question__assignment__course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Auto-assign order if not provided
        if 'order' not in serializer.validated_data or serializer.validated_data.get('order') in [None, 0]:
            question = serializer.validated_data['question']
            max_order = question.answers.aggregate(max_o=Max('order')).get('max_o') or 0
            serializer.validated_data['order'] = max_order + 1
        
        # Check if user has permission to create answers for this question
        user = self.request.user
        question = serializer.validated_data['question']
        
        # Check if user is instructor through Profile
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # For instructors, check if they own the course
                # Use instructors (ManyToManyField) instead of instructor (ForeignKey)
                if not question.assignment.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only create answers for your own course assignment questions")
            else:
                raise PermissionDenied("Only instructors can create assignment answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not question.assignment.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only create answers for your own course assignment questions")
            else:
                raise PermissionDenied("Only instructors can create assignment answers")
        
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class ExamViewSet(ModelViewSet):
    """ViewSet for Exam model"""
    queryset = Exam.objects.select_related('course', 'module').prefetch_related('questions').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'module', 'is_final', 'is_active']
    ordering_fields = ['created_at', 'title', 'start_date']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ExamCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return ExamDetailSerializer
        return ExamBasicSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course if provided
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by module if provided
        module_id = self.request.query_params.get('module')
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see exams from their courses
                queryset = queryset.filter(course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see exams from enrolled courses
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Check if user has permission to create exams for this course
        user = self.request.user
        course = serializer.validated_data.get('course')
        
        if course:
            try:
                profile = user.profile
                if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                    # Check if user is instructor for this course
                    if not course.instructors.filter(profile=profile).exists():
                        raise PermissionDenied("You can only create exams for your own courses")
                else:
                    raise PermissionDenied("Only instructors can create exams")
            except AttributeError:
                # If user has no profile, check if they have instructor attribute
                if hasattr(user, 'instructor'):
                    if not course.instructors.filter(id=user.instructor.id).exists():
                        raise PermissionDenied("You can only create exams for your own courses")
                else:
                    raise PermissionDenied("Only instructors can create exams")
        
        serializer.save()

    def perform_update(self, serializer):
        # Check if user has permission to update this exam
        user = self.request.user
        exam = self.get_object()
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this exam's course
                if not exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only update exams for your own courses")
            else:
                raise PermissionDenied("Only instructors can update exams")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only update exams for your own courses")
            else:
                raise PermissionDenied("Only instructors can update exams")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete this exam
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this exam's course
                if not instance.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only delete exams for your own courses")
            else:
                raise PermissionDenied("Only instructors can delete exams")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not instance.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only delete exams for your own courses")
            else:
                raise PermissionDenied("Only instructors can delete exams")
        
        instance.delete()

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for a specific exam"""
        exam = self.get_object()
        questions = exam.questions.all().prefetch_related('answers')
        serializer = ExamQuestionWithAnswersSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def attempts(self, request, pk=None):
        """Get attempts for a specific exam"""
        exam = self.get_object()
        attempts = UserExamAttempt.objects.filter(exam=exam).select_related('user')
        
        # Filter by user role
        user = request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                # Students can only see their own attempts
                attempts = attempts.filter(user=user)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Instructors can see attempts from their course students
                if not exam.course.instructors.filter(profile=profile).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            # Fallback to old method
            if hasattr(user, 'student'):
                attempts = attempts.filter(user=user)
            elif hasattr(user, 'instructor'):
                if not exam.course.instructors.filter(id=user.instructor.id).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserExamAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a specific exam"""
        exam = self.get_object()
        
        # Check if user has permission to view statistics
        user = request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                return Response({'error': 'Students cannot view exam statistics'}, status=status.HTTP_403_FORBIDDEN)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                if not exam.course.instructors.filter(profile=profile).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            if hasattr(user, 'student'):
                return Response({'error': 'Students cannot view exam statistics'}, status=status.HTTP_403_FORBIDDEN)
            elif hasattr(user, 'instructor'):
                if not exam.course.instructors.filter(id=user.instructor.id).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate statistics
        attempts = UserExamAttempt.objects.filter(exam=exam)
        total_attempts = attempts.count()
        passed_attempts = attempts.filter(passed=True).count()
        avg_score = attempts.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        
        statistics = {
            'total_attempts': total_attempts,
            'passed_attempts': passed_attempts,
            'failed_attempts': total_attempts - passed_attempts,
            'pass_rate': (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            'average_score': round(avg_score, 2),
            'total_questions': exam.questions.count(),
            'total_points': exam.total_points
        }
        
        return Response(statistics)


class ExamQuestionViewSet(ModelViewSet):
    """ViewSet for ExamQuestion model"""
    queryset = ExamQuestion.objects.select_related('exam').prefetch_related('answers').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['exam', 'question_type']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamQuestionCreateSerializer
        elif self.action in ['retrieve', 'list']:
            # Check if user is teacher/instructor
            user = self.request.user
            try:
                profile = user.profile
                if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                    return ExamQuestionWithAnswersForTeacherSerializer
            except:
                pass
            return ExamQuestionDetailSerializer
        return ExamQuestionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by exam if provided
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see questions from their course exams
                queryset = queryset.filter(exam__course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see questions from enrolled course exams
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(exam__course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(exam__course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(exam__course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Auto-assign order if not provided
        if 'order' not in serializer.validated_data or serializer.validated_data.get('order') in [None, 0]:
            exam = serializer.validated_data['exam']
            max_order = exam.questions.aggregate(max_o=Max('order')).get('max_o') or 0
            serializer.validated_data['order'] = max_order + 1
        
        # Check if user has permission to create questions for this exam
        user = self.request.user
        exam = serializer.validated_data['exam']
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this exam's course
                if not exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only create questions for your own course exams")
            else:
                raise PermissionDenied("Only instructors can create exam questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only create questions for your own course exams")
            else:
                raise PermissionDenied("Only instructors can create exam questions")
        
        serializer.save()

    def perform_update(self, serializer):
        # Check if user has permission to update this question
        user = self.request.user
        question = self.get_object()
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this question's exam course
                if not question.exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only update questions for your own course exams")
            else:
                raise PermissionDenied("Only instructors can update exam questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not question.exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only update questions for your own course exams")
            else:
                raise PermissionDenied("Only instructors can update exam questions")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete this question
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this question's exam course
                if not instance.exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only delete questions for your own course exams")
            else:
                raise PermissionDenied("Only instructors can delete exam questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not instance.exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only delete questions for your own course exams")
            else:
                raise PermissionDenied("Only instructors can delete exam questions")
        
        instance.delete()


class ExamAnswerViewSet(ModelViewSet):
    """ViewSet for ExamAnswer model"""
    queryset = ExamAnswer.objects.select_related('question').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['question', 'is_correct']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExamAnswerCreateSerializer
        
        # Check if user is teacher/instructor
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                return ExamAnswerForTeacherSerializer
        except:
            pass
        
        return ExamAnswerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by question if provided
        question_id = self.request.query_params.get('question')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see answers from their course exam questions
                queryset = queryset.filter(question__exam__course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see answers from enrolled course exam questions
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(question__exam__course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(question__exam__course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(question__exam__course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Auto-assign order if not provided
        if 'order' not in serializer.validated_data or serializer.validated_data.get('order') in [None, 0]:
            question = serializer.validated_data['question']
            max_order = question.answers.aggregate(max_o=Max('order')).get('max_o') or 0
            serializer.validated_data['order'] = max_order + 1
        
        # Check if user has permission to create answers for this question
        user = self.request.user
        question = serializer.validated_data['question']
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this question's exam course
                if not question.exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only create answers for your own course exam questions")
            else:
                raise PermissionDenied("Only instructors can create exam answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not question.exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only create answers for your own course exam questions")
            else:
                raise PermissionDenied("Only instructors can create exam answers")
        
        serializer.save()

    def perform_update(self, serializer):
        # Check if user has permission to update this answer
        user = self.request.user
        answer = self.get_object()
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this answer's question exam course
                if not answer.question.exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only update answers for your own course exam questions")
            else:
                raise PermissionDenied("Only instructors can update exam answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not answer.question.exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only update answers for your own course exam questions")
            else:
                raise PermissionDenied("Only instructors can update exam answers")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete this answer
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this answer's question exam course
                if not instance.question.exam.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only delete answers for your own course exam questions")
            else:
                raise PermissionDenied("Only instructors can delete exam answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not instance.question.exam.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only delete answers for your own course exam questions")
            else:
                raise PermissionDenied("Only instructors can delete exam answers")
        
        instance.delete()


class QuizViewSet(ModelViewSet):
    """ViewSet for Quiz model"""
    queryset = Quiz.objects.select_related('course', 'module').prefetch_related('questions').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'module', 'is_active']
    ordering_fields = ['created_at', 'title', 'start_date']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuizCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QuizUpdateSerializer
        elif self.action == 'retrieve':
            # Check if user is teacher/instructor to show correct answers
            user = self.request.user
            try:
                profile = user.profile
                if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                    return QuizDetailForTeacherSerializer
            except AttributeError:
                # Fallback to old method if no profile
                if hasattr(user, 'instructor'):
                    return QuizDetailForTeacherSerializer
            return QuizDetailSerializer
        elif self.action == 'list':
            return QuizBasicSerializer
        return QuizBasicSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course if provided
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by module if provided
        module_id = self.request.query_params.get('module')
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see quizzes from their courses
                queryset = queryset.filter(course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see quizzes from enrolled courses
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Check if user has permission to create quizzes for this course
        user = self.request.user
        course = serializer.validated_data.get('course')
        
        if course:
            try:
                profile = user.profile
                if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                    # Check if user is instructor for this course
                    if not course.instructors.filter(profile=profile).exists():
                        raise PermissionDenied("You can only create quizzes for your own courses")
                else:
                    raise PermissionDenied("Only instructors can create quizzes")
            except AttributeError:
                # If user has no profile, check if they have instructor attribute
                if hasattr(user, 'instructor'):
                    if not course.instructors.filter(id=user.instructor.id).exists():
                        raise PermissionDenied("You can only create quizzes for your own courses")
                else:
                    raise PermissionDenied("Only instructors can create quizzes")
        
        serializer.save()

    def perform_update(self, serializer):
        # Check if user has permission to update this quiz
        user = self.request.user
        quiz = self.get_object()
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this quiz's course
                if not quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only update quizzes for your own courses")
            else:
                raise PermissionDenied("Only instructors can update quizzes")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only update quizzes for your own courses")
            else:
                raise PermissionDenied("Only instructors can update quizzes")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete this quiz
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this quiz's course
                if not instance.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only delete quizzes for your own courses")
            else:
                raise PermissionDenied("Only instructors can delete quizzes")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not instance.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only delete quizzes for your own courses")
            else:
                raise PermissionDenied("Only instructors can delete quizzes")
        
        instance.delete()

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for a specific quiz"""
        quiz = self.get_object()
        questions = quiz.questions.all().prefetch_related('answers')
        serializer = QuizQuestionWithAnswersSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def attempts(self, request, pk=None):
        """Get attempts for a specific quiz"""
        quiz = self.get_object()
        attempts = QuizAttempt.objects.filter(quiz=quiz).select_related('user')
        
        # Filter by user role
        user = request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                # Students can only see their own attempts
                attempts = attempts.filter(user=user)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Instructors can see attempts from their course students
                if not quiz.course.instructors.filter(profile=profile).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            # Fallback to old method
            if hasattr(user, 'student'):
                attempts = attempts.filter(user=user)
            elif hasattr(user, 'instructor'):
                if not quiz.course.instructors.filter(id=user.instructor.id).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a specific quiz"""
        quiz = self.get_object()
        
        # Check if user has permission to view statistics
        user = request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                return Response({'error': 'Students cannot view quiz statistics'}, status=status.HTTP_403_FORBIDDEN)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                if not quiz.course.instructors.filter(profile=profile).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            if hasattr(user, 'student'):
                return Response({'error': 'Students cannot view quiz statistics'}, status=status.HTTP_403_FORBIDDEN)
            elif hasattr(user, 'instructor'):
                if not quiz.course.instructors.filter(id=user.instructor.id).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate statistics
        attempts = QuizAttempt.objects.filter(quiz=quiz)
        total_attempts = attempts.count()
        passed_attempts = attempts.filter(passed=True).count()
        avg_score = attempts.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        
        statistics = {
            'total_attempts': total_attempts,
            'passed_attempts': passed_attempts,
            'failed_attempts': total_attempts - passed_attempts,
            'pass_rate': (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            'average_score': round(avg_score, 2),
            'total_questions': quiz.get_total_questions(),
            'total_points': quiz.get_total_points()
        }
        
        return Response(statistics)


class QuizQuestionViewSet(ModelViewSet):
    """ViewSet for Question model (Quiz questions)"""
    queryset = Question.objects.select_related('quiz').prefetch_related('answers').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['quiz', 'question_type']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuizQuestionCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return QuizQuestionSerializer
        return QuizQuestionUpdateSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by quiz if provided
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see questions from their course quizzes
                queryset = queryset.filter(quiz__course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see questions from enrolled course quizzes
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(quiz__course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(quiz__course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(quiz__course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Auto-assign order if not provided
        if 'order' not in serializer.validated_data or serializer.validated_data.get('order') in [None, 0]:
            quiz = serializer.validated_data['quiz']
            max_order = quiz.questions.aggregate(max_o=Max('order')).get('max_o') or 0
            serializer.validated_data['order'] = max_order + 1
        
        # Check if user has permission to create questions for this quiz
        user = self.request.user
        quiz = serializer.validated_data['quiz']
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this quiz's course
                if not quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only create questions for your own course quizzes")
            else:
                raise PermissionDenied("Only instructors can create quiz questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only create questions for your own course quizzes")
            else:
                raise PermissionDenied("Only instructors can create quiz questions")
        
        serializer.save()

    def perform_update(self, serializer):
        # Check if user has permission to update this question
        user = self.request.user
        question = self.get_object()
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this question's quiz course
                if not question.quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only update questions for your own course quizzes")
            else:
                raise PermissionDenied("Only instructors can update quiz questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not question.quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only update questions for your own course quizzes")
            else:
                raise PermissionDenied("Only instructors can update quiz questions")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete this question
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this question's quiz course
                if not instance.quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only delete questions for your own course quizzes")
            else:
                raise PermissionDenied("Only instructors can delete quiz questions")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not instance.quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only delete questions for your own course quizzes")
            else:
                raise PermissionDenied("Only instructors can delete quiz questions")
        
        instance.delete()


class QuizAnswerViewSet(ModelViewSet):
    """ViewSet for Answer model (Quiz answers)"""
    queryset = Answer.objects.select_related('question').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['question', 'is_correct']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuizAnswerCreateSerializer
        return QuizAnswerUpdateSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by question if provided
        question_id = self.request.query_params.get('question')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Teachers can see answers from their course quiz questions
                queryset = queryset.filter(question__quiz__course__instructors__profile=profile)
            elif profile.status == 'Student':
                # Students can see answers from enrolled course quiz questions
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(question__quiz__course_id__in=enrolled_courses)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'instructor'):
                queryset = queryset.filter(question__quiz__course__instructors=user.instructor)
            elif hasattr(user, 'student'):
                from courses.models import Enrollment
                enrolled_courses = Enrollment.objects.filter(
                    student=user, 
                    status__in=['active', 'completed']
                ).values_list('course_id', flat=True)
                queryset = queryset.filter(question__quiz__course_id__in=enrolled_courses)
        
        return queryset

    def perform_create(self, serializer):
        # Auto-assign order if not provided
        if 'order' not in serializer.validated_data or serializer.validated_data.get('order') in [None, 0]:
            question = serializer.validated_data['question']
            max_order = question.answers.aggregate(max_o=Max('order')).get('max_o') or 0
            serializer.validated_data['order'] = max_order + 1
        
        # Check if user has permission to create answers for this question
        user = self.request.user
        question = serializer.validated_data['question']
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this question's quiz course
                if not question.quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only create answers for your own course quiz questions")
            else:
                raise PermissionDenied("Only instructors can create quiz answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not question.quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only create answers for your own course quiz questions")
            else:
                raise PermissionDenied("Only instructors can create quiz answers")
        
        serializer.save()

    def perform_update(self, serializer):
        # Check if user has permission to update this answer
        user = self.request.user
        answer = self.get_object()
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this answer's question quiz course
                if not answer.question.quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only update answers for your own course quiz questions")
            else:
                raise PermissionDenied("Only instructors can update quiz answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not answer.question.quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only update answers for your own course quiz questions")
            else:
                raise PermissionDenied("Only instructors can update quiz answers")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete this answer
        user = self.request.user
        
        try:
            profile = user.profile
            if profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Check if user is instructor for this answer's question quiz course
                if not instance.question.quiz.course.instructors.filter(profile=profile).exists():
                    raise PermissionDenied("You can only delete answers for your own course quiz questions")
            else:
                raise PermissionDenied("Only instructors can delete quiz answers")
        except AttributeError:
            # If user has no profile, check if they have instructor attribute
            if hasattr(user, 'instructor'):
                if not instance.question.quiz.course.instructors.filter(id=user.instructor.id).exists():
                    raise PermissionDenied("You can only delete answers for your own course quiz questions")
            else:
                raise PermissionDenied("Only instructors can delete quiz answers")
        
        instance.delete()


class QuizAttemptViewSet(ModelViewSet):
    """ViewSet for QuizAttempt model"""
    queryset = QuizAttempt.objects.select_related('user', 'quiz').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['quiz', 'user', 'passed']
    ordering_fields = ['start_time', 'end_time', 'score']
    ordering = ['-start_time']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuizAttemptCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return QuizAttemptDetailSerializer
        return QuizAttemptSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by quiz if provided
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                # Students can only see their own attempts
                queryset = queryset.filter(user=user)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Instructors can see attempts from their course students
                queryset = queryset.filter(quiz__course__instructors__profile=profile)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'student'):
                queryset = queryset.filter(user=user)
            elif hasattr(user, 'instructor'):
                queryset = queryset.filter(quiz__course__instructors=user.instructor)
        
        return queryset

    def perform_create(self, serializer):
        # Check if user has permission to create attempts for this quiz
        user = self.request.user
        quiz = serializer.validated_data['quiz']
        
        # Check if user is enrolled in the course
        from courses.models import Enrollment
        enrollment = Enrollment.objects.filter(
            student=user,
            course=quiz.course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            raise PermissionDenied("You must be enrolled in the course to take this quiz")
        
        # Check if user has already taken the quiz (allow multiple attempts by default)
        # Note: Quiz model doesn't have allow_multiple_attempts field, so we allow multiple attempts
        existing_attempts = QuizAttempt.objects.filter(user=user, quiz=quiz)
        
        # Calculate the next attempt number
        next_attempt_number = existing_attempts.count() + 1
        
        # For now, we allow unlimited attempts since the model doesn't have max_attempts field
        # This can be customized later if needed
        
        # Create the attempt with the calculated attempt_number
        attempt = serializer.save(user=user, attempt_number=next_attempt_number)
        return attempt

    @action(detail=True, methods=['patch'])
    def finish(self, request, pk=None):
        """Finish a quiz attempt"""
        attempt = self.get_object()
        
        # Check if user owns this attempt
        if attempt.user != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate score and mark as finished
        from django.utils import timezone
        attempt.end_time = timezone.now()
        attempt.calculate_score()
        attempt.save()
        
        serializer = QuizAttemptDetailSerializer(attempt)
        return Response(serializer.data)


class QuizUserAnswerViewSet(ModelViewSet):
    """ViewSet for QuizUserAnswer model"""
    queryset = QuizUserAnswer.objects.select_related('attempt', 'question', 'selected_answer').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['attempt', 'question', 'is_correct']
    ordering_fields = ['id', 'question__order']
    ordering = ['id']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return QuizUserAnswerCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return QuizUserAnswerDetailSerializer
        return QuizUserAnswerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by attempt if provided
        attempt_id = self.request.query_params.get('attempt')
        if attempt_id:
            queryset = queryset.filter(attempt_id=attempt_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                # Students can only see their own answers
                queryset = queryset.filter(attempt__user=user)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Instructors can see answers from their course students
                queryset = queryset.filter(attempt__quiz__course__instructors__profile=profile)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'student'):
                queryset = queryset.filter(attempt__user=user)
            elif hasattr(user, 'instructor'):
                queryset = queryset.filter(attempt__quiz__course__instructors=user.instructor)
        
        return queryset

    def perform_create(self, serializer):
        # Check if user has permission to create answers for this attempt
        user = self.request.user
        attempt = serializer.validated_data['attempt']
        
        # Check if user owns this attempt
        if attempt.user != user:
            raise PermissionDenied("You can only submit answers for your own attempts")
        
        # Check if attempt is still active
        if attempt.end_time:
            raise PermissionDenied("Cannot submit answers to a finished attempt")
        
        serializer.save()

    @action(detail=False, methods=['post'])
    def submit_answers(self, request):
        """Submit multiple answers at once"""
        print(f"🔍 submit_answers called with data: {request.data}")
        
        attempt_id = request.data.get('attempt')
        answers_data = request.data.get('answers', [])
        
        print(f"🔍 attempt_id: {attempt_id}")
        print(f"🔍 answers_data: {answers_data}")
        
        if not attempt_id:
            return Response({'error': 'Attempt ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user)
            print(f"🔍 Found attempt: {attempt.id}")
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if attempt is still active
        if attempt.end_time:
            return Response({'error': 'Cannot submit answers to a finished attempt'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create answers
        created_answers = []
        for i, answer_data in enumerate(answers_data):
            print(f"🔍 Processing answer {i}: {answer_data}")
            answer_data['attempt'] = attempt_id
            serializer = QuizUserAnswerCreateSerializer(data=answer_data)
            if serializer.is_valid():
                answer = serializer.save()
                print(f"✅ Created answer: {answer.id}")
                created_answers.append(answer)
            else:
                print(f"❌ Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"🔍 Total created answers: {len(created_answers)}")
        
        # Return created answers
        serializer = QuizUserAnswerDetailSerializer(created_answers, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def result_answers(self, request):
        """Get quiz attempt answers with correct answers for results"""
        attempt_id = request.query_params.get('attempt')
        
        print(f"🔍 result_answers called with attempt_id: {attempt_id}")
        
        if not attempt_id:
            return Response({'error': 'Attempt ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user)
            print(f"🔍 Found attempt: {attempt.id}")
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get answers with correct answer info
        answers = QuizUserAnswer.objects.filter(attempt=attempt).select_related('question', 'selected_answer').prefetch_related('question__answers')
        print(f"🔍 Found {answers.count()} answers for attempt {attempt_id}")
        
        for answer in answers:
            print(f"🔍 Answer {answer.id}: question={answer.question.id}, selected_answer={answer.selected_answer_id}, text_answer={answer.text_answer}, is_correct={answer.is_correct}")
        
        serializer = QuizUserAnswerResultSerializer(answers, many=True)
        print(f"🔍 Serialized data: {serializer.data}")
        return Response(serializer.data)


class ExamAttemptViewSet(ModelViewSet):
    """ViewSet for UserExamAttempt model"""
    queryset = UserExamAttempt.objects.select_related('user', 'exam').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['exam', 'user', 'passed']
    ordering_fields = ['start_time', 'end_time', 'score']
    ordering = ['-start_time']
    http_method_names = ['get', 'post', 'patch']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserExamAttemptCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return UserExamAttemptDetailSerializer
        return UserExamAttemptSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by exam if provided
        exam_id = self.request.query_params.get('exam')
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                # Students can only see their own attempts
                queryset = queryset.filter(user=user)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Instructors can see attempts from their course students
                queryset = queryset.filter(exam__course__instructors__profile=profile)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'student'):
                queryset = queryset.filter(user=user)
            elif hasattr(user, 'instructor'):
                queryset = queryset.filter(exam__course__instructors=user.instructor)
        
        return queryset

    def perform_create(self, serializer):
        print(f"ExamAttemptViewSet.perform_create called")
        print(f"User: {self.request.user}")
        print(f"Validated data: {serializer.validated_data}")
        
        # The create method in the serializer handles user assignment
        attempt = serializer.save()
        print(f"Created attempt: {attempt.id}")
        return attempt

    @action(detail=True, methods=['patch'])
    def finish(self, request, pk=None):
        """Finish an exam attempt"""
        print(f"finish method called for attempt {pk}")
        print(f"User: {request.user}")
        
        attempt = self.get_object()
        print(f"Found attempt: {attempt.id}")
        
        # Check if user owns this attempt
        if attempt.user != request.user:
            print("User doesn't own this attempt")
            raise PermissionDenied("You can only finish your own attempts")
        
        # Check if attempt is already finished
        if attempt.end_time:
            print("Attempt already finished")
            return Response({'error': 'Attempt is already finished'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set end time and calculate score
        attempt.end_time = timezone.now()
        print(f"Set end time: {attempt.end_time}")
        
        attempt.calculate_score()
        print(f"Calculated score: {attempt.score}")
        
        serializer = UserExamAttemptDetailSerializer(attempt)
        print(f"Returning attempt data: {serializer.data}")
        return Response(serializer.data)


class ExamUserAnswerViewSet(ModelViewSet):
    """ViewSet for UserExamAnswer model"""
    queryset = UserExamAnswer.objects.select_related('attempt', 'question', 'selected_answer').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['attempt', 'question', 'is_correct']
    ordering_fields = ['id', 'question__order']
    ordering = ['id']
    http_method_names = ['get', 'post']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserExamAnswerCreateSerializer
        elif self.action in ['retrieve', 'list']:
            return UserExamAnswerDetailSerializer
        return UserExamAnswerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by attempt if provided
        attempt_id = self.request.query_params.get('attempt')
        if attempt_id:
            queryset = queryset.filter(attempt_id=attempt_id)
        
        # Filter by user role
        user = self.request.user
        try:
            profile = user.profile
            if profile.status == 'Student':
                # Students can only see their own answers
                queryset = queryset.filter(attempt__user=user)
            elif profile.status == 'Instructor' or profile.status == 'Admin' or user.is_superuser:
                # Instructors can see answers from their course students
                queryset = queryset.filter(attempt__exam__course__instructors__profile=profile)
        except AttributeError:
            # Fallback to old method if no profile
            if hasattr(user, 'student'):
                queryset = queryset.filter(attempt__user=user)
            elif hasattr(user, 'instructor'):
                queryset = queryset.filter(attempt__exam__course__instructors=user.instructor)
        
        return queryset

    def perform_create(self, serializer):
        # Check if user has permission to create answers for this attempt
        user = self.request.user
        attempt = serializer.validated_data['attempt']
        
        # Check if user owns this attempt
        if attempt.user != user:
            raise PermissionDenied("You can only submit answers for your own attempts")
        
        # Check if attempt is still active
        if attempt.end_time:
            raise PermissionDenied("Cannot submit answers to a finished attempt")
        
        serializer.save()

    @action(detail=False, methods=['post'])
    def submit_answers(self, request):
        """Submit multiple exam answers at once"""
        print(f"submit_answers called with data: {request.data}")
        print(f"User: {request.user}")
        
        attempt_id = request.data.get('attempt')
        answers_data = request.data.get('answers', [])
        
        print(f"Attempt ID: {attempt_id}")
        print(f"Answers data: {answers_data}")
        
        if not attempt_id:
            print("No attempt ID provided")
            return Response({'error': 'Attempt ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            attempt = UserExamAttempt.objects.get(id=attempt_id, user=request.user)
            print(f"Found attempt: {attempt.id}")
        except UserExamAttempt.DoesNotExist:
            print("Attempt not found")
            return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if attempt is still active
        if attempt.end_time:
            print("Attempt already finished")
            return Response({'error': 'Cannot submit answers to a finished attempt'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create answers with auto marking
        created_answers = []
        for i, answer_data in enumerate(answers_data):
            print(f"Processing answer {i}: {answer_data}")
            answer_data['attempt'] = attempt_id
            serializer = UserExamAnswerCreateSerializer(data=answer_data)
            if serializer.is_valid():
                answer = serializer.save()
                
                # Apply auto marking
                self._apply_auto_marking(answer)
                
                created_answers.append(answer)
                print(f"Created answer: {answer.id}, is_correct: {answer.is_correct}, points_earned: {answer.points_earned}")
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Return created answers
        serializer = UserExamAnswerDetailSerializer(created_answers, many=True)
        print(f"Returning {len(created_answers)} answers")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _apply_auto_marking(self, user_answer):
        """Apply automatic marking to a user answer"""
        question = user_answer.question
        
        print(f"Applying auto marking for question {question.id} (type: {question.question_type})")
        
        is_correct = False
        points_earned = 0
        
        if question.question_type in ['multiple_choice', 'true_false']:
            if user_answer.selected_answer:
                is_correct = user_answer.selected_answer.is_correct
                points_earned = question.points if is_correct else 0
                print(f"Selected answer: {user_answer.selected_answer.id}, is_correct: {is_correct}")
        elif question.question_type == 'short_answer' and user_answer.text_answer:
            # For short answer questions, check against correct answers
            correct_answers = ExamAnswer.objects.filter(question=question, is_correct=True)
            is_correct = any(
                user_answer.text_answer.lower().strip() == correct.text.lower().strip()
                for correct in correct_answers
            )
            points_earned = question.points if is_correct else 0
            print(f"Text answer: '{user_answer.text_answer}', is_correct: {is_correct}")
        
        # Update the user answer
        user_answer.is_correct = is_correct
        user_answer.points_earned = points_earned
        user_answer.save(update_fields=['is_correct', 'points_earned'])
        
        print(f"Updated answer: is_correct={is_correct}, points_earned={points_earned}")

    @action(detail=False, methods=['get'])
    def result_answers(self, request):
        """Get exam attempt answers with correct answers for results"""
        attempt_id = request.query_params.get('attempt')
        
        if not attempt_id:
            return Response({'error': 'Attempt ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            attempt = UserExamAttempt.objects.get(id=attempt_id, user=request.user)
        except UserExamAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get answers with correct answer info
        answers = UserExamAnswer.objects.filter(attempt=attempt).select_related('question', 'selected_answer').prefetch_related('question__answers')
        serializer = UserExamAnswerResultSerializer(answers, many=True)
        return Response(serializer.data)


 