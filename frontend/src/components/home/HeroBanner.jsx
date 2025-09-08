import { useState, useEffect } from 'react';
import { 
  Box, Button, Container, Typography, useTheme, 
  Grid, keyframes
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Code, Laptop, PlayCircle, 
  School, Lightbulb, Book, Science, Edit
} from '@mui/icons-material';
import api from '../../services/api.service';

// Import the banner image
import bannerImage from '../../assets/images/img.png';

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const slideInLeft = keyframes`
  0% { transform: translateX(-50px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  0% { transform: translateX(50px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const fadeInUp = keyframes`
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const wave = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
`;

// Hero Section with creative background
const HeroSection = styled('section')(({ theme }) => ({
  position: 'relative',
  color: '#333',
  padding: '60px 0',
  overflow: 'hidden',
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#ffffff',
    zIndex: 0,
  },
  [theme.breakpoints.down('md')]: {
    padding: '40px 0',
    minHeight: '60vh',
  },
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const LeftSection = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  height: '500px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${slideInLeft} 1s ease-out`,
  [theme.breakpoints.down('md')]: {
    height: '300px',
    marginBottom: theme.spacing(4),
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(0, 4),
  animation: `${slideInRight} 1s ease-out 0.3s both`,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0, 2),
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  marginBottom: theme.spacing(3),
  fontSize: '3.5rem',
  lineHeight: 1.1,
  color: '#0e5181',
  textShadow: '0 2px 10px rgba(14, 81, 129, 0.2)',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  marginBottom: theme.spacing(4),
  color: '#333',
  fontWeight: 400,
  lineHeight: 1.6,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const HeroButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  borderRadius: '50px',
  textTransform: 'none',
  background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
  color: 'white',
  border: 'none',
  boxShadow: '0 8px 25px rgba(14, 81, 129, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 1s ease-out 0.6s both`,
  '&:hover': {
    background: 'linear-gradient(135deg, #0a3d5f 0%, #d17a6f 100%)',
    boxShadow: '0 12px 35px rgba(14, 81, 129, 0.4)',
    transform: 'translateY(-3px)',
  },
  '&:active': {
    transform: 'translateY(-1px)',
  },
}));

// Creative abstract shapes
const OrganicShape = styled(Box)(({ theme, variant, top, left, size, delay = 0, rotation = 0 }) => ({
    position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: size,
  height: size,
  borderRadius: variant === 'organic' ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '50%',
  background: variant === 'gradient' 
    ? 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)'
    : variant === 'light'
    ? '#f0f8ff'
    : variant === 'striped'
    ? 'repeating-linear-gradient(45deg, #0e5181, #0e5181 5px, #e5978b 5px, #e5978b 10px)'
    : '#0e5181',
  opacity: variant === 'light' ? 0.6 : 0.8,
  transform: `rotate(${rotation}deg)`,
  zIndex: 1,
  '&:hover': {
    transform: `scale(1.1) rotate(${rotation + 10}deg)`,
    opacity: 1,
  },
}));

const DiagonalShape = styled(Box)(({ theme, top, left, width, height, delay = 0, rotation = 45 }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: width,
  height: height,
  background: 'linear-gradient(45deg, #0e5181 0%, #e5978b 100%)',
  transform: `rotate(${rotation}deg)`,
  opacity: 0.7,
  zIndex: 1,
}));

const DottedGrid = styled(Box)(({ theme, top, left, rows = 3, cols = 4, delay = 0, color = '#FFB6C1' }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  display: 'grid',
  gridTemplateRows: `repeat(${rows}, 8px)`,
  gridTemplateColumns: `repeat(${cols}, 8px)`,
  gap: '4px',
    zIndex: 1,
  '& .dot': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
    opacity: 0.8,
  },
}));

const CircularGrid = styled(Box)(({ theme, top, left, rows = 4, cols = 5, delay = 0, color = '#DDA0DD' }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  display: 'grid',
  gridTemplateRows: `repeat(${rows}, 6px)`,
  gridTemplateColumns: `repeat(${cols}, 6px)`,
  gap: '3px',
    zIndex: 1,
  '& .circle': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: color,
    opacity: 0.8,
  },
}));

// Dashed connecting lines
const DashedLine = styled(Box)(({ theme, start, end, delay = 0 }) => ({
  position: 'absolute',
  top: `${start.top}%`,
  left: `${start.left}%`,
  width: `${Math.sqrt(Math.pow(end.left - start.left, 2) + Math.pow(end.top - start.top, 2))}px`,
  height: '2px',
  background: 'repeating-linear-gradient(to right, #e5978b 0, #e5978b 4px, transparent 4px, transparent 8px)',
  transform: `rotate(${Math.atan2(end.top - start.top, end.left - start.left) * 180 / Math.PI}deg)`,
  transformOrigin: '0 0',
  zIndex: 1,
  opacity: 0.6,
}));

// Student character container with image
const StudentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '650px',
  height: '750px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  [theme.breakpoints.down('md')]: {
    width: '450px',
    height: '550px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '320px',
    height: '420px',
  },
}));

const StudentImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  filter: 'drop-shadow(0 10px 30px rgba(14, 81, 129, 0.3))',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 15px 40px rgba(14, 81, 129, 0.5))',
  },
}));

// Enhanced educational icons
const EducationalIcon = styled(Box)(({ theme, top, left, size = 40, delay = 0, iconType = 'default' }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: size,
  height: size,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#0e5181',
  fontSize: `${size * 0.6}px`,
  zIndex: 2,
  '&:hover': {
    transform: 'scale(1.2)',
    color: '#e5978b',
  },
}));

// Floating particles
const FloatingParticle = styled(Box)(({ theme, top, left, size = 4, delay = 0, color = '#0e5181' }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  opacity: 0.6,
  zIndex: 1,
}));

// Floating Cards like in the image
const FloatingCard = styled(Box)(({ theme, position, delay = 0 }) => ({
  position: 'absolute',
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  zIndex: 2,
  animation: `${floatAnimation} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.05)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)',
    background: '#ffffff',
  },
  ...position,
}));

const FloatingIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'iconColor',
})(({ theme, bgColor = '#f5f5f5', iconColor = '#666' }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: bgColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: iconColor,
  fontSize: '1.2rem',
  flexShrink: 0,
}));

const FloatingText = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  '& .title': {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: '2px',
  },
  '& .subtitle': {
    fontSize: '0.7rem',
    color: '#666',
    lineHeight: 1.2,
  },
}));

const FloatingBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'color',
})(({ theme, bgColor = '#0e5181', color = '#fff' }) => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: bgColor,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 700,
  flexShrink: 0,
}));

const HeroBanner = () => {
  const theme = useTheme();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('Fetching banners from API...');
        console.log('API base URL:', api.defaults.baseURL);
        console.log('Full URL:', `${api.defaults.baseURL}/api/extras/banners/active/`);
        
        const response = await api.get('/api/extras/banners/active/');
        console.log('API Response:', response.data);
        
        // Check if response has results property (paginated response)
        const bannersData = response.data.results || response.data;
        console.log('Banners data:', bannersData);
        console.log('Banners data length:', Array.isArray(bannersData) ? bannersData.length : 'Not an array');
        
        if (Array.isArray(bannersData) && bannersData.length > 0) {
          console.log('First banner details:', {
            id: bannersData[0].id,
            title: bannersData[0].title,
            description: bannersData[0].description,
            image_url: bannersData[0].image_url
          });
        }
        
        // Transform the data to match the expected format
        const transformedSlides = bannersData.map(banner => ({
          id: banner.id,
          title: banner.title,
          subtitle: banner.description || '',
          image: banner.image_url
        }));
        console.log('Transformed slides:', transformedSlides);
        setSlides(transformedSlides);
      } catch (error) {
        console.error('Error fetching banners:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error status:', error.response?.status);
        console.error('Error config:', error.config);
        console.error('Error headers:', error.response?.headers);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Get the first banner or use default content
  const currentBanner = slides.length > 0 ? {
    ...slides[0],
    title: " معهد التطوير المهني العالي للتدريب",
    subtitle: ""
  } : {
    title: " معهد التطوير المهني العالي للتدريب",
    subtitle: ""
  };

  return (
    <HeroSection>
      <HeroContent maxWidth="lg">
        {/* Right Section - Text Content */}
        <RightSection>
          {/* Creative Title Design */}
          <Box sx={{ mb: 4 }}>
            {/* Main Title with Creative Typography */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.2rem', lg: '3.8rem' },
                fontWeight: 800,
                color: '#0e5181',
                textAlign: 'right',
                lineHeight: 1.1,
                mb: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  right: 0,
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
                  borderRadius: '2px',
                },
              }}
            >
              معهد التطوير المهني
            </Typography>
            
            {/* Subtitle */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.2rem', lg: '2.5rem' },
                fontWeight: 600,
                color: '#e5978b',
                textAlign: 'right',
                mb: 2,
                opacity: 0.9,
              }}
            >
              العالي للتدريب
            </Typography>
            
            {/* Creative Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(14, 81, 129, 0.08)',
                border: '1px solid rgba(14, 81, 129, 0.15)',
                borderRadius: '20px',
                padding: '6px 16px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                  transition: 'left 0.6s ease',
                },
                '&:hover::before': {
                  left: '100%',
                },
              }}
            >
              <Box
                sx={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#0e5181',
                  borderRadius: '50%',
                  mr: 1,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.6, transform: 'scale(1.1)' },
                    '100%': { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#0e5181',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                منصة تعليمية متطورة
              </Typography>
            </Box>
          </Box>
          
          {/* Creative Search Bar */}
          <Box
            sx={{
              position: 'relative',
              mt: 4,
              maxWidth: '500px',
              width: '100%',
            }}
          >
            {/* Search Input */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '50px',
                border: '2px solid rgba(14, 81, 129, 0.2)',
                boxShadow: '0 8px 32px rgba(14, 81, 129, 0.15)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgba(14, 81, 129, 0.4)',
                  boxShadow: '0 12px 40px rgba(14, 81, 129, 0.25)',
                  transform: 'translateY(-2px)',
                },
                '&:focus-within': {
                  borderColor: '#0e5181',
                  boxShadow: '0 0 0 3px rgba(14, 81, 129, 0.1)',
                },
              }}
            >
              {/* Search Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  color: '#0e5181',
                  fontSize: '1.2rem',
                }}
              >
                🔍
              </Box>
              
              {/* Search Input Field */}
              <input
                type="text"
                placeholder="ابحث عن الدورات التدريبية..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  color: '#333',
                  padding: '15px 0',
                  fontFamily: 'inherit',
                }}
              />
              
              {/* Search Button */}
              <Box
                component="button"
                sx={{
                  backgroundColor: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                  background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '12px 24px',
                  margin: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 20px rgba(14, 81, 129, 0.3)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                بحث
              </Box>
            </Box>
            
            {/* Floating Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '-20px',
                right: '20px',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #e5978b 0%, #ff6b6b 100%)',
                borderRadius: '50%',
                opacity: 0.8,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '-15px',
                left: '30px',
                width: '25px',
                height: '25px',
                background: 'linear-gradient(135deg, #0e5181 0%, #87CEEB 100%)',
                borderRadius: '50%',
                opacity: 0.6,
                animation: 'float 2s ease-in-out infinite reverse',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                },
              }}
            />
          </Box>
        </RightSection>

        {/* Left Section - Student Character with Floating Cards */}
        <LeftSection>
          {/* Student Character with Image */}
          <StudentContainer>
            <StudentImage 
              src={bannerImage} 
              alt="Student giving thumbs up"
              onError={(e) => {
                e.target.style.display = 'none';
                // Fallback to emoji if image fails to load
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback emoji if image fails */}
            <Box 
            sx={{ 
                display: 'none',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'white',
                boxShadow: '0 10px 30px rgba(14, 81, 129, 0.3)',
              }}
            >
              😊
        </Box>
          </StudentContainer>

          {/* Floating Cards around the student image */}
          {/* Top Left - Atom Icon */}
          <FloatingCard 
            position={{ top: '15%', left: '5%' }} 
            delay={0}
          >
            <FloatingIcon bgColor="#f5f5f5" iconColor="#9c27b0">
              ⚛️
            </FloatingIcon>
          </FloatingCard>

          {/* Top Right - Angular Logo */}
          <FloatingCard 
            position={{ top: '20%', right: '8%' }} 
            delay={1}
          >
            <FloatingIcon bgColor="#f5f5f5" iconColor="#dd0031">
              🔺
            </FloatingIcon>
          </FloatingCard>

          {/* Mid Right - Students Card */}
          <FloatingCard 
            position={{ top: '45%', right: '3%' }} 
            delay={2}
            sx={{ 
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              minWidth: '140px'
            }}
          >
            <FloatingText>
              <Box className="title">طلابنا الجدد اليوم</Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Box sx={{ display: 'flex', gap: -0.5 }}>
                  {[1,2,3,4].map((i) => (
                    <Box 
                      key={i}
                      sx={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: i === 1 ? '#e5978b' : i === 2 ? '#0e5181' : i === 3 ? '#ffc107' : '#4caf50',
                        border: '2px solid #fff',
                        marginLeft: '-4px',
                        fontSize: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    >
                      {i}
                    </Box>
                  ))}
                </Box>
                <FloatingBadge bgColor="#0e5181" color="#fff">
                  1K+
                </FloatingBadge>
              </Box>
            </FloatingText>
          </FloatingCard>

          {/* Bottom Right - Figma Logo */}
          <FloatingCard 
            position={{ bottom: '25%', right: '10%' }} 
            delay={3}
          >
            <FloatingIcon bgColor="#f5f5f5" iconColor="#f24e1e">
              🎨
            </FloatingIcon>
          </FloatingCard>

          {/* Bottom Left - Discount Card */}
          <FloatingCard 
            position={{ bottom: '20%', left: '8%' }} 
            delay={4}
            sx={{ 
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              minWidth: '160px'
            }}
          >
            <FloatingIcon bgColor="#ffc107" iconColor="#fff">
              🎯
            </FloatingIcon>
            <FloatingText>
              <Box className="title">خصم 20%</Box>
              <Box className="subtitle">على جميع الدورات</Box>
            </FloatingText>
            <Box sx={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              background: '#e5978b', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              %
            </Box>
          </FloatingCard>

          {/* Above student head - Lightbulb */}
          <FloatingCard 
            position={{ top: '2%', left: '50%', transform: 'translateX(-50%)' }} 
            delay={5}
            sx={{ 
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '8px 12px'
            }}
          >
            <FloatingIcon bgColor="#ffc107" iconColor="#fff">
              💡
            </FloatingIcon>
          </FloatingCard>
        </LeftSection>
      </HeroContent>
      
      {/* Single Wave Separator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <path
            d="M0,0V40 Q300,80 600,50 T1200,70 L1200,0 Z"
            fill="#0e5181"
          />
        </svg>
      </Box>
    </HeroSection>
  );
};

export default HeroBanner;