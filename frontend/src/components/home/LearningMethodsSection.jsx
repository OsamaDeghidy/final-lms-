import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  useTheme, 
  useMediaQuery, 
  styled,
  keyframes,
  Fade,
  Grow,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { 
  Code, 
  School, 
  MenuBook, 
  ChevronLeft, 
  ChevronRight,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import { courseAPI } from '../../services/api.service';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  background: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.03) 0%, rgba(229, 151, 139, 0.03) 100%)',
    top: '-200px',
    right: '-200px',
    zIndex: 0,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(229, 151, 139, 0.02) 0%, rgba(14, 81, 129, 0.02) 100%)',
    bottom: '-150px',
    left: '-150px',
    zIndex: 0,
  },
  '& .creative-pattern': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.03,
    zIndex: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 30%, #0e5181 1px, transparent 1px),
      radial-gradient(circle at 80% 70%, #e5978b 1px, transparent 1px),
      radial-gradient(circle at 40% 80%, #0e5181 1px, transparent 1px),
      radial-gradient(circle at 90% 20%, #e5978b 1px, transparent 1px),
      linear-gradient(45deg, transparent 49.5%, rgba(14, 81, 129, 0.08) 50%, transparent 50.5%),
      linear-gradient(-45deg, transparent 49.5%, rgba(229, 151, 139, 0.08) 50%, transparent 50.5%)
    `,
    backgroundSize: '120px 120px, 120px 120px, 120px 120px, 120px 120px, 200px 200px, 200px 200px',
    backgroundPosition: '0 0, 60px 60px, 30px 90px, 90px 30px, 0 0, 0 0',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(8, 0),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  color: '#0e5181',
  fontSize: '2.5rem',
  position: 'relative',
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
    fontSize: '2rem',
  },
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  maxWidth: '700px',
  margin: '0 auto',
  marginBottom: theme.spacing(6),
  fontSize: '1.1rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    padding: theme.spacing(0, 2),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
    gap: theme.spacing(1),
    background: 'rgba(255, 255, 255, 0.7)',
    padding: theme.spacing(1.5, 2),
    borderRadius: '50px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: 'fit-content',
    margin: '0 auto',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    minWidth: 'auto',
    padding: theme.spacing(1, 3),
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#0e5181',
      transform: 'translateY(-2px)',
    },
    '&.Mui-selected': {
      color: '#fff',
      background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
      boxShadow: '0 4px 15px rgba(14, 81, 129, 0.3)',
    },
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiTabs-flexContainer': {
      padding: theme.spacing(1),
    },
    '& .MuiTab-root': {
      fontSize: '0.85rem',
      padding: theme.spacing(0.5, 1.5),
    },
  },
}));

const MethodCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'delay',
})(({ theme, delay = 0 }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.03)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
    '& .card-hover-effect': {
      opacity: 1,
      transform: 'scale(1.03)',
    },
    '& .course-image': {
      transform: 'scale(1.05)',
    },
    '& .course-stats': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    zIndex: 2,
  },
  animation: `${floatAnimation} 6s ease-in-out infinite`,
  animationDelay: `${delay * 0.2}s`,
  opacity: 1,
}));

const CourseImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: { xs: '160px', sm: '180px', md: '200px' },
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
  '& .course-image': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
}));

const CourseBadge = styled(Box)(({ theme, variant = 'primary' }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  zIndex: 3,
  ...(variant === 'free' && {
    background: 'linear-gradient(90deg, #e5978b 0%, #d18a7a 100%)',
    color: '#fff',
  }),
  ...(variant === 'featured' && {
    background: 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
    color: '#fff',
  }),
  ...(variant === 'new' && {
    background: 'linear-gradient(90deg, #e5978b 0%, #45a049 100%)',
    color: '#fff',
  }),
}));

const MethodHeader = styled(Box)(({ theme, bgcolor }) => ({
  padding: theme.spacing(2.5, 3),
  background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
  },
  '& .MuiSvgIcon-root': {
    marginLeft: theme.spacing(1.5),
    fontSize: '2.2rem',
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '8px',
  },
  '& h3': {
    position: 'relative',
    zIndex: 1,
    margin: 0,
    fontWeight: 700,
    fontSize: '1.1rem',
  },
}));

const MethodContent = styled(CardContent)(({ theme }) => ({
  padding: { xs: theme.spacing(2), sm: theme.spacing(3) },
  position: 'relative',
  zIndex: 1,
  background: '#fff',
  borderRadius: '0 0 20px 20px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  '& h3': {
    marginTop: 0,
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
    fontWeight: 700,
    fontSize: { xs: '1.1rem', sm: '1.25rem' },
    lineHeight: 1.4,
    minHeight: { xs: '2.5rem', sm: '3rem' },
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  '& p': {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    minHeight: { xs: '60px', sm: '72px' },
    lineHeight: 1.7,
    fontSize: { xs: '0.9rem', sm: '0.95rem' },
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  '& ul': {
    paddingRight: '20px',
    margin: '12px 0',
    '& li': {
      marginBottom: '8px',
      position: 'relative',
      paddingRight: '24px',
      '&:before': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: '8px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#0e5181',
      },
    },
  },
}));

const MethodFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 3, 3, 3),
  marginTop: 'auto',
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.3px',
    padding: '10px 24px',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    color: '#0e5181',
    border: `1.5px solid #0e5181`,
    '&:hover': {
      backgroundColor: 'rgba(14, 81, 129, 0.04)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(14, 81, 129, 0.1)',
      borderColor: '#0e5181',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(14, 81, 129, 0.1)',
    },
    '& .MuiButton-endIcon': {
      transition: 'transform 0.3s ease',
      marginRight: theme.spacing(0.5),
      marginLeft: 0,
    },
    '&:hover .MuiButton-endIcon': {
      transform: 'translateX(-4px)'
    },
    '& span': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
    },
  },
  '& .MuiTypography-body2': {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    '& svg': {
      color: '#0e5181',
      fontSize: '1rem',
    },
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  padding: theme.spacing(0, 1),
  direction: 'rtl', // RTL direction for Arabic
  '& .slider-track': {
    display: 'flex',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    gap: theme.spacing(3),
    flexDirection: 'row-reverse', // Reverse flex direction for RTL
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(2),
    },
  },
  '& .slider-item': {
    flex: '0 0 300px',
    width: '300px',
    direction: 'ltr', // Keep content LTR for proper text display
    [theme.breakpoints.down('md')]: {
      flex: '0 0 280px',
      width: '280px',
    },
    [theme.breakpoints.down('sm')]: {
      flex: '0 0 100%',
      width: '100%',
    },
  },
}));

