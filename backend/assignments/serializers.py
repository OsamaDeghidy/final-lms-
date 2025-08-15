from rest_framework import serializers
from .models import *


class QuizBasicSerializer(serializers.ModelSerializer):
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'quiz_type', 'is_active', 'created_at', 'course', 'module']
    
    def get_course(self, obj):
        if obj.course:
            return {
                'id': obj.course.id,
                'title': obj.course.title
            }
        return None
    
    def get_module(self, obj):
        if obj.module:
            return {
                'id': obj.module.id,
                'name': obj.module.name
            }
        return None


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = '__all__'
    
    def get_questions(self, obj):
        return QuizQuestionSerializer(obj.questions.all(), many=True).data
    
    def get_course(self, obj):
        if obj.course:
            return {
                'id': obj.course.id,
                'title': obj.course.title
            }
        return None
    
    def get_module(self, obj):
        if obj.module:
            return {
                'id': obj.module.id,
                'name': obj.module.name
            }
        return None


class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'module', 'quiz_type', 'time_limit', 'pass_mark', 'is_active']


class QuizUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'module', 'quiz_type', 'time_limit', 'pass_mark', 'is_active']


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'explanation', 'order']


class QuizQuestionSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order', 'answers']


class QuizQuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'question_type', 'points', 'explanation', 'image', 'order']


class QuizQuestionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['text', 'question_type', 'points', 'explanation', 'image', 'order']


class QuizAnswerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'question', 'text', 'is_correct', 'explanation', 'order']


class QuizAnswerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['text', 'is_correct', 'explanation', 'order']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'start_time', 'end_time', 'score', 'passed', 'attempt_number']


class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['quiz']


class QuizUserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizUserAnswer
        fields = ['id', 'attempt', 'question', 'selected_answer', 'text_answer', 'is_correct', 'points_earned']


class QuizUserAnswerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizUserAnswer
        fields = ['question', 'selected_answer', 'text_answer']


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
        fields = [
            'title', 'description', 'course', 'module', 'due_date', 'points',
            'allow_late_submissions', 'late_submission_penalty',
            'has_questions', 'has_file_upload', 'assignment_file', 'is_active'
        ]


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