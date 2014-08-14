from wtforms_alchemy import ModelForm
from backend.models import Permit


class PermitForm(ModelForm):
    class Meta:
        model = Permit
