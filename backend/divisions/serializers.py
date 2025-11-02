from rest_framework import serializers
from .models import Division
from users.models import Student


class StudentMiniSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='profile.name', read_only=True)
    user_id = serializers.IntegerField(source='profile.user.id', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'name', 'user_id']


class DivisionSerializer(serializers.ModelSerializer):
    students = StudentMiniSerializer(many=True, read_only=True)
    students_count = serializers.IntegerField(read_only=True)
    organization_id = serializers.IntegerField(source='organization.id', read_only=True)
    organization_name = serializers.CharField(source='organization.profile.name', read_only=True)

    class Meta:
        model = Division
        fields = [
            'id', 'name', 'description', 'organization_id', 'organization_name',
            'students', 'students_count', 'created_at', 'updated_at'
        ]


class DivisionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ['name', 'description', 'organization']