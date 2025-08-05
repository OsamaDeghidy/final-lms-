from rest_framework import serializers
from .models import *


class QuizBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'quiz_type', 'is_active', 'created_at']


class QuizDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'


class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['title', 'description', 'course', 'quiz_type', 'time_limit', 'pass_mark']


class ExamBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'is_final', 'is_active', 'created_at']


class ExamDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'


class ExamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['title', 'description', 'course', 'time_limit', 'pass_mark', 'total_points']


class AssignmentBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'points', 'is_active', 'created_at']


class AssignmentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'


class AssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['title', 'description', 'course', 'due_date', 'points', 'allow_late_submissions']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'


class AssignmentSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ['assignment', 'submission_text', 'submitted_file']


class AssignmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentQuestion
        fields = '__all__'


class AssignmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentAnswer
        fields = '__all__'


class AssignmentQuestionWithAnswersSerializer(serializers.ModelSerializer):
    answers = AssignmentAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssignmentQuestion
        fields = '__all__'


class AssignmentDetailWithQuestionsSerializer(serializers.ModelSerializer):
    questions = AssignmentQuestionWithAnswersSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assignment
        fields = '__all__'


class AssignmentQuestionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentQuestionResponse
        fields = '__all__'


class AssignmentSubmissionWithResponsesSerializer(serializers.ModelSerializer):
    question_responses = AssignmentQuestionResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__' 