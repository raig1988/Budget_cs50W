# Generated by Django 4.1.1 on 2022-10-10 16:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budget', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='amount',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='transactions',
            name='amount',
            field=models.FloatField(),
        ),
    ]
