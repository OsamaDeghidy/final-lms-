import os
from datetime import datetime, timedelta

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F, Count, Case, When, Value, IntegerField
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Assignment, AssignmentSubmission, AssignmentGrade,
    AssignmentFile, SubmissionComment, AssignmentGroup
)
from .serializers import (
    AssignmentSerializer, AssignmentDetailSerializer,
    AssignmentCreateSerializer, AssignmentUpdateSerializer,
    AssignmentSubmissionSerializer, SubmissionDetailSerializer,
    AssignmentGradeSerializer, GradeUpdateSerializer,
    AssignmentFileSerializer, SubmissionCommentSerializer,
    AssignmentGroupSerializer
)
from courses.models import Course, Module
from users.models import User

class AssignmentBaseView:
    """Base view for assignment functionality"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'course', 'module', 'assignment_group']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'points']
    ordering = ['-due_date']


class AssignmentListView(AssignmentBaseView, generics.ListCreateAPIView):
    """List and create assignments"""
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AssignmentCreateSerializer
        return AssignmentSerializer
    
    def get_queryset(self):
        # Show assignments for courses the user is enrolled in or is teaching
        user = self.request.user
        if user.role == 'instructor':
            return Assignment.objects.filter(
                Q(course__instructor=user) | Q(created_by=user)
            ).distinct().select_related('course', 'module', 'created_by')
        
        # For students, only show published assignments in enrolled courses
        return Assignment.objects.filter(
            course__enrollments__student=user,
            status='published'
        ).select_related('course', 'module', 'created_by')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AssignmentDetailView(AssignmentBaseView, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an assignment"""
    serializer_class = AssignmentDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Assignment.objects.filter(
                Q(course__instructor=user) | Q(created_by=user)
            ).distinct()
        return Assignment.objects.filter(
            course__enrollments__student=user,
            status='published'
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AssignmentUpdateSerializer
        return AssignmentDetailSerializer
    
    def perform_update(self, serializer):
        # Only instructors can update assignments
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied(
                "Only instructors can update assignments."
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only instructors can delete assignments
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied(
                "Only instructors can delete assignments."
            )
        instance.delete()


class AssignmentSubmissionView(AssignmentBaseView, generics.ListCreateAPIView):
    """List and create assignment submissions"""
    serializer_class = AssignmentSubmissionSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        assignment_id = self.kwargs['assignment_id']
        user = self.request.user
        
        # Instructors can see all submissions for their assignments
        if user.role == 'instructor':
            return AssignmentSubmission.objects.filter(
                assignment_id=assignment_id,
                assignment__course__instructor=user
            ).select_related('student', 'assignment')
        
        # Students can only see their own submissions
        return AssignmentSubmission.objects.filter(
            assignment_id=assignment_id,
            student=user
        ).select_related('student', 'assignment')
    
    def perform_create(self, serializer):
        assignment = get_object_or_404(Assignment, id=self.kwargs['assignment_id'])
        
        # Check if submission is allowed
        if assignment.due_date and timezone.now() > assignment.due_date + timedelta(days=1):
            raise permissions.PermissionDenied("The submission deadline has passed.")
        
        # Check for existing submission if multiple submissions are not allowed
        if not assignment.allow_multiple_submissions and \
           AssignmentSubmission.objects.filter(assignment=assignment, student=self.request.user).exists():
            raise permissions.PermissionDenied("Multiple submissions are not allowed for this assignment.")
        
        submission = serializer.save(
            assignment=assignment,
            student=self.request.user,
            submitted_at=timezone.now()
        )
        
        # Handle file uploads
        files = self.request.FILES.getlist('files')
        for file in files:
            AssignmentFile.objects.create(
                submission=submission,
                file=file,
                original_filename=file.name
            )
        
        # Notify instructor about new submission
        self.notify_instructor(submission)
    
    def notify_instructor(self, submission):
        # In a real implementation, this would send a notification to the instructor
        pass


class SubmissionDetailView(AssignmentBaseView, generics.RetrieveUpdateAPIView):
    """Retrieve or update an assignment submission"""
    serializer_class = SubmissionDetailSerializer
    lookup_field = 'submission_id'
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return AssignmentSubmission.objects.filter(
                assignment__course__instructor=user
            )
        return AssignmentSubmission.objects.filter(student=user)
    
    def perform_update(self, serializer):
        submission = self.get_object()
        
        # Only allow updates to draft submissions
        if submission.status != 'draft':
            raise permissions.PermissionDenied(
                "Only draft submissions can be updated."
            )
        
        # Handle file uploads
        files = self.request.FILES.getlist('files')
        for file in files:
            AssignmentFile.objects.create(
                submission=submission,
                file=file,
                original_filename=file.name
            )
        
        # Update submission status if needed
        if 'status' in self.request.data and self.request.data['status'] == 'submitted':
            serializer.save(submitted_at=timezone.now())
            self.notify_instructor(submission)
        else:
            serializer.save()


class GradeSubmissionView(APIView):
    """Grade an assignment submission"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, submission_id):
        submission = get_object_or_404(
            AssignmentSubmission,
            id=submission_id,
            assignment__course__instructor=request.user
        )
        
        serializer = GradeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create or update grade
        grade, created = AssignmentGrade.objects.update_or_create(
            submission=submission,
            defaults={
                'grade': serializer.validated_data['grade'],
                'feedback': serializer.validated_data.get('feedback', ''),
                'graded_by': request.user,
                'graded_at': timezone.now()
            }
        )
        
        # Update submission status
        submission.status = 'graded'
        submission.save(update_fields=['status'])
        
        # Notify student about grade
        self.notify_student(grade)
        
        return Response(
            AssignmentGradeSerializer(grade).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    def notify_student(self, grade):
        # In a real implementation, this would send a notification to the student
        pass


class AssignmentGroupView(AssignmentBaseView, generics.ListCreateAPIView):
    """List and create assignment groups"""
    serializer_class = AssignmentGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        queryset = AssignmentGroup.objects.filter(course_id=course_id)
        
        # Only instructors can see all groups
        if self.request.user.role != 'instructor':
            queryset = queryset.filter(is_visible=True)
            
        return queryset.order_by('order')
    
    def perform_create(self, serializer):
        if self.request.user.role != 'instructor':
            raise permissions.PermissionDenied(
                "Only instructors can create assignment groups."
            )
        serializer.save()


class SubmissionCommentView(AssignmentBaseView, generics.ListCreateAPIView):
    """List and create submission comments"""
    serializer_class = SubmissionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        submission_id = self.kwargs['submission_id']
        return SubmissionComment.objects.filter(
            submission_id=submission_id
        ).select_related('user')
    
    def perform_create(self, serializer):
        submission = get_object_or_404(
            AssignmentSubmission,
            id=self.kwargs['submission_id']
        )
        
        # Check if user has permission to comment
        if not (self.request.user == submission.student or 
                self.request.user == submission.assignment.course.instructor):
            raise permissions.PermissionDenied(
                "You don't have permission to comment on this submission."
            )
        
        serializer.save(
            submission=submission,
            user=self.request.user
        )


class MyGradesView(AssignmentBaseView, generics.ListAPIView):
    """View for students to see their grades"""
    serializer_class = AssignmentGradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AssignmentGrade.objects.filter(
            submission__student=self.request.user
        ).select_related('submission', 'submission__assignment')
