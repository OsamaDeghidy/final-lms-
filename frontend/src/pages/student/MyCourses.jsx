import React, { useState } from 'react';
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
  Tooltip
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
    background: 'linear-gradient(90deg, #7c4dff, #43a047)',
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

const mockEnrolledCourses = [
  {
    id: 1,
    title: 'تطوير تطبيقات الويب المتقدمة',
    description: 'تعلم أحدث تقنيات تطوير تطبيقات الويب',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    instructor: 'أحمد محمد',
    progress: 65,
    totalLessons: 24,
    completedLessons: 15,
    category: 'برمجة'
  },
  {
    id: 2,
    title: 'تعلم لغة JavaScript',
    description: 'دورة شاملة لتعلم لغة JavaScript من الصفر',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    instructor: 'سارة أحمد',
    progress: 30,
    totalLessons: 30,
    completedLessons: 9,
    category: 'برمجة'
  },
];

const mockCompletedCourses = [
  {
    id: 3,
    title: 'أساسيات HTML و CSS',
    description: 'تعلم أساسيات تطوير واجهات الويب',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    instructor: 'محمد علي',
    completedDate: '15 مايو 2023',
    grade: 'A',
    category: 'تطوير ويب'
  }
];

const EmptyState = () => (
  <Fade in={true} timeout={500}>
    <Box sx={{
      textAlign: 'center',
      py: 8,
      color: '#7c4dff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }}>
      <SentimentSatisfiedAlt sx={{ fontSize: 80, color: '#b39ddb' }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>
        لا توجد كورسات مسجلة بعد
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        يمكنك تصفح الكورسات المتاحة والتسجيل فيها لتبدأ رحلة التعلم
      </Typography>
      <Button variant="contained" size="large" sx={{ bgcolor: '#7c4dff', borderRadius: 3, px: 5, py: 1.5, fontWeight: 700 }}>
        تصفح الكورسات
      </Button>
    </Box>
  </Fade>
);

const CourseCard = ({ course, onClick }) => (
  <Card
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderRadius: '48px',
      minHeight: 220,
      boxShadow: '0 8px 32px 0 rgba(124,77,255,0.10)',
      mb: 3,
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #f3e5f5 0%, #fff 100%)',
      transition: 'transform 0.25s, box-shadow 0.25s',
      px: 4,
      py: 2,
      '&:hover': {
        transform: 'translateY(-8px) scale(1.03)',
        boxShadow: '0 16px 48px 0 rgba(124,77,255,0.18)',
        border: '2px solid #7c4dff',
      }
    }}
    onClick={() => onClick(course.id)}
  >
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip label={course.category} sx={{ bgcolor: '#ede7f6', color: '#7c4dff', fontWeight: 700, fontSize: 14 }} />
            </Box>
      <Typography variant="h6" fontWeight={800} color="#5e35b1" sx={{ mb: 0.5, fontSize: 22 }}>
              {course.title}
            </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 36, fontSize: 16 }}>
              {course.description}
            </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: 15 }}>
        <SchoolIcon sx={{ fontSize: 20, color: '#43a047', ml: 0.5 }} />
                  {course.instructor}
                </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <Box sx={{ height: 10, bgcolor: '#ede7f6', borderRadius: 5, overflow: 'hidden' }}>
            <Box sx={{ width: `${course.progress}%`, height: '100%', bgcolor: '#7c4dff', borderRadius: 5, transition: 'width 0.8s' }} />
          </Box>
        </Box>
        <Typography variant="body2" fontWeight={700} color="#7c4dff" sx={{ fontSize: 16 }}>
          {course.progress}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<PlayIcon />}
          sx={{
            bgcolor: '#43a047',
            color: '#fff',
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 5,
            py: 1.5,
            boxShadow: '0 2px 12px 0 rgba(67,160,71,0.10)',
            '&:hover': { bgcolor: '#388e3c' }
          }}
          onClick={e => {
            e.stopPropagation();
            onClick(course.id);
          }}
        >
          استكمال التعلم
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

