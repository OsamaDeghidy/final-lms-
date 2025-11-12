from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User

from .models import Profile


class CustomUserCreationForm(UserCreationForm):
    national_id = forms.CharField(
        max_length=100,
        required=True,
        label="رقم الهوية",
        help_text="أدخل رقم الهوية للمستخدم."
    )
    phone = forms.CharField(
        max_length=20,
        required=False,
        label="رقم الهاتف",
        help_text="اختياري"
    )
    """
    Django admin add-user form override:
    - Rename username label to Arabic "البريد الإلكتروني".
    - Allow leaving username blank and fall back to the provided email.
    - Surface first/last name inputs directly on the add screen.
    """

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email", "first_name", "last_name", "national_id", "phone")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._save_profile_after_commit = False

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

        national_id_field = self.fields.get("national_id")
        if national_id_field:
            national_id_field.label = "رقم الهوية"
            national_id_field.required = True
            national_id_field.help_text = "هذا الحقل إجباري ويجب أن يكون فريداً."

        phone_field = self.fields.get("phone")
        if phone_field:
            phone_field.label = "رقم الهاتف"
            phone_field.required = False

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

    def clean_national_id(self):
        national_id = self.cleaned_data.get("national_id")
        if not national_id:
            raise forms.ValidationError("رقم الهوية مطلوب.")

        if Profile.objects.filter(national_id__iexact=national_id.strip()).exists():
            raise forms.ValidationError("رقم الهوية مستخدم بالفعل.")

        return national_id.strip()

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
            self.save_profile(user)
            self._save_profile_after_commit = False
        else:
            self._save_profile_after_commit = True

        return user

    def save_profile(self, user):
        national_id = self.cleaned_data.get("national_id")
        phone = self.cleaned_data.get("phone")
        if not user.pk:
            user.save()
        profile, _ = Profile.objects.get_or_create(user_id=user.pk)
        profile.national_id = national_id.strip() if national_id else None
        profile.phone = phone.strip() if phone else None
        profile.save(update_fields=["national_id", "phone"])


class CustomUserChangeForm(UserChangeForm):
    national_id = forms.CharField(
        max_length=100,
        required=True,
        label="رقم الهوية",
        help_text="أدخل رقم الهوية للمستخدم."
    )
    phone = forms.CharField(
        max_length=20,
        required=False,
        label="رقم الهاتف",
        help_text="اختياري"
    )
    """
    Ensure consistent labelling when editing existing users inside the admin.
    """

    class Meta(UserChangeForm.Meta):
        model = User
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._save_profile_after_commit = False

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

        national_id_field = self.fields.get("national_id")
        if national_id_field:
            national_id_field.label = "رقم الهوية"
            national_id_field.required = True
            national_id_field.help_text = "هذا الحقل إجباري ويجب أن يكون فريداً."
            if self.instance and hasattr(self.instance, "profile"):
                national_id_field.initial = self.instance.profile.national_id

        phone_field = self.fields.get("phone")
        if phone_field:
            phone_field.label = "رقم الهاتف"
            phone_field.required = False
            if self.instance and hasattr(self.instance, "profile"):
                phone_field.initial = self.instance.profile.phone

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get("email")
        username = cleaned_data.get("username")

        if not username and email:
            cleaned_data["username"] = email.lower()
            self.cleaned_data["username"] = cleaned_data["username"]

        return cleaned_data

    def clean_national_id(self):
        national_id = self.cleaned_data.get("national_id")
        if not national_id:
            raise forms.ValidationError("رقم الهوية مطلوب.")

        queryset = Profile.objects.filter(national_id__iexact=national_id.strip())
        if self.instance and self.instance.pk:
            queryset = queryset.exclude(user_id=self.instance.pk)
        if queryset.exists():
            raise forms.ValidationError("رقم الهوية مستخدم بالفعل.")

        return national_id.strip()

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
            self.save_profile(user)
            self._save_profile_after_commit = False
        else:
            self._save_profile_after_commit = True

        return user

    def save_profile(self, user):
        if not user.pk:
            user.save()
        national_id = self.cleaned_data.get("national_id")
        phone = self.cleaned_data.get("phone")
        profile, _ = Profile.objects.get_or_create(user_id=user.pk)
        profile.national_id = national_id.strip() if national_id else None
        profile.phone = phone.strip() if phone else None
        profile.save(update_fields=["national_id", "phone"])

        return user

