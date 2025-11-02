from django.db import models
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field
from users.models import Organization, Student


class Division(models.Model):
    name = models.CharField(max_length=255, verbose_name='اسم الشعبة')
    description = CKEditor5Field(blank=True, null=True, verbose_name='الوصف')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='المنظمة')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_divisions', verbose_name='أنشأها')
    students = models.ManyToManyField(Student, related_name='divisions', blank=True, verbose_name='الطلاب')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'شعبة'
        verbose_name_plural = 'الشعب'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def students_count(self):
        return self.students.count()