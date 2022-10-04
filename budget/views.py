from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from .models import *
# Decorators
from django.contrib.auth.decorators import login_required
# Password Reset libraries:
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError
from django.db.models.query_utils import Q
# manage range of dates
import datetime
# Aggregation functions
from django.db.models import Sum



def index(request):
    return render(request, "budget/index.html")

# Get summary amount per category and per month and consolidate total value
def summary_month(request, date):
    month = int(request.GET["month"])
    year = int(request.GET["year"])
    user = request.user
    array = []
    category_dict = {}
    category = Transactions.objects.filter(user=user, date__month=month, date__year=year).values('category').annotate(categ_sum=Sum('amount'))
    sum_month = Transactions.objects.filter(user_id=user, date__month=month, date__year=year).aggregate(total_sum=Sum('amount'))
    categories = Categories.objects.all()
    for item in categories:
        category_dict[item.id] = item.category
    for item in category:
        array.append(item)
    return JsonResponse({
        "sum_categories" : array,
        "total_month" : sum_month["total_sum"],
        "categories" : category_dict
    })

# load all transactions per user per month and year
def load_transactions(request, date):
    month = int(request.GET["month"])
    year = int(request.GET["year"])
    # pass range as year, month and day
    selected_month = Transactions.objects.filter(user=request.user, date__month=month, date__year=year)
    month_transaction = Transactions.objects.filter(user=request.user).first()
    return JsonResponse({
        "date_transaction" : month_transaction.date,
        "transaction" : [transaction.serialize_transaction() for transaction in selected_month]
        })

# Profile view
@login_required
def profile(request):
    if Profile.objects.filter(user=request.user).exists():
        return render(request, "budget/profile.html", {"profile" : Profile.objects.get(user=request.user)})
    return render(request, "budget/profile.html")

def setnickname(request):
    if request.method == "POST":
        nickname = request.POST["nickname"]
        if not nickname:
            messages.error(request, "El nickname no puede estar vacio.")
            return redirect("profile")
        if Profile.objects.filter(user=request.user).exists():
            nickname_update = Profile.objects.get(user=request.user)
            nickname_update.nickname = nickname
            nickname_update.save()
            messages.success(request, 'Tu nickname ha sido actualizado.')
            return HttpResponseRedirect(reverse("profile"))
        nickname_create = Profile(user=request.user, nickname=nickname)
        nickname_create.save()
        messages.success(request, 'Tu nickname ha sido creado.')
        return HttpResponseRedirect(reverse("profile"))

def change_password(request):
    if request.method == "POST":
        change_password = request.POST["changepassword"]
        confirmation_password = request.POST["confirmationpassword"]
        if not change_password:
            messages.error(request, "La contraseña no puede estar vacia.")
            return redirect("profile")
        if change_password != confirmation_password:
            messages.error(request, "Las contraseñas deben coincidir.")
            return redirect("profile")
        user = User.objects.get(id=request.user.id)
        user.set_password(change_password)
        user.save()
        messages.success(request, 'Tu contraseña ha sido cambiada con exito.')
        login(request, user)
        return HttpResponseRedirect(reverse("profile"))

#end profile

# user register, login, logout, change password

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if not password:
            return render(request, "budget/register.html", {
                "message": "La contraseña no puede estar vacia."
            })
        if password != confirmation:
            return render(request, "budget/register.html", {
                "message": "Las contraseñas deben coincidir."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "budget/register.html", {
                "message": "Nombre de usuario ya esta en uso."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "budget/register.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "budget/login.html", {
                "message": "Nombre de usuario y/o contraseña invalida."
            })
    else:
        return render(request, "budget/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def password_reset_request(request):
    if request.method == 'POST':
        password_reset_form = PasswordResetForm(request.POST)
        if password_reset_form.is_valid():
            data = password_reset_form.cleaned_data['email']
            selected_user = User.objects.filter(Q(email=data))
            if selected_user.exists():
                for user in selected_user:
                    subject = "Solicitud de cambio de contraseña"
                    email_template_name = "budget/password/password_reset_email.txt"
                    context_mail = {
                        "email": user.email,
                        'domain': '127.0.0.1:8000', #to be changed during production
                        'site_name' : 'AprendoFinanzas123', #to be changed during production
                        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                        "user": user,
                        'token': default_token_generator.make_token(user),
                        'protocol': 'http' #to be changed during production
                    }
                    email = render_to_string(email_template_name, context_mail)
                    try:
                        send_mail(subject, email, 'aprendofinanzas123@gmail.com', [user.email], fail_silently=False) # from email to be changed during production
                    except BadHeaderError:
                        return HttpResponse('Invalid header found.')
                    messages.success(request, 'Un email con las instrucciones de cambio de contraseña ha sido enviado al inbox de tu email')
                    return redirect("index")
            messages.error(request, 'El email ingresado no es valido.')
    password_reset_form = PasswordResetForm()
    return render(request, "budget/password/password_reset.html", {"password_reset_form": password_reset_form})

# end user register, login, logout, change password