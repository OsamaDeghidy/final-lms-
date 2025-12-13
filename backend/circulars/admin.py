from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect
from django.urls import path
from .models import Circular
from extras.admin import custom_admin_site
from notifications.services import EmailService
from notifications.models import Notification, NotificationLog, BannerNotification


@admin.register(Circular)
class CircularAdmin(admin.ModelAdmin):
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:circular_id>/send_now/',
                self.admin_site.admin_view(self.send_now_view),
                name='circulars_circular_send_now',
            ),
        ]
        return custom_urls + urls
    
    def send_now_view(self, request, circular_id):
        """إرسال تعميم مجدول الآن"""
        circular = get_object_or_404(Circular, pk=circular_id)
        
        if circular.status != 'scheduled':
            messages.error(request, f'التعميم ليس في حالة "مجدول"')
            return redirect('admin:circulars_circular_changelist')
        
        # تحديث الحالة وإرسال
        circular.status = 'sent'
        if not circular.publish_at:
            circular.publish_at = timezone.now()
        circular.save()
        
        # إعادة تحميل مع العلاقات
        circular = Circular.objects.prefetch_related(
            'target_students__profile__user',
            'target_divisions__students__profile__user'
        ).get(pk=circular.pk)
        
        try:
            self._send_circular(circular, request)
            messages.success(request, f'✅ تم إرسال التعميم "{circular.title}" بنجاح')
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"خطأ في إرسال التعميم: {str(e)}")
            messages.error(request, f'❌ حدث خطأ عند إرسال التعميم: {str(e)}')
        
        return redirect('admin:circulars_circular_change', circular.pk)
    list_display = ('title', 'status_display', 'recipients_count', 'show_on_homepage', 'send_options_display', 'publish_at', 'created_at', 'actions_column')
    search_fields = ('title', 'content')
    list_filter = ('status', 'show_on_homepage', 'send_email', 'send_notification', 'created_at')
    readonly_fields = ('recipients_count', 'created_at', 'updated_at', 'send_info')
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'content', 'attachment')
        }),
        ('الاستهداف', {
            'fields': ('target_divisions', 'target_students'),
            'description': 'اختر الشعب أو الطلاب المستهدفين. إذا لم تختر شيئاً، سيتم إرسال التعميم للجميع.'
        }),
        ('خيارات الإرسال', {
            'fields': ('send_email', 'send_notification', 'show_on_homepage'),
            'description': 'حدد كيفية إرسال التعميم: عبر الإشعارات في المنصة، البريد الإلكتروني، أو عرضه في الصفحة الرئيسية'
        }),
        ('الحالة والجدولة', {
            'fields': ('status', 'publish_at'),
            'description': 'يمكنك جدولة التعميم للتاريخ المحدد. عند تغيير الحالة إلى "مرسل" سيتم الإرسال فوراً عند الحفظ.'
        }),
        ('معلومات الإرسال', {
            'fields': ('send_info',),
            'description': 'معلومات حول وقت إرسال التعميم'
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at', 'recipients_count'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ('target_divisions', 'target_students')
    actions = ['send_selected_circulars', 'mark_as_draft', 'schedule_selected', 'send_scheduled_now']
    
    def status_display(self, obj):
        colors = {
            'draft': ('#6c757d', '⏸ مسودة'),
            'scheduled': ('#ffc107', '⏳ مجدول'),
            'sent': ('#28a745', '✅ مرسل'),
        }
        color, text = colors.get(obj.status, ('#6c757d', obj.status))
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, text)
    status_display.short_description = 'الحالة'
    
    def send_options_display(self, obj):
        options = []
        if obj.send_notification:
            options.append('🔔 إشعار')
        if obj.send_email:
            options.append('📧 بريد')
        if obj.show_on_homepage:
            options.append('🏠 رئيسية')
        return ', '.join(options) if options else 'لا شيء'
    send_options_display.short_description = 'خيارات الإرسال'
    
    def send_info(self, obj):
        if obj.pk:
            if obj.status == 'sent':
                return format_html('<span style="color: #28a745;">✅ تم الإرسال</span>')
            elif obj.status == 'scheduled' and obj.publish_at:
                return format_html('<span style="color: #ffc107;">⏰ مجدول للإرسال في: {}</span>', obj.publish_at.strftime("%Y-%m-%d %H:%M"))
            elif obj.status == 'draft':
                if obj.send_notification or obj.send_email:
                    return format_html('<span style="color: #6c757d;">⚠️ جاهز للإرسال (غير مرسل بعد) - غير الحالة إلى "مرسل" للإرسال الفوري</span>')
                else:
                    return format_html('<span style="color: #6c757d;">❌ غير جاهز للإرسال (لم يتم تفعيل خيارات الإرسال)</span>')
        return 'سيتم تحديد الحالة بعد الحفظ'
    send_info.short_description = 'معلومات الإرسال'
    
    def actions_column(self, obj):
        actions_html = []
        if obj.status != 'sent':
            actions_html.append(
                f'<a href="#" onclick="sendCircular({obj.id}); return false;" '
                f'style="color: #28a745; font-weight: bold;">📤 إرسال</a>'
            )
        if obj.status == 'scheduled':
            actions_html.append(
                f'<a href="/admin/circulars/circular/{obj.id}/send_now/" '
                f'style="color: #007bff; font-weight: bold;">⚡ إرسال الآن</a>'
            )
        if obj.status == 'draft':
            actions_html.append(
                f'<a href="#" onclick="scheduleCircular({obj.id}); return false;" '
                f'style="color: #ffc107;">⏰ جدولة</a>'
            )
        return format_html(' | '.join(actions_html)) if actions_html else '-'
    actions_column.short_description = 'إجراءات'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        
        # إذا لم يتم تحديد publish_at وكان status=sent، إرسال فوري
        if obj.status == 'sent' and not obj.publish_at:
            obj.publish_at = timezone.now()
        
        super().save_model(request, obj, form, change)
        self._saved_obj = obj
    
    def save_related(self, request, form, formsets, change):
        """حفظ العلاقات المرتبطة ثم إرسال التعميم إذا كان status=sent"""
        import logging
        logger = logging.getLogger(__name__)
        
        super().save_related(request, form, formsets, change)
        
        obj = getattr(self, '_saved_obj', form.instance)
        logger.info(f"save_related called for circular {obj.pk}, status: {obj.status}")
        
        # إعادة تحميل الكائن مع العلاقات
        try:
            obj = Circular.objects.prefetch_related(
                'target_students__profile__user',
                'target_divisions__students__profile__user'
            ).get(pk=obj.pk)
            
            # التحقق من العلاقات
            students_count = obj.target_students.count()
            divisions_count = obj.target_divisions.count()
            logger.info(f"Circular {obj.pk}: {students_count} students, {divisions_count} divisions")
            
        except Circular.DoesNotExist:
            logger.error(f"Circular {obj.pk} not found after save_related")
            return
        
        # إذا كان status=sent، إرسال فوري
        if obj.status == 'sent':
            logger.info(f"Circular {obj.pk} status is 'sent', starting send process")
            try:
                self._send_circular(obj, request)
            except Exception as e:
                logger.error(f"خطأ في إرسال التعميم: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                messages.error(request, f'❌ حدث خطأ عند إرسال التعميم: {str(e)}')
        else:
            logger.info(f"Circular {obj.pk} status is '{obj.status}', skipping send")
    
    def response_add(self, request, obj, post_url_continue=None):
        """بعد إضافة التعميم، التحقق من الإرسال"""
        import logging
        logger = logging.getLogger(__name__)
        
        # إذا كان status=sent، إرسال فوري (في حالة لم يتم الإرسال في save_related)
        if obj.status == 'sent':
            logger.info(f"response_add: التعميم {obj.pk} في حالة 'sent'، محاولة الإرسال")
            try:
                obj = Circular.objects.prefetch_related(
                    'target_students__profile__user',
                    'target_divisions__students__profile__user'
                ).get(pk=obj.pk)
                self._send_circular(obj, request)
            except Exception as e:
                logger.error(f"خطأ في إرسال التعميم من response_add: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
        
        return super().response_add(request, obj, post_url_continue)
    
    def response_change(self, request, obj):
        """بعد تعديل التعميم، التحقق من الإرسال"""
        import logging
        logger = logging.getLogger(__name__)
        
        # إذا كان status=sent، إرسال فوري (في حالة لم يتم الإرسال في save_related)
        if obj.status == 'sent':
            logger.info(f"response_change: التعميم {obj.pk} في حالة 'sent'، محاولة الإرسال")
            try:
                obj = Circular.objects.prefetch_related(
                    'target_students__profile__user',
                    'target_divisions__students__profile__user'
                ).get(pk=obj.pk)
                self._send_circular(obj, request)
            except Exception as e:
                logger.error(f"خطأ في إرسال التعميم من response_change: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
        
        return super().response_change(request, obj)
    
    def _send_circular(self, circular, request=None):
        """إرسال التعميم للمستهدفين"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"=== بدء إرسال التعميم '{circular.title}' (ID: {circular.pk}) ===")
        
        # التحقق من وجود خيارات إرسال مفعلة
        if not circular.send_notification and not circular.send_email:
            logger.warning(f"التعميم '{circular.title}' لا يحتوي على خيارات إرسال مفعلة")
            if request:
                messages.warning(request, '⚠️ لم يتم تفعيل خيارات الإرسال (إشعار أو بريد)')
            return
        
        logger.info(f"خيارات الإرسال: send_notification={circular.send_notification}, send_email={circular.send_email}")
        
        # التحقق من العلاقات
        students_count = circular.target_students.count()
        divisions_count = circular.target_divisions.count()
        logger.info(f"العلاقات: {students_count} طلاب مباشرين, {divisions_count} شعب")
        
        recipients = circular.get_recipients()
        logger.info(f"عدد المستلمين المحتملين: {len(recipients)}")
        
        if not recipients:
            logger.warning(f"التعميم '{circular.title}' لا يحتوي على مستلمين مستهدفين")
            if request:
                messages.warning(request, '⚠️ لا يوجد مستلمين مستهدفين للتعميم. تحقق من الشعب والطلاب المحددين.')
            return
        
        logger.info(f"✅ بدء إرسال التعميم '{circular.title}' إلى {len(recipients)} مستلم")
        
        # إنشاء BannerNotification للعرض في المنصة (مرة واحدة فقط)
        # ملاحظة: لا ننشئ BannerNotification من التعميم لأننا ننشئ Notification مباشرة
        # BannerNotification يستخدم للإشعارات المستقلة فقط
        
        # إنشاء إشعارات في المنصة لكل مستخدم
        notifications = []
        if circular.send_notification:
            for user in recipients:
                if user and hasattr(user, 'email') and user.email:
                    try:
                        # إنشاء إشعار في المنصة
                        notification = Notification.objects.create(
                            recipient=user,
                            sender=circular.created_by,
                            title=circular.title,
                            message=circular.content or '',
                            notification_type='system_announcement',
                            priority='high',
                        )
                        notifications.append((notification, user))
                    except Exception as e:
                        logger.error(f"خطأ في إنشاء إشعار للمستخدم {user.email}: {str(e)}")
                        continue
        
        # إرسال البريد الإلكتروني
        emails_sent = 0
        emails_failed = 0
        if circular.send_email:
            logger.info(f"بدء إرسال البريد الإلكتروني - عدد الإشعارات: {len(notifications)}")
            
            # الحصول على المرفق إذا كان موجوداً
            attachment = circular.attachment if hasattr(circular, 'attachment') and circular.attachment else None
            if attachment:
                logger.info(f"تم العثور على مرفق: {attachment.name}")
            
            if notifications:
                # إرسال البريد للمستخدمين الذين لديهم إشعارات
                for notification, user in notifications:
                    try:
                        if user and hasattr(user, 'email') and user.email:
                            logger.info(f"محاولة إرسال بريد للمستخدم {user.email}")
                            result = EmailService.send_notification_email(notification, user, attachment=attachment)
                            if result:
                                emails_sent += 1
                                logger.info(f"تم إرسال البريد بنجاح للمستخدم {user.email}")
                            else:
                                emails_failed += 1
                                logger.warning(f"فشل إرسال البريد للمستخدم {user.email}")
                        else:
                            logger.warning(f"المستخدم {user} لا يمتلك بريد إلكتروني صحيح")
                    except Exception as e:
                        logger.error(f"خطأ في إرسال البريد للمستخدم {user.email if user and hasattr(user, 'email') else 'unknown'}: {str(e)}")
                        import traceback
                        logger.error(traceback.format_exc())
                        emails_failed += 1
            else:
                logger.warning("لا توجد إشعارات لإرسال البريد لها - ربما send_notification معطل")
                # إذا كان send_email مفعلاً لكن send_notification معطل، إنشاء إشعارات فقط للإرسال
                if not circular.send_notification:
                    logger.info("إنشاء إشعارات مؤقتة لإرسال البريد فقط")
                    temp_notifications = []
                    for user in recipients:
                        if user and hasattr(user, 'email') and user.email:
                            try:
                                notification = Notification.objects.create(
                                    recipient=user,
                                    sender=circular.created_by,
                                    title=circular.title,
                                    message=circular.content or '',
                                    notification_type='system_announcement',
                                    priority='high',
                                )
                                temp_notifications.append((notification, user))
                            except Exception as e:
                                logger.error(f"خطأ في إنشاء إشعار مؤقت: {str(e)}")
                                continue
                    
                    # إرسال البريد للإشعارات المؤقتة
                    for notification, user in temp_notifications:
                        try:
                            result = EmailService.send_notification_email(notification, user, attachment=attachment)
                            if result:
                                emails_sent += 1
                            else:
                                emails_failed += 1
                        except Exception as e:
                            logger.error(f"خطأ في إرسال البريد: {str(e)}")
                            emails_failed += 1
        
        # رسالة نجاح
        if request:
            msg_parts = [f'✅ تم إرسال التعميم إلى {len(recipients)} مستخدم']
            if circular.send_notification:
                msg_parts.append(f'({len(notifications)} إشعار في المنصة)')
            if circular.send_email:
                msg_parts.append(f'({emails_sent} بريد إلكتروني)')
                if emails_failed > 0:
                    msg_parts.append(f'({emails_failed} فشل)')
            
            messages.success(request, ' '.join(msg_parts))
    
    @admin.action(description='إرسال التعاميم المحددة')
    def send_selected_circulars(self, request, queryset):
        count = 0
        for circular in queryset:
            if circular.status != 'sent':
                circular.status = 'sent'
                circular.publish_at = timezone.now()
                circular.save()
                try:
                    self._send_circular(circular, request)
                    count += 1
                except Exception as e:
                    messages.error(request, f'❌ خطأ في إرسال التعميم "{circular.title}": {str(e)}')
        
        self.message_user(
            request,
            f'✅ تم إرسال {count} تعميم بنجاح',
            level='success'
        )
    
    @admin.action(description='تعيين كمسودة')
    def mark_as_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(
            request,
            f'✅ تم تعيين {updated} تعميم كمسودة',
            level='success'
        )
    
    @admin.action(description='جدولة التعاميم المحددة')
    def schedule_selected(self, request, queryset):
        updated = queryset.update(status='scheduled')
        self.message_user(
            request,
            f'⏳ تم جدولة {updated} تعميم',
            level='info'
        )
    
    @admin.action(description='إرسال التعاميم المجدولة الآن')
    def send_scheduled_now(self, request, queryset):
        """إرسال التعاميم المجدولة فوراً (حتى لو لم يصل وقتها)"""
        from circulars.management.commands.process_scheduled_circulars import Command as ProcessCommand
        command = ProcessCommand()
        command.handle()
        
        count = queryset.filter(status='scheduled').update(status='sent')
        self.message_user(
            request,
            f'✅ تم إرسال {count} تعميم مجدول',
            level='success'
        )

# Register with custom admin site explicitly to ensure visibility
custom_admin_site.register(Circular, CircularAdmin)