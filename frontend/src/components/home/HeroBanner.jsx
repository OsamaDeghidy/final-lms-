import { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, Container, Typography, useMediaQuery, useTheme, 
  Grid, IconButton, keyframes, Fade, Grow, Slide, Zoom, useScrollTrigger 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Code, Laptop, Smartphone, PlayCircle, ArrowBackIos, 
  ArrowForwardIos, Circle, Star, School, EmojiEvents 
} from '@mui/icons-material';
import api from '../../services/api.service';

// Import the banner image (fallback)
import fallbackBannerImage from '../../assets/images/bannar.jpeg';

// Keyframe animations
const gradientBG = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const moveBubbles = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-1000px) rotate(720deg); }
`;

// 3D Image Container
const Image3DContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  perspective: '1000px',
  zIndex: 0,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #0e5181 0%, #e5978b 100%)',
    animation: '${gradientBG} 15s ease infinite',
    backgroundSize: '400% 400%',
    zIndex: 0,
  },
}));

const Image3D = styled(Box)(({ theme, src }) => ({
  position: 'absolute',
  width: '35%',
  height: '90%',
  left: '8%',
  top: '5%',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'rotateY(5deg) rotateX(5deg) scale(1.05)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: `url(${src})`,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: '15px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
    transform: 'translateZ(40px)',
    transition: 'all 0.4s ease',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '20px',
  },
  '@keyframes float': {
    '0%': { transform: 'translateZ(0) rotate(0deg)' },
    '50%': { transform: 'translateZ(20px) rotate(2deg)' },
    '100%': { transform: 'translateZ(0) rotate(0deg)' },
  },
  animation: 'float 6s ease-in-out infinite',
}));

// Animated bubbles for background
const Bubbles = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  top: 0,
  left: 0,
  zIndex: 0,
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 1,
  },
  '& span': {
    position: 'absolute',
    bottom: '-100px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    animation: `${moveBubbles} 15s linear infinite`,
    '&:nth-child(1)': { width: '40px', height: '40px', left: '10%', animationDuration: '15s' },
    '&:nth-child(2)': { width: '60px', height: '60px', left: '20%', animationDuration: '20s', animationDelay: '2s' },
    '&:nth-child(3)': { width: '30px', height: '30px', left: '35%', animationDuration: '25s', animationDelay: '4s' },
    '&:nth-child(4)': { width: '50px', height: '50px', left: '50%', animationDuration: '18s', animationDelay: '0s' },
    '&:nth-child(5)': { width: '35px', height: '35px', left: '65%', animationDuration: '22s', animationDelay: '6s' },
    '&:nth-child(6)': { width: '45px', height: '45px', left: '80%', animationDuration: '17s', animationDelay: '3s' },
    '&:nth-child(7)': { width: '25px', height: '25px', left: '90%', animationDuration: '19s', animationDelay: '7s' },
  }
}));

const HeroSection = styled('section')(({ theme }) => ({
  position: 'relative',
  color: '#fff',
  padding: '30px 0 20px',
  overflow: 'hidden',
  height: '300px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  background: 'linear-gradient(-45deg, #0e5181, #e5978b, #0e5181, #e5978b)',
  backgroundSize: '400% 400%',
  animation: `${gradientBG} 15s ease infinite`,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
    zIndex: 1,
  },
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'right',
  height: '100%',
  justifyContent: 'center',
  padding: theme.spacing(6, 0),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 2),
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  fontSize: '3.5rem',
  lineHeight: 1.2,
  maxWidth: '800px',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  marginBottom: theme.spacing(4),
  maxWidth: '600px',
  opacity: 0.9,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const HeroButton = styled(Button)(({ theme, variant }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  borderRadius: '12px',
  textTransform: 'none',
  background: variant === 'contained' 
    ? 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)' 
    : 'transparent',
  color: variant === 'contained' ? 'white' : '#0e5181',
  border: variant === 'outlined' ? '2px solid #0e5181' : 'none',
  boxShadow: variant === 'contained' ? '0 4px 15px rgba(14, 81, 129, 0.4)' : 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: '0.5s',
  },
  '&:hover': {
    background: variant === 'contained'
      ? 'linear-gradient(90deg, #0a3d5f 0%, #d17a6f 100%)'
      : 'rgba(14, 81, 129, 0.1)',
    boxShadow: variant === 'contained' 
      ? '0 6px 20px rgba(14, 81, 129, 0.6)' 
      : '0 4px 12px rgba(14, 81, 129, 0.2)',
    transform: 'translateY(-2px)',
    '&:before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginBottom: theme.spacing(1),
  },
}));

const FeatureItem = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem',
  padding: '1.5rem 2rem',
  background: 'linear-gradient(90deg, rgba(14, 81, 129, 0.1) 0%, rgba(229, 151, 139, 0.05) 100%)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: 'linear-gradient(to bottom, #0e5181, #e5978b)',
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    '&::before': {
      width: '8px',
    },
    '& .feature-icon': {
      transform: 'scale(1.2) rotate(5deg)',
      textShadow: '0 0 15px rgba(255,255,255,0.5)',
    },
  },
  '& .feature-icon': {
    marginLeft: '1.5rem',
    fontSize: '1.5rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: 1,
  },
  '& .feature-text': {
    fontSize: '1rem',
    fontWeight: 500,
    position: 'relative',
    zIndex: 1,
    background: 'linear-gradient(90deg, #fff, #E2E8F0)',    
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
});

const ImageContainer = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.03) rotate(1deg)',
      filter: 'drop-shadow(0 15px 30px rgba(14, 81, 129, 0.3))',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(229, 151, 139, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(20px)',
    zIndex: 0,
    animation: 'pulse 8s infinite alternate',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(14, 81, 129, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(30px)',
    zIndex: 0,
    animation: 'pulse 10s infinite alternate-reverse',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '100%': { transform: 'scale(1.1)' },
  },
});

const FloatingIcon = styled('div')(({ theme, top, left, size = 40, delay }) => ({
  position: 'absolute',
  width: size,
  height: size,
  top: `${top}%`,
  left: `${left}%`,
  background: 'rgba(14, 81, 129, 0.1)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(14, 81, 129, 0.8)',
  animation: `float 6s ease-in-out ${delay}s infinite`,
  backdropFilter: 'blur(2px)',
  border: '1px solid rgba(14, 81, 129, 0.2)',
  zIndex: 1,
  '&:hover': {
    background: 'rgba(229, 151, 139, 0.15)',
    transform: 'scale(1.1)',
  },
}));

const HeroBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bottomSlideIndex, setBottomSlideIndex] = useState(0);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('Fetching banners from API...');
        console.log('API base URL:', api.defaults.baseURL);
        console.log('Full URL:', `${api.defaults.baseURL}/extras/banners/active/`);
        
        const response = await api.get('/extras/banners/active/');
        console.log('API Response:', response.data);
        
        // Check if response has results property (paginated response)
        const bannersData = response.data.results || response.data;
        console.log('Banners data:', bannersData);
        
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

  // Auto slide functionality
  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoPlay, slides.length]);

  // Auto-play functionality for bottom slideshow
  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setBottomSlideIndex((prevIndex) => 
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slides]);

  const handleNext = () => {
    if (slides.length === 0) return;
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (slides.length === 0) return;
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const currentSlide = slides[activeSlide] || { title: '', subtitle: '' };

  // Handle mouse move for parallax effect
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  // Calculate parallax effect
  const parallaxStyle = (factor = 5) => ({
    transform: `translate(${(mousePosition.x - window.innerWidth / 2) / factor}px, ${(mousePosition.y - window.innerHeight / 2) / factor}px)`,
    transition: 'transform 0.1s ease-out'
  });

  // Show loading state
  if (loading) {
    return (
      <HeroSection>
        <HeroContent maxWidth="md">
          <Typography variant="h6" sx={{ color: '#fff' }}>
            جاري تحميل البانرات...
          </Typography>
        </HeroContent>
      </HeroSection>
    );
  }

  // Show empty state if no banners
  if (slides.length === 0) {
    return (
      <HeroSection>
        <HeroContent maxWidth="md">
          <Typography variant="h6" sx={{ color: '#fff' }}>
            لا توجد بانرات متاحة حالياً
          </Typography>
        </HeroContent>
      </HeroSection>
    );
  }

  return (
    <>
    <HeroSection 
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <Bubbles>
        {[...Array(7)].map((_, i) => (
          <span key={i} style={{ left: `${Math.random() * 100}%` }} />
        ))}
      </Bubbles>
      {/* Removed 3D image container */}
      <HeroContent maxWidth="md">
        <Box sx={{ 
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 1,
              color: '#fff',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              animation: `${float} 6s ease-in-out infinite`,
              position: 'relative',
              zIndex: 2,
              '&:after': {
                content: '""',
                display: 'block',
                width: '100px',
                height: '4px',
                background: 'rgba(255,255,255,0.8)',
                margin: '12px auto 8px',
                borderRadius: '2px'
              }
            }}
          >
            {currentSlide.title}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              fontWeight: 400,
              mb: 1.5,
              color: 'rgba(255,255,255,0.95)',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.7,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              position: 'relative',
              zIndex: 2
            }}
          >
            {currentSlide.subtitle}
          </Typography>
          
        </Box>
      </HeroContent>
    </HeroSection>
    
    {/* Prominent Banner Section - Slideshow */}
    <Box sx={{
      width: 'calc(100% - 32px)',
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 10,
      marginTop: '-60px',
      marginBottom: '60px',
      borderRadius: '12px',
      overflow: 'hidden',
      height: '250px',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      border: 'none',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }
    }}>
      {/* Slideshow Container */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        {slides.map((slide, index) => (
          <Box
            key={slide.id}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              transform: `translateX(${(index - bottomSlideIndex) * 100}%)`,
              transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transition: 'all 0.5s ease',
                filter: 'brightness(0.9)',
              },
              '&:hover img': {
                transform: 'scale(1.03)',
                filter: 'brightness(1.1)',
              }
            }}
          >
            <img 
              src={slide.image || fallbackBannerImage} 
              alt={slide.title || "Promotional Banner"} 
              style={{ display: 'block' }}
            />
          </Box>
        ))}
        
        {/* Navigation Dots */}
        {slides.length > 1 && (
          <Box sx={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 2
          }}>
            {slides.map((_, index) => (
              <Box
                key={index}
                onClick={() => setBottomSlideIndex(index)}
                sx={{
                  width: index === bottomSlideIndex ? '24px' : '12px',
                  height: '12px',
                  borderRadius: index === bottomSlideIndex ? '6px' : '50%',
                  backgroundColor: index === bottomSlideIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  boxShadow: index === bottomSlideIndex ? '0 0 10px rgba(255,255,255,0.8)' : 'none',
                  '&:hover': {
                    backgroundColor: index === bottomSlideIndex ? '#fff' : 'rgba(255,255,255,0.8)',
                    transform: 'scale(1.3)',
                    boxShadow: '0 0 15px rgba(255,255,255,0.9)'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
};

export default HeroBanner;
