from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_alter_instructor_bio_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='national_id',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='National ID'),
        ),
    ]

