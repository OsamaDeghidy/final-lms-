from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_alter_course_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='level',
            field=models.CharField(
                blank=True,
                choices=[
                    ('beginner', 'Beginner'),
                    ('intermediate', 'Intermediate'),
                    ('advanced', 'Advanced'),
                ],
                max_length=20,
                null=True,
                verbose_name='Difficulty Level',
            ),
        ),
        migrations.RemoveField(
            model_name='course',
            name='language',
        ),
    ]

