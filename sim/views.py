from django.shortcuts import render, redirect
import json
from django.contrib.auth import get_user_model, login
from core.settings import PROJECT_ID

def home(request):
    if not request.user.is_anonymous and request.user.has_verified_did:

        return render(request, 'sim/home.html')
    else:
        return redirect("sign_in")

def sign_in(request):
    if request.method == 'POST':
        try:
            response = json.loads(request.body)
            data = response.get('data')
            
            if data.get('success'):
                user_did = response.get('id')
                User = get_user_model()
                user, created = User.objects.get_or_create(
                    did=user_did,
                    has_verified_did=True,
                    defaults={
                        'username': user_did,
                        'password': user_did,
                    })
                user.save()
                login(request, user)
                return redirect('home')
            else:
                return render(request, 'sim/sign_in.html', {'error': 'Invalid DID'})
        except json.decoder.JSONDecodeError:
            return render(request, 'sim/sign_in.html', {'error': 'Invalid JSON'})

    project_id = PROJECT_ID 

    context = {
        'project_id': project_id,
    }

    return render(request, 'sim/sign_in.html', context)

def sign_out(request):
    request.session.flush()
    
    return redirect("sign_in")

