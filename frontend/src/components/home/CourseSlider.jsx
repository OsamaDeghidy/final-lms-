import { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, IconButton, Rating, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowLeft, KeyboardArrowRight, PlayCircleOutline } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const courses = [
  {
    id: 1,
    title: 'تطوير تطبيقات الويب المتقدمة',
    instructor: 'أحمد محمد',
    rating: 4.8,
    students: 1250,
    price: '199 ر.س',
    originalPrice: '399 ر.س',
    image: 'https://via.placeholder.com/300x180',
    category: 'تطوير الويب'
  },
  {
    id: 2,
    title: 'تعلم الذكاء الاصطناعي من الصفر',
    instructor: 'سارة أحمد',
    rating: 4.9,
    students: 980,
    price: '249 ر.س',
    originalPrice: '499 ر.س',
    image: 'https://via.placeholder.com/300x180',
    category: 'الذكاء الاصطناعي'
  },
  {
    id: 3,
    title: 'أساسيات تحليل البيانات',
    instructor: 'خالد عبدالله',
    rating: 4.7,
    students: 876,
    price: '179 ر.س',
    originalPrice: '299 ر.س',
    image: 'https://via.placeholder.com/300x180',
    category: 'تحليل البيانات'
  },
  {
    id: 4,
    title: 'التسويق الرقمي المتكامل',
    instructor: 'نورة سعيد',
    rating: 4.6,
    students: 1540,
    price: '159 ر.س',
    originalPrice: '299 ر.س',
    image: 'https://via.placeholder.com/300x180',
    category: 'التسويق'
  },
  {
    id: 5,
    title: 'تصميم تجربة المستخدم UX/UI',
    instructor: 'محمد علي',
    rating: 4.8,
    students: 2100,
    price: '229 ر.س',
    originalPrice: '399 ر.س',
    image: 'https://via.placeholder.com/300x180',
    category: 'التصميم'
  },
];

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4, 0),
  overflow: 'hidden',
  direction: 'rtl',
}));

const SliderHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(0, 2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    right: 0,
    bottom: -8,
    width: '50px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

const SliderButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}));

const SliderTrack = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2.5),
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  minWidth: 300,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '85%',
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
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  opacity: 0,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
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
  color: theme.palette.primary.main,
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
  color: theme.palette.primary.main,
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

const SliderDots = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active, theme }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: theme.palette.action.disabled,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  ...(active && {
    backgroundColor: theme.palette.primary.main,
  }),
}));

const CourseSlider = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const sliderRef = useRef(null);
  
  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const slideWidth = isMobile ? 280 : 300; // Slightly reduced width for better fit
  const slideGap = isMobile ? 16 : 20; // Reduced gap for better fit
  const containerWidth = '100%';
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalSlides = Math.ceil(courses.length / slidesToShow);
  
  // Auto slide functionality
  useEffect(() => {
    if (isHovered || totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev >= totalSlides - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [totalSlides, isHovered]);
  
  const goToSlide = (index) => {
    if (index < 0 || index >= totalSlides) return;
    setCurrentSlide(index);
  };
  
  // Calculate translateX based on current slide and viewport width
  const getTranslateX = () => {
    if (isMobile) {
      return `calc(50% - ${(slideWidth / 2) + (currentSlide * (slideWidth + slideGap))}px)`;
    }
    return `calc(50% - ${(slidesToShow * slideWidth / 2) + ((slidesToShow - 1) * slideGap / 2) + (currentSlide * (slideWidth + slideGap) * slidesToShow)}px)`;
  };

  return (
    <SliderContainer>
      <Container maxWidth="lg">
        <SliderHeader>
          <SectionTitle variant="h4" component="h2">
            دورات مميزة لك
          </SectionTitle>
          <Button 
            variant="outlined" 
            color="primary"
            component={RouterLink}
            to="/courses"
            endIcon={<KeyboardArrowLeft />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(74, 108, 247, 0.05)',
              },
              '& .MuiButton-endIcon': {
                marginRight: '4px',
                marginLeft: '-4px',
              }
            }}
          >
            عرض الكل
          </Button>
        </SliderHeader>
        
        <Box 
          ref={sliderRef}
          sx={{ 
            overflow: 'hidden', 
            width: '100%', 
            margin: '0 auto',
            '&:hover': {
              cursor: 'grab',
            },
            '&:active': {
              cursor: 'grabbing',
            },
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <SliderTrack 
            sx={{ 
              transform: getTranslateX(),
              transition: 'transform 0.5s ease-in-out',
              width: 'fit-content',
              margin: '0 auto',
              padding: theme.spacing(0, 2, 4, 2),
              [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(0, 1, 4, 1),
              },
            }}
          >
            {courses.map((course) => (
              <CourseCard key={course.id}>
                <Box sx={{ position: 'relative' }}>
                  <CourseMedia
                    image={course.image}
                    title={course.title}
                  >
                    <PlayButton className="play-button">
                      <PlayCircleOutline fontSize="large" color="primary" />
                    </PlayButton>
                  </CourseMedia>
                  <DiscountBadge>
                    {Math.round((1 - parseFloat(course.price) / parseFloat(course.originalPrice)) * 100)}% خصم
                  </DiscountBadge>
                </Box>
                <CourseCardContent>
                  <CourseCategory>{course.category}</CourseCategory>
                  <CourseTitle variant="subtitle1" component="h3">
                    {course.title}
                  </CourseTitle>
                  <InstructorText>
                    {course.instructor}
                  </InstructorText>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={course.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      ({course.rating})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <PriceContainer>
                      <CurrentPrice>{course.price}</CurrentPrice>
                      <OriginalPrice>{course.originalPrice}</OriginalPrice>
                    </PriceContainer>
                    <StudentsCount>
                      <span>•</span> {course.students.toLocaleString()} طالب
                    </StudentsCount>
                  </Box>
                </CourseCardContent>
              </CourseCard>
            ))}
          </SliderTrack>
        </Box>
        
        {!isMobile && totalSlides > 1 && (
          <SliderDots>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <Dot 
                key={index} 
                active={index === currentSlide} 
                onClick={() => goToSlide(index)}
                aria-label={`انتقل إلى الشريحة ${index + 1}`}
              />
            ))}
          </SliderDots>
        )}
      </Container>
    </SliderContainer>
  );
};

export default CourseSlider;
