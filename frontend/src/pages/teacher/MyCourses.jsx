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
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  LibraryBooks as LibraryBooksIcon,
  FilterList,
  Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/system';
import { courseAPI } from '../../services/courseService';

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
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Debug: log categories state
  console.log('Categories state:', categories);
  console.log('Categories length:', categories.length);

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
        
        // Log sample course data to understand structure
        if (coursesArray.length > 0) {
          console.log('Sample course data:', coursesArray[0]);
          console.log('Sample course category:', coursesArray[0].category);
          console.log('Sample course category_id:', coursesArray[0].category_id);
        }
        
        setCourses(coursesArray);
        setAllCourses(coursesArray);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setSnackbar({
          open: true,
          message: 'خطأ في تحميل الكورسات',
          severity: 'error'
        });
        // Set empty array as fallback
        setCourses([]);
        setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

    fetchCourses();
  }, []);

  // Fetch categories independently
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const categoriesData = await courseAPI.getCategories();
        console.log('Categories API response:', categoriesData);
        // Ensure categoriesData is an array
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : 
                              categoriesData.results ? categoriesData.results : 
                              categoriesData.data ? categoriesData.data : [];
        console.log('Processed categories array:', categoriesArray);
        console.log('Categories length:', categoriesArray.length);
        
        // Log sample category data
        if (categoriesArray.length > 0) {
          console.log('Sample category data:', categoriesArray[0]);
        }
        
        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.log('Trying fallback: extracting categories from courses...');
        // Try to extract categories from courses as fallback
        const uniqueCategories = [];
        const categoryMap = new Map();
        allCourses.forEach(course => {
          console.log('Course category:', course.category);
          console.log('Course category_id:', course.category_id);
          console.log('Course category_name:', course.category_name);
          
          // Try different ways to get category info
          let category = null;
          if (course.category && course.category.id) {
            category = course.category;
          } else if (course.category_id && course.category_name) {
            category = { id: course.category_id, name: course.category_name };
          } else if (course.category && typeof course.category === 'object') {
            category = course.category;
          }
          
          if (category && category.id && !categoryMap.has(category.id)) {
            categoryMap.set(category.id, category);
            uniqueCategories.push(category);
          }
        });
        console.log('Fallback categories:', uniqueCategories);
        setCategories(uniqueCategories);
      }
    };

    fetchCategories();
  }, [allCourses]);

  // Handle search input
  const handleSearch = (event) => {
    const value = event.target.value;
    console.log('Search input changed:', value);
    setSearchQuery(value);
  };

  // Apply filters
  useEffect(() => {
    console.log('=== APPLYING FILTERS ===');
    console.log('Search query:', searchQuery);
    console.log('Selected category:', selectedCategory);
    console.log('Selected status:', selectedStatus);
    console.log('Selected level:', selectedLevel);
    console.log('All courses count:', allCourses.length);
    console.log('Available categories:', categories);
    console.log('========================');
    
    let filtered = [...allCourses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course => {
        const titleMatch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryNameMatch = course.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = course.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return titleMatch || descMatch || categoryNameMatch || categoryMatch;
      });
      console.log('After search filter:', filtered.length);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => {
        // Try different ways to get category ID
        const courseCategoryId = course.category?.id || 
                                course.category_id || 
                                course.category?.pk ||
                                course.category;
        
        // Convert both to numbers for comparison
        const courseId = parseInt(courseCategoryId);
        const selectedId = parseInt(selectedCategory);
        
        const match = courseId === selectedId;
        console.log(`Course ${course.id}: categoryId=${courseCategoryId} (${courseId}), selected=${selectedCategory} (${selectedId}), match=${match}`);
        console.log('Course category object:', course.category);
        console.log('Course category_id:', course.category_id);
        console.log('Course category_name:', course.category_name);
        return match;
      });
      console.log('After category filter:', filtered.length);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(course => {
        const match = course.status === selectedStatus;
        console.log(`Course ${course.id}: status=${course.status}, selected=${selectedStatus}, match=${match}`);
        return match;
      });
      console.log('After status filter:', filtered.length);
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => {
        const match = course.level === selectedLevel;
        console.log(`Course ${course.id}: level=${course.level}, selected=${selectedLevel}, match=${match}`);
        return match;
      });
      console.log('After level filter:', filtered.length);
    }

    console.log('Final filtered count:', filtered.length);
    setCourses(filtered);
  }, [searchQuery, selectedCategory, selectedStatus, selectedLevel, allCourses]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // This will trigger the filter effect above
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Clear all filters
  const clearFilters = () => {
    console.log('Clearing all filters...');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedLevel('');
  };
  
  // Filter courses based on search query
  const filteredCourses = courses;

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
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -30, 
          left: -30, 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.08)',
          zIndex: 1
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              كورساتي
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          إدارة الكورسات والمحتوى التعليمي
          </Typography>
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
            label={course.category?.name || course.category_name || 'غير محدد'} 
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
                {course.level === 'beginner' ? 'مبتدئ' : 
                 course.level === 'intermediate' ? 'متوسط' : 
                 course.level === 'advanced' ? 'متقدم' : 
                 course.level || 'غير محدد'}
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
            الحالة: {course.status === 'published' ? 'منشور' : course.status === 'draft' ? 'مسودة' : course.status || 'غير محدد'}
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
        
        {/* Create Course Button - Fixed */}
        <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
          <IconButton
            onClick={handleCreateCourse}
                  sx={{ 
              width: 56,
              height: 56,
              background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
              boxShadow: '0 4px 20px rgba(14, 81, 129, 0.3)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                boxShadow: '0 6px 25px rgba(14, 81, 129, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
        
        {/* Filters Section */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterList sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  فلاتر البحث
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  النتائج:
                </Typography>
                <Chip 
                  label={`${courses.length} من ${allCourses.length}`} 
                  color={courses.length !== allCourses.length ? "secondary" : "primary"}
                  size="small" 
                  variant="outlined"
                  sx={{ minWidth: 'fit-content' }}
                />
              </Box>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: 2, 
              alignItems: 'flex-end',
              '& > *': { flex: '0 0 auto' }
            }}>
              <TextField
                label="البحث في الكورسات"
                value={searchQuery}
                onChange={handleSearch}
                sx={{ minWidth: 280, flex: '1 1 280px' }}
                size="small"
                placeholder="ابحث في العنوان أو الوصف..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                helperText={`${searchQuery ? 'جاري البحث...' : 'اكتب للبحث'}`}
              />
              
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>التصنيف</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    console.log('Category changed:', e.target.value);
                    console.log('Available categories:', categories);
                    setSelectedCategory(e.target.value);
                  }}
                  label="التصنيف"
                >
                  <MenuItem value="">جميع التصنيفات</MenuItem>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>جاري تحميل التصنيفات...</MenuItem>
                  )}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => {
                    console.log('Status changed:', e.target.value);
                    setSelectedStatus(e.target.value);
                  }}
                  label="الحالة"
                >
                  <MenuItem value="">جميع الحالات</MenuItem>
                  <MenuItem value="published">منشور</MenuItem>
                  <MenuItem value="draft">مسودة</MenuItem>
                  <MenuItem value="archived">مؤرشف</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel>المستوى</InputLabel>
                <Select
                  value={selectedLevel}
                  onChange={(e) => {
                    console.log('Level changed:', e.target.value);
                    setSelectedLevel(e.target.value);
                  }}
                  label="المستوى"
                >
                  <MenuItem value="">جميع المستويات</MenuItem>
                  <MenuItem value="beginner">مبتدئ</MenuItem>
                  <MenuItem value="intermediate">متوسط</MenuItem>
                  <MenuItem value="advanced">متقدم</MenuItem>
                </Select>
              </FormControl>
              
              <IconButton
                onClick={clearFilters}
                disabled={!searchQuery && !selectedCategory && !selectedStatus && !selectedLevel}
                sx={{ 
                  width: 40,
                  height: 40,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  color: 'grey.700',
                  '&:hover': {
                    borderColor: 'grey.400',
                    backgroundColor: 'grey.50',
                    color: 'error.main'
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }
                }}
                title="مسح جميع الفلاتر"
              >
                <Clear />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
        
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
                    background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
                    color: 'white',
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(14, 81, 129, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
                      boxShadow: '0 6px 20px rgba(14, 81, 129, 0.4)',
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
