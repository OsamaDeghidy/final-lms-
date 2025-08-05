from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from datetime import timedelta
from courses.models import Course
from content.models import Module
from assignments.models import (
    Assignment, AssignmentQuestion, AssignmentAnswer, 
    AssignmentSubmission, AssignmentQuestionResponse
)


class AssignmentFeaturesTestCase(TestCase):
    def setUp(self):
        """إعداد البيانات الأساسية للاختبارات"""
        # إنشاء مستخدم
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # إنشاء دورة
        self.course = Course.objects.create(
            title='دورة اختبارية',
            description='دورة للاختبار',
            instructor=self.user
        )
        
        # إنشاء وحدة
        self.module = Module.objects.create(
            name='وحدة اختبارية',
            course=self.course,
            order=1
        )
        
        # إنشاء واجب
        self.assignment = Assignment.objects.create(
            title='واجب اختباري',
            description='واجب للاختبار',
            course=self.course,
            module=self.module,
            due_date=timezone.now() + timedelta(days=7),
            points=100,
            has_questions=True,
            has_file_upload=True
        )

    def test_assignment_creation_with_questions(self):
        """اختبار إنشاء واجب مع أسئلة"""
        # إنشاء سؤال
        question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='ما هو ناتج 2 + 2؟',
            question_type='multiple_choice',
            points=10,
            order=1
        )
        
        # إنشاء إجابات
        answer1 = AssignmentAnswer.objects.create(
            question=question,
            text='3',
            is_correct=False,
            order=1
        )
        
        answer2 = AssignmentAnswer.objects.create(
            question=question,
            text='4',
            is_correct=True,
            order=2
        )
        
        # التحقق من العلاقات
        self.assertEqual(self.assignment.questions.count(), 1)
        self.assertEqual(question.answers.count(), 2)
        self.assertEqual(question.answers.filter(is_correct=True).count(), 1)
        
        # التحقق من إجمالي النقاط
        self.assertEqual(self.assignment.get_total_points(), 10)

    def test_assignment_file_upload(self):
        """اختبار رفع ملف للواجب"""
        # إنشاء ملف وهمي
        file_content = b'This is a test file content'
        test_file = SimpleUploadedFile(
            'test_assignment.pdf',
            file_content,
            content_type='application/pdf'
        )
        
        # تحديث الواجب بملف
        self.assignment.assignment_file = test_file
        self.assignment.save()
        
        # التحقق من وجود الملف
        self.assertIsNotNone(self.assignment.assignment_file)
        self.assertTrue(self.assignment.can_submit_file())

    def test_assignment_submission_with_questions(self):
        """اختبار تسليم واجب مع أسئلة"""
        # إنشاء سؤال
        question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='اكتب إجابة قصيرة',
            question_type='short_answer',
            points=10,
            order=1
        )
        
        # إنشاء تسليم
        submission = AssignmentSubmission.objects.create(
            assignment=self.assignment,
            user=self.user,
            submission_text='إجابة عامة للواجب'
        )
        
        # إنشاء استجابة للسؤال
        response = AssignmentQuestionResponse.objects.create(
            submission=submission,
            question=question,
            text_answer='هذه إجابة قصيرة للسؤال',
            points_earned=8
        )
        
        # التحقق من الاستجابة
        self.assertEqual(submission.question_responses.count(), 1)
        self.assertEqual(response.points_earned, 8)
        self.assertEqual(response.text_answer, 'هذه إجابة قصيرة للسؤال')

    def test_assignment_submission_with_file(self):
        """اختبار تسليم واجب مع ملف"""
        # إنشاء ملف وهمي للتسليم
        file_content = b'This is a test submission file'
        submission_file = SimpleUploadedFile(
            'test_submission.pdf',
            file_content,
            content_type='application/pdf'
        )
        
        # إنشاء تسليم مع ملف
        submission = AssignmentSubmission.objects.create(
            assignment=self.assignment,
            user=self.user,
            submission_text='تم رفع الملف المطلوب',
            submitted_file=submission_file
        )
        
        # التحقق من الملف
        self.assertIsNotNone(submission.submitted_file)
        self.assertEqual(submission.user, self.user)
        self.assertEqual(submission.assignment, self.assignment)

    def test_assignment_question_types(self):
        """اختبار أنواع الأسئلة المختلفة"""
        # سؤال اختيار من متعدد
        mc_question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='اختر الإجابة الصحيحة',
            question_type='multiple_choice',
            points=5,
            order=1
        )
        
        # سؤال صح أو خطأ
        tf_question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='2 + 2 = 4',
            question_type='true_false',
            points=5,
            order=2
        )
        
        # سؤال مقال
        essay_question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='اكتب مقال قصير',
            question_type='essay',
            points=20,
            order=3
        )
        
        # سؤال رفع ملف
        file_question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='ارفع ملف PDF',
            question_type='file_upload',
            points=10,
            order=4
        )
        
        # التحقق من عدد الأسئلة
        self.assertEqual(self.assignment.questions.count(), 4)
        self.assertEqual(self.assignment.get_total_points(), 40)

    def test_assignment_grading(self):
        """اختبار تقييم الواجب"""
        # إنشاء سؤال
        question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='سؤال للاختبار',
            question_type='short_answer',
            points=10,
            order=1
        )
        
        # إنشاء تسليم
        submission = AssignmentSubmission.objects.create(
            assignment=self.assignment,
            user=self.user,
            submission_text='إجابة الطالب'
        )
        
        # إنشاء استجابة
        response = AssignmentQuestionResponse.objects.create(
            submission=submission,
            question=question,
            text_answer='إجابة الطالب للسؤال',
            points_earned=8,
            feedback='إجابة جيدة ولكن تحتاج تحسين'
        )
        
        # تقييم التسليم
        submission.status = 'graded'
        submission.grade = 80
        submission.feedback = 'عمل ممتاز'
        submission.graded_by = self.user
        submission.graded_at = timezone.now()
        submission.save()
        
        # التحقق من التقييم
        self.assertEqual(submission.status, 'graded')
        self.assertEqual(submission.grade, 80)
        self.assertIsNotNone(submission.graded_by)
        self.assertIsNotNone(submission.graded_at)

    def test_assignment_overdue(self):
        """اختبار انتهاء صلاحية الواجب"""
        # إنشاء واجب منتهي الصلاحية
        overdue_assignment = Assignment.objects.create(
            title='واجب منتهي الصلاحية',
            description='واجب منتهي',
            course=self.course,
            due_date=timezone.now() - timedelta(days=1),
            points=50
        )
        
        # التحقق من انتهاء الصلاحية
        self.assertTrue(overdue_assignment.is_overdue())
        self.assertFalse(self.assignment.is_overdue())

    def test_assignment_required_questions(self):
        """اختبار الأسئلة الإجبارية"""
        # إنشاء سؤال إجباري
        required_question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='سؤال إجباري',
            question_type='short_answer',
            points=10,
            order=1,
            is_required=True
        )
        
        # إنشاء سؤال اختياري
        optional_question = AssignmentQuestion.objects.create(
            assignment=self.assignment,
            text='سؤال اختياري',
            question_type='short_answer',
            points=5,
            order=2,
            is_required=False
        )
        
        # التحقق من الأسئلة الإجبارية
        self.assertTrue(required_question.is_required)
        self.assertFalse(optional_question.is_required)
        self.assertEqual(self.assignment.questions.filter(is_required=True).count(), 1) 