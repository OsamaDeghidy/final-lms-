# دليل نظام الدفع والتسجيل في المنصة التعليمية
# Payment and Enrollment System Guide

## نظرة عامة / Overview

هذا الدليل يشرح كيفية عمل نظام الدفع والتسجيل في المنصة التعليمية، وكيفية استخدام جدولي `Order` و `Enrollment` معاً.

This guide explains how the payment and enrollment system works in the educational platform, and how to use both `Order` and `Enrollment` tables together.

## الفرق بين الجدولين / Difference Between Tables

### 1. جدول Order (الطلب)
**الغرض**: إدارة عملية الشراء والدفع
**Purpose**: Manage purchase and payment process

**المحتوى**:
- تفاصيل الطلب (رقم الطلب، الحالة، طريقة الدفع)
- معلومات الدفع (معرف الدفع، حالة الدفع، تفاصيل الفواتير)
- الحسابات المالية (المجموع الفرعي، الضرائب، الإجمالي، الخصومات)
- الكوبونات والخصومات
- OrderItem لكل كورس تم شراؤه

**Content**:
- Order details (order number, status, payment method)
- Payment information (payment ID, payment status, billing details)
- Financial calculations (subtotal, tax, total, discounts)
- Coupons and discounts
- OrderItem for each purchased course

### 2. جدول Enrollment (التسجيل)
**الغرض**: إدارة تسجيل الطالب في الكورس والوصول للمحتوى
**Purpose**: Manage student enrollment in courses and content access

**المحتوى**:
- حالة التسجيل (معلق، نشط، مكتمل، منسحب)
- تقدم الطالب في الكورس (نسبة التقدم %)
- تاريخ التسجيل والإكمال
- معلومات الدفع الأساسية (مدفوع، مبلغ الدفع، معرف المعاملة)

**Content**:
- Enrollment status (pending, active, completed, dropped)
- Student progress in course (progress %)
- Enrollment and completion dates
- Basic payment info (is paid, payment amount, transaction ID)

## سير العمل المقترح / Recommended Workflow

### الخطوة 1: إنشاء الطلب / Step 1: Create Order
```python
# إنشاء طلب جديد
order = Order.objects.create(
    user=user,
    order_number=generate_order_number(),
    billing_email=user.email,
    billing_name=user.get_full_name(),
    billing_address=user.address
)

# إضافة الكورسات للطلب
for course in cart_items:
    OrderItem.objects.create(
        order=order,
        course=course,
        price=course.price
    )

# حساب المجاميع
order.calculate_totals()
```

### الخطوة 2: معالجة الدفع / Step 2: Process Payment
```python
# إرسال الطلب لمنصة الدفع الخارجية
payment_result = external_payment_gateway.process_payment(order)

if payment_result.success:
    # تحديث حالة الطلب وإنشاء التسجيلات
    order.mark_as_paid(
        payment_id=payment_result.payment_id,
        payment_status='completed'
    )
else:
    order.status = 'cancelled'
    order.save()
```

### الخطوة 3: إنشاء التسجيلات / Step 3: Create Enrollments
```python
# يتم إنشاء التسجيلات تلقائياً عند استدعاء mark_as_paid()
# أو يمكن إنشاؤها يدوياً:

for item in order.items.all():
    enrollment = item.create_enrollment(user)
```

## مثال على الاستخدام / Usage Example

### إنشاء طلب كامل / Complete Order Creation
```python
def create_course_order(user, courses):
    """
    إنشاء طلب كامل لشراء كورسات
    Create complete order for purchasing courses
    """
    # 1. إنشاء الطلب
    order = Order.objects.create(
        user=user,
        order_number=f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        billing_email=user.email,
        billing_name=user.get_full_name(),
        billing_address=getattr(user, 'address', ''),
        status='pending'
    )
    
    # 2. إضافة الكورسات
    total = 0
    for course in courses:
        price = course.discount_price or course.price
        OrderItem.objects.create(
            order=order,
            course=course,
            price=price
        )
        total += price
    
    # 3. حساب المجاميع
    order.subtotal = total
    order.tax = total * Decimal('0.1')  # 10% ضريبة
    order.total = order.subtotal + order.tax
    order.save()
    
    return order

def process_payment_success(order, payment_id):
    """
    معالجة نجاح الدفع
    Process successful payment
    """
    # تحديث حالة الطلب وإنشاء التسجيلات
    order.mark_as_paid(payment_id)
    
    # إرسال إشعار للطالب
    send_enrollment_notification(order.user, order)
    
    return order
```

## الاستعلامات المفيدة / Useful Queries

### الحصول على كورسات الطالب / Get Student Courses
```python
# من جدول التسجيل
enrollments = Enrollment.objects.filter(
    student=user,
    status__in=['active', 'completed']
)

# من جدول الطلبات
paid_orders = Order.objects.filter(
    user=user,
    status='completed'
)
courses_from_orders = Course.objects.filter(
    order_items__order__in=paid_orders
).distinct()
```

### الحصول على إحصائيات المبيعات / Get Sales Statistics
```python
# إجمالي المبيعات
total_sales = Order.objects.filter(
    status='completed'
).aggregate(
    total=Sum('total')
)['total']

# عدد الطلبات المكتملة
completed_orders = Order.objects.filter(
    status='completed'
).count()

# الكورسات الأكثر مبيعاً
top_selling_courses = Course.objects.annotate(
    sales_count=Count('order_items__order', filter=Q(order_items__order__status='completed'))
).order_by('-sales_count')[:10]
```

## ملاحظات مهمة / Important Notes

1. **استخدم كلا الجدولين**: Order للدفع، Enrollment للوصول للمحتوى
   **Use both tables**: Order for payment, Enrollment for content access

2. **التسجيل التلقائي**: عند نجاح الدفع، يتم إنشاء التسجيل تلقائياً
   **Automatic enrollment**: When payment succeeds, enrollment is created automatically

3. **المرونة**: يمكن إنشاء تسجيل بدون طلب (مثل الكورسات المجانية)
   **Flexibility**: Can create enrollment without order (e.g., free courses)

4. **التتبع**: كل طلب مرتبط بتسجيل واحد أو أكثر
   **Tracking**: Each order is linked to one or more enrollments

## استثناءات / Exceptions

### الكورسات المجانية / Free Courses
```python
# إنشاء تسجيل مباشر للكورسات المجانية
enrollment = Enrollment.objects.create(
    student=user,
    course=free_course,
    is_paid=False,
    status='active'
)
```

### التسجيل اليدوي / Manual Enrollment
```python
# تسجيل طالب يدوياً (مثل منحة دراسية)
enrollment = Enrollment.objects.create(
    student=user,
    course=course,
    is_paid=True,
    payment_amount=0,
    status='active'
)
```

## الخلاصة / Summary

- **Order**: لإدارة عملية الشراء والدفع
- **Enrollment**: لإدارة الوصول للمحتوى والتقدم
- **الربط**: OrderItem يحتوي على مرجع للتسجيل
- **التكامل**: النظام يعمل معاً لتوفير تجربة سلسة

**Order**: For managing purchase and payment process
**Enrollment**: For managing content access and progress
**Linking**: OrderItem contains reference to enrollment
**Integration**: System works together to provide seamless experience
