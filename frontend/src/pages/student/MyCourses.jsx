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
  Fade,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  School as SchoolIcon, 
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  SentimentSatisfiedAlt,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/system';
import { courseAPI } from '../../services/api.service';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

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
    background: progress >= 100 ? 'linear-gradient(90deg, #43a047, #66bb6a)' : 'linear-gradient(90deg, #7c4dff, #43a047)',
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



const EmptyState = () => (
  <Fade in={true} timeout={500}>
    <Box sx={{
      textAlign: 'center',
      py: 8,
      color: '#0e5181',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }}>
      <SentimentSatisfiedAlt sx={{ fontSize: 80, color: '#e5978b' }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>
        لا توجد كورسات مسجلة بعد
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        يمكنك تصفح الكورسات المتاحة والتسجيل فيها لتبدأ رحلة التعلم
      </Typography>
      <Button variant="contained" size="large" sx={{ bgcolor: '#0e5181', borderRadius: 3, px: 5, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#0a3d5f' } }}>
        تصفح الكورسات
      </Button>
    </Box>
  </Fade>
);

const CourseCard = ({ course, onClick }) => {
  // Ensure progress is a valid number between 0 and 100
  const progress = Math.min(Math.max(course.progress || 0, 0), 100);
  
  return (
  <Card
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderRadius: '48px',
      minHeight: 220,
      boxShadow: progress >= 100 ? '0 8px 32px 0 rgba(229, 151, 139, 0.15)' : '0 8px 32px 0 rgba(14, 81, 129, 0.15)',
      mb: 3,
      overflow: 'hidden',
      background: progress >= 100 ? 'linear-gradient(120deg, #fdf2f2 0%, #fff 100%)' : 'linear-gradient(120deg, #f0f8ff 0%, #fff 100%)',
      transition: 'transform 0.25s, box-shadow 0.25s',
      px: 4,
      py: 2,
      border: progress >= 100 ? '2px solid #e5978b' : '2px solid transparent',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.03)',
        boxShadow: progress >= 100 ? '0 16px 48px 0 rgba(229, 151, 139, 0.25)' : '0 16px 48px 0 rgba(14, 81, 129, 0.25)',
        border: progress >= 100 ? '2px solid #e5978b' : '2px solid #0e5181',
      }
    }}
    onClick={() => onClick(course.id)}
  >
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip label={course.category} sx={{ bgcolor: 'rgba(14, 81, 129, 0.1)', color: '#0e5181', fontWeight: 700, fontSize: 14 }} />
            </Box>
      <Typography variant="h6" fontWeight={800} color="#0e5181" sx={{ mb: 0.5, fontSize: 22 }}>
              {course.title}
            </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 36, fontSize: 16 }}>
              {course.description}
            </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: 15 }}>
        <SchoolIcon sx={{ fontSize: 20, color: '#e5978b', ml: 0.5 }} />
                  {course.instructor}
                </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ 
            height: 12, 
            bgcolor: 'rgba(14, 81, 129, 0.1)', 
            borderRadius: 6, 
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Box 
              sx={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
                borderRadius: 6, 
                transition: 'width 0.8s ease-in-out',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)',
                  borderRadius: 6
                }
              }} 
            />
          </Box>
        </Box>
        <Typography 
          variant="body2" 
          fontWeight={700} 
          color="#0e5181" 
          sx={{ 
            fontSize: 16,
            minWidth: '45px',
            textAlign: 'center',
            background: 'rgba(14, 81, 129, 0.1)',
            borderRadius: 2,
            px: 1,
            py: 0.5
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<PlayIcon />}
          sx={{
            bgcolor: progress >= 100 ? '#e5978b' : '#0e5181',
            color: '#fff',
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 5,
            py: 1.5,
            boxShadow: progress >= 100 ? '0 2px 12px 0 rgba(229, 151, 139, 0.3)' : '0 2px 12px 0 rgba(14, 81, 129, 0.3)',
            '&:hover': { 
              bgcolor: progress >= 100 ? '#d17a6f' : '#0a3d5f' 
            }
          }}
          onClick={e => {
            e.stopPropagation();
            onClick(course.id);
          }}
        >
          {progress >= 100 ? 'مراجعة الكورس' : 'استكمال التعلم'}
        </Button>
      </Box>
    </CardContent>
    <CardMedia
      component="img"
      image={course.image}
      alt={course.title}
      sx={{ width: 180, height: 180, objectFit: 'cover', borderRadius: '40px', ml: 2 }}
    />
  </Card>
  );
};

