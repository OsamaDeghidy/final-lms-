import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowBack,
  Receipt as ReceiptIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { courseAPI } from '../../services/courseService';
import { paymentAPI } from '../../services/api.service';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.2)}`,
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2.5, 4),
  fontSize: '1.2rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 4,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/payment/${courseId}` } });
        return;
      }
      loadCourseData();
    }
  }, [courseId, isAuthenticated, authLoading, navigate]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await courseAPI.getCourseById(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Error loading course:', error);
      alert('حدث خطأ أثناء تحميل بيانات الدورة');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/payment/${courseId}` } });
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      // Create direct payment for the course
      const { url } = await paymentAPI.createCoursePayment(courseId);
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('حدث خطأ أثناء بدء عملية الدفع');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const calculateTotal = () => {
    if (!course) return 0;
    const price = course.discount_price || course.price;
    const subtotal = parseFloat(price);
    const tax = subtotal * 0.15; // 15% tax
    return subtotal + tax;
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            الدورة غير موجودة
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/courses')}
          startIcon={<ArrowBack />}
        >
          العودة للدورات
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={() => navigate(-1)} sx={{ color: 'primary.main' }}>
            <ArrowBack />
          </Button>
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            إتمام الشراء
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid xs={12} lg={8}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" />
                  معلومات الدورة
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Avatar 
                    src={course.image} 
                    alt={course.title}
                    sx={{ width: 100, height: 100, mr: 3 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      {course.instructor}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={course.level} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.total_enrollments || 0} مشترك
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  جميع المدفوعات آمنة ومشفرة عبر بوابة Moyasar
                </Alert>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} lg={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" />
                  ملخص الطلب
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">سعر الدورة:</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {parseFloat(course.discount_price || course.price).toFixed(2)} ر.س
                    </Typography>
                  </Box>
                  {course.discount_price && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        السعر الأصلي:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        {parseFloat(course.price).toFixed(2)} ر.س
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">الضريبة (15%):</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {(parseFloat(course.discount_price || course.price) * 0.15).toFixed(2)} ر.س
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>المجموع الكلي:</Typography>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {calculateTotal().toFixed(2)} ر.س
                    </Typography>
                  </Box>
                </Box>
                
                <PaymentButton
                  variant="contained"
                  onClick={handlePaymentSubmit}
                  disabled={processingPayment}
                  startIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                >
                  {processingPayment ? 'جاري التوجيه...' : 'إتمام الدفع'}
                </PaymentButton>
                
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    • وصول مدى الحياة للدورة
                  </Typography>
                  <Typography variant="body2">
                    • شهادة إتمام
                  </Typography>
                  <Typography variant="body2">
                    • ضمان استرداد الأموال خلال 30 يوم
                  </Typography>
                </Alert>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default PaymentPage;
