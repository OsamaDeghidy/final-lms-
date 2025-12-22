"""
Utility functions for users app
"""

def fix_arabic_encoding(text):
    """
    إصلاح ترميز النص العربي بطرق متعددة
    هذه الدالة تحل مشكلة ظهور النصوص العربية كرموز مثل Ø§Ø³Ø§Ù…Ù‡
    """
    if not text:
        return ''
    
    # تحويل إلى string إذا لم يكن string
    if not isinstance(text, str):
        try:
            text = str(text)
        except:
            return ''
    
    # إذا كان النص يحتوي على رموز مثل Ø§Ø³Ø§، فهذا يعني أنه UTF-8 مخزن كـ Latin-1
    if 'Ø' in text or '§' in text or '³' in text or 'Ù' in text:
        try:
            # الطريقة 1: تحويل من Latin-1 إلى bytes ثم decode كـ UTF-8
            fixed = text.encode('latin-1').decode('utf-8')
            # التحقق من أن الإصلاح نجح (لا يجب أن يحتوي على رموز غريبة)
            if 'Ø' not in fixed and '§' not in fixed:
                return fixed
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
        
        try:
            # الطريقة 2: استخدام errors='replace' أو 'ignore'
            fixed = text.encode('latin-1', errors='ignore').decode('utf-8', errors='ignore')
            if 'Ø' not in fixed and '§' not in fixed:
                return fixed
        except:
            pass
    
    # إذا كان النص bytes، decodeه كـ UTF-8
    if isinstance(text, bytes):
        try:
            return text.decode('utf-8')
        except UnicodeDecodeError:
            try:
                return text.decode('utf-8', errors='ignore')
            except:
                return text.decode('latin-1', errors='ignore')
    
    return text

