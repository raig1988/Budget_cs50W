from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *

# Add profile to User Admin:
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete: False
    verbose_name_plural = 'Profiles'

class CustomizedUserAdmin(UserAdmin):
    inlines = (ProfileInline, )

# Register your models here.
admin.site.register(User, CustomizedUserAdmin)
admin.site.register(Categories)
admin.site.register(Budget)
admin.site.register(Transactions)