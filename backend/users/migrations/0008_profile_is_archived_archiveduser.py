from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0007_profile_national_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='is_archived',
            field=models.BooleanField(default=False, verbose_name='Is Archived'),
        ),
        migrations.CreateModel(
            name='ArchivedUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=150)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('first_name', models.CharField(blank=True, max_length=150)),
                ('last_name', models.CharField(blank=True, max_length=150)),
                ('national_id', models.CharField(blank=True, max_length=100, null=True)),
                ('profile_data', models.JSONField(blank=True, null=True)),
                ('archived_at', models.DateTimeField(auto_now_add=True)),
                ('archived_by', models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name='archived_users', to=settings.AUTH_USER_MODEL)),
                ('original_user', models.OneToOneField(blank=True, null=True, on_delete=models.SET_NULL, related_name='archived_entry', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-archived_at'],
                'verbose_name': 'Archived User',
                'verbose_name_plural': 'Archived Users',
            },
        ),
    ]

