import { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, IconButton, Rating, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowLeft, KeyboardArrowRight, PlayCircleOutline, BookmarkBorder, Bookmark } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { courseAPI } from '../../services/courseService';

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(12, 0),
  overflow: 'hidden',
  direction: 'rtl',
  background: '#ffffff',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(8, 0),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6, 0),
  },
}));

const CreativeBanner = styled(Box)(({ theme, position = 'top' }) => ({
  position: 'relative',
  width: '100%',
  height: position === 'top' ? '120px' : '100px',
  background: position === 'top' 
    ? 'linear-gradient(135deg, rgba(14, 81, 129, 0.8) 0%, rgba(229, 151, 139, 0.8) 50%, rgba(14, 81, 129, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(229, 151, 139, 0.8) 0%, rgba(14, 81, 129, 0.8) 50%, rgba(229, 151, 139, 0.8) 100%)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: position === 'top' ? '0' : 'auto',
    bottom: position === 'top' ? 'auto' : '0',
    left: '0',
    right: '0',
    height: '4px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
    animation: 'shimmer 2s ease-in-out infinite',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '50%': { transform: 'translateY(-10px) rotate(1deg)' },
  },
  '@keyframes shimmer': {
    '0%, 100%': { opacity: 0.3 },
    '50%': { opacity: 0.8 },
  },
  [theme.breakpoints.down('md')]: {
    height: position === 'top' ? '100px' : '80px',
  },
  [theme.breakpoints.down('sm')]: {
    height: position === 'top' ? '80px' : '60px',
  },
}));

const CreativeBannerContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  color: '#fff',
  '& .banner-title': {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '8px',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    [theme.breakpoints.down('md')]: {
      fontSize: '1.25rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.1rem',
    },
  },
  '& .banner-subtitle': {
    fontSize: '1rem',
    fontWeight: 500,
    opacity: 0.9,
    [theme.breakpoints.down('md')]: {
      fontSize: '0.9rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
    },
  },
}));

const FloatingIcon = styled(Box)(({ theme, position = 'top' }) => ({
  position: 'absolute',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '1.2rem',
  animation: position === 'top' ? 'floatIcon 4s ease-in-out infinite' : 'floatIcon 4s ease-in-out infinite reverse',
  '&:nth-child(1)': {
    top: '20%',
    left: '15%',
    animationDelay: '0s',
  },
  '&:nth-child(2)': {
    top: '60%',
    right: '20%',
    animationDelay: '1s',
  },
  '&:nth-child(3)': {
    bottom: '30%',
    left: '25%',
    animationDelay: '2s',
  },
  '@keyframes floatIcon': {
    '0%, 100%': { transform: 'translateY(0px) scale(1)' },
    '50%': { transform: 'translateY(-8px) scale(1.1)' },
  },
  [theme.breakpoints.down('md')]: {
    width: '32px',
    height: '32px',
    fontSize: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    width: '28px',
    height: '28px',
    fontSize: '0.9rem',
  },
}));

const SliderHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(0, 2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  position: 'relative',
  color: '#0e5181',
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80px',
    height: '4px',
    background: '#e5978b',
    borderRadius: '2px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  },
}));

const SliderButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(14, 81, 129, 0.1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  color: '#0e5181',
  width: '48px',
  height: '48px',
  '&:hover': {
    backgroundColor: '#0e5181',
    color: '#fff',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 25px rgba(14, 81, 129, 0.3)',
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
  [theme.breakpoints.down('md')]: {
    width: '40px',
    height: '40px',
  },
}));

const SliderTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2.5),
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  transform: 'translateY(0) scale(1)',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.03)',
    boxShadow: '0 20px 40px rgba(14, 81, 129, 0.2)',
    border: '2px solid rgba(14, 81, 129, 0.4)',
    '& .play-button': {
      opacity: 1,
      transform: 'scale(1.2)',
    },
    '& .creative-corner': {
      transform: 'scale(1.2) rotate(5deg)',
    },
    '& .creative-corner-2': {
      transform: 'scale(1.2) rotate(-5deg)',
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 50%, #0e5181 100%)',
    zIndex: 2,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '1px solid rgba(14, 81, 129, 0.1)',
    borderRadius: theme.shape.borderRadius,
    pointerEvents: 'none',
    zIndex: 1,
  },
  '& .creative-corner': {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    borderTop: '2px solid #0e5181',
    borderRight: '2px solid #0e5181',
    borderTopRightRadius: '8px',
    zIndex: 3,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'scale(1) rotate(0deg)',
  },
  '& .creative-corner-2': {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    width: '20px',
    height: '20px',
    borderBottom: '2px solid #e5978b',
    borderLeft: '2px solid #e5978b',
    borderBottomLeftRadius: '8px',
    zIndex: 3,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'scale(1) rotate(0deg)',
  },
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px)',
      opacity: 0.4,
    },
    '50%': {
      transform: 'translateY(-6px)',
      opacity: 0.8,
    },
  },
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 600,
  zIndex: 1,
}));

const CourseMedia = styled(CardMedia)({
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
  '&:hover .play-button': {
    opacity: 1,
    transform: 'scale(1.1)',
  },
});

const PlayButton = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) scale(1)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  opacity: 0,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translate(-50%, -50%) scale(1.1)',
    boxShadow: '0 12px 40px rgba(14, 81, 129, 0.3)',
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const CourseCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiRating-root': {
    direction: 'ltr',
  },
}));

const CourseCategory = styled(Typography)(({ theme }) => ({
  color: '#0e5181',
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

const CourseTitle = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '3.6em',
  lineHeight: '1.2',
});

const InstructorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(1),
}));

const PriceContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '8px',
});

const CurrentPrice = styled(Typography)(({ theme }) => ({
  color: '#0e5181',
  fontWeight: 700,
  fontSize: '1.25rem',
}));

const OriginalPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  textDecoration: 'line-through',
  fontSize: '0.875rem',
}));

const StudentsCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

const SliderIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(3),
  direction: 'rtl', // RTL direction for indicators
  '& .indicator-dot': {
    width: '8px',
    height: '8px',
  borderRadius: '50%',
    backgroundColor: 'rgba(14, 81, 129, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
    '&.active': {
      backgroundColor: '#0e5181',
      transform: 'scale(1.2)',
    },
  '&:hover': {
      backgroundColor: 'rgba(14, 81, 129, 0.6)',
    },
  },
}));

const PromotionalBanner = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100vw',
  height: '200px',
  margin: theme.spacing(8, 0),
  marginLeft: 'calc(-50vw + 50%)',
  marginRight: 'calc(-50vw + 50%)',
  borderRadius: 0,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'translateY(0) scale(1)',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    '& .banner-content': {
      transform: 'translateY(-5px)',
    },
    '& .floating-element': {
      transform: 'translateY(-15px) scale(1.2)',
      opacity: 1,
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.6) 0%, rgba(229, 151, 139, 0.6) 100%)',
    zIndex: 1,
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '50%': { transform: 'translateY(-5px) rotate(0.5deg)' },
  },
  [theme.breakpoints.down('md')]: {
    height: '160px',
    margin: theme.spacing(6, 0),
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
  },
  [theme.breakpoints.down('sm')]: {
    height: '140px',
    margin: theme.spacing(5, 0),
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
  },
}));

const BannerImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0,
});

const BannerContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  color: '#fff',
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'translateY(0)',
  '& .banner-title': {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    [theme.breakpoints.down('md')]: {
      fontSize: '1.5rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.3rem',
    },
  },
  '& .banner-description': {
    fontSize: '1rem',
    fontWeight: 500,
    opacity: 0.9,
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    [theme.breakpoints.down('md')]: {
      fontSize: '0.9rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
    },
  },
}));

