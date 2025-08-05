from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models

from .models import (
    Quiz, Question, Answer, QuizAttempt, QuizUserAnswer,
    Exam, ExamQuestion, ExamAnswer, UserExamAttempt, UserExamAnswer,
    Assignment, AssignmentSubmission, AssignmentQuestion, AssignmentAnswer, AssignmentQuestionResponse
)
from .serializers import *


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for Quiz management"""
    queryset = Quiz.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'quiz_type', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return QuizCreateSerializer
        elif self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizBasicSerializer


class ExamViewSet(viewsets.ModelViewSet):
    """ViewSet for Exam management"""
    queryset = Exam.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'is_final', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'start_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return ExamCreateSerializer
        elif self.action == 'retrieve':
            return ExamDetailSerializer
        return ExamBasicSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment management"""
    queryset = Assignment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return AssignmentCreateSerializer
        elif self.action == 'retrieve':
            return AssignmentDetailWithQuestionsSerializer
        return AssignmentBasicSerializer


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment Submission management"""
    queryset = AssignmentSubmission.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['assignment', 'status', 'is_late']
    search_fields = ['assignment__title']
    ordering_fields = ['submitted_at', 'grade']
    ordering = ['-submitted_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return AssignmentSubmissionCreateSerializer
        elif self.action == 'retrieve':
            return AssignmentSubmissionWithResponsesSerializer
        return AssignmentSubmissionSerializer


class AssignmentQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment Question management"""
    queryset = AssignmentQuestion.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['assignment', 'question_type', 'is_required']
    search_fields = ['text', 'explanation']
    ordering_fields = ['order', 'points']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AssignmentQuestionWithAnswersSerializer
        return AssignmentQuestionSerializer


class AssignmentAnswerViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment Answer management"""
    queryset = AssignmentAnswer.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['question', 'is_correct']
    search_fields = ['text', 'explanation']
    ordering_fields = ['order']
    ordering = ['order']

    def get_serializer_class(self):
        return AssignmentAnswerSerializer


class AssignmentQuestionResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for Assignment Question Response management"""
    queryset = AssignmentQuestionResponse.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['submission', 'question']
    search_fields = ['text_answer', 'feedback']
    ordering_fields = ['points_earned']
    ordering = ['-points_earned']

    def get_serializer_class(self):
        return AssignmentQuestionResponseSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_assignments(request):
    """Get current user's assignments"""
    user = request.user
    assignments = Assignment.objects.filter(
        course__enroller_user=user
    ).distinct()[:10]
    
    serializer = AssignmentBasicSerializer(assignments, many=True, context={'request': request})
    return Response({
        'assignments': serializer.data,
        'total': assignments.count()
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_statistics(request, quiz_id):
    """Get quiz statistics"""
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        attempts = QuizAttempt.objects.filter(quiz=quiz)
        
        stats = {
            'total_attempts': attempts.count(),
            'passed_attempts': attempts.filter(passed=True).count(),
            'average_score': attempts.aggregate(avg_score=models.Avg('score'))['avg_score'] or 0
        }
        
        return Response(stats)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def assignment_questions(request, assignment_id):
    """Get assignment questions"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        questions = assignment.questions.all()
        serializer = AssignmentQuestionWithAnswersSerializer(questions, many=True)
        return Response(serializer.data)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_assignment_with_questions(request, assignment_id):
    """Submit assignment with question responses"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        user = request.user
        
        # Check if user already submitted
        existing_submission = AssignmentSubmission.objects.filter(
            assignment=assignment, user=user
        ).first()
        
        if existing_submission:
            return Response(
                {'error': 'You have already submitted this assignment'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create submission
        submission_data = {
            'assignment': assignment,
            'user': user,
            'submission_text': request.data.get('submission_text', ''),
            'submitted_file': request.FILES.get('submitted_file')
        }
        
        submission = AssignmentSubmission.objects.create(**submission_data)
        
        # Create question responses
        question_responses = request.data.get('question_responses', [])
        for response_data in question_responses:
            question_id = response_data.get('question_id')
            try:
                question = AssignmentQuestion.objects.get(id=question_id, assignment=assignment)
                
                response = AssignmentQuestionResponse.objects.create(
                    submission=submission,
                    question=question,
                    text_answer=response_data.get('text_answer'),
                    selected_answer_id=response_data.get('selected_answer_id'),
                    file_answer=response_data.get('file_answer')
                )
            except AssignmentQuestion.DoesNotExist:
                continue
        
        serializer = AssignmentSubmissionWithResponsesSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST) 