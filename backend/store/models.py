from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MinValueValidator
from decimal import Decimal
from django.core.exceptions import ValidationError

User = get_user_model()

class Coupon(models.Model):
    """كوبونات للخصومات على المشتريات"""
    DISCOUNT_TYPES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed', 'مبلغ ثابت'),
    ]
    
    code = models.CharField(max_length=50, unique=True, verbose_name='رمز الكوبون')
    description = models.TextField(blank=True, verbose_name='الوصف')
    discount_type = models.CharField(
        max_length=10, 
        choices=DISCOUNT_TYPES, 
        default='percentage',
        verbose_name='نوع الخصم'
    )
    discount_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name='قيمة الخصم'
    )
    max_uses = models.PositiveIntegerField(default=1, verbose_name='الحد الأقصى للاستخدام')
    used_count = models.PositiveIntegerField(default=0, verbose_name='عدد مرات الاستخدام')
    min_purchase = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='الحد الأدنى للشراء'
    )
    valid_from = models.DateTimeField(verbose_name='صالح من')
    valid_to = models.DateTimeField(verbose_name='صالح حتى')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'كوبون'
        verbose_name_plural = 'كوبونات'
    
    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()} - {self.discount_value})"
    
    def clean(self):
        if self.valid_from and self.valid_to and self.valid_to <= self.valid_from:
            raise ValidationError('تاريخ الصلاحية حتى يجب أن يكون بعد تاريخ الصلاحية من')
    
    def is_valid(self):
        """Check if coupon is valid for use"""
        now = timezone.now()
        return (
            self.is_active and
            self.used_count < self.max_uses and
            self.valid_from <= now <= self.valid_to
        )
    
    def apply_discount(self, amount):
        """Apply discount to the given amount"""
        if not self.is_valid():
            return amount
            
        if amount < self.min_purchase:
            return amount
            
        if self.discount_type == 'percentage':
            discount = (amount * self.discount_value) / 100
            # Ensure discount doesn't exceed the amount
            return max(amount - discount, Decimal('0.00'))
        else:  # fixed amount
            return max(amount - self.discount_value, Decimal('0.00'))


