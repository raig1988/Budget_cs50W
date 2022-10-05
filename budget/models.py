from unicodedata import decimal
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    nickname = models.CharField(max_length=50, blank=True)

    def __str__(self) -> str:
        return f"user : {self.user} - nickname : {self.nickname}"
class Categories(models.Model):
    category = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"category: {self.category}"

class Transactions(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    description = models.CharField(max_length=200)
    category = models.ForeignKey(Categories, on_delete=models.PROTECT, related_name="categories")
    amount = models.DecimalField(max_digits=19, decimal_places=2)
    input_date = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"user: {self.user} - date: {self.date} - category: {self.category} - description: {self.description} - amount: {self.amount} - input date: {self.input_date}"

    def serialize_transaction(self):
        return {
            "id" : self.id,
            "user_id" : self.user_id,
            "user" : self.user.username,
            "date" : self.date.strftime("%d %b %Y"),
            "description" : self.description,
            "category" : self.category.category,
            "amount" : self.amount,
            "input_date" : self.input_date.strftime("%b %d %Y, %I:%M %p"),
        }

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budget_user')
    category = models.ForeignKey(Categories, on_delete=models.CASCADE, related_name='budget_category')
    amount = models.DecimalField(max_digits=19, decimal_places=2)
    input_date = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"user: {self.user} - category: {self.category} - amount: {self.amount} - input date: {self.input_date}"

    def serialize_budget(self):
        return {
            "id" : self.id,
            "user_id" : self.user.id,
            "user" : self.user.username,
            "category" : self.category.category,
            "amount" : self.amount,
            "input_date" : self.input_date.strftime("%b %d %Y, %I:%M %p")
        }
