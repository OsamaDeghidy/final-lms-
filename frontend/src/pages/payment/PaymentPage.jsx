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
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  Payment as PaymentIcon,
  ArrowBack,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { courseAPI } from '../../services/courseService';
import { paymentAPI } from '../../services/api.service';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha('#1976d2', 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.12)}`,
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2.5, 4),
  fontSize: '1.2rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 4,
  textTransform: 'none',
  background: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)`,
  boxShadow: `0 8px 32px ${alpha('#1976d2', 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 16px 48px ${alpha('#1976d2', 0.4)}`,
    '&::before': {
      left: '100%',
    },
  },
}));

const CourseCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${alpha('#42a5f5', 0.05)} 0%, ${alpha('#1976d2', 0.02)} 100%)`,
  border: `1px solid ${alpha('#1976d2', 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, #1976d2, #f50057)`,
  },
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  background: alpha('#2e7d32', 0.1),
  border: `1px solid ${alpha('#2e7d32', 0.2)}`,
  color: '#2e7d32',
  fontSize: '0.875rem',
  fontWeight: 500,
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
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
          sx={{ borderRadius: 3, px: 4, py: 1.5 }}
        >
          العودة للدورات
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              color: '#1976d2',
              background: alpha('#fff', 0.8),
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: alpha('#fff', 0.9),
                transform: 'scale(1.1)',
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight={800} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #0e5181 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <PaymentIcon sx={{ fontSize: 40 }} />
            إتمام الشراء
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid xs={12} lg={8}>
            <StyledCard>
              <CardContent>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    mb: 4, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    fontWeight: 700,
                    color: '#1976d2'
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 28 }} />
                  معلومات الدورة
                </Typography>
                
                <CourseCard elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Avatar 
                    src={course.image} 
                    alt={course.title}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        border: '4px solid',
                        borderColor: '#1976d2',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                      }}
                  />
                  <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                      {course.title}
                    </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontSize: '1.1rem' }}>
                      {course.instructor}
                    </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                      <Chip 
                        label={course.level} 
                        color="primary" 
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                      />
                        <FeatureBox>
                          <TimeIcon fontSize="small" />
                        {course.duration}
                        </FeatureBox>
                        <FeatureBox>
                          <GroupIcon fontSize="small" />
                        {course.total_enrollments || 0} مشترك
                        </FeatureBox>
                  </Box>
                </Box>

                    <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                      <Typography variant="h4" color="primary" fontWeight={800} sx={{ mb: 1 }}>
                        {parseFloat(course.discount_price || course.price).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        ريال سعودي
                      </Typography>
                      {course.discount_price && (
                        <Typography 
                          variant="body2" 
                          color="error.main" 
                          sx={{ 
                            textDecoration: 'line-through',
                            fontWeight: 600
                          }}
                        >
                          {parseFloat(course.price).toFixed(2)} ر.س
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CourseCard>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 4,
                    borderRadius: 3,
                    background: alpha('#e3f2fd', 0.8),
                    border: '1px solid',
                    borderColor: '#42a5f5'
                  }}
                >
                  <SecurityIcon sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1" fontWeight={600}>
                  جميع المدفوعات آمنة ومشفرة عبر بوابة Moyasar
                  </Typography>
                </Alert>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
            <StyledCard>
              <CardContent>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      mb: 4, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      fontWeight: 700,
                      color: '#1976d2'
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 28 }} />
                  ملخص الطلب
                </Typography>
                
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      background: alpha('#1976d2', 0.05)
                    }}>
                      <Typography variant="body1" fontWeight={600}>سعر الدورة:</Typography>
                      <Typography variant="body1" fontWeight={700} color="primary">
                      {parseFloat(course.discount_price || course.price).toFixed(2)} ر.س
                    </Typography>
                  </Box>
                    
                  {course.discount_price && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 2,
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha('#2e7d32', 0.1)
                      }}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          التوفير:
                      </Typography>
                        <Typography variant="body2" color="success.main" fontWeight={700}>
                          {(parseFloat(course.price) - parseFloat(course.discount_price)).toFixed(2)} ر.س
                      </Typography>
                    </Box>
                  )}
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      background: alpha('#ed6c02', 0.05)
                    }}>
                      <Typography variant="body1" fontWeight={600}>الضريبة (15%):</Typography>
                      <Typography variant="body1" fontWeight={700} color="warning.main">
                      {(parseFloat(course.discount_price || course.price) * 0.15).toFixed(2)} ر.س
                    </Typography>
                  </Box>
                    
                    <Divider sx={{ my: 3, borderWidth: 2 }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #0e5181 100%)',
                      color: 'white'
                    }}>
                    <Typography variant="h6" fontWeight={700}>المجموع الكلي:</Typography>
                      <Typography variant="h5" fontWeight={800}>
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
                    {processingPayment ? 'جاري التوجيه...' : 'إتمام الدفع الآمن'}
                </PaymentButton>
                
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      mt: 3, 
                      borderRadius: 3, 
                      py: 1.5,
                      borderWidth: 2,
                      fontWeight: 600,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => navigate('/courses')}
                  >
                    العودة للدورات
                  </Button>
                  
                  <Box sx={{ 
                    mt: 4, 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e5978b 0%, #45a049 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="10" cy="10" r="1"/%3E%3C/g%3E%3C/svg%3E")',
                      opacity: 0.3,
                    }
                  }}>
                    <Typography variant="h6" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      fontWeight: 700
                    }}>
                      <CheckCircleIcon />
                      المميزات المضمنة
                    </Typography>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        وصول مدى الحياة للدورة
                  </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        شهادة إتمام معتمدة
                  </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon fontSize="small" />
                        ضمان استرداد الأموال خلال 30 يوم
                  </Typography>
                    </Box>
                  </Box>
              </CardContent>
            </StyledCard>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default PaymentPage;