const FloatingElements = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
  '& .floating-element': {
    position: 'absolute',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1rem',
    animation: 'floatElement 6s ease-in-out infinite',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 0.7,
    '&:nth-child(1)': {
      top: '15%',
      left: '10%',
      animationDelay: '0s',
    },
    '&:nth-child(2)': {
      top: '25%',
      right: '15%',
      animationDelay: '2s',
    },
    '&:nth-child(3)': {
      bottom: '20%',
      left: '20%',
      animationDelay: '4s',
    },
    '@keyframes floatElement': {
      '0%, 100%': { transform: 'translateY(0px) scale(1)' },
      '50%': { transform: 'translateY(-10px) scale(1.1)' },
    },
  },
  [theme.breakpoints.down('md')]: {
    '& .floating-element': {
      width: '24px',
      height: '24px',
      fontSize: '0.8rem',
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .floating-element': {
      width: '20px',
      height: '20px',
      fontSize: '0.7rem',
    },
  },
}));

const CourseCollections = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  const [collections, setCollections] = useState([]);
  const [promotionalBanners, setPromotionalBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlides, setCurrentSlides] = useState({});
  const [slidesPerView, setSlidesPerView] = useState(4);
  
  // Update slides per view based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else if (window.innerWidth < 1200) {
        setSlidesPerView(3);
      } else {
        setSlidesPerView(4);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  // Initialize current slides for each collection
  useEffect(() => {
    if (collections.length > 0) {
      const initialSlides = {};
      collections.forEach(collection => {
        initialSlides[collection.id] = 0;
      });
      setCurrentSlides(initialSlides);
    }
  }, [collections]);
  
  // Fetch collections and promotional banners from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [collectionsData, bannersData] = await Promise.all([
          courseAPI.getCourseCollections(),
          courseAPI.getPromotionalBanners()
        ]);
        setCollections(collectionsData);
        setPromotionalBanners(bannersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SliderContainer>
        <Container maxWidth="lg">
          {[1, 2, 3].map((index) => (
            <Box key={index} sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Box sx={{ width: 200, height: 32, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ width: 300, height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                </Box>
                <Box sx={{ width: 100, height: 36, bgcolor: 'grey.300', borderRadius: 1 }} />
              </Box>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(auto-fill, minmax(280px, 1fr))',
                  sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                  md: 'repeat(auto-fill, minmax(320px, 1fr))',
                  lg: 'repeat(auto-fill, minmax(350px, 1fr))'
                },
                gap: 3
              }}>
                {[1, 2, 3, 4].map((courseIndex) => (
                  <Box key={courseIndex} sx={{ 
                    bgcolor: 'grey.100', 
                    borderRadius: 2, 
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ height: 200, bgcolor: 'grey.300', borderRadius: '8px 8px 0 0' }} />
                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
                      <Box sx={{ width: '90%', height: 20, bgcolor: 'grey.300', borderRadius: 1 }} />
                      <Box sx={{ width: '70%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                      <Box sx={{ width: '40%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Container>
      </SliderContainer>
    );
  }

  if (error) {
    return (
      <SliderContainer>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h5" color="error.main" sx={{ mb: 2 }}>
              حدث خطأ في تحميل المجموعات
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              إعادة المحاولة
            </Button>
          </Box>
        </Container>
      </SliderContainer>
    );
  }

  // Slider navigation functions
  const nextSlide = (collectionId) => {
    setCurrentSlides(prev => {
      const collection = collections.find(c => c.id === collectionId);
      if (!collection || !collection.courses) return prev;
      
      const maxSlides = Math.max(0, collection.courses.length - slidesPerView);
      return {
        ...prev,
        [collectionId]: Math.min(prev[collectionId] + 1, maxSlides)
      };
    });
  };

  const prevSlide = (collectionId) => {
    setCurrentSlides(prev => ({
      ...prev,
      [collectionId]: Math.max(0, prev[collectionId] - 1)
    }));
  };

  const goToSlide = (collectionId, slideIndex) => {
    setCurrentSlides(prev => ({
      ...prev,
      [collectionId]: slideIndex
    }));
  };

  // Function to render promotional banner
  const renderPromotionalBanner = (banner, index) => {
    if (!banner || !banner.is_active) return null;

    return (
      <PromotionalBanner 
        key={`banner-${banner.id}-${index}`}
        onClick={() => {
          if (banner.url) {
            window.open(banner.url, '_blank');
          }
        }}
      >
        {banner.image_url && (
          <BannerImage 
            src={banner.image_url} 
            alt={banner.title}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <BannerContent className="banner-content">
          <Typography variant="h4" className="banner-title">
            {banner.title}
          </Typography>
          {banner.description && (
            <Typography variant="body1" className="banner-description">
              {banner.description}
            </Typography>
          )}
        </BannerContent>
        <FloatingElements>
          <Box className="floating-element">🎯</Box>
          <Box className="floating-element">✨</Box>
          <Box className="floating-element">🚀</Box>
        </FloatingElements>
      </PromotionalBanner>
    );
  };

  if (!collections || collections.length === 0) {
    return (
      <SliderContainer>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              لا توجد مجموعات متاحة حالياً
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              سيتم إضافة مجموعات جديدة قريباً
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              component={RouterLink}
              to="/courses"
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              تصفح جميع الدورات
            </Button>
          </Box>
        </Container>
      </SliderContainer>
    );
  }

  return (
    <SliderContainer>
      <Container maxWidth="lg">
        {collections.map((collection, collectionIndex) => (
          <Box key={collection.id}>
            {/* Show promotional banner before each collection except the first one */}
            {collectionIndex > 0 && promotionalBanners.length > 0 && (
              renderPromotionalBanner(
                promotionalBanners[(collectionIndex - 1) % promotionalBanners.length], 
                collectionIndex - 1
              )
            )}
            
            <Box sx={{ mb: 6 }}>
                         <SliderHeader>
               <Box>
                 <SectionTitle variant="h4" component="h2">
                   {collection.name}
                 </SectionTitle>
                 {collection.description && (
                   <Typography variant="body1" color="text.secondary" sx={{ 
                     mt: 2,
                     fontSize: '0.9rem',
                     lineHeight: 1.6
                   }}>
                     {collection.description}
                   </Typography>
                 )}
               </Box>
               <Button 
                 variant="outlined" 
                 component={RouterLink}
                 to={`/courses?collection=${collection.slug}`}
                 endIcon={<KeyboardArrowLeft />}
                 sx={{
                   borderRadius: '12px',
                   textTransform: 'none',
                   fontWeight: 600,
                   px: 3,
                   py: 1.5,
                   border: '1.5px solid #0e5181',
                   color: '#0e5181',
                   background: 'linear-gradient(90deg, rgba(14, 81, 129, 0.05) 0%, rgba(229, 151, 139, 0.05) 100%)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
                     color: '#fff',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 6px 12px rgba(14, 81, 129, 0.2)',
                     borderColor: 'transparent',
                   },
                   '&:active': {
                     transform: 'translateY(0)',
                     boxShadow: '0 2px 4px rgba(14, 81, 129, 0.1)',
                   },
                   '& .MuiButton-endIcon': {
                     transition: 'transform 0.3s ease',
                   },
                   '&:hover .MuiButton-endIcon': {
                     transform: 'translateX(4px)',
                   },
                 }}
               >
                 عرض الكل
               </Button>
             </SliderHeader>
            
                         {collection.courses && collection.courses.length > 0 ? (
               <Box 
                 sx={{ 
                   position: 'relative',
                   overflow: 'hidden', 
                   width: '100%', 
                   margin: '0 auto',
                 }}
               >
                 {/* Navigation Buttons */}
                 {currentSlides[collection.id] > 0 && (
                   <SliderButton 
                     onClick={() => prevSlide(collection.id)}
                     sx={{
                       position: 'absolute',
                       left: theme.spacing(2),
                       top: '50%',
                       transform: 'translateY(-50%)',
                       zIndex: 10,
                     }}
                   >
                     <KeyboardArrowRight />
                   </SliderButton>
                 )}
                 
                 {currentSlides[collection.id] < Math.max(0, collection.courses.length - slidesPerView) && (
                   <SliderButton 
                     onClick={() => nextSlide(collection.id)}
                     sx={{
                       position: 'absolute',
                       right: theme.spacing(2),
                       top: '50%',
                       transform: 'translateY(-50%)',
                       zIndex: 10,
                     }}
                   >
                     <KeyboardArrowLeft />
                   </SliderButton>
                 )}

                                 <SliderTrack 
                   sx={{ 
                     transform: `translateX(${currentSlides[collection.id] * (slidesPerView === 1 ? 100 : slidesPerView === 2 ? 280 + 24 : slidesPerView === 3 ? 320 + 24 : 350 + 24)}px)`,
                     [theme.breakpoints.down('sm')]: {
                       transform: `translateX(${currentSlides[collection.id] * 100}%)`,
                     },
                   }}
                 >
                  {collection.courses.map((course) => (
                    <Box 
                      key={course.id} 
                      sx={{ 
                        flex: `0 0 ${slidesPerView === 1 ? '100%' : slidesPerView === 2 ? '280px' : slidesPerView === 3 ? '320px' : '350px'}`,
                        width: slidesPerView === 1 ? '100%' : slidesPerView === 2 ? '280px' : slidesPerView === 3 ? '320px' : '350px',
                      }}
                    >
                      <CourseCard component={RouterLink} to={`/courses/${course.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ position: 'relative' }}>
                        <CourseMedia
                          image={course.image_url || 'https://via.placeholder.com/300x180'}
                          title={course.title}
                        >
                          <PlayButton className="play-button">
                            <PlayCircleOutline fontSize="large" color="primary" />
                          </PlayButton>
                        </CourseMedia>
                                                 {course.discount_price && course.price && course.discount_price !== course.price && (
                           <DiscountBadge>
                             {Math.round((1 - parseFloat(course.discount_price) / parseFloat(course.price)) * 100)}% خصم
                           </DiscountBadge>
                         )}
                      </Box>
                      <CourseCardContent sx={{ p: 1.5 }}>
                          {/* Category */}
                          <CourseCategory sx={{ 
                            mb: 0.8,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#0e5181',
                            opacity: 0.8
                          }}>
                            {course.category_name || 'بدون تصنيف'}
                          </CourseCategory>

                          {/* Title */}
                          <CourseTitle variant="subtitle1" component="h3" sx={{ 
                            color: '#0e5181',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            mb: 1,
                            lineHeight: 1.2,
                            minHeight: '2.2em'
                          }}>
                          {course.title}
                        </CourseTitle>

                          {/* Instructor & Rating */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1.2
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.8
                            }}>
                              <Box sx={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.7rem',
                                fontWeight: 700
                              }}>
                                {course.instructors && course.instructors.length > 0 
                                  ? course.instructors[0].name?.charAt(0) || 'م'
                                  : 'م'
                                }
                              </Box>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary', 
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}>
                                {course.instructors && course.instructors.length > 0 
                                  ? course.instructors[0].name 
                                  : 'مدرب غير محدد'
                                }
                              </Typography>
                            </Box>

                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5
                            }}>
                              <Rating 
                                value={course.rating || 0} 
                                precision={0.1} 
                                readOnly 
                                size="small"
                                sx={{
                                  '& .MuiRating-icon': {
                                    fontSize: '0.8rem'
                                  },
                                  '& .MuiRating-iconFilled': {
                                    color: '#ffc107',
                                  },
                                }}
                              />
                              <Typography variant="caption" sx={{ 
                                color: '#ffc107',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}>
                                ({course.rating || 0})
                              </Typography>
                            </Box>
                          </Box>

                          {/* Course Stats */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1.2,
                            pb: 1,
                            borderBottom: '1px solid rgba(14, 81, 129, 0.1)'
                          }}>
                            <Typography variant="caption" sx={{ 
                              color: '#0e5181', 
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              {course.lessons_count || 0} درس
                            </Typography>
                            
                            <Typography variant="caption" sx={{ 
                              color: '#e5978b', 
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              {course.enrolled_count || 0} طالب
                            </Typography>

                            <Typography variant="caption" sx={{ 
                              color: '#0e5181', 
                              fontWeight: 600, 
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(14, 81, 129, 0.08)',
                              px: 1,
                              py: 0.3,
                              borderRadius: '8px'
                            }}>
                              {course.level === 'beginner' ? 'مبتدئ' : 
                               course.level === 'intermediate' ? 'متوسط' : 
                               course.level === 'advanced' ? 'متقدم' : 'مبتدئ'}
                            </Typography>
                          </Box>

                          {/* Price */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center'
                          }}>
                           <PriceContainer>
                              <CurrentPrice sx={{
                                color: '#e5978b',
                                fontWeight: 700,
                                fontSize: '1rem'
                              }}>
                               {course.is_free ? 'مجاني' : `${course.discount_price || course.price} ر.س`}
                             </CurrentPrice>
                             {course.discount_price && course.price && course.discount_price !== course.price && (
                               <OriginalPrice sx={{ fontSize: '0.75rem' }}>{`${course.price} ر.س`}</OriginalPrice>
                             )}
                           </PriceContainer>
                           
                           {/* Save Icon */}
                           <IconButton 
                             size="small"
                             sx={{
                               color: '#0e5181',
                               '&:hover': {
                                 color: '#e5978b',
                                 backgroundColor: 'rgba(14, 81, 129, 0.08)',
                               },
                               transition: 'all 0.3s ease',
                             }}
                           >
                             <BookmarkBorder fontSize="small" />
                           </IconButton>
                         </Box>
                      </CourseCardContent>
                    </CourseCard>
                    </Box>
                                     ))}
                 </SliderTrack>
                 
                 {/* Slider Indicators */}
                 {collection.courses && collection.courses.length > slidesPerView && (
                   <SliderIndicator>
                     {Array.from({ length: Math.ceil(collection.courses.length / slidesPerView) }, (_, index) => (
                       <Box
                         key={index}
                         className="indicator-dot"
                         onClick={() => goToSlide(collection.id, index)}
                         sx={{
                           backgroundColor: index === currentSlides[collection.id] ? '#0e5181' : 'rgba(14, 81, 129, 0.3)',
                           transform: index === currentSlides[collection.id] ? 'scale(1.2)' : 'scale(1)',
                           cursor: 'pointer',
                         }}
                       />
                     ))}
                   </SliderIndicator>
                 )}
               </Box>
             ) : (
               <Box sx={{ 
                 textAlign: 'center', 
                 py: 6,
                 bgcolor: 'grey.50',
                 borderRadius: 2,
                 border: '1px dashed',
                 borderColor: 'grey.300'
               }}>
                 <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                   لا توجد دورات في هذه المجموعة حالياً
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   سيتم إضافة دورات جديدة قريباً
                 </Typography>
               </Box>
             )}
            </Box>
          </Box>
        ))}
        
        {/* Show a promotional banner after the last collection if there are banners */}
        {collections.length > 0 && promotionalBanners.length > 0 && (
          renderPromotionalBanner(
            promotionalBanners[collections.length % promotionalBanners.length], 
            collections.length
          )
        )}
      </Container>
    </SliderContainer>
  );
};

export default CourseCollections;
