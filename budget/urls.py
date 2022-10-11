from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("password_reset", views.password_reset_request, name="password_reset"),
    path("change_password", views.change_password, name="change_password"),
    path("setnickname", views.setnickname, name="setnickname"),
    path("load_transactions/<str:date>", views.load_transactions, name="load_transactions"),
    path("summary_month/<str:date>", views.summary_month, name="summary_month"),
    path("general_summary/<str:date>", views.general_summary, name="general_summary"),
    path("new_transaction", views.new_transaction, name="new_transaction"),
    path("delete_transaction/<int:id>", views.delete_transaction, name="delete_transaction")
]