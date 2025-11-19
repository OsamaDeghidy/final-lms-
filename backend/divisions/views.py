from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from users.models import Profile, Instructor, Student
from .models import Division
from .serializers import DivisionSerializer, DivisionCreateUpdateSerializer, StudentMiniSerializer


class IsTeacherOrAdmin(permissions.BasePermission):
    """يسمح بالوصول للمعلم/الأدمن فقط للإجراءات الحساسة"""
    def has_permission(self, request, view):
        if not hasattr(request.user, 'profile'):
            return False
        status_val = request.user.profile.status
        return status_val in ['Instructor', 'Admin'] or request.user.is_staff or request.user.is_superuser


class DivisionViewSet(viewsets.ModelViewSet):
    queryset = Division.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DivisionCreateUpdateSerializer
        return DivisionSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Division.objects.none()

        profile = user.profile

        # Admin/staff: see all divisions
        if profile.status == 'Admin' or user.is_staff or user.is_superuser:
            return Division.objects.all()

        # Instructor: see divisions created by them or under their organization
        if profile.status == 'Instructor':
            try:
                instructor = Instructor.objects.get(profile=profile)
                qs = Division.objects.filter(created_by=user)
                if instructor.organization:
                    qs = qs | Division.objects.filter(organization=instructor.organization)
                return qs.distinct()
            except Instructor.DoesNotExist:
                return Division.objects.filter(created_by=user)

        # Student: see divisions they belong to
        try:
            student = Student.objects.get(profile=profile)
            return Division.objects.filter(students=student)
        except Student.DoesNotExist:
            return Division.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTeacherOrAdmin])
    def add_students(self, request, pk=None):
        division = self.get_object()
        student_ids = request.data.get('student_ids', [])
        if not isinstance(student_ids, list):
            return Response({'error': 'student_ids يجب أن تكون قائمة'}, status=status.HTTP_400_BAD_REQUEST)
        students = Student.objects.filter(id__in=student_ids)
        
        with transaction.atomic():
            removed_from_other_divisions = []
            for student in students:
                # إزالة الطالب من جميع الشعب الأخرى
                other_divisions = Division.objects.exclude(pk=division.pk).filter(students=student)
                if other_divisions.exists():
                    for other_division in other_divisions:
                        other_division.students.remove(student)
                        removed_from_other_divisions.append({
                            'student': student.profile.name if student.profile else str(student),
                            'division': other_division.name
                        })
            
            # إضافة الطلاب للشعبة الحالية
            division.students.add(*students)
        
        response_data = {
            'message': 'تم إضافة الطلاب',
            'added_count': students.count()
        }
        
        if removed_from_other_divisions:
            response_data['warning'] = 'تم إزالة بعض الطلاب من شعب أخرى لضمان أن كل طالب في شعبة واحدة فقط'
            response_data['removed_from_other_divisions'] = removed_from_other_divisions
        
        return Response(response_data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTeacherOrAdmin])
    def remove_students(self, request, pk=None):
        division = self.get_object()
        student_ids = request.data.get('student_ids', [])
        if not isinstance(student_ids, list):
            return Response({'error': 'student_ids يجب أن تكون قائمة'}, status=status.HTTP_400_BAD_REQUEST)
        students = Student.objects.filter(id__in=student_ids)
        with transaction.atomic():
            division.students.remove(*students)
        return Response({'message': 'تم إزالة الطلاب', 'removed_count': students.count()})

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def students(self, request, pk=None):
        division = self.get_object()
        serializer = StudentMiniSerializer(division.students.all(), many=True)
        return Response(serializer.data)