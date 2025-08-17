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
    """Detailed quiz serializer with questions and answers"""
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'module', 'course', 'quiz_type',
            'start_time', 'time_limit', 'pass_mark', 'created_at', 'updated_at',
            'is_active', 'questions'
        ]
    
    def get_questions(self, obj):
        """Get questions with their answers"""
        questions = obj.questions.all().prefetch_related('answers')
        return QuizQuestionWithAnswersSerializer(questions, many=True).data


class QuizQuestionWithAnswersSerializer(serializers.ModelSerializer):
    """Question serializer with answers"""
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order', 'answers']
    
    def get_answers(self, obj):
        """Get answers for the question"""
        answers = obj.answers.all()
        return QuizAnswerSerializer(answers, many=True).data


class QuizAnswerSerializer(serializers.ModelSerializer):
    """Answer serializer without correct answer info for students"""
    class Meta:
        model = Answer
        fields = ['id', 'text', 'explanation', 'order']


class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'module', 'quiz_type', 'time_limit', 'pass_mark', 'is_active']


class QuizUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'module', 'quiz_type', 'time_limit', 'pass_mark', 'is_active']


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
        fields = ['question', 'text', 'is_correct', 'explanation', 'order']


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


class QuizAnswersSubmitSerializer(serializers.Serializer):
    """Serializer for submitting multiple quiz answers at once"""
    attempt = serializers.PrimaryKeyRelatedField(queryset=QuizAttempt.objects.all())
    answers = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    def validate_answers(self, value):
        """Validate the answers format"""
        for answer in value:
            if 'question' not in answer:
                raise serializers.ValidationError("Each answer must contain a 'question' field")
            
            # Check if question exists
            try:
                question = Question.objects.get(id=answer['question'])
            except Question.DoesNotExist:
                raise serializers.ValidationError(f"Question with id {answer['question']} does not exist")
            
            # Validate answer type based on question type
            if question.question_type in ['multiple_choice', 'true_false']:
                if 'selected_answer' not in answer:
                    raise serializers.ValidationError(f"Question {question.id} requires a 'selected_answer' field")
            elif question.question_type == 'short_answer':
                if 'text_answer' not in answer:
                    raise serializers.ValidationError(f"Question {question.id} requires a 'text_answer' field")
        
        return value

    def save(self, **kwargs):
        """Save multiple QuizUserAnswer objects"""
        attempt = self.validated_data['attempt']
        answers_data = self.validated_data['answers']
        created_answers = []

        for answer_data in answers_data:
            question_id = answer_data['question']
            question = Question.objects.get(id=question_id)
            
            # Check if answer already exists for this attempt and question
            existing_answer, created = QuizUserAnswer.objects.get_or_create(
                attempt=attempt,
                question=question,
                defaults={
                    'selected_answer_id': answer_data.get('selected_answer'),
                    'text_answer': answer_data.get('text_answer'),
                }
            )
            
            if not created:
                # Update existing answer
                if 'selected_answer' in answer_data:
                    existing_answer.selected_answer_id = answer_data['selected_answer']
                if 'text_answer' in answer_data:
                    existing_answer.text_answer = answer_data['text_answer']
                existing_answer.save()
            
            # Calculate if answer is correct and points earned
            self._calculate_answer_correctness(existing_answer)
            created_answers.append(existing_answer)

        # Recalculate attempt score
        attempt.calculate_score()
        
        return created_answers

    def _calculate_answer_correctness(self, user_answer):
        """Calculate if the user's answer is correct and assign points"""
        question = user_answer.question
        
        if question.question_type in ['multiple_choice', 'true_false']:
            if user_answer.selected_answer:
                user_answer.is_correct = user_answer.selected_answer.is_correct
                user_answer.points_earned = question.points if user_answer.is_correct else 0
        elif question.question_type == 'short_answer':
            # For short answer, we'll need manual grading
            # For now, we'll set it as not correct and 0 points
            user_answer.is_correct = False
            user_answer.points_earned = 0
        
        user_answer.save()


class QuizAttemptDetailSerializer(serializers.ModelSerializer):
    """Detailed quiz attempt serializer with user answers"""
    answers = serializers.SerializerMethodField()
    quiz = QuizBasicSerializer(read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'user', 'quiz', 'start_time', 'end_time', 'score', 
            'passed', 'attempt_number', 'answers'
        ]
    
    def get_answers(self, obj):
        """Get user answers for this attempt"""
        answers = obj.answers.all().select_related('question', 'selected_answer')
        return QuizUserAnswerDetailSerializer(answers, many=True).data


class QuizUserAnswerDetailSerializer(serializers.ModelSerializer):
    """Detailed user answer serializer with question info"""
    question = QuizQuestionWithAnswersSerializer(read_only=True)
    selected_answer = QuizAnswerSerializer(read_only=True)
    
    class Meta:
        model = QuizUserAnswer
        fields = [
            'id', 'attempt', 'question', 'selected_answer', 'text_answer',
            'is_correct', 'points_earned'
        ]


class ExamBasicSerializer(serializers.ModelSerializer):
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'is_final', 'is_active', 'created_at', 'course', 'module']
    
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


class ExamDetailSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = '__all__'
    
    def get_questions(self, obj):
        """Get questions with their answers"""
        questions = obj.questions.all().prefetch_related('answers')
        return ExamQuestionWithAnswersSerializer(questions, many=True).data


class ExamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = [
            'title', 'description', 'course', 'module', 'time_limit', 'pass_mark', 
            'total_points', 'is_final', 'is_active', 'allow_multiple_attempts', 
            'max_attempts', 'show_answers_after', 'randomize_questions', 
            'start_date', 'end_date'
        ]


class ExamQuestionSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order', 'answers']
    
    def get_answers(self, obj):
        """Get answers for the question"""
        answers = obj.answers.all()
        return ExamAnswerSerializer(answers, many=True).data


class ExamAnswerSerializer(serializers.ModelSerializer):
    """Answer serializer without correct answer info for students"""
    class Meta:
        model = ExamAnswer
        fields = ['id', 'text', 'explanation', 'order']


class ExamAnswerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAnswer
        fields = ['id', 'question', 'text', 'is_correct', 'explanation', 'order']


class ExamQuestionWithAnswersSerializer(serializers.ModelSerializer):
    """Question serializer with answers"""
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order', 'answers']
    
    def get_answers(self, obj):
        """Get answers for the question"""
        answers = obj.answers.all()
        return ExamAnswerSerializer(answers, many=True).data


class ExamQuestionDetailSerializer(serializers.ModelSerializer):
    answers = ExamAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = ExamQuestion
        fields = '__all__'


class ExamQuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = ['id', 'exam', 'text', 'question_type', 'points', 'explanation', 'image', 'order']


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