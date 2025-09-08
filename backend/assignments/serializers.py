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
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'module', 'course', 'quiz_type',
            'start_time', 'time_limit', 'pass_mark', 'created_at', 'updated_at',
            'is_active', 'questions'
        ]
    
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
    
    def get_questions(self, obj):
        """Get questions with their answers"""
        questions = obj.questions.all().prefetch_related('answers')
        return QuizQuestionWithAnswersSerializer(questions, many=True).data


class QuizDetailForTeacherSerializer(serializers.ModelSerializer):
    """Detailed quiz serializer with questions and answers including correct answers for teachers"""
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'module', 'course', 'quiz_type',
            'start_time', 'time_limit', 'pass_mark', 'created_at', 'updated_at',
            'is_active', 'questions'
        ]
    
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
    
    def get_questions(self, obj):
        """Get questions with their answers including correct answer info"""
        questions = obj.questions.all().prefetch_related('answers')
        return QuizQuestionForTeacherSerializer(questions, many=True).data


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


class QuizAnswerForTeacherSerializer(serializers.ModelSerializer):
    """Answer serializer with correct answer info for teachers"""
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'explanation', 'order']


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


class QuizQuestionForTeacherSerializer(serializers.ModelSerializer):
    """Question serializer with answers including correct answer info for teachers"""
    answers = QuizAnswerForTeacherSerializer(many=True, read_only=True)
    
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
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order']


class QuizAnswerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['question', 'text', 'is_correct', 'explanation', 'order']
    
    def validate(self, data):
        """Custom validation for quiz answer"""
        # Ensure text is not empty
        if not data.get('text', '').strip():
            raise serializers.ValidationError({
                'text': 'نص الإجابة مطلوب'
            })
        
        # Ensure question exists
        if not data.get('question'):
            raise serializers.ValidationError({
                'question': 'السؤال مطلوب'
            })
        
        return data


class QuizAnswerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'explanation', 'order']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'start_time', 'end_time', 'score', 'passed', 'attempt_number']


class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'attempt_number', 'start_time']
    
    def create(self, validated_data):
        # attempt_number will be set in perform_create
        return super().create(validated_data)


class QuizUserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizUserAnswer
        fields = ['id', 'attempt', 'question', 'selected_answer', 'text_answer', 'is_correct', 'points_earned']


class QuizUserAnswerCreateSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(write_only=True)
    selected_answer_id = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = QuizUserAnswer
        fields = ['attempt', 'question_id', 'selected_answer_id', 'text_answer']
    
    def validate_selected_answer_id(self, value):
        """Validate that selected_answer belongs to the question"""
        if value:
            question_id = self.initial_data.get('question_id')
            if question_id:
                from .models import Question, Answer
                try:
                    question = Question.objects.get(id=question_id)
                    if question.question_type == 'true_false':
                        # For true/false questions, value should be "true" or "false"
                        if value not in ['true', 'false']:
                            raise serializers.ValidationError("For true/false questions, value must be 'true' or 'false'")
                    else:
                        # For other question types, value should be an answer ID (can be string or int)
                        try:
                            # Convert to int if it's a string number
                            answer_id = int(value) if str(value).isdigit() else value
                            answer = Answer.objects.get(id=answer_id, question_id=question_id)
                        except (Answer.DoesNotExist, ValueError):
                            raise serializers.ValidationError("Selected answer must belong to the question")
                except Question.DoesNotExist:
                    raise serializers.ValidationError("Question not found")
        return value
    
    def create(self, validated_data):
        """Create user answer and calculate correctness"""
        print(f"🔍 QuizUserAnswerCreateSerializer.create called with: {validated_data}")
        
        question_id = validated_data.pop('question_id')
        selected_answer_id = validated_data.pop('selected_answer_id', None)
        
        print(f"🔍 question_id: {question_id}, selected_answer_id: {selected_answer_id}")
        
        # Get question and selected answer objects
        from .models import Question, Answer
        question = Question.objects.get(id=question_id)
        selected_answer = None
        
        print(f"🔍 Found question: {question.id} - {question.text[:50]}...")
        
        # Handle different question types
        if question.question_type == 'true_false':
            # For true/false questions, selected_answer_id contains "true" or "false"
            if selected_answer_id in ['true', 'false']:
                # Find the correct answer object for this true/false value
                answer_text = 'صح' if selected_answer_id == 'true' else 'خطأ'
                try:
                    selected_answer = Answer.objects.get(question=question, text=answer_text)
                except Answer.DoesNotExist:
                    # If answer doesn't exist, create it
                    selected_answer = Answer.objects.create(
                        question=question,
                        text=answer_text,
                        is_correct=False,  # Will be determined below
                        order=0
                    )
        elif question.question_type == 'multiple_choice' and selected_answer_id:
            # Convert string to int if needed
            answer_id = int(selected_answer_id) if str(selected_answer_id).isdigit() else selected_answer_id
            selected_answer = Answer.objects.get(id=answer_id)
        
        # Create user answer
        user_answer = QuizUserAnswer.objects.create(
            attempt=validated_data['attempt'],
            question=question,
            selected_answer=selected_answer,
            text_answer=validated_data.get('text_answer')
        )
        
        # Calculate correctness and points
        is_correct = False
        if question.question_type == 'multiple_choice' and selected_answer:
            is_correct = selected_answer.is_correct
        elif question.question_type == 'true_false' and selected_answer:
            # For true/false, check if the selected answer is marked as correct
            is_correct = selected_answer.is_correct
        elif question.question_type == 'short_answer' and user_answer.text_answer:
            correct_answers = Answer.objects.filter(question=question, is_correct=True)
            is_correct = any(
                user_answer.text_answer.lower().strip() == correct.text.lower().strip()
                for correct in correct_answers
            )
        
        user_answer.is_correct = is_correct
        user_answer.points_earned = question.points if is_correct else 0
        user_answer.save()
        
        print(f"✅ Created QuizUserAnswer: id={user_answer.id}, is_correct={is_correct}, points_earned={user_answer.points_earned}")
        
        return user_answer


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


