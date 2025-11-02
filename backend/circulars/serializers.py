from rest_framework import serializers
from .models import Circular
from divisions.models import Division
from users.models import Student


class CircularSerializer(serializers.ModelSerializer):
    target_divisions = serializers.PrimaryKeyRelatedField(queryset=Division.objects.all(), many=True, required=False)
    target_students = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True, required=False)
    recipients_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Circular
        fields = [
            'id', 'title', 'content', 'attachment',
            'target_divisions', 'target_students',
            'send_email', 'send_notification', 'show_on_homepage',
            'status', 'publish_at', 'recipients_count',
            'created_at', 'updated_at'
        ]