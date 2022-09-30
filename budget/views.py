from http.client import HTTPResponse
from django.shortcuts import render


# Create your views here.
def index(request):
    return render(request, "budget/index.html")

def register(request):
    return render(request, "budget/register.html")

def login(request):
    return render(request, "budget/login.html")