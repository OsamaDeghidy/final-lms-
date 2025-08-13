import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  ArrowBack,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { cartAPI } from '../../services/courseService';
import { paymentAPI } from '../../services/api.service';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 3,
  textTransform: 'none',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }
      loadCartItems();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('حدث خطأ أثناء إزالة الدورة من السلة');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.course.discount_price || item.course.price;
      return total + parseFloat(price);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    if (cartItems.length === 0) {
      alert('السلة فارغة. يرجى إضافة دورة إلى السلة أولاً.');
      return;
    }
    
    try {
      setProcessingPayment(true);
      const { url } = await paymentAPI.createMoyasarPayment();
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('حدث خطأ أثناء بدء عملية الدفع');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'primary.main' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CartIcon color="primary" />
            سلة التسوق
          </Typography>
        </Box>

        {cartItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              السلة فارغة
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              لم تقم بإضافة أي دورات إلى السلة بعد
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/courses')}
              sx={{ borderRadius: 3, px: 4, py: 1.5 }}
            >
              تصفح الدورات
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid xs={12} lg={8}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CartIcon color="primary" />
                    الدورات المضافة ({cartItems.length})
                  </Typography>
                  
                  {cartItems.map((item) => (
                    <Box key={item.course.id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2, 
                      mb: 2, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 2 
                    }}>
                      <Avatar 
                        src={item.course.image} 
                        alt={item.course.title}
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {item.course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.course.instructor}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip 
                            label={item.course.level} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {item.course.duration}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'left', mr: 2 }}>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {parseFloat(item.course.discount_price || item.course.price).toFixed(2)} ر.س
                        </Typography>
                        {item.course.discount_price && (
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {parseFloat(item.course.price).toFixed(2)} ر.س
                          </Typography>
                        )}
                      </Box>
                      <IconButton 
                        color="error" 
                        onClick={() => removeFromCart(item.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
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
                      <Typography variant="body1">عدد الدورات:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {cartItems.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">المجموع الفرعي:</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {calculateTotal().toFixed(2)} ر.س
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">الضريبة (15%):</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {(calculateTotal() * 0.15).toFixed(2)} ر.س
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight={700}>المجموع الكلي:</Typography>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        {(calculateTotal() * 1.15).toFixed(2)} ر.س
                      </Typography>
                    </Box>
                  </Box>
                  
                  <PaymentButton
                    variant="contained"
                    onClick={handleCheckout}
                    startIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                    disabled={cartItems.length === 0 || processingPayment}
                  >
                    {processingPayment ? 'جاري التوجيه...' : 'إتمام الشراء'}
                  </PaymentButton>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2, borderRadius: 3, py: 1.5 }}
                    onClick={() => navigate('/courses')}
                  >
                    إضافة المزيد من الدورات
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default CartPage;
