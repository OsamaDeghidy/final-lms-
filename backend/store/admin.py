from django.contrib import admin
from core.admin_mixins import ImportExportAdminMixin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone

from .models import Cart, CartItem, Wishlist, Order, OrderItem, Coupon
from .models_payment import PaymentMethod, RefundRequest, Transaction


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    raw_id_fields = ['course']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_price', 'total_items', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__username', 'user__email']
    inlines = [CartItemInline]
    readonly_fields = ['total_price', 'total_items']
    
    def total_price(self, obj):
        return obj.total_price
    total_price.short_description = 'السعر الإجمالي'
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'عدد العناصر'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'course', 'quantity', 'total_price']
    list_filter = ['added_at']
    search_fields = ['cart__user__username', 'course__title']
    raw_id_fields = ['cart', 'course']
    
    def total_price(self, obj):
        return obj.total_price
    total_price.short_description = 'السعر الإجمالي'


class WishlistCoursesInline(admin.TabularInline):
    model = Wishlist.courses.through
    extra = 1
    raw_id_fields = ['course']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'courses_count', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__username', 'user__email']
    inlines = [WishlistCoursesInline]
    exclude = ['courses']
    
    def courses_count(self, obj):
        return obj.courses.count()
    courses_count.short_description = 'عدد الدورات'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['get_total_price']
    raw_id_fields = ['course']
    
    def get_total_price(self, obj):
        return obj.price * obj.quantity
    get_total_price.short_description = 'السعر الإجمالي'


@admin.register(Order)
class OrderAdmin(ImportExportAdminMixin, admin.ModelAdmin):
    list_display = [
        'order_number', 'user', 'status', 'total', 'payment_method', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = [
        'order_number', 'user__username', 'user__email',
        'billing_email', 'billing_name'
    ]
    readonly_fields = [
        'order_number', 'subtotal', 'tax', 'total', 'created_at', 'updated_at'
    ]
    inlines = [OrderItemInline]
    fieldsets = [
        (None, {
            'fields': [
                'order_number', 'user', 'status', 'payment_method',
                'payment_id', 'payment_status'
            ]
        }),
        ('معلومات الفوترة', {
            'fields': [
                'billing_name', 'billing_email', 'billing_address'
            ]
        }),
        ('الإجماليات', {
            'fields': [
                'subtotal', 'tax', 'total'
            ]
        }),
        ('التواريخ', {
            'fields': [
                'created_at', 'updated_at'
            ]
        }),
    ]


@admin.register(Coupon)
class CouponAdmin(ImportExportAdminMixin, admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'is_valid', 'used_count', 'valid_until']
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at', 'used_count', 'is_valid', 'valid_until']
    date_hierarchy = 'valid_to'
    
    fieldsets = [
        (None, {
            'fields': [
                'code', 'description', 'is_active',
                'discount_type', 'discount_value',
                'min_purchase', 'max_uses', 'used_count',
            ]
        }),
        ('الصلاحية', {
            'fields': [
                'valid_from', 'valid_to'
            ]
        }),
        ('التواريخ', {
            'fields': [
                'created_at', 'updated_at'
            ],
            'classes': ['collapse']
        }),
    ]
    
    def is_valid(self, obj):
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = 'صالح؟'
    
    def valid_until(self, obj):
        return obj.valid_to
    valid_until.short_description = 'صالح حتى'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'course', 'price', 'created_at', 'get_order_user']
    list_filter = ['created_at']
    search_fields = [
        'order__order_number', 'course__title',
        'order__user__username', 'order__user__email'
    ]
    raw_id_fields = ['order', 'course']
    readonly_fields = ['created_at']
    
    def get_order_user(self, obj):
        return obj.order.user if obj.order and obj.order.user else None
    get_order_user.short_description = 'المستخدم'
    get_order_user.admin_order_field = 'order__user'


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'payment_type', 'card_type', 'last_four', 'is_default', 'is_verified', 'created_at']
    list_filter = ['payment_type', 'card_type', 'is_default', 'is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'billing_name', 'billing_email', 'last_four']
    readonly_fields = ['created_at', 'updated_at', 'masked_card_display', 'expiry_date_display']
    
    fieldsets = (
        ('المستخدم', {
            'fields': ('user',)
        }),
        ('معلومات الدفع', {
            'fields': ('payment_type', 'card_type', 'last_four', 'is_default')
        }),
        ('تفاصيل البطاقة', {
            'fields': ('expiry_month', 'expiry_year', 'masked_card_display', 'expiry_date_display'),
            'classes': ('collapse',)
        }),
        ('معلومات الفوترة', {
            'fields': ('billing_name', 'billing_email', 'billing_phone', 'billing_address'),
            'classes': ('collapse',)
        }),
        ('إعدادات النظام', {
            'fields': ('payment_gateway_id', 'is_verified'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def masked_card_display(self, obj):
        return obj.mask_card_number() or '-'
    masked_card_display.short_description = 'رقم البطاقة'
    
    def expiry_date_display(self, obj):
        return obj.expiry_date() or '-'
    expiry_date_display.short_description = 'تاريخ الانتهاء'


@admin.register(RefundRequest)
class RefundRequestAdmin(ImportExportAdminMixin, admin.ModelAdmin):
    list_display = ['request_id', 'order', 'user', 'status', 'amount_requested', 'amount_approved', 'created_at']
    list_filter = ['status', 'reason', 'created_at']
    search_fields = ['request_id', 'order__order_number', 'user__username', 'user__email']
    readonly_fields = ['request_id', 'created_at', 'updated_at', 'refunded_at']
    
    fieldsets = (
        ('معلومات الطلب', {
            'fields': ('request_id', 'order', 'user', 'status')
        }),
        ('تفاصيل الاسترداد', {
            'fields': ('reason', 'reason_details', 'amount_requested', 'amount_approved')
        }),
        ('ملاحظات المدير', {
            'fields': ('admin_notes',)
        }),
        ('معلومات المعالجة', {
            'fields': ('refund_reference', 'refunded_at'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_refunds', 'reject_refunds', 'process_refunds']
    
    def approve_refunds(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='approved')
        self.message_user(request, f'تم الموافقة على {updated} طلب استرداد.')
    approve_refunds.short_description = "الموافقة على طلبات الاسترداد المحددة"
    
    def reject_refunds(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='rejected')
        self.message_user(request, f'تم رفض {updated} طلب استرداد.')
    reject_refunds.short_description = "رفض طلبات الاسترداد المحددة"
    
    def process_refunds(self, request, queryset):
        processed = 0
        for refund in queryset.filter(status='approved'):
            success, message = refund.process_refund()
            if success:
                processed += 1
        self.message_user(request, f'تم معالجة {processed} طلب استرداد.')
    process_refunds.short_description = "معالجة طلبات الاسترداد المحددة"


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'transaction_type', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['transaction_type', 'status', 'currency', 'created_at']
    search_fields = ['transaction_id', 'user__username', 'user__email', 'gateway_transaction_id']
    readonly_fields = ['transaction_id', 'created_at', 'updated_at', 'processed_at']
    
    fieldsets = (
        ('معلومات المعاملة', {
            'fields': ('transaction_id', 'user', 'transaction_type', 'status')
        }),
        ('المبلغ', {
            'fields': ('amount', 'currency')
        }),
        ('الروابط', {
            'fields': ('order', 'refund_request', 'payment_method'),
            'classes': ('collapse',)
        }),
        ('معلومات البوابة', {
            'fields': ('gateway_transaction_id', 'gateway_response'),
            'classes': ('collapse',)
        }),
        ('ملاحظات', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )
