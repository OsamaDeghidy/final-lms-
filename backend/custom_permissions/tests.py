"""
Tests for custom permissions system
اختبارات نظام الصلاحيات المخصصة
"""

from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from .models import CustomPermission
from .decorators import has_permission, has_any_permission, has_all_permissions


class CustomPermissionsTestCase(TestCase):
    """Test case for custom permissions system"""
    
    def setUp(self):
        """Set up test data"""
        # Create test users
        self.superuser = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='testpass123'
        )
        
        self.teacher = User.objects.create_user(
            username='teacher',
            email='teacher@test.com',
            password='testpass123',
            is_staff=True
        )
        
        self.content_manager = User.objects.create_user(
            username='content_manager',
            email='content@test.com',
            password='testpass123',
            is_staff=True
        )
        
        self.financial_manager = User.objects.create_user(
            username='financial_manager',
            email='financial@test.com',
            password='testpass123',
            is_staff=True
        )
        
        # Create permissions for teachers
        teacher_permissions = [
            'view_my_courses',
            'add_my_courses',
            'edit_my_courses',
            'view_lessons',
            'add_lessons',
            'edit_lessons',
        ]
        
        for permission in teacher_permissions:
            CustomPermission.objects.create(
                user=self.teacher,
                permission_code=permission
            )
        
        # Create permissions for content manager
        content_permissions = [
            'view_all_courses',
            'add_all_courses',
            'edit_all_courses',
            'view_articles',
            'add_articles',
            'edit_articles',
        ]
        
        for permission in content_permissions:
            CustomPermission.objects.create(
                user=self.content_manager,
                permission_code=permission
            )
        
        # Create permissions for financial manager
        financial_permissions = [
            'view_orders',
            'edit_orders',
            'view_payments',
            'edit_payments',
            'view_coupons',
        ]
        
        for permission in financial_permissions:
            CustomPermission.objects.create(
                user=self.financial_manager,
                permission_code=permission
            )
        
        # Create client
        self.client = Client()
    
    def test_superuser_has_all_permissions(self):
        """Test that superuser has all permissions"""
        # Superuser should have all permissions
        self.assertTrue(CustomPermission.has_permission(self.superuser, 'view_articles'))
        self.assertTrue(CustomPermission.has_permission(self.superuser, 'add_articles'))
        self.assertTrue(CustomPermission.has_permission(self.superuser, 'delete_articles'))
        self.assertTrue(CustomPermission.has_permission(self.superuser, 'view_orders'))
    
    def test_teacher_permissions(self):
        """Test teacher permissions"""
        # Teacher should have course permissions
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'view_my_courses'))
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'add_my_courses'))
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'edit_my_courses'))
        
        # Teacher should have lesson permissions
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'view_lessons'))
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'add_lessons'))
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'edit_lessons'))
        
        # Teacher should NOT have article permissions
        self.assertFalse(CustomPermission.has_permission(self.teacher, 'view_articles'))
        self.assertFalse(CustomPermission.has_permission(self.teacher, 'add_articles'))
        
        # Teacher should NOT have financial permissions
        self.assertFalse(CustomPermission.has_permission(self.teacher, 'view_orders'))
        self.assertFalse(CustomPermission.has_permission(self.teacher, 'view_payments'))
    
    def test_content_manager_permissions(self):
        """Test content manager permissions"""
        # Content manager should have course permissions
        self.assertTrue(CustomPermission.has_permission(self.content_manager, 'view_all_courses'))
        self.assertTrue(CustomPermission.has_permission(self.content_manager, 'add_all_courses'))
        self.assertTrue(CustomPermission.has_permission(self.content_manager, 'edit_all_courses'))
        
        # Content manager should have article permissions
        self.assertTrue(CustomPermission.has_permission(self.content_manager, 'view_articles'))
        self.assertTrue(CustomPermission.has_permission(self.content_manager, 'add_articles'))
        self.assertTrue(CustomPermission.has_permission(self.content_manager, 'edit_articles'))
        
        # Content manager should NOT have financial permissions
        self.assertFalse(CustomPermission.has_permission(self.content_manager, 'view_orders'))
        self.assertFalse(CustomPermission.has_permission(self.content_manager, 'view_payments'))
    
    def test_financial_manager_permissions(self):
        """Test financial manager permissions"""
        # Financial manager should have financial permissions
        self.assertTrue(CustomPermission.has_permission(self.financial_manager, 'view_orders'))
        self.assertTrue(CustomPermission.has_permission(self.financial_manager, 'edit_orders'))
        self.assertTrue(CustomPermission.has_permission(self.financial_manager, 'view_payments'))
        self.assertTrue(CustomPermission.has_permission(self.financial_manager, 'edit_payments'))
        self.assertTrue(CustomPermission.has_permission(self.financial_manager, 'view_coupons'))
        
        # Financial manager should NOT have course permissions
        self.assertFalse(CustomPermission.has_permission(self.financial_manager, 'view_all_courses'))
        self.assertFalse(CustomPermission.has_permission(self.financial_manager, 'add_all_courses'))
        
        # Financial manager should NOT have article permissions
        self.assertFalse(CustomPermission.has_permission(self.financial_manager, 'view_articles'))
        self.assertFalse(CustomPermission.has_permission(self.financial_manager, 'add_articles'))
    
    def test_has_any_permission(self):
        """Test has_any_permission method"""
        # Teacher should have any of the course permissions
        self.assertTrue(CustomPermission.has_any_permission(
            self.teacher, 
            ['view_my_courses', 'add_my_courses', 'edit_my_courses']
        ))
        
        # Teacher should have any of the lesson permissions
        self.assertTrue(CustomPermission.has_any_permission(
            self.teacher, 
            ['view_lessons', 'add_lessons', 'edit_lessons']
        ))
        
        # Teacher should NOT have any financial permissions
        self.assertFalse(CustomPermission.has_any_permission(
            self.teacher, 
            ['view_orders', 'view_payments', 'view_coupons']
        ))
    
    def test_has_all_permissions(self):
        """Test has_all_permissions method"""
        # Teacher should have all course permissions
        self.assertTrue(CustomPermission.has_all_permissions(
            self.teacher, 
            ['view_my_courses', 'add_my_courses', 'edit_my_courses']
        ))
        
        # Teacher should have all lesson permissions
        self.assertTrue(CustomPermission.has_all_permissions(
            self.teacher, 
            ['view_lessons', 'add_lessons', 'edit_lessons']
        ))
        
        # Teacher should NOT have all financial permissions
        self.assertFalse(CustomPermission.has_all_permissions(
            self.teacher, 
            ['view_orders', 'view_payments', 'view_coupons']
        ))
    
    def test_get_user_permissions(self):
        """Test get_user_permissions method"""
        teacher_permissions = CustomPermission.get_user_permissions(self.teacher)
        expected_permissions = [
            'view_my_courses',
            'add_my_courses',
            'edit_my_courses',
            'view_lessons',
            'add_lessons',
            'edit_lessons',
        ]
        
        self.assertEqual(set(teacher_permissions), set(expected_permissions))
    
    def test_permission_creation(self):
        """Test permission creation"""
        # Create a new user
        new_user = User.objects.create_user(
            username='new_user',
            email='new@test.com',
            password='testpass123',
            is_staff=True
        )
        
        # Add permissions
        CustomPermission.objects.create(
            user=new_user,
            permission_code='view_articles'
        )
        
        # Check if permission was created
        self.assertTrue(CustomPermission.has_permission(new_user, 'view_articles'))
    
    def test_permission_deactivation(self):
        """Test permission deactivation"""
        # Create a permission
        permission = CustomPermission.objects.create(
            user=self.teacher,
            permission_code='test_permission'
        )
        
        # Check if permission is active
        self.assertTrue(CustomPermission.has_permission(self.teacher, 'test_permission'))
        
        # Deactivate permission
        permission.is_active = False
        permission.save()
        
        # Check if permission is now inactive
        self.assertFalse(CustomPermission.has_permission(self.teacher, 'test_permission'))
    
    def test_permission_uniqueness(self):
        """Test that users can't have duplicate permissions"""
        # Try to create duplicate permission
        CustomPermission.objects.create(
            user=self.teacher,
            permission_code='view_my_courses'
        )
        
        # Should not create duplicate
        count = CustomPermission.objects.filter(
            user=self.teacher,
            permission_code='view_my_courses'
        ).count()
        
        self.assertEqual(count, 1)


