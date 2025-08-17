from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from ..models import Quiz, Question, Answer, QuizAttempt, QuizUserAnswer
from courses.models import Course
from content.models import Module


class QuizAPITestCase(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='teststudent',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test course
        self.course = Course.objects.create(
            title='Test Course',
            description='Test course description'
        )
        
        # Create test module
        self.module = Module.objects.create(
            name='Test Module',
            course=self.course
        )
        
        # Create test quiz
        self.quiz = Quiz.objects.create(
            title='Test Quiz',
            description='Test quiz description',
            course=self.course,
            module=self.module,
            quiz_type='module',
            time_limit=30,
            pass_mark=60
        )
        
        # Create test questions
        self.question1 = Question.objects.create(
            quiz=self.quiz,
            text='What is HTML?',
            question_type='multiple_choice',
            points=2,
            order=1
        )
        
        self.question2 = Question.objects.create(
            quiz=self.quiz,
            text='Is CSS a programming language?',
            question_type='true_false',
            points=1,
            order=2
        )
        
        # Create test answers
        self.answer1_correct = Answer.objects.create(
            question=self.question1,
            text='Markup language',
            is_correct=True,
            order=1
        )
        
        self.answer1_incorrect = Answer.objects.create(
            question=self.question1,
            text='Programming language',
            is_correct=False,
            order=2
        )
        
        self.answer2_true = Answer.objects.create(
            question=self.question2,
            text='True',
            is_correct=False,
            order=1
        )
        
        self.answer2_false = Answer.objects.create(
            question=self.question2,
            text='False',
            is_correct=True,
            order=2
        )

    def test_get_quizzes(self):
        """Test getting list of quizzes"""
        self.client.force_authenticate(user=self.user)
        url = reverse('quiz-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Test Quiz')

    def test_get_quiz_detail(self):
        """Test getting quiz details with questions"""
        self.client.force_authenticate(user=self.user)
        url = reverse('quiz-detail', args=[self.quiz.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Quiz')
        self.assertEqual(len(response.data['questions']), 2)

    def test_start_quiz_attempt(self):
        """Test starting a new quiz attempt"""
        self.client.force_authenticate(user=self.user)
        url = reverse('quiz-attempt-list')
        data = {'quiz': self.quiz.id}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quiz'], self.quiz.id)
        self.assertEqual(response.data['user'], self.user.id)
        self.assertIsNotNone(response.data['start_time'])

    def test_submit_quiz_answers(self):
        """Test submitting quiz answers"""
        # First start an attempt
        self.client.force_authenticate(user=self.user)
        attempt_url = reverse('quiz-attempt-list')
        attempt_data = {'quiz': self.quiz.id}
        attempt_response = self.client.post(attempt_url, attempt_data)
        attempt_id = attempt_response.data['id']
        
        # Submit answers
        submit_url = reverse('quiz-user-answer-submit_answers')
        answers_data = {
            'attempt': attempt_id,
            'answers': [
                {
                    'question': self.question1.id,
                    'selected_answer': self.answer1_correct.id
                },
                {
                    'question': self.question2.id,
                    'selected_answer': self.answer2_false.id
                }
            ]
        }
        response = self.client.post(submit_url, answers_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['answers_count'], 2)

    def test_finish_quiz_attempt(self):
        """Test finishing a quiz attempt"""
        # First start an attempt
        self.client.force_authenticate(user=self.user)
        attempt_url = reverse('quiz-attempt-list')
        attempt_data = {'quiz': self.quiz.id}
        attempt_response = self.client.post(attempt_url, attempt_data)
        attempt_id = attempt_response.data['id']
        
        # Submit some answers first
        submit_url = reverse('quiz-user-answer-submit_answers')
        answers_data = {
            'attempt': attempt_id,
            'answers': [
                {
                    'question': self.question1.id,
                    'selected_answer': self.answer1_correct.id
                }
            ]
        }
        self.client.post(submit_url, answers_data)
        
        # Finish the attempt
        finish_url = reverse('quiz-attempt-finish', args=[attempt_id])
        response = self.client.patch(finish_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['end_time'])
        self.assertIsNotNone(response.data['score'])

    def test_get_quiz_attempt_result(self):
        """Test getting quiz attempt result"""
        # First start and finish an attempt
        self.client.force_authenticate(user=self.user)
        attempt_url = reverse('quiz-attempt-list')
        attempt_data = {'quiz': self.quiz.id}
        attempt_response = self.client.post(attempt_url, attempt_data)
        attempt_id = attempt_response.data['id']
        
        # Submit answers
        submit_url = reverse('quiz-user-answer-submit_answers')
        answers_data = {
            'attempt': attempt_id,
            'answers': [
                {
                    'question': self.question1.id,
                    'selected_answer': self.answer1_correct.id
                }
            ]
        }
        self.client.post(submit_url, answers_data)
        
        # Finish attempt
        finish_url = reverse('quiz-attempt-finish', args=[attempt_id])
        self.client.patch(finish_url)
        
        # Get result
        result_url = reverse('quiz-attempt-detail', args=[attempt_id])
        response = self.client.get(result_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['score'])
        self.assertIsNotNone(response.data['passed'])
        self.assertEqual(len(response.data['answers']), 1)
