from django.urls import path 
from . import views

urlpatterns = [
    path('', views.sign_in, name='sign_in'),
    path('home/', views.home, name='home'),
    path('sign-out', views.sign_out, name='sign_out'),
]
