from django import forms
from .models import Assignment, AssignmentQuestion, AssignmentAnswer, AssignmentSubmission, AssignmentQuestionResponse


class AssignmentForm(forms.ModelForm):
    """Form for creating/editing assignments"""
    class Meta:
        model = Assignment
        fields = [
            'title', 'description', 'course', 'module', 'due_date', 
            'points', 'allow_late_submissions', 'late_submission_penalty',
            'has_questions', 'has_file_upload', 'assignment_file', 'is_active'
        ]
        widgets = {
            'due_date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 4}),
        }


class AssignmentQuestionForm(forms.ModelForm):
    """Form for creating/editing assignment questions"""
    class Meta:
        model = AssignmentQuestion
        fields = [
            'text', 'question_type', 'points', 'explanation', 
            'image', 'order', 'is_required'
        ]
        widgets = {
            'text': forms.Textarea(attrs={'rows': 3}),
            'explanation': forms.Textarea(attrs={'rows': 2}),
        }


class AssignmentAnswerForm(forms.ModelForm):
    """Form for creating/editing assignment answers"""
    class Meta:
        model = AssignmentAnswer
        fields = ['text', 'is_correct', 'explanation', 'order']
        widgets = {
            'text': forms.TextInput(attrs={'class': 'form-control'}),
            'explanation': forms.Textarea(attrs={'rows': 2}),
        }


class AssignmentSubmissionForm(forms.ModelForm):
    """Form for submitting assignments"""
    class Meta:
        model = AssignmentSubmission
        fields = ['submission_text', 'submitted_file']
        widgets = {
            'submission_text': forms.Textarea(attrs={
                'rows': 6, 
                'placeholder': 'اكتب إجابتك هنا...',
                'class': 'form-control'
            }),
        }


class AssignmentQuestionResponseForm(forms.ModelForm):
    """Form for responding to assignment questions"""
    class Meta:
        model = AssignmentQuestionResponse
        fields = ['text_answer', 'selected_answer', 'file_answer']
        widgets = {
            'text_answer': forms.Textarea(attrs={
                'rows': 4, 
                'placeholder': 'اكتب إجابتك هنا...',
                'class': 'form-control'
            }),
        }

    def __init__(self, *args, **kwargs):
        question = kwargs.pop('question', None)
        super().__init__(*args, **kwargs)
        
        if question:
            # Filter answers based on the question
            self.fields['selected_answer'].queryset = question.answers.all()
            
            # Show/hide fields based on question type
            if question.question_type == 'multiple_choice':
                self.fields['text_answer'].widget = forms.HiddenInput()
                self.fields['file_answer'].widget = forms.HiddenInput()
            elif question.question_type == 'file_upload':
                self.fields['text_answer'].widget = forms.HiddenInput()
                self.fields['selected_answer'].widget = forms.HiddenInput()
            else:
                self.fields['selected_answer'].widget = forms.HiddenInput()
                self.fields['file_answer'].widget = forms.HiddenInput()


class AssignmentGradingForm(forms.ModelForm):
    """Form for grading assignment submissions"""
    class Meta:
        model = AssignmentSubmission
        fields = ['status', 'grade', 'feedback']
        widgets = {
            'feedback': forms.Textarea(attrs={
                'rows': 4, 
                'placeholder': 'اكتب ملاحظاتك هنا...',
                'class': 'form-control'
            }),
            'grade': forms.NumberInput(attrs={
                'min': 0, 
                'step': 0.01,
                'class': 'form-control'
            }),
        }


class AssignmentQuestionResponseGradingForm(forms.ModelForm):
    """Form for grading individual question responses"""
    class Meta:
        model = AssignmentQuestionResponse
        fields = ['points_earned', 'feedback']
        widgets = {
            'feedback': forms.Textarea(attrs={
                'rows': 3, 
                'placeholder': 'اكتب ملاحظاتك هنا...',
                'class': 'form-control'
            }),
            'points_earned': forms.NumberInput(attrs={
                'min': 0, 
                'step': 0.01,
                'class': 'form-control'
            }),
        } 