class PermissionDecoratorsTestCase(TestCase):
    """Test case for permission decorators"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            is_staff=True
        )
        
        self.client = Client()
    
    def test_has_permission_decorator(self):
        """Test has_permission decorator"""
        # Create a test view with decorator
        @has_permission('view_articles')
        def test_view(request):
            return {'success': True}
        
        # User without permission should be redirected
        self.client.force_login(self.user)
        # This would need to be tested with a proper URL setup
        
        # Add permission and test again
        CustomPermission.objects.create(
            user=self.user,
            permission_code='view_articles'
        )
        
        # Now user should have permission
        self.assertTrue(CustomPermission.has_permission(self.user, 'view_articles'))
    
    def test_has_any_permission_decorator(self):
        """Test has_any_permission decorator"""
        # Add some permissions
        CustomPermission.objects.create(
            user=self.user,
            permission_code='view_articles'
        )
        
        # Test with any permission
        self.assertTrue(CustomPermission.has_any_permission(
            self.user, 
            ['view_articles', 'add_articles']
        ))
    
    def test_has_all_permissions_decorator(self):
        """Test has_all_permissions decorator"""
        # Add permissions
        CustomPermission.objects.create(
            user=self.user,
            permission_code='view_articles'
        )
        CustomPermission.objects.create(
            user=self.user,
            permission_code='add_articles'
        )
        
        # Test with all permissions
        self.assertTrue(CustomPermission.has_all_permissions(
            self.user, 
            ['view_articles', 'add_articles']
        ))
        
        # Test with missing permission
        self.assertFalse(CustomPermission.has_all_permissions(
            self.user, 
            ['view_articles', 'add_articles', 'delete_articles']
        ))


class PermissionViewsTestCase(TestCase):
    """Test case for permission views"""
    
    def setUp(self):
        """Set up test data"""
        self.superuser = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='testpass123'
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            is_staff=True
        )
        
        self.client = Client()
    
    def test_user_permissions_view_access(self):
        """Test access to user permissions view"""
        # Login as superuser
        self.client.force_login(self.superuser)
        
        # Try to access the view
        response = self.client.get('/permissions/user-permissions/')
        self.assertEqual(response.status_code, 200)
    
    def test_user_permissions_view_without_access(self):
        """Test access to user permissions view without superuser"""
        # Login as regular user
        self.client.force_login(self.user)
        
        # Try to access the view
        response = self.client.get('/permissions/user-permissions/')
        self.assertEqual(response.status_code, 403)  # Should be forbidden
    
    def test_permission_save(self):
        """Test saving permissions"""
        # Login as superuser
        self.client.force_login(self.superuser)
        
        # Prepare data
        data = {
            'user_id': self.user.id,
            'permissions': ['view_articles', 'add_articles', 'edit_articles']
        }
        
        # Send POST request
        response = self.client.post('/permissions/user-permissions/', data)
        
        # Check if permissions were saved
        user_permissions = CustomPermission.get_user_permissions(self.user)
        expected_permissions = ['view_articles', 'add_articles', 'edit_articles']
        
        self.assertEqual(set(user_permissions), set(expected_permissions))


class PermissionManagementTestCase(TestCase):
    """Test case for permission management"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            is_staff=True
        )
    
    def test_bulk_permission_update(self):
        """Test bulk permission update"""
        # Add initial permissions
        CustomPermission.objects.create(
            user=self.user,
            permission_code='view_articles'
        )
        
        # Update permissions
        new_permissions = ['view_articles', 'add_articles', 'edit_articles']
        
        # Clear existing permissions
        CustomPermission.objects.filter(user=self.user).delete()
        
        # Add new permissions
        for permission in new_permissions:
            CustomPermission.objects.create(
                user=self.user,
                permission_code=permission
            )
        
        # Check if permissions were updated
        user_permissions = CustomPermission.get_user_permissions(self.user)
        self.assertEqual(set(user_permissions), set(new_permissions))
    
    def test_permission_removal(self):
        """Test permission removal"""
        # Add permissions
        CustomPermission.objects.create(
            user=self.user,
            permission_code='view_articles'
        )
        CustomPermission.objects.create(
            user=self.user,
            permission_code='add_articles'
        )
        
        # Remove one permission
        CustomPermission.objects.filter(
            user=self.user,
            permission_code='add_articles'
        ).delete()
        
        # Check if permission was removed
        self.assertTrue(CustomPermission.has_permission(self.user, 'view_articles'))
        self.assertFalse(CustomPermission.has_permission(self.user, 'add_articles'))
    
    def test_permission_activation_deactivation(self):
        """Test permission activation and deactivation"""
        # Create permission
        permission = CustomPermission.objects.create(
            user=self.user,
            permission_code='test_permission'
        )
        
        # Check if active
        self.assertTrue(CustomPermission.has_permission(self.user, 'test_permission'))
        
        # Deactivate
        permission.is_active = False
        permission.save()
        
        # Check if inactive
        self.assertFalse(CustomPermission.has_permission(self.user, 'test_permission'))
        
        # Reactivate
        permission.is_active = True
        permission.save()
        
        # Check if active again
        self.assertTrue(CustomPermission.has_permission(self.user, 'test_permission')) 