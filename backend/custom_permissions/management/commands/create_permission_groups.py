from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from custom_permissions.models import CustomPermission


class Command(BaseCommand):
    help = 'Create predefined permission groups for different user roles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Username to assign permissions to'
        )
        parser.add_argument(
            '--role',
            type=str,
            choices=['teacher', 'content_manager', 'user_manager', 'financial_manager', 'general_manager'],
            help='Role to assign permissions for'
        )

    def handle(self, *args, **options):
        username = options['username']
        role = options['role']
        
        if not username:
            self.stdout.write(
                self.style.ERROR('Please provide a username with --username')
            )
            return
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User {username} does not exist')
            )
            return
        
        # Define permission groups
        permission_groups = {
            'teacher': [
                'view_my_courses',
                'add_my_courses',
                'edit_my_courses',
                'delete_my_courses',
                'view_lessons',
                'add_lessons',
                'edit_lessons',
                'delete_lessons',
                'view_modules',
                'add_modules',
                'edit_modules',
                'delete_modules',
                'view_quizzes',
                'add_quizzes',
                'edit_quizzes',
                'delete_quizzes',
                'view_questions',
                'add_questions',
                'edit_questions',
                'delete_questions',
            ],
            'content_manager': [
                'view_all_courses',
                'add_all_courses',
                'edit_all_courses',
                'delete_all_courses',
                'view_lessons',
                'add_lessons',
                'edit_lessons',
                'delete_lessons',
                'view_modules',
                'add_modules',
                'edit_modules',
                'delete_modules',
                'view_quizzes',
                'add_quizzes',
                'edit_quizzes',
                'delete_quizzes',
                'view_questions',
                'add_questions',
                'edit_questions',
                'delete_questions',
                'view_articles',
                'add_articles',
                'edit_articles',
                'delete_articles',
                'view_article_categories',
                'add_article_categories',
                'edit_article_categories',
                'delete_article_categories',
            ],
            'user_manager': [
                'view_instructors',
                'add_instructors',
                'edit_instructors',
                'delete_instructors',
                'view_students',
                'add_students',
                'edit_students',
                'delete_students',
            ],
            'financial_manager': [
                'view_orders',
                'edit_orders',
                'view_payments',
                'edit_payments',
                'view_coupons',
                'add_coupons',
                'edit_coupons',
                'delete_coupons',
            ],
            'general_manager': [
                # All permissions
                'view_instructors', 'add_instructors', 'edit_instructors', 'delete_instructors',
                'view_students', 'add_students', 'edit_students', 'delete_students',
                'view_all_courses', 'add_all_courses', 'edit_all_courses', 'delete_all_courses',
                'view_my_courses', 'add_my_courses', 'edit_my_courses', 'delete_my_courses',
                'view_lessons', 'add_lessons', 'edit_lessons', 'delete_lessons',
                'view_modules', 'add_modules', 'edit_modules', 'delete_modules',
                'view_quizzes', 'add_quizzes', 'edit_quizzes', 'delete_quizzes',
                'view_questions', 'add_questions', 'edit_questions', 'delete_questions',
                'view_orders', 'add_orders', 'edit_orders', 'delete_orders',
                'view_payments', 'add_payments', 'edit_payments', 'delete_payments',
                'view_coupons', 'add_coupons', 'edit_coupons', 'delete_coupons',
                'view_certificates', 'add_certificates', 'edit_certificates', 'delete_certificates',
                'view_reviews', 'add_reviews', 'edit_reviews', 'delete_reviews',
                'view_banners', 'add_banners', 'edit_banners', 'delete_banners',
                'view_settings', 'add_settings', 'edit_settings', 'delete_settings',
                'view_meetings', 'add_meetings', 'edit_meetings', 'delete_meetings',
                'view_articles', 'add_articles', 'edit_articles', 'delete_articles',
                'view_article_categories', 'add_article_categories', 'edit_article_categories', 'delete_article_categories',
                'view_article_comments', 'add_article_comments', 'edit_article_comments', 'delete_article_comments',
            ]
        }
        
        if role not in permission_groups:
            self.stdout.write(
                self.style.ERROR(f'Invalid role: {role}')
            )
            return
        
        # Clear existing permissions for this user
        CustomPermission.objects.filter(user=user).delete()
        
        # Add new permissions
        permissions_to_add = permission_groups[role]
        created_permissions = []
        
        for permission_code in permissions_to_add:
            permission, created = CustomPermission.objects.get_or_create(
                user=user,
                permission_code=permission_code,
                defaults={'is_active': True}
            )
            created_permissions.append(permission)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully assigned {len(created_permissions)} permissions to user {username} for role {role}'
            )
        )
        
        # Show assigned permissions
        self.stdout.write('\nAssigned permissions:')
        for permission in created_permissions:
            self.stdout.write(f'  - {permission.get_permission_code_display()}') 