class Cart(models.Model):
    """سلة التسوق للمستخدمين"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='cart',
        verbose_name='المستخدم'
    )
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='carts',
        verbose_name='كوبون'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'سلة التسوق'
        verbose_name_plural = 'سلات التسوق'
    
    def __str__(self):
        return f"Cart for {self.user.username}"
    
    @property
    def total_price(self):
        """Calculate total price of all items in cart"""
        return sum(item.total_price for item in self.items.all())
    
    @property
    def subtotal(self):
        """Calculate subtotal of all items in cart"""
        return sum(item.total_price for item in self.items.all())
    
    @property
    def tax(self):
        """Calculate tax (15%) on subtotal"""
        return self.subtotal * Decimal('0.15')
    
    @property
    def total(self):
        """Calculate total including tax"""
        return self.subtotal + self.tax
    
    @property
    def total_items(self):
        """Get total number of items in cart"""
        return self.items.count()
    
    def add_item(self, course, quantity=1):
        """Add an item to the cart"""
        item, created = CartItem.objects.get_or_create(
            cart=self,
            course=course,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()
        return item
    
    def remove_item(self, course_id):
        """Remove an item from the cart"""
        self.items.filter(course_id=course_id).delete()
    
    def clear(self):
        """Remove all items from the cart"""
        self.items.all().delete()


class CartItem(models.Model):
    """عناصر في سلة التسوق"""
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items',
        verbose_name='السلة'
    )
    course = models.ForeignKey(
        'courses.Course', 
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name='الدورة'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='الكمية'
    )
    added_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإضافة')
    
    class Meta:
        ordering = ['-added_at']
        unique_together = ('cart', 'course')
        verbose_name = 'عنصر السلة'
        verbose_name_plural = 'عناصر السلة'
    
    def __str__(self):
        return f"{self.quantity}x {self.course.title} in cart"
    
    @property
    def total_price(self):
        """Calculate total price for this cart item"""
        price = self.course.discount_price if self.course.discount_price else self.course.price
        return price * self.quantity


class Wishlist(models.Model):
    """قائمة أمنيات المستخدم للدورات"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='wishlist',
        verbose_name='المستخدم'
    )
    courses = models.ManyToManyField(
        'courses.Course', 
        related_name='wishlisted_by',
        blank=True,
        verbose_name='الدورات'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'قائمة الأمنيات'
        verbose_name_plural = 'قوائم الأمنيات'
    
    def __str__(self):
        return f"Wishlist for {self.user.username}"
    
    def add_course(self, course):
        """Add a course to the wishlist"""
        self.courses.add(course)
        self.save()
    
    def remove_course(self, course):
        """Remove a course from the wishlist"""
        self.courses.remove(course)
        self.save()
    
    def clear(self):
        """Remove all courses from the wishlist"""
        self.courses.clear()
        self.save()


class Order(models.Model):
    """طلب لشراء الدورات"""
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('processing', 'قيد المعالجة'),
        ('completed', 'مكتمل'),
        ('cancelled', 'ملغي'),
        ('refunded', 'مسترد'),
    ]
    PAYMENT_METHODS = [
        ('credit_card', 'بطاقة ائتمان'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'تحويل بنكي'),
    ]
    
    # Add coupon fields to Order
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders_used',
        verbose_name='كوبون'
    )
    coupon_code = models.CharField(max_length=50, blank=True, verbose_name='رمز الكوبون')
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='مبلغ الخصم'
    )
    
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='orders',
        verbose_name='المستخدم'
    )
    order_number = models.CharField(max_length=20, unique=True, verbose_name='رقم الطلب')
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='الحالة'
    )
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHODS, 
        default='credit_card',
        verbose_name='طريقة الدفع'
    )
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        verbose_name='المجموع الفرعي'
    )
    tax = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        verbose_name='الضريبة'
    )
    total = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0,
        verbose_name='الإجمالي'
    )
    payment_id = models.CharField(max_length=100, blank=True, verbose_name='معرف الدفع')
    payment_status = models.CharField(max_length=50, blank=True, verbose_name='حالة الدفع')
    billing_email = models.EmailField(verbose_name='البريد الإلكتروني للفوترة')
    billing_name = models.CharField(max_length=100, verbose_name='اسم الفوترة')
    billing_address = models.TextField(verbose_name='عنوان الفوترة')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'طلب'
        verbose_name_plural = 'الطلبات'
    
    def __str__(self):
        return f"Order {self.order_number} - {self.get_status_display()}"
    
    def calculate_totals(self):
        """Calculate subtotal, tax, and total"""
        self.subtotal = sum(item.price for item in self.items.all())
        self.tax = self.subtotal * Decimal('0.1')  # 10% tax
        self.total = self.subtotal + self.tax
        self.save()
    
    def create_enrollments_after_payment(self):
        """Create enrollments for all order items after successful payment"""
        if self.status == 'completed' and self.user:
            for item in self.items.all():
                if not item.enrollment:
                    item.create_enrollment(self.user)
    
    def mark_as_paid(self, payment_id, payment_status='completed'):
        """Mark order as paid and create enrollments"""
        self.status = 'completed'
        self.payment_id = payment_id
        self.payment_status = payment_status
        self.save()
        
        # Create enrollments for all courses
        self.create_enrollments_after_payment()


class OrderItem(models.Model):
    """عناصر في الطلب"""
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='items',
        verbose_name='الطلب'
    )
    course = models.ForeignKey(
        'courses.Course', 
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name='الدورة'
    )
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name='السعر'
    )
    # Reference to enrollment after successful payment
    enrollment = models.ForeignKey(
        'courses.Enrollment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items',
        verbose_name='التسجيل'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'عنصر الطلب'
        verbose_name_plural = 'عناصر الطلب'
    
    def __str__(self):
        return f"{self.course.title} in order {self.order.order_number}"
    
    def create_enrollment(self, user):
        """Create enrollment for this order item"""
        from courses.models import Enrollment
        
        enrollment, created = Enrollment.objects.get_or_create(
            student=user,
            course=self.course,
            defaults={
                'is_paid': True,
                'payment_amount': self.price,
                'payment_date': timezone.now(),
                'transaction_id': self.order.payment_id,
                'status': 'active'
            }
        )
        
        if not created:
            # Update existing enrollment
            enrollment.is_paid = True
            enrollment.payment_amount = self.price
            enrollment.payment_date = timezone.now()
            enrollment.transaction_id = self.order.payment_id
            enrollment.status = 'active'
            enrollment.save()
        
        self.enrollment = enrollment
        self.save()
        
        return enrollment