class QuizAnswerForResultSerializer(serializers.ModelSerializer):
    """Answer serializer with correct answer info for quiz results"""
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'explanation', 'order']


class QuizQuestionForResultSerializer(serializers.ModelSerializer):
    """Question serializer with answers for quiz results"""
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order', 'answers']
    
    def get_answers(self, obj):
        """Get answers for the question with correct answer info"""
        answers = obj.answers.all()
        return QuizAnswerForResultSerializer(answers, many=True).data


class QuizUserAnswerResultSerializer(serializers.ModelSerializer):
    """User answer serializer for quiz results with correct answers"""
    question = QuizQuestionForResultSerializer(read_only=True)
    selected_answer = QuizAnswerForResultSerializer(read_only=True)
    
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
    course = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'description', 'course', 'module', 'time_limit', 'pass_mark', 
            'total_points', 'is_final', 'is_active', 'allow_multiple_attempts', 
            'max_attempts', 'show_answers_after', 'randomize_questions', 
            'start_date', 'end_date', 'created_at', 'updated_at', 'questions'
        ]
    
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


class ExamAnswerForTeacherSerializer(serializers.ModelSerializer):
    """Answer serializer with correct answer info for teachers"""
    class Meta:
        model = ExamAnswer
        fields = ['id', 'text', 'is_correct', 'explanation', 'order']


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


class ExamQuestionWithAnswersForTeacherSerializer(serializers.ModelSerializer):
    """Question serializer with answers for teachers"""
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'text', 'question_type', 'points', 'explanation', 'image', 'order', 'answers']
    
    def get_answers(self, obj):
        """Get answers for the question with correct answer info for teachers"""
        answers = obj.answers.all()
        return ExamAnswerForTeacherSerializer(answers, many=True).data


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
    course_title = serializers.SerializerMethodField()
    module_name = serializers.SerializerMethodField()
    submissions_count = serializers.SerializerMethodField()
    graded_count = serializers.SerializerMethodField()
    total_students = serializers.SerializerMethodField()
    average_grade = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'course', 'module', 'due_date', 'points', 
            'allow_late_submissions', 'late_submission_penalty', 'has_questions', 
            'has_file_upload', 'assignment_file', 'is_active', 'created_at', 'updated_at',
            'course_title', 'module_name', 'submissions_count', 'graded_count', 
            'total_students', 'average_grade', 'questions_count', 'total_points'
        ]
    
    def get_course_title(self, obj):
        return obj.course.title if obj.course else ''
    
    def get_module_name(self, obj):
        return obj.module.name if obj.module else ''
    
    def get_submissions_count(self, obj):
        return obj.submissions.count()
    
    def get_graded_count(self, obj):
        return obj.submissions.filter(status='graded').count()
    
    def get_total_students(self, obj):
        if obj.course:
            from courses.models import Enrollment
            return Enrollment.objects.filter(
                course=obj.course, 
                status__in=['active', 'completed']
            ).count()
        return 0
    
    def get_average_grade(self, obj):
        from django.db.models import Avg
        avg = obj.submissions.filter(
            status='graded', 
            grade__isnull=False
        ).aggregate(avg_grade=Avg('grade'))['avg_grade']
        return float(avg) if avg else 0
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    
    def get_total_points(self, obj):
        return obj.get_total_points()


