import { useState, useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, IconButton, Rating, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowLeft, KeyboardArrowRight, PlayCircleOutline } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { courseAPI } from '../../services/courseService';

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
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
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

const CourseCollections = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const data = await courseAPI.getCourseCollections();
        setCollections(data);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('حدث خطأ في تحميل المجموعات');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
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
          <Box key={collection.id} sx={{ mb: 6 }}>
                         <SliderHeader>
               <Box>
                 <SectionTitle variant="h4" component="h2">
                   {collection.name}
                 </SectionTitle>
                 {collection.description && (
                   <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                     {collection.description}
                   </Typography>
                 )}
               </Box>
               <Button 
                 variant="outlined" 
                 color="primary"
                 component={RouterLink}
                 to={`/courses?collection=${collection.slug}`}
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
            
                         {collection.courses && collection.courses.length > 0 ? (
               <Box 
                 sx={{ 
                   overflow: 'hidden', 
                   width: '100%', 
                   margin: '0 auto',
                 }}
               >
                                 <SliderTrack 
                   sx={{ 
                     display: 'grid',
                     gridTemplateColumns: {
                       xs: 'repeat(auto-fill, minmax(280px, 1fr))',
                       sm: 'repeat(auto-fill, minmax(300px, 1fr))',
                       md: 'repeat(auto-fill, minmax(320px, 1fr))',
                       lg: 'repeat(auto-fill, minmax(350px, 1fr))'
                     },
                     gap: theme.spacing(2.5),
                     width: '100%',
                     padding: theme.spacing(0, 2, 4, 2),
                     [theme.breakpoints.down('sm')]: {
                       gap: theme.spacing(2),
                       padding: theme.spacing(0, 1, 4, 1),
                     },
                   }}
                 >
                  {collection.courses.map((course) => (
                    <CourseCard key={course.id} component={RouterLink} to={`/courses/${course.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
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
                      <CourseCardContent>
                        <CourseCategory>{course.category_name || 'بدون تصنيف'}</CourseCategory>
                        <CourseTitle variant="subtitle1" component="h3">
                          {course.title}
                        </CourseTitle>
                        <InstructorText>
                          {course.instructors && course.instructors.length > 0 
                            ? course.instructors[0].name 
                            : 'مدرب غير محدد'
                          }
                        </InstructorText>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating value={course.rating || 0} precision={0.1} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            ({course.rating || 0})
                          </Typography>
                        </Box>
                                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                           <PriceContainer>
                             <CurrentPrice>
                               {course.is_free ? 'مجاني' : `${course.discount_price || course.price} ر.س`}
                             </CurrentPrice>
                             {course.discount_price && course.price && course.discount_price !== course.price && (
                               <OriginalPrice>{`${course.price} ر.س`}</OriginalPrice>
                             )}
                           </PriceContainer>
                           <StudentsCount>
                             <span>•</span> {course.enrolled_count || 0} طالب
                           </StudentsCount>
                         </Box>
                      </CourseCardContent>
                    </CourseCard>
                                     ))}
                 </SliderTrack>
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
        ))}
      </Container>
    </SliderContainer>
  );
};

export default CourseCollections;
