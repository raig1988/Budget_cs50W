from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from .models import *
# Password Reset libraries:
from django.contrib.auth.forms import PasswordResetForm
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError
from django.db.models.query_utils import Q

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

# Create your views here.
def index(request):
    return render(request, "budget/index.html")

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
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