class AssignmentStudentSerializer(serializers.ModelSerializer):
    """Serializer for assignments with student submission info"""
    course_title = serializers.SerializerMethodField()
    module_name = serializers.SerializerMethodField()
    submission_status = serializers.SerializerMethodField()
    submission_date = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()
    is_late = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'course', 'module', 'due_date', 'points', 
            'allow_late_submissions', 'late_submission_penalty', 'has_questions', 
            'has_file_upload', 'assignment_file', 'is_active', 'created_at', 'updated_at',
            'course_title', 'module_name', 'submission_status', 'submission_date',
            'grade', 'feedback', 'is_late', 'is_overdue'
        ]
    
    def get_course_title(self, obj):
        return obj.course.title if obj.course else ''
    
    def get_module_name(self, obj):
        return obj.module.name if obj.module else ''
    
    def get_submission_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = obj.submissions.filter(user=request.user).first()
            return submission.status if submission else None
        return None
    
    def get_submission_date(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = obj.submissions.filter(user=request.user).first()
            return submission.submitted_at if submission else None
        return None
    
    def get_grade(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = obj.submissions.filter(user=request.user).first()
            return submission.grade if submission else None
        return None
    
    def get_feedback(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = obj.submissions.filter(user=request.user).first()
            return submission.feedback if submission else None
        return None
    
    def get_is_late(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = obj.submissions.filter(user=request.user).first()
            return submission.is_late if submission else False
        return False
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()


class AssignmentDetailSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()
    module_name = serializers.SerializerMethodField()
    questions = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = '__all__'
    
    def get_course_title(self, obj):
        return obj.course.title if obj.course else ''
    
    def get_module_name(self, obj):
        return obj.module.name if obj.module else ''
    
    def get_questions(self, obj):
        questions = obj.questions.all().prefetch_related('answers').order_by('order')
        return AssignmentQuestionWithAnswersSerializer(questions, many=True).data


class AssignmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            'title', 'description', 'course', 'module', 'due_date', 'points',
            'allow_late_submissions', 'late_submission_penalty',
            'has_questions', 'has_file_upload', 'assignment_file', 'is_active'
        ]


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    assignment_title = serializers.SerializerMethodField()
    assignment_points = serializers.SerializerMethodField()
    question_responses = serializers.SerializerMethodField()
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'user', 'submission_text', 'submitted_file',
            'status', 'grade', 'feedback', 'graded_by', 'graded_at',
            'submitted_at', 'is_late', 'student_name', 'student_email',
            'assignment_title', 'assignment_points', 'question_responses'
        ]
    
    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    
    def get_student_email(self, obj):
        return obj.user.email
    
    def get_assignment_title(self, obj):
        return obj.assignment.title
    
    def get_assignment_points(self, obj):
        return obj.assignment.points
    
    def get_question_responses(self, obj):
        responses = obj.question_responses.all().select_related('question', 'selected_answer')
        print(f"Getting question responses for submission {obj.id}: {responses.count()} responses")
        for response in responses:
            print(f"Response {response.id}: question={response.question.text if response.question else 'None'}, selected_answer={response.selected_answer}")
        serialized_data = AssignmentQuestionResponseSerializer(responses, many=True).data
        print(f"Serialized responses: {serialized_data}")
        return serialized_data


class AssignmentSubmissionCreateSerializer(serializers.ModelSerializer):
    question_responses = serializers.CharField(required=False, write_only=True, allow_blank=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = ['assignment', 'submission_text', 'submitted_file', 'question_responses']
    
    def create(self, validated_data):
        # This method will be called after the submission is created in the view
        # We'll handle question responses in a separate method
        return validated_data
    
    def create_question_responses(self, submission, question_responses_data):
        """Create question responses for the submission"""
        try:
            import json
            responses = json.loads(question_responses_data) if isinstance(question_responses_data, str) else question_responses_data
            
            print(f"Received question responses: {responses}")  # Debug log
            
            # Create question responses
            for index, response_data in enumerate(responses):
                question_id = response_data.get('question')
                text_answer = response_data.get('text_answer')
                selected_answer = response_data.get('selected_answer')
                file_answer = response_data.get('file_answer')
                
                print(f"Processing response {index}: question={question_id}, text={text_answer}, selected={selected_answer}")  # Debug log
                
                # Check for file in request.FILES
                if not file_answer and hasattr(self.context['request'], 'FILES'):
                    file_key = f'question_responses[{index}][file_answer]'
                    if file_key in self.context['request'].FILES:
                        file_answer = self.context['request'].FILES[file_key]
                
                if question_id:
                    try:
                        question = AssignmentQuestion.objects.get(id=question_id, assignment=submission.assignment)
                        
                        # Handle selected_answer properly
                        selected_answer_obj = None
                        if selected_answer:
                            try:
                                print(f"Processing selected_answer: {selected_answer} (type: {type(selected_answer)})")  # Debug log
                                
                                # For true/false questions, handle differently
                                if question.question_type == 'true_false':
                                    # Convert boolean string to proper text
                                    if selected_answer == 'true':
                                        answer_text = 'صح'
                                    elif selected_answer == 'false':
                                        answer_text = 'خطأ'
                                    else:
                                        answer_text = str(selected_answer)
                                    
                                    print(f"Looking for true/false answer with text: {answer_text}")  # Debug log
                                    
                                    try:
                                        selected_answer_obj = AssignmentAnswer.objects.get(
                                            question=question,
                                            text__iexact=answer_text
                                        )
                                        print(f"Found true/false answer: {selected_answer_obj.text}")  # Debug log
                                    except AssignmentAnswer.DoesNotExist:
                                        print(f"True/false answer with text '{answer_text}' not found for question {question.id}")  # Debug log
                                        # Try to create the answer if it doesn't exist
                                        try:
                                            selected_answer_obj = AssignmentAnswer.objects.create(
                                                question=question,
                                                text=answer_text,
                                                is_correct=False,  # Default to False, can be updated later
                                                order=1
                                            )
                                            print(f"Created new true/false answer: {selected_answer_obj.text}")  # Debug log
                                        except Exception as e:
                                            print(f"Error creating true/false answer: {e}")  # Debug log
                                else:
                                    # For multiple choice questions, handle by ID
                                    if isinstance(selected_answer, str):
                                        try:
                                            selected_answer = int(selected_answer)
                                        except ValueError:
                                            print(f"Cannot convert selected_answer '{selected_answer}' to int")  # Debug log
                                            continue
                                    
                                    print(f"Looking for AssignmentAnswer with id={selected_answer} for question={question.id}")  # Debug log
                                    
                                    try:
                                        selected_answer_obj = AssignmentAnswer.objects.get(id=selected_answer)
                                        print(f"Found answer: {selected_answer_obj.text}")  # Debug log
                                    except AssignmentAnswer.DoesNotExist:
                                        print(f"AssignmentAnswer with id={selected_answer} not found")  # Debug log
                                            
                            except (ValueError, TypeError) as e:
                                print(f"Error processing selected_answer: {e}")  # Debug log
                                pass  # Skip if answer doesn't exist
                        
                        print(f"Final selected_answer_obj: {selected_answer_obj}")  # Debug log
                        
                        AssignmentQuestionResponse.objects.create(
                            submission=submission,
                            question=question,
                            text_answer=text_answer,
                            selected_answer=selected_answer_obj,
                            file_answer=file_answer
                        )
                    except AssignmentQuestion.DoesNotExist:
                        pass  # Skip if question doesn't exist
        except (json.JSONDecodeError, TypeError):
            pass  # Skip if JSON parsing fails


class AssignmentSubmissionGradeSerializer(serializers.ModelSerializer):
    """Serializer for grading submissions"""
    class Meta:
        model = AssignmentSubmission
        fields = ['grade', 'feedback', 'status']
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        instance.grade = validated_data.get('grade', instance.grade)
        instance.feedback = validated_data.get('feedback', instance.feedback)
        instance.status = validated_data.get('status', 'graded')
        instance.graded_by = self.context['request'].user
        instance.graded_at = timezone.now()
        instance.save()
        return instance


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
    question_text = serializers.SerializerMethodField()
    selected_answer_text = serializers.SerializerMethodField()
    
    class Meta:
        model = AssignmentQuestionResponse
        fields = '__all__'
    
    def get_question_text(self, obj):
        return obj.question.text if obj.question else ''
    
    def get_selected_answer_text(self, obj):
        print(f"Getting selected_answer_text for response {obj.id}: selected_answer={obj.selected_answer}")
        if obj.selected_answer:
            print(f"Selected answer text: {obj.selected_answer.text}")
            return obj.selected_answer.text
        else:
            print("No selected_answer found")
            return ''


class AssignmentSubmissionWithResponsesSerializer(serializers.ModelSerializer):
    question_responses = AssignmentQuestionResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'


class UserExamAttemptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating UserExamAttempt"""
    class Meta:
        model = UserExamAttempt
        fields = ['id', 'exam', 'attempt_number', 'start_time']
    
    def create(self, validated_data):
        print(f"UserExamAttemptCreateSerializer.create called")
        print(f"Validated data: {validated_data}")
        
        user = self.context['request'].user
        exam = validated_data['exam']
        
        print(f"User: {user}")
        print(f"Exam: {exam.id} - {exam.title}")
        
        # Check if user can take the exam
        attempts = UserExamAttempt.objects.filter(user=user, exam=exam)
        print(f"Existing attempts: {attempts.count()}")
        
        if not exam.allow_multiple_attempts and attempts.exists():
            print("Multiple attempts not allowed and attempt exists")
            raise serializers.ValidationError("لا يمكنك تقديم هذا الامتحان مرة أخرى")
        
        if exam.max_attempts and attempts.count() >= exam.max_attempts:
            print(f"Max attempts reached: {attempts.count()}/{exam.max_attempts}")
            raise serializers.ValidationError("لقد استنفذت عدد المحاولات المسموحة")
        
        # Create attempt
        attempt_number = attempts.count() + 1
        print(f"Creating attempt number: {attempt_number}")
        
        attempt = UserExamAttempt.objects.create(
            user=user,
            exam=exam,
            attempt_number=attempt_number
        )
        
        print(f"Created attempt: {attempt.id}")
        return attempt


class UserExamAttemptSerializer(serializers.ModelSerializer):
    """Serializer for UserExamAttempt model"""
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    exam_title = serializers.SerializerMethodField()
    
    class Meta:
        model = UserExamAttempt
        fields = [
            'id', 'user', 'exam', 'attempt_number', 'start_time', 'end_time',
            'score', 'passed', 'user_name', 'user_email', 'exam_title'
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    
    def get_user_email(self, obj):
        return obj.user.email
    
    def get_exam_title(self, obj):
        return obj.exam.title


class UserExamAnswerSerializer(serializers.ModelSerializer):
    """Serializer for UserExamAnswer model"""
    class Meta:
        model = UserExamAnswer
        fields = [
            'id', 'attempt', 'question', 'selected_answer', 'text_answer',
            'is_correct', 'points_earned'
        ]


class UserExamAttemptDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for UserExamAttempt with answers"""
    answers = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    exam_title = serializers.SerializerMethodField()
    
    class Meta:
        model = UserExamAttempt
        fields = [
            'id', 'user', 'exam', 'attempt_number', 'start_time', 'end_time',
            'score', 'passed', 'answers', 'user_name', 'exam_title'
        ]
    
    def get_answers(self, obj):
        answers = obj.answers.all().select_related('question', 'selected_answer')
        return UserExamAnswerSerializer(answers, many=True).data
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    
    def get_exam_title(self, obj):
        return obj.exam.title


class UserExamAnswerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating UserExamAnswer"""
    question_id = serializers.IntegerField(write_only=True)
    selected_answer_id = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = UserExamAnswer
        fields = ['attempt', 'question_id', 'selected_answer_id', 'text_answer']
    
    def validate_selected_answer_id(self, value):
        print(f"validate_selected_answer_id called with value: {value} (type: {type(value)})")
        
        if value is None:
            print("Value is None, returning None")
            return value
        
        # Handle array values (take first element)
        if isinstance(value, list):
            print(f"Value is array: {value}, taking first element")
            if len(value) > 0:
                value = value[0]
                print(f"New value after array processing: {value}")
            else:
                print("Array is empty, returning None")
                return None
        
        question_id = self.initial_data.get('question_id')
        print(f"Question ID: {question_id}")
        if not question_id:
            raise serializers.ValidationError("question_id is required")
        
        try:
            question = ExamQuestion.objects.get(id=question_id)
        except ExamQuestion.DoesNotExist:
            raise serializers.ValidationError("Question not found")
        
        # For true_false questions, expect "true" or "false" strings
        if question.question_type == 'true_false':
            if value not in ['true', 'false']:
                raise serializers.ValidationError("For true/false questions, value must be 'true' or 'false'")
        else:
            # For other question types, expect integer ID
            try:
                answer = ExamAnswer.objects.get(id=value, question=question)
            except ExamAnswer.DoesNotExist:
                raise serializers.ValidationError("Answer not found for this question")
        
        return value
    
    def create(self, validated_data):
        question_id = validated_data.pop('question_id')
        selected_answer_id = validated_data.pop('selected_answer_id', None)
        
        try:
            question = ExamQuestion.objects.get(id=question_id)
        except ExamQuestion.DoesNotExist:
            raise serializers.ValidationError("Question not found")
        
        # Handle true_false questions
        if question.question_type == 'true_false' and selected_answer_id in ['true', 'false']:
            # Find or create the corresponding answer
            answer_text = 'صح' if selected_answer_id == 'true' else 'خطأ'
            answer, created = ExamAnswer.objects.get_or_create(
                question=question,
                text=answer_text,
                defaults={'is_correct': answer_text == 'صح', 'order': 1}
            )
            selected_answer = answer
        elif selected_answer_id:
            try:
                selected_answer = ExamAnswer.objects.get(id=selected_answer_id, question=question)
            except ExamAnswer.DoesNotExist:
                raise serializers.ValidationError("Answer not found for this question")
        else:
            selected_answer = None
        
        # Create the user answer
        user_answer = UserExamAnswer.objects.create(
            question=question,
            selected_answer=selected_answer,
            **validated_data
        )
        
        # Calculate correctness and points
        if question.question_type == 'true_false':
            if selected_answer:
                user_answer.is_correct = selected_answer.is_correct
                user_answer.points_earned = question.points if selected_answer.is_correct else 0
        elif question.question_type == 'multiple_choice':
            if selected_answer:
                user_answer.is_correct = selected_answer.is_correct
                user_answer.points_earned = question.points if selected_answer.is_correct else 0
        elif question.question_type == 'short_answer':
            # Auto marking for short answer questions
            if user_answer.text_answer:
                correct_answers = ExamAnswer.objects.filter(question=question, is_correct=True)
                is_correct = any(
                    user_answer.text_answer.lower().strip() == correct.text.lower().strip()
                    for correct in correct_answers
                )
                user_answer.is_correct = is_correct
                user_answer.points_earned = question.points if is_correct else 0
            else:
                user_answer.is_correct = False
                user_answer.points_earned = 0
        
        user_answer.save()
        return user_answer


class UserExamAnswerDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for UserExamAnswer"""
    question_text = serializers.SerializerMethodField()
    selected_answer_text = serializers.SerializerMethodField()
    
    class Meta:
        model = UserExamAnswer
        fields = [
            'id', 'attempt', 'question', 'question_text', 'selected_answer', 
            'selected_answer_text', 'text_answer', 'is_correct', 'points_earned'
        ]
    
    def get_question_text(self, obj):
        return obj.question.text
    
    def get_selected_answer_text(self, obj):
        return obj.selected_answer.text if obj.selected_answer else None


class ExamAnswerForResultSerializer(serializers.ModelSerializer):
    """Serializer for exam answers in results with is_correct field"""
    class Meta:
        model = ExamAnswer
        fields = ['id', 'text', 'is_correct', 'explanation', 'order']


class ExamQuestionForResultSerializer(serializers.ModelSerializer):
    """Serializer for exam questions in results with answers"""
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamQuestion
        fields = ['id', 'text', 'question_type', 'points', 'answers']
    
    def get_answers(self, obj):
        answers = obj.answers.all().order_by('order')
        return ExamAnswerForResultSerializer(answers, many=True).data


class UserExamAnswerResultSerializer(serializers.ModelSerializer):
    """Serializer for exam user answers in results with correct answer info"""
    question = ExamQuestionForResultSerializer(read_only=True)
    selected_answer = ExamAnswerForResultSerializer(read_only=True)
    
    class Meta:
        model = UserExamAnswer
        fields = [
            'id', 'question', 'selected_answer', 'text_answer', 
            'is_correct', 'points_earned'
        ]