const CompletedCourseCard = ({ course }) => {
  // For completed courses, progress should be 100%
  const progress = 100;
  
  return (
  <Card
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderRadius: '48px',
      minHeight: 220,
      boxShadow: '0 8px 32px 0 rgba(229, 151, 139, 0.15)',
      mb: 3,
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #fdf2f2 0%, #fff 100%)',
      transition: 'transform 0.25s, box-shadow 0.25s',
      px: 4,
      py: 2,
      border: '2px solid #e5978b',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.03)',
        boxShadow: '0 16px 48px 0 rgba(229, 151, 139, 0.25)',
        border: '2px solid #e5978b',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #e5978b, #f0a8a0)',
        zIndex: 1
      }
    }}
  >
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip label={course.category} sx={{ bgcolor: 'rgba(14, 81, 129, 0.1)', color: '#0e5181', fontWeight: 700, fontSize: 14 }} />
      </Box>
      <Typography variant="h6" fontWeight={800} color="#0e5181" sx={{ mb: 0.5, fontSize: 22 }}>
        {course.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 36, fontSize: 16 }}>
        {course.description}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: 15 }}>
        <SchoolIcon sx={{ fontSize: 20, color: '#e5978b', ml: 0.5 }} />
        {course.instructor}
        </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ 
            height: 12, 
            bgcolor: 'rgba(229, 151, 139, 0.1)', 
            borderRadius: 6, 
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Box 
              sx={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #e5978b 0%, #f0a8a0 100%)',
                borderRadius: 6, 
                transition: 'width 0.8s ease-in-out',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.2) 100%)',
                  borderRadius: 6
                }
              }} 
            />
          </Box>
        </Box>
        <CheckCircleIcon sx={{ color: '#e5978b', fontSize: 28 }} />
        <Typography 
          variant="body2" 
          fontWeight={700} 
          color="#e5978b" 
          sx={{ 
            fontSize: 16,
            minWidth: '45px',
            textAlign: 'center',
            background: 'rgba(229, 151, 139, 0.1)',
            borderRadius: 2,
            px: 1,
            py: 0.5
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Typography variant="body2" fontWeight={700} color="#e5978b" sx={{ fontSize: 16 }}>
          مكتمل - {course.grade || 'A'}
        </Typography>
        {course.completion_date && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 14 }}>
            تم الإكمال في: {new Date(course.completion_date).toLocaleDateString('ar-EG')}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<SchoolIcon />}
          sx={{
            color: '#0e5181',
            borderColor: '#0e5181',
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 5,
            py: 1.5,
            '&:hover': { bgcolor: 'rgba(14, 81, 129, 0.1)', borderColor: '#0e5181' }
          }}
        >
          عرض الشهادة
        </Button>
      </Box>
    </CardContent>
    <CardMedia
      component="img"
      image={course.image}
      alt={course.title}
      sx={{ width: 180, height: 180, objectFit: 'cover', borderRadius: '40px', ml: 2 }}
    />
  </Card>
  );
};

const MyCourses = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseAPI.getMyEnrolledCourses();
      
      setEnrolledCourses(response.enrolled_courses || []);
      setCompletedCourses(response.completed_courses || []);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('حدث خطأ أثناء جلب الكورسات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/student/courses/${courseId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #ede7f6 0%, #fff 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #ede7f6 0%, #fff 100%)',
          py: 4
        }}
      >
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={fetchMyCourses}
            sx={{ bgcolor: '#7c4dff' }}
          >
            إعادة المحاولة
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #ede7f6 0%, #fff 100%)',
        py: 0,
        px: 0
      }}
    >
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
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
            استكشف، تعلم، وحقق أهدافك التعليمية بسهولة واحترافية
          </Typography>
        </Box>
      </Box>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant={tab === 0 ? 'contained' : 'outlined'}
            onClick={() => setTab(0)}
          sx={{ 
              mx: 1,
              bgcolor: tab === 0 ? '#0e5181' : '#fff',
              color: tab === 0 ? '#fff' : '#0e5181',
              borderColor: '#0e5181',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.2,
              boxShadow: tab === 0 ? '0 2px 12px 0 rgba(14, 81, 129, 0.2)' : 'none',
              '&:hover': { bgcolor: 'rgba(14, 81, 129, 0.1)', color: '#0e5181' }
            }}
          >
            الكورسات المسجلة ({enrolledCourses.length})
          </Button>
          <Button
            variant={tab === 1 ? 'contained' : 'outlined'}
            onClick={() => setTab(1)}
                  sx={{ 
              mx: 1,
              bgcolor: tab === 1 ? '#e5978b' : '#fff',
              color: tab === 1 ? '#fff' : '#e5978b',
              borderColor: '#e5978b',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.2,
              boxShadow: tab === 1 ? '0 2px 12px 0 rgba(229, 151, 139, 0.2)' : 'none',
              '&:hover': { bgcolor: 'rgba(229, 151, 139, 0.1)', color: '#e5978b' }
            }}
          >
            الكورسات المكتملة ({completedCourses.length})
          </Button>
        </Box>
        <Grid container spacing={3}>
          {tab === 0
            ? (enrolledCourses.length > 0
                ? enrolledCourses.map(course => (
                    <Grid item xs={12} sm={6} md={6} key={course.id}>
                      <CourseCard course={course} onClick={handleCourseClick} />
                    </Grid>
                  ))
                : <EmptyState />)
            : (completedCourses.length > 0
                ? completedCourses.map(course => (
                    <Grid item xs={12} sm={6} md={6} key={course.id}>
                      <CompletedCourseCard course={course} />
                    </Grid>
                  ))
                : <EmptyState />)
          }
        </Grid>
    </Container>
    </Box>
  );
};

export default MyCourses;
