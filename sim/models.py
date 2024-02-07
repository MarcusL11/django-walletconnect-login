from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    has_verified_did = models.BooleanField(default=False)
    did = models.TextField(blank=True)

