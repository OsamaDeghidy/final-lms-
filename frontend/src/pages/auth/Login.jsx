import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  School as SchoolIcon, 
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  EmailOutlined as EmailIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(98,0,238,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(98,0,238,0); }
  100% { box-shadow: 0 0 0 0 rgba(98,0,238,0); }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
}));

const LoginContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  maxWidth: 1000,
  width: '100%',
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[10],
  position: 'relative',
  zIndex: 1,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #6200ee 0%, #03dac6 100%)',
    zIndex: -1,
    transform: 'skewY(-5deg)',
    opacity: 0.1,
  },
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(8, 4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #6200ee 0%, #3700b3 100%)',
  color: theme.palette.common.white,
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(6, 5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 3),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1, 'auto', 3, 'auto'), // top, right, bottom, left
  backgroundColor: theme.palette.primary.main,
  width: 70,
  height: 70,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${pulse} 2s infinite`,
}));
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: 50,
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 14px 0 rgba(98, 0, 238, 0.2)',
  '&:hover': {
    boxShadow: '0 6px 20px 0 rgba(98, 0, 238, 0.3)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FloatingIcon = styled('div')(({ theme }) => ({
  position: 'absolute',
  color: 'rgba(255, 255, 255, 0.05)',
  fontSize: '10rem',
  zIndex: 0,
  '&:nth-of-type(1)': {
    top: '10%',
    left: '10%',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&:nth-of-type(2)': {
    bottom: '10%',
    right: '10%',
    animation: `${float} 7s ease-in-out infinite`,
    animationDelay: '0.5s',
  },
}));

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name] || submitError) {
      setErrors({
        ...errors,
        [name]: '',
      });
      setSubmitError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    setErrors(newErrors);
    setSubmitError(''); // Clear any previous submit errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const result = await dispatch(login(formData));
      
      if (login.fulfilled.match(result)) {
        // Get the user role from the profile status
        const userRole = result.payload?.profile?.status?.toLowerCase() || 
                        result.payload?.user_details?.type?.toLowerCase() || 
                        'student';
        
        // Redirect based on user role
        if (userRole === 'admin' || userRole === 'instructor') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else if (login.rejected.match(result)) {
        // Handle error from the auth slice
        const errorMessage = result.error || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
        setSubmitError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setSubmitError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider) => {
    // Handle social login
    console.log(`Logging in with ${provider}`);
  };

  return (
    <Fade in={true} timeout={800}>
      <StyledContainer maxWidth={false}>
        <LoginContainer elevation={3}>
          {/* Left Panel - Welcome Section */}
          <LeftPanel>
            <FloatingIcon>
              <SchoolIcon fontSize="inherit" />
            </FloatingIcon>
            <FloatingIcon>
              <PersonIcon fontSize="inherit" />
            </FloatingIcon>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                مرحباً بعودتك!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, maxWidth: '80%', mx: 'auto' }}>
استمر في رحلة التعلم معنا. تصفح دوراتك، تتبع تقدمك، وحقق أهدافك.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  ليس لديك حساب؟
                </Typography>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  color="inherit"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  إنشاء حساب
                </Button>
              </Box>
            </Box>
          </LeftPanel>

          {/* Right Panel - Login Form */}
          <RightPanel>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <StyledAvatar>
                <LockIcon />
              </StyledAvatar>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>

              </Typography>
              <Typography variant="body2" color="text.secondary">
                أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك
              </Typography>
            </Box>
            
            {(error || submitError) && (
              <Fade in={true}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    width: '100%',
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                >
                  {submitError || error}
                </Alert>
              </Fade>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="البريد الإلكتروني"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color={errors.email ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                    },
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={errors.password ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="تبديل رؤية كلمة المرور"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                    },
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                <Link 
                  component={RouterLink} 
                  to="/forgot-password" 
                  variant="body2" 
                  sx={{ 
                    textDecoration: 'none',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  نسيت كلمة المرور؟
                </Link>
              </Box>
              
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{
                  background: 'linear-gradient(45deg, #6200ee 0%, #7c4dff 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c4dff 0%, #6200ee 100%)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span>تسجيل الدخول</span>
                  </Box>
                )}
              </StyledButton>
              
              <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                  أو تابع باستخدام
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                <SocialButton onClick={() => handleSocialLogin('google')} aria-label="Google">
                  <GoogleIcon color="error" />
                </SocialButton>
                <SocialButton onClick={() => handleSocialLogin('facebook')} aria-label="Facebook">
                  <FacebookIcon color="primary" />
                </SocialButton>
                <SocialButton onClick={() => handleSocialLogin('twitter')} aria-label="Twitter">
                  <TwitterIcon color="info" />
                </SocialButton>
              </Box>
            </Box>
          </RightPanel>
        </LoginContainer>
      </StyledContainer>
    </Fade>
  );
};

export default Login;
