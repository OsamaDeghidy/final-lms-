import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Button, 
  Chip,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  School as SchoolIcon, 
  People as PeopleIcon, 
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/system';
import { courseAPI } from '../../services/api.service';

// Helper: truncate text to a fixed number of characters and append ellipsis
const truncateText = (text, maxChars = 30) => {
  if (!text) return '';
  const clean = String(text).trim();
  return clean.length > maxChars ? `${clean.slice(0, maxChars)}…` : clean;
};

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '16px',
  bgcolor: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)'
    },
    '& .action-buttons': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #3498db, #2ecc71)',
    zIndex: 1
  }
}));

const StyledCardMedia = styled(CardMedia)({
  height: 160,
  position: 'relative',
  transition: 'transform 0.5s ease-in-out',
  bgcolor: '#ecf0f1',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
    zIndex: 1
  }
});

const MyCourses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await courseAPI.getCourses();
        console.log('Courses API response:', coursesData);
        // Ensure coursesData is an array
        const coursesArray = Array.isArray(coursesData) ? coursesData : 
                           coursesData.results ? coursesData.results : 
                           coursesData.data ? coursesData.data : [];
        console.log('Processed courses array:', coursesArray);
        setCourses(coursesArray);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setSnackbar({
          open: true,
          message: 'خطأ في تحميل الكورسات',
          severity: 'error'
        });
        // Set empty array as fallback
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle search input
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter courses based on search query
  const filteredCourses = Array.isArray(courses) ? courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Handle course click - navigate to course detail page
  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Handle create course - navigate to create course page
  const handleCreateCourse = () => {
    navigate('/teacher/courses/new');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Header Component
  const Header = () => (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 4,
      p: 3,
      bgcolor: 'white',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #3498db, #2ecc71, #f39c12)',
        zIndex: 1
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1.5,
          bgcolor: '#f8f9fa',
          borderRadius: 2
        }}>
          <SchoolIcon sx={{ color: '#3498db', fontSize: 28 }} />
          <Typography variant="h5" component="h1" fontWeight="bold" sx={{ color: '#2c3e50' }}>
            كورساتي
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ color: '#27ae60', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {Array.isArray(courses) ? courses.length : 0} كورس نشط
          </Typography>
        </Box>
      </Box>
      
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="بحث في الكورسات..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3498db',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3498db',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}
            sx={{
              bgcolor: '#3498db',
              color: 'white',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(52, 152, 219, 0.3)',
              '&:hover': {
                bgcolor: '#2980b9',
                boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            إنشاء كورس جديد
          </Button>
        </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Course Card Component
  const CourseCard = ({ course }) => {
    const handleDeleteCourse = async (e) => {
      e.stopPropagation();
      if (window.confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
        try {
          // TODO: Implement actual delete API call
          // await courseAPI.deleteCourse(course.id);
          setSnackbar({
            open: true,
            message: 'تم حذف الكورس بنجاح',
            severity: 'success'
          });
          // Remove course from local state
          setCourses(prevCourses => prevCourses.filter(c => c.id !== course.id));
        } catch (error) {
          console.error('Error deleting course:', error);
          setSnackbar({
            open: true,
            message: 'خطأ في حذف الكورس',
            severity: 'error'
          });
        }
      }
    };

    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 5,
          boxShadow: '0 8px 32px 0 rgba(124,77,255,0.10)',
          mb: 3,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.95)',
          transition: 'transform 0.25s, box-shadow 0.25s',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: '0 16px 48px 0 rgba(124,77,255,0.18)',
            border: '1.5px solid #7c4dff',
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <StyledCardMedia
            component="img"
            image={course.image || 'https://via.placeholder.com/300x200/3498db/ffffff?text=Course'}
            alt={course.title}
          />
          
          {/* Category Chip */}
          <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                  <Chip 
            label={course.category_name || 'غير محدد'} 
                  size="small" 
            sx={{ 
              fontWeight: 'bold',
              bgcolor: '#3498db',
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
                  </Box>
                </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="h2" 
            sx={{
              fontWeight: 'bold',
              minHeight: '2.5em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.3em',
              textAlign: 'right',
              fontSize: '1rem',
              mb: 1
            }}
          >
                  {course.title}
                </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 2,
              textAlign: 'right',
              fontSize: '0.85rem'
            }}
            title={course.short_description || course.description}
          >
            {truncateText(course.short_description || course.description, 30)}
          </Typography>
          
          {/* Course Stats */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="action" fontSize="small" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {course.total_enrollments || 0} طالب
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {course.level || 'غير محدد'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ color: '#f39c12', fontSize: '0.9rem' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {course.average_rating || 0}
                    </Typography>
            </Box>
          </Box>
          
          {/* Price */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="#3498db" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
              {course.is_free ? 'مجاني' : `$${course.price}`}
                    </Typography>
                  </Box>
          
          {/* Status */}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 2, display: 'block' }}>
            الحالة: {course.status === 'published' ? 'منشور' : course.status === 'draft' ? 'مسودة' : course.status}
          </Typography>

          {/* أيقونات actions أسفل البطاقة */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: 'center',
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Tooltip title="تعديل الكورس">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(124,77,255,0.1)', 
                  boxShadow: '0 2px 8px rgba(124,77,255,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(124,77,255,0.2)',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={e => {
                  e.stopPropagation();
                  // Navigate to edit course page
                  navigate(`/teacher/courses/${course.id}/edit`);
                }}
              >
                <EditIcon sx={{ color: '#7c4dff', fontSize: '1.1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="تفاصيل الكورس">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(67,160,71,0.1)', 
                  boxShadow: '0 2px 8px rgba(67,160,71,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(67,160,71,0.2)',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={e => {
                  e.stopPropagation();
                  // Navigate to course detail page (public route)
                  navigate(`/courses/${course.id}`);
                }}
              >
                <VisibilityIcon sx={{ color: '#43a047', fontSize: '1.1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="وحدات الكورس">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(231,76,60,0.1)', 
                  boxShadow: '0 2px 8px rgba(231,76,60,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(231,76,60,0.2)',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={e => {
                  e.stopPropagation();
                  // Navigate to course units list/details page
                  navigate(`/teacher/courses/${course.id}/units`);
                }}
              >
                <AddIcon sx={{ color: '#e74c3c', fontSize: '1.1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف الكورس">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(192,57,43,0.1)', 
                  boxShadow: '0 2px 8px rgba(192,57,43,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(192,57,43,0.2)',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={handleDeleteCourse}
              >
                <DeleteIcon sx={{ color: '#c0392b', fontSize: '1.1rem' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      direction: 'rtl'
    }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <Grid container spacing={3}>
          {filteredCourses.length === 0 ? (
            <Fade in={true} timeout={500}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 6 }, 
                  textAlign: 'center', 
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  maxWidth: '600px',
                  mx: 'auto',
                  my: 4
                }}
              >
                <Box sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 3,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%)',
                    animation: `${pulse} 2s infinite ease-in-out`,
                  }
                }}>
                  <SchoolIcon 
                    color="disabled" 
                          sx={{
                    fontSize: 60, 
                    position: 'relative',
                    top: '50%',
                    transform: 'translateY(-50%)'
                          }}
                        />
                      </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery ? 'لا توجد نتائج' : 'لا توجد كورسات مسجلة بعد'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
                  {searchQuery 
                    ? 'لم يتم العثور على نتائج مطابقة للبحث. جرب كلمات بحث أخرى.'
                    : 'يمكنك البدء بإنشاء كورس جديد بالنقر على زر "إنشاء كورس جديد"'
                  }
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateCourse}
                  sx={{
                    bgcolor: '#3498db',
                    color: 'white',
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(52, 152, 219, 0.3)',
                    '&:hover': {
                      bgcolor: '#2980b9',
                      boxShadow: '0 6px 20px rgba(52, 152, 219, 0.4)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  إنشاء كورس جديد
                </Button>
              </Paper>
            </Fade>
          ) : (
            filteredCourses.map((course, index) => (
              <Grid item xs={12} sm={6} md={6} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyCourses;