const CompletedCourseCard = ({ course }) => (
  <Card
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderRadius: '48px',
      minHeight: 220,
      boxShadow: '0 8px 32px 0 rgba(124,77,255,0.10)',
      mb: 3,
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #f3e5f5 0%, #fff 100%)',
      transition: 'transform 0.25s, box-shadow 0.25s',
      px: 4,
      py: 2,
      '&:hover': {
        transform: 'translateY(-8px) scale(1.03)',
        boxShadow: '0 16px 48px 0 rgba(124,77,255,0.18)',
        border: '2px solid #7c4dff',
      }
    }}
  >
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip label={course.category} sx={{ bgcolor: '#ede7f6', color: '#7c4dff', fontWeight: 700, fontSize: 14 }} />
      </Box>
      <Typography variant="h6" fontWeight={800} color="#5e35b1" sx={{ mb: 0.5, fontSize: 22 }}>
        {course.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 36, fontSize: 16 }}>
        {course.description}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: 15 }}>
        <SchoolIcon sx={{ fontSize: 20, color: '#43a047', ml: 0.5 }} />
        {course.instructor}
        </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <CheckCircleIcon sx={{ color: '#43a047', fontSize: 28 }} />
        <Typography variant="body2" fontWeight={700} color="#43a047" sx={{ fontSize: 16 }}>
          مكتمل - {course.grade}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<SchoolIcon />}
          sx={{
            color: '#7c4dff',
            borderColor: '#7c4dff',
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 5,
            py: 1.5,
            '&:hover': { bgcolor: '#ede7f6', borderColor: '#7c4dff' }
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

const MyCourses = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const enrolledCourses = mockEnrolledCourses;
  const completedCourses = mockCompletedCourses;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #ede7f6 0%, #fff 100%)',
        py: 0,
        px: 0
      }}
    >
    <Box sx={{ 
        py: 7,
        background: 'linear-gradient(90deg, #7c4dff 0%, #43a047 100%)',
        color: '#fff',
        textAlign: 'center',
        mb: 5,
        borderRadius: 0,
        boxShadow: '0 4px 32px 0 rgba(124,77,255,0.10)'
      }}>
        <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: 1 }}>
          مرحبًا بك في كورساتك
        </Typography>
        <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9 }}>
          استكشف، تعلم، وحقق أهدافك التعليمية بسهولة واحترافية
        </Typography>
            </Box>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant={tab === 0 ? 'contained' : 'outlined'}
            onClick={() => setTab(0)}
          sx={{ 
              mx: 1,
              bgcolor: tab === 0 ? '#7c4dff' : '#fff',
              color: tab === 0 ? '#fff' : '#7c4dff',
              borderColor: '#7c4dff',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.2,
              boxShadow: tab === 0 ? '0 2px 12px 0 rgba(124,77,255,0.10)' : 'none',
              '&:hover': { bgcolor: '#ede7f6', color: '#7c4dff' }
            }}
          >
            الكورسات المسجلة
          </Button>
          <Button
            variant={tab === 1 ? 'contained' : 'outlined'}
            onClick={() => setTab(1)}
                  sx={{ 
              mx: 1,
              bgcolor: tab === 1 ? '#43a047' : '#fff',
              color: tab === 1 ? '#fff' : '#43a047',
              borderColor: '#43a047',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.2,
              boxShadow: tab === 1 ? '0 2px 12px 0 rgba(67,160,71,0.10)' : 'none',
              '&:hover': { bgcolor: '#e8f5e9', color: '#43a047' }
            }}
          >
            الكورسات المكتملة
          </Button>
        </Box>
        <Grid container spacing={3}>
          {tab === 0
            ? (enrolledCourses.length > 0
                ? enrolledCourses.map(course => (
                    <Grid item xs={12} sm={6} md={6} key={course.id}>
                      <CourseCard course={course} onClick={id => navigate(`/student/courses/${id}`)} />
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
