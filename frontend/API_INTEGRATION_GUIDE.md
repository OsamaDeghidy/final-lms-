# دليل تكامل API - صفحة تفاصيل الدورة

## نظرة عامة

تم تحديث صفحة تفاصيل الدورة (`CourseDetail.jsx`) لتعمل بشكل صحيح مع API الخلفية. هذا الدليل يوضح كيفية عمل التكامل والتحسينات المضافة.

## التحسينات المضافة

### 1. تحسين ملف الخدمات (`courseService.js`)

- ✅ إضافة معالجة أخطاء شاملة لجميع استدعاءات API
- ✅ إضافة دوال جديدة للتعامل مع التقييمات والتقدم
- ✅ تحسين دوال السلة والدفع
- ✅ إضافة رسائل خطأ باللغة العربية

### 2. تحسين معالجة البيانات

- ✅ دالة `transformCourseData` محسنة لتعامل مع تنسيقات مختلفة من API
- ✅ دعم متعدد للغة (عربي/إنجليزي) في البيانات
- ✅ معالجة أفضل للصور والملفات
- ✅ دعم التقييمات والمراجعات

### 3. تحسين تجربة المستخدم

- ✅ رسائل خطأ واضحة باللغة العربية
- ✅ معالجة حالات التحميل والأخطاء
- ✅ تحديث تلقائي للبيانات بعد التسجيل

## كيفية الاستخدام

### 1. إعداد البيئة

تأكد من وجود الملفات التالية:

```bash
# ملف التكوين
frontend/src/config/api.config.js

# ملف الخدمات
frontend/src/services/courseService.js

# متغيرات البيئة (اختياري)
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 2. استدعاء API

```javascript
import { courseAPI, cartAPI, paymentAPI } from '../../services/courseService';

// جلب تفاصيل الدورة
const courseData = await courseAPI.getCourseById(courseId);

// جلب الوحدات
const modulesData = await courseAPI.getCourseModules(courseId);

// جلب التقييمات
const reviewsData = await courseAPI.getCourseReviews(courseId);

// إضافة للسلة
await cartAPI.addToCart(courseId);

// إنشاء دفع
const { url } = await paymentAPI.createCoursePayment(courseId);
```

### 3. معالجة الأخطاء

```javascript
try {
  const data = await courseAPI.getCourseById(id);
  // معالجة البيانات
} catch (error) {
  // معالجة الأخطاء تلقائياً
  console.error('API Error:', error);
  // رسائل خطأ باللغة العربية
}
```

## نقاط النهاية المدعومة

### الدورات
- `GET /courses/courses/{id}/` - تفاصيل الدورة
- `GET /courses/courses/{id}/modules/` - وحدات الدورة
- `GET /courses/courses/{id}/reviews/` - تقييمات الدورة
- `GET /courses/courses/{id}/related/` - دورات ذات صلة
- `POST /courses/courses/{id}/enroll/` - التسجيل في الدورة

### السلة والدفع
- `GET /store/cart/` - محتويات السلة
- `POST /store/cart/items/` - إضافة للسلة
- `POST /store/payment/moyasar/course/{id}/create/` - إنشاء دفع

## معالجة البيانات

### تنسيق البيانات المدخل

```javascript
// مثال لبيانات الدورة من API
{
  id: 1,
  title: "دورة React المتقدمة",
  description: "وصف الدورة...",
  price: 99.99,
  discount_price: 79.99,
  image: "/media/courses/course1.jpg",
  instructor: {
    name: "أحمد محمد",
    profile_pic: "/media/profiles/ahmed.jpg"
  },
  category: {
    name: "تطوير الويب"
  },
  // ... المزيد من البيانات
}
```

### تنسيق البيانات المخرجة

```javascript
// بعد التحويل
{
  id: 1,
  title: "دورة React المتقدمة",
  subtitle: "وصف مختصر...",
  instructor: "أحمد محمد",
  instructorAvatar: "http://127.0.0.1:8000/media/profiles/ahmed.jpg",
  price: 99.99,
  originalPrice: 99.99,
  discount: 20,
  // ... البيانات المحولة
}
```

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ 404 - الدورة غير موجودة**
   - تحقق من صحة معرف الدورة
   - تأكد من أن الدورة منشورة

2. **خطأ 403 - لا توجد صلاحية**
   - تحقق من تسجيل الدخول
   - تأكد من صلاحيات المستخدم

3. **خطأ في الشبكة**
   - تحقق من اتصال الإنترنت
   - تأكد من تشغيل الخادم الخلفي

### سجلات التصحيح

```javascript
// تفعيل سجلات التصحيح
console.log('Course data:', courseData);
console.log('Modules data:', modulesData);
console.log('API Error:', error);
```

## التحديثات المستقبلية

- [ ] إضافة دعم للتنبيهات (Snackbar/Toast)
- [ ] تحسين معالجة الصور والملفات
- [ ] إضافة دعم للوضع غير المتصل
- [ ] تحسين الأداء مع التخزين المؤقت

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