const NavigationButton = styled(IconButton)(({ theme, direction }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 10,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(14, 81, 129, 0.1)',
  color: '#0e5181',
  '&:hover': {
    background: '#0e5181',
    color: '#fff',
    transform: 'translateY(-50%) scale(1.1)',
    boxShadow: '0 6px 25px rgba(14, 81, 129, 0.3)',
  },
  // RTL positioning - left button becomes right, right button becomes left
  ...(direction === 'left' && {
    right: theme.spacing(2), // RTL: left button goes to right
  }),
  ...(direction === 'right' && {
    left: theme.spacing(2), // RTL: right button goes to left
  }),
  [theme.breakpoints.down('md')]: {
    width: '40px',
    height: '40px',
    ...(direction === 'left' && {
      right: theme.spacing(1), // RTL: left button goes to right
    }),
    ...(direction === 'right' && {
      left: theme.spacing(1), // RTL: right button goes to left
    }),
  },
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

const LearningMethodsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [value, setValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setCurrentSlide(0); // Reset slider when changing tabs
    if (categories[newValue]) {
      loadCoursesByCategory(categories[newValue].id);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCategories();
      setCategories(response);
      if (response.length > 0) {
        // Load courses for the first category
        await loadCoursesByCategory(response[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('حدث خطأ في تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  // Load courses by category
  const loadCoursesByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await courseAPI.getPublicCourses({ category: categoryId });
      setCourses(Array.isArray(response) ? response : response.results || response.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('حدث خطأ في تحميل الدورات');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('دورة') || name.includes('course')) return <School />;
    if (name.includes('تدريب') || name.includes('training')) return <Code />;
    if (name.includes('دبلوم') || name.includes('diploma')) return <MenuBook />;
    return <School />;
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const [slidesPerView, setSlidesPerView] = useState(3);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Update slides per view based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, Math.max(0, courses.length - slidesPerView)));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const renderCourses = () => {
    if (loading) {
      return (
    <Box sx={{
        display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
          py: 6,
          gap: 2
        }}>
          <CircularProgress sx={{ color: '#0e5181' }} />
          <Typography variant="body1" color="text.secondary">
            جاري تحميل الدورات...
                  </Typography>
                    </Box>
      );
    }

    if (error) {
      return (
                    <Box sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: '600px', 
              width: '100%',
              '& .MuiAlert-message': {
                textAlign: 'center'
              }
            }}
          >
            {error}
          </Alert>
                  <Button
                    variant="outlined"
            onClick={() => {
              setError(null);
              loadCategories();
            }}
            sx={{ color: '#0e5181', borderColor: '#0e5181' }}
          >
            إعادة المحاولة
                  </Button>
            </Box>
      );
    }

    if (courses.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            bgcolor: 'rgba(14, 81, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <School sx={{ fontSize: '2rem', color: '#0e5181' }} />
        </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            لا توجد دورات متاحة في هذا التصنيف حالياً
          </Typography>
          <Typography variant="body2" color="text.secondary">
            سيتم إضافة دورات جديدة قريباً
          </Typography>
    </Box>
  );
    }

    // Calculate slider values
    const maxSlides = Math.max(0, courses.length - slidesPerView);
    const canGoNext = currentSlide < maxSlides;
    const canGoPrev = currentSlide > 0;
    const totalSlides = Math.ceil(courses.length / slidesPerView);

    return (
      <SliderContainer>
        {/* Navigation Buttons - RTL Layout */}
        {canGoPrev && (
          <NavigationButton direction="left" onClick={prevSlide}>
            <ChevronRight /> {/* RTL: show right arrow for previous */}
          </NavigationButton>
        )}
        
        {canGoNext && (
          <NavigationButton direction="right" onClick={nextSlide}>
            <ChevronLeft /> {/* RTL: show left arrow for next */}
          </NavigationButton>
        )}

        {/* Slider Track */}
        <Box 
          className="slider-track"
          sx={{
            // RTL: Use positive translateX for right-to-left movement
            transform: `translateX(${currentSlide * (slidesPerView === 1 ? 100 : slidesPerView === 2 ? 280 + 24 : 300 + 24)}px)`,
            [theme.breakpoints.down('sm')]: {
              transform: `translateX(${currentSlide * 100}%)`,
            },
          }}
        >
        {courses.map((course, index) => (
            <Box key={course.id} className="slider-item">
            <Grow in={true} timeout={index * 200}>
              <Box>
                <MethodCard 
                  delay={index}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CourseImageContainer>
                    <img 
                      src={course.image_url || '/src/assets/images/bannar.jpeg'} 
                      alt={course.title} 
                      className="course-image"
                      onError={(e) => {
                        e.target.src = '/src/assets/images/bannar.jpeg';
                      }}
                    />
                    
                    {/* Course Badges */}
                    {course.is_free && (
                      <CourseBadge variant="free">
                        مجاني
                      </CourseBadge>
                    )}
                    {course.is_featured && (
                      <CourseBadge variant="featured">
                        مميز
                      </CourseBadge>
                    )}
                    {course.is_certified && (
                      <CourseBadge variant="new">
                        معتمد
                      </CourseBadge>
                    )}
                  </CourseImageContainer>
                  
                  <MethodContent>
                    <Typography variant="h6" component="h3">
                      {course.title}
                    </Typography>
                    
                    {course.instructors && course.instructors.length > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                          justifyContent: 'space-between',
                        mt: 1.5,
                        p: 1,
                        bgcolor: 'rgba(14, 81, 129, 0.05)',
                        borderRadius: '8px'
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                      }}>
                        <Box sx={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          bgcolor: '#0e5181',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          {course.instructors[0]?.name?.charAt(0) || 'م'}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          {course.instructors[0]?.name || 'مدرب غير محدد'}
                        </Typography>
                      </Box>
                          
                          {/* Open button with icon */}
                          <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id);
                      }}
                      sx={{
                              width: '28px',
                              height: '28px',
                              bgcolor: 'rgba(14, 81, 129, 0.1)',
                        color: '#0e5181',
                        '&:hover': {
                                bgcolor: '#0e5181',
                          color: '#fff',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <ArrowForward sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      )}
                    </MethodContent>
                    
                    <MethodFooter>
                      {/* Empty footer - removed course button */}
                  </MethodFooter>
                </MethodCard>
              </Box>
            </Grow>
          </Box>
        ))}
    </Box>

        {/* Slider Indicators */}
        {courses.length > slidesPerView && (
          <SliderIndicator>
            {Array.from({ length: totalSlides }, (_, index) => (
              <Box
                key={index}
                className={`indicator-dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </SliderIndicator>
        )}
      </SliderContainer>
  );
  };

  return (
    <SectionContainer>
      {/* Creative Pattern Background */}
      <Box className="creative-pattern" />
      
      <Container maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 1, mb: 8 }}>
          <SectionTitle 
            variant="h2" 
            component="h2"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            أساليب تعليمية مبتكرة
          </SectionTitle>
          <SectionSubtitle 
            data-aos="fade-up"
            data-aos-delay="200"
            sx={{ mt: 4 }}
          >
            اكتشف طرق تعلم جديدة ومبتكرة تناسب احتياجاتك وتواكب متطلبات سوق العمل
          </SectionSubtitle>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={500}>
            <Box>
              {loading && categories.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  py: 6,
                  gap: 2
                }}>
                  <CircularProgress sx={{ color: '#0e5181' }} />
                  <Typography variant="body1" color="text.secondary">
                    جاري تحميل التصنيفات...
                  </Typography>
                </Box>
              ) : (
                <>
              <StyledTabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="learning methods tabs"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                    {categories.map((category, index) => (
                <Tab 
                        key={category.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCategoryIcon(category.name)}
                            <span>{category.name}</span>
                            {category.courses_count > 0 && (
                              <Box sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                px: 1,
                                py: 0.2,
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                minWidth: '20px',
                                textAlign: 'center'
                              }}>
                                {category.courses_count}
                    </Box>
                            )}
                    </Box>
                  } 
                  iconPosition="start"
                />
                    ))}
              </StyledTabs>

              <Box mt={2}>
                    <TabPanel value={value} index={value}>
                  {renderCourses()}
                </TabPanel>
              </Box>
                </>
              )}
            </Box>
          </Fade>
        </Box>


      </Container>
    </SectionContainer>
  );
};

export default LearningMethodsSection;
