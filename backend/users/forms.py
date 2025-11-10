from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):
    """
    Django admin add-user form override:
    - Rename username label to Arabic "البريد الإلكتروني".
    - Allow leaving username blank and fall back to the provided email.
    - Surface first/last name inputs directly on the add screen.
    """

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email", "first_name", "last_name")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        username_field = self.fields.get("username")
        if username_field:
            username_field.label = "اسم المستخدم"
            username_field.required = False
            username_field.help_text = "سيتم استخدام البريد الإلكتروني كاسم مستخدم إذا تركته فارغاً."

        email_field = self.fields.get("email")
        if email_field:
            email_field.label = "البريد الإلكتروني "
            email_field.required = True

        first_name_field = self.fields.get("first_name")
        if first_name_field:
            first_name_field.label = "الاسم الأول"
            first_name_field.required = False

        last_name_field = self.fields.get("last_name")
        if last_name_field:
            last_name_field.label = "الاسم الثاني"
            last_name_field.required = False

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        username = cleaned_data.get("username")

        if not email:
            raise forms.ValidationError("يجب إدخال البريد الإلكتروني.")

        if not username and email:
            cleaned_data["username"] = email.lower()
            # Reflect the auto-filled username for subsequent processing.
            self.cleaned_data["username"] = cleaned_data["username"]

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        username = self.cleaned_data.get("username") or self.cleaned_data.get("email")
        email = self.cleaned_data.get("email")

        if username:
            user.username = username.lower()
        if email:
            user.email = email.lower()

        user.first_name = self.cleaned_data.get("first_name", "")
        user.last_name = self.cleaned_data.get("last_name", "")

        if commit:
            user.save()
            self.save_m2m()

        return user


class CustomUserChangeForm(UserChangeForm):
    """
    Ensure consistent labelling when editing existing users inside the admin.
    """

    class Meta(UserChangeForm.Meta):
        model = User
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        username_field = self.fields.get("username")
        if username_field:
            username_field.label = "البريد الإلكتروني"
            username_field.required = False
            username_field.help_text = "يمكن ترك الحقل فارغاً لاستخدام البريد الإلكتروني الحالي."

        email_field = self.fields.get("email")
        if email_field:
            email_field.label = "اسم المستخدم"

        first_name_field = self.fields.get("first_name")
        if first_name_field:
            first_name_field.label = "الاسم الأول"

        last_name_field = self.fields.get("last_name")
        if last_name_field:
            last_name_field.label = "الاسم الثاني"

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        username = cleaned_data.get("username")

        if not username and email:
            cleaned_data["username"] = email.lower()
            self.cleaned_data["username"] = cleaned_data["username"]

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        username = self.cleaned_data.get("username") or self.cleaned_data.get("email")
        email = self.cleaned_data.get("email")

        if username:
            user.username = username.lower()
        if email:
            user.email = email.lower()

        if commit:
            user.save()
            self.save_m2m()

        return user

