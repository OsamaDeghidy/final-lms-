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

                {/* Left Section - Student Character Only */}
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
        </LeftSection>
      </HeroContent>
      
      {/* Decorative Wave Separator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
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
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="#0e5181"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.46,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="#0e5181"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="#0e5181"
          />
        </svg>
      </Box>
    </HeroSection>
  );
};

export default HeroBanner;
