import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PlayCircleOutline as PlayIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
  VideoLibrary as VideoIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  background: theme.palette.background.paper,
  marginTop: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));

const LESSON_TYPES = [
  { value: 'video', label: 'فيديو', icon: <VideoIcon />, color: 'primary' },
  { value: 'article', label: 'مقال', icon: <ArticleIcon />, color: 'secondary' },
  { value: 'quiz', label: 'اختبار', icon: <QuizIcon />, color: 'warning' },
  { value: 'exercise', label: 'تمرين عملي', icon: <CodeIcon />, color: 'success' },
];

const UnitDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId, unitId } = useParams();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // الجلب من API سيتم مباشرةً

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      try {
        const data = await contentAPI.getModuleById(unitId);
        const normalized = {
          id: data?.id,
          title: data?.name || '',
          description: data?.description || '',
          duration: typeof data?.video_duration === 'number' ? Math.round(data.video_duration / 60) : 0,
          order: data?.order,
          status: data?.status || (data?.is_active ? 'published' : 'draft'),
          isPreview: data?.is_active === false,
          lessons: Array.isArray(data?.lessons)
            ? data.lessons.map((l) => ({
                id: l.id,
                title: l.title || '',
                type: l.lesson_type || 'article',
                duration: l.duration_minutes || 0,
                content: l.content || '',
                isPreview: l.is_free || false,
                completed: false,
                resources: [],
              }))
            : [],
          createdAt: data?.created_at,
          updatedAt: data?.updated_at,
        };
        setUnit(normalized);
        const initialExpanded = {};
        normalized.lessons.forEach((lesson) => {
          initialExpanded[lesson.id] = false;
        });
        setExpandedLessons(initialExpanded);
      } catch (error) {
        console.error('Error fetching unit:', error);
        setSnackbar({
          open: true,
          message: 'حدث خطأ في تحميل بيانات الوحدة',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchUnit();
    }
  }, [unitId]);

  const handleLessonToggle = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleEditUnit = () => {
    navigate(`/teacher/courses/${courseId}/units/${unitId}/edit`);
  };

  const handleLessonClick = (lesson) => {
    // Navigate to lesson content or open in modal
    console.log('Opening lesson:', lesson);
  };

  const getLessonIcon = (type) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.icon : <ArticleIcon />;
  };

  const getLessonColor = (type) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.color : 'default';
  };

  const getLessonLabel = (type) => {
    const lessonType = LESSON_TYPES.find(t => t.value === type);
    return lessonType ? lessonType.label : 'عام';
  };

  const calculateProgress = () => {
    if (!unit || !unit.lessons.length) return 0;
    const completedLessons = unit.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completedLessons / unit.lessons.length) * 100);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!unit) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          لم يتم العثور على الوحدة المطلوبة
        </Alert>
      </Container>
    );
  }

  const progress = calculateProgress();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mr: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {unit.title}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              وحدة من دورة البرمجة
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditUnit}
          sx={{ borderRadius: '12px' }}
        >
          تعديل الوحدة
        </Button>
      </Box>

      {/* Unit Overview */}
      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 64,
              height: 64,
              mr: 2,
            }}
          >
            <ArticleIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
              {unit.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip
                label={unit.status === 'published' ? 'منشور' : 'مسودة'}
                color={unit.status === 'published' ? 'success' : 'warning'}
                size="small"
                variant="outlined"
              />
              {unit.isPreview && (
                <Chip
                  label="معاينة"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {unit.duration} دقيقة
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArticleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {unit.lessons.length} درس
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          {unit.description}
        </Typography>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              التقدم
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {progress}% مكتمل
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </StyledPaper>

      {/* Lessons */}
      <StyledPaper elevation={0} sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
          دروس الوحدة ({unit.lessons.length})
        </Typography>

        <List sx={{ p: 0 }}>
          {unit.lessons.map((lesson, index) => (
            <React.Fragment key={lesson.id}>
              <ListItem
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: expandedLessons[lesson.id] ? theme.palette.grey[50] : 'transparent',
                  border: `1px solid ${expandedLessons[lesson.id] ? theme.palette.primary.main : theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette[getLessonColor(lesson.type)].main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getLessonIcon(lesson.type)}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {lesson.title}
                      </Typography>
                      <Chip
                        label={getLessonLabel(lesson.type)}
                        size="small"
                        color={getLessonColor(lesson.type)}
                        variant="outlined"
                      />
                      {lesson.isPreview && (
                        <Chip
                          label="معاينة"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {lesson.duration} دقيقة
                        </Typography>
                      </Box>
                      {lesson.completed && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircleIcon sx={{ fontSize: '0.875rem', color: 'success.main' }} />
                          <Typography variant="body2" color="success.main">
                            مكتمل
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="عرض التفاصيل">
                      <IconButton
                        size="small"
                        onClick={() => handleLessonToggle(lesson.id)}
                      >
                        {expandedLessons[lesson.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="فتح الدرس">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleLessonClick(lesson)}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              
              {/* Expanded Lesson Details */}
              {expandedLessons[lesson.id] && (
                <Box sx={{ pl: 7, pr: 2, pb: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {lesson.content}
                  </Typography>
                  
                  {lesson.resources.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        المرفقات:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {lesson.resources.map((resource) => (
                          <Chip
                            key={resource.id}
                            label={resource.name}
                            size="small"
                            variant="outlined"
                            icon={<DownloadIcon />}
                            onClick={() => console.log('Download:', resource)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </React.Fragment>
          ))}
        </List>
      </StyledPaper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UnitDetail; 