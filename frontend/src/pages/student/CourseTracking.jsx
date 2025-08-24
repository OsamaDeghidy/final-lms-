import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  LinearProgress, 
  CircularProgress,
  TextField,
  Chip, 
  IconButton, 
  Divider, 
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  keyframes,
  Tooltip,
  linearProgressClasses,
  Tabs,
  Tab,
  Drawer,
  AppBar,
  Toolbar,
  InputBase,
  Fab,
  Zoom,
  Fade,
  Slide,
  Grow,
  Modal,
  Backdrop,
  Alert
} from '@mui/material';
import { 
  PlayCircleOutline, 
  PlayArrow,
  Pause,
  Fullscreen,
  FullscreenExit,
  VolumeUp,
  VolumeOff,
  Speed as SpeedIcon,
  ClosedCaption,
  Settings,
  PictureInPicture,
  CheckCircle, 
  CheckCircleOutline, 
  ExpandMore, 
  ExpandLess,
  BookmarkBorder,
  Bookmark,
  AccessTime,
  MenuBook,
  Assignment,
  Quiz,
  VideoLibrary,
  Star,
  StarBorder,
  StarHalf,
  ArrowBack,
  DescriptionOutlined,
  EmojiEvents,
  School,
  Timeline,
  LocalLibrary,
  Speed,
  InsertChart,
  CalendarToday,
  HourglassEmpty,
  CheckCircle as CheckCircleIcon,
  Menu,
  Close,
  NoteAlt,
  Download,
  Share,
  MoreVert,
  Subscriptions,
  ChatBubbleOutline,
  ThumbUp,
  ThumbUpOutlined,
  ForumOutlined,
  NoteAltOutlined,
  DownloadOutlined,
  ShareOutlined,
  MoreVertOutlined,
  CloudOff,
  Forum,
  ChevronRight,
  ChevronLeft,
} from '@mui/icons-material';
import { Quiz as QuizIcon } from '@mui/icons-material';
import QuizStart from './quiz/QuizStart';
import QuizResult from './quiz/QuizResult';
import ExamStart from './exam/ExamStart';
import ExamTaking from './exam/ExamTaking';
import ExamResult from './exam/ExamResult';
import FinalExamModal from './FinalExamModal';
import { courseAPI } from '../../services/api.service';

// Simple video player component to replace ReactPlayer
const VideoPlayer = ({ url, playing, onPlay, onPause, onProgress, onDuration, width, height, style }) => {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => onPlay && onPlay();
    const handlePause = () => onPause && onPause();
    const handleTimeUpdate = () => {
      if (onProgress && video.duration) {
        onProgress({
          played: video.currentTime / video.duration,
          playedSeconds: video.currentTime,
          loaded: 1,
          loadedSeconds: video.duration,
        });
      }
    };
    const handleDuration = () => onDuration && onDuration(video.duration);
    const handleLoadedMetadata = () => onDuration && onDuration(video.duration);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDuration);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDuration);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onPlay, onPause, onProgress, onDuration]);

  React.useEffect(() => {
    if (!videoRef.current) return;
    
    if (playing) {
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', ...style }}>
      <video
        ref={videoRef}
        src={url}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
        }}
        controls
        playsInline
      />
    </div>
  );
};
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { toggleDarkMode } from '../../store/slices/uiSlice';



// Animation
// Styled Components
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundImage: 'linear-gradient(45deg, #3f51b5, #2196f3)',
  },
}));

const ProgressCircle = styled(CircularProgress)({
  position: 'relative',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
});

const ProgressText = styled(Typography)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontWeight: 'bold',
});

// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 46, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.5s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}));

const ModuleCard = styled(Card)(({ theme, active }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  background: active 
    ? theme.palette.mode === 'dark' 
      ? 'rgba(63, 81, 181, 0.15)' 
      : 'rgba(63, 81, 181, 0.05)'
    : 'transparent',
  borderLeft: `4px solid ${active ? theme.palette.primary.main : 'transparent'}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderLeft: `4px solid ${theme.palette.primary.light}`,
    background: theme.palette.mode === 'dark' 
      ? 'rgba(63, 81, 181, 0.2)' 
      : 'rgba(63, 81, 181, 0.08)',
    transform: 'translateX(4px)',
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: value === 100 
      ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
      : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    boxShadow: `0 0 10px ${theme.palette.primary.main}40`,
  },
}));

// Helper function to find the next incomplete lesson
const findNextIncompleteLesson = (modules) => {
  for (const module of modules) {
    const incompleteLesson = module.lessons.find(lesson => !lesson.completed);
    if (incompleteLesson) {
      return { module, lesson: incompleteLesson };
    }
  }
  return null;
};

// Calculate course statistics
const calculateCourseStats = (modules) => {
  const totalLessons = modules.reduce(
    (sum, module) => sum + module.lessons.length, 0
  );
  const completedLessons = modules.reduce(
    (sum, module) => sum + module.lessons.filter(lesson => lesson.completed).length, 0
  );
  const completionPercentage = Math.round((completedLessons / totalLessons) * 100);
  const totalDuration = modules.reduce(
    (sum, module) => sum + module.lessons.reduce(
      (moduleSum, lesson) => moduleSum + parseInt(lesson.duration), 0
    ), 0
  );
  
  return {
    totalLessons,
    completedLessons,
    completionPercentage,
    totalDuration: Math.round(totalDuration / 60) // Convert to hours
  };
};

// Get module icon based on module ID
const getModuleIcon = (moduleId) => {
  const icons = [
    <School color="primary" />,
    <LocalLibrary color="secondary" />,
    <Timeline color="success" />,
    <Speed color="warning" />,
    <InsertChart color="info" />,
    <EmojiEvents color="error" />
  ];
  // Convert moduleId to string and ensure it's valid before using charCodeAt
  const moduleIdStr = String(moduleId || 0);
  return icons[moduleIdStr.charCodeAt(1) % icons.length];
};

// Get lesson icon based on lesson type
const getLessonIcon = (type) => {
  switch(type) {
    case 'video':
      return <VideoLibrary color="primary" />;
    case 'quiz':
      return <Quiz color="secondary" />;
    case 'assignment':
      return <Assignment color="warning" />;
    default:
      return <MenuBook color="action" />; // Course Content Component
  }
};

const CourseContent = ({ modules, expandedModule, onModuleClick, onLessonClick, currentLessonId, setActiveQuizId, setOpenQuiz, setShowQuizResult, showFinalExamButton, onFinalExamClick }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.grey[100],
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.grey[400],
          borderRadius: '3px',
        },
      }}
    >
      <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <MenuBook sx={{ ml: 1 }} />
          محتوى الدورة
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {(modules || []).map((module, moduleIndex) => (
          <React.Fragment key={module.id}>
            <ListItem 
              button 
              onClick={() => onModuleClick(module.id)}
              sx={{
                bgcolor: expandedModule === module.id ? 'action.hover' : 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <Box 
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                  }}
                >
                  {getModuleIcon(module.id)}
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {module.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {module.completedLessons} من {module.totalLessons} دروس
                    </Typography>
                    <Box sx={{ mx: 1 }}>•</Box>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(module.progress)}% مكتمل
                    </Typography>
                  </Box>
                }
                sx={{ ml: 1 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 60, mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={module.progress} 
                    sx={{ 
                      height: 4, 
                      borderRadius: 2,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                      }
                    }} 
                  />
                </Box>
                {expandedModule === module.id ? <ExpandLess /> : <ExpandMore />}
              </Box>
            </ListItem>
            
            <Collapse in={expandedModule === module.id} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {(module.lessons || []).map((lesson, lessonIndex) => (
                  <ListItem
                    key={lesson.id}
                    button
                    selected={currentLessonId === lesson.id}
                    onClick={() => onLessonClick(module.id, lesson.id)}
                    sx={{
                      pl: 8,
                      pr: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor: currentLessonId === lesson.id ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {lesson.completed ? (
                        <CheckCircle color="success" sx={{ fontSize: 20 }} />
                      ) : (
                        <Box 
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: `2px solid ${theme.palette.grey[400]}`,
                          }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: currentLessonId === lesson.id ? 'bold' : 'normal',
                              color: currentLessonId === lesson.id ? 'primary.main' : 'text.primary',
                            }}
                          >
                            {lesson.title}
                          </Typography>
                          {lesson.type === 'quiz' && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<QuizIcon />}
                              sx={{ ml: 1, fontSize: '0.75rem', borderRadius: 2, px: 1.5, py: 0.5 }}
                              onClick={e => {
                                e.stopPropagation();
                                setActiveQuizId && setActiveQuizId(lesson.quizId || lesson.id);
                                setOpenQuiz && setOpenQuiz(true);
                                setShowQuizResult && setShowQuizResult(false);
                              }}
                            >
                              ابدأ الكويز
                            </Button>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                            {getLessonIcon(lesson.type)}
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontSize: '0.7rem' }}>
                              {lesson.type === 'video' ? 'فيديو' : lesson.type === 'quiz' ? 'اختبار' : 'تمرين'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {lesson.duration}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small" edge="end">
                      <PlayCircleOutline sx={{ fontSize: 20 }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
        {/* زر الامتحان الشامل بعد آخر وحدة إذا كل الدروس مكتملة */}
        {showFinalExamButton && (
          <ListItem sx={{ justifyContent: 'center', py: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                px: 0,
                py: 0.5,
                fontSize: 15,
                minWidth: 0,
                width: '85%',
                height: 38,
                boxShadow: '0 2px 8px 0 rgba(63,81,181,0.08)',
                mx: 'auto',
                display: 'block',
                mt: 1,
                mb: 1,
                letterSpacing: 1,
              }}
              onClick={onFinalExamClick}
            >
              بدء الامتحان الشامل
            </Button>
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

const CourseTracking = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedModule, setExpandedModule] = useState('m1');
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedLessons, setBookmarkedLessons] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const playerRef = useRef(null);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [examStep, setExamStep] = useState('start');
  const [openFinalExam, setOpenFinalExam] = useState(false);
  
  // Fetch course data on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!courseId) {
        setError('معرف الدورة غير صحيح');
        setIsLoading(false);
        return;
      }
      
      const response = await courseAPI.getCourseTrackingData(courseId);
      
      // Check if response has required data
      if (!response || !response.course) {
        setError('بيانات الدورة غير متاحة');
        setIsLoading(false);
        return;
      }
      
      // Transform API data to match component structure
      const transformedData = {
        id: response.course.id,
        title: response.course.title,
        instructor: response.course.instructor,
        instructorAvatar: response.course.instructor_avatar,
        category: response.course.category,
        level: response.course.level,
        duration: response.course.duration,
        progress: response.course.overall_progress,
        rating: response.course.rating,
        totalStudents: response.course.total_students,
        lastAccessed: {
          moduleId: response.course.modules[0]?.id || 'm1',
          lessonId: response.course.modules[0]?.lessons[0]?.id || 'l1',
          title: response.course.modules[0]?.lessons[0]?.title || 'الدرس الأول',
          duration: response.course.modules[0]?.lessons[0]?.duration_minutes || 15,
          completion: response.course.completed_lessons
        },
        enrolledDate: response.enrollment?.enrollment_date,
        hasFinalExam: response.course.has_final_exam,
        modules: (response.course.modules || []).map(module => ({
          id: module.id,
          title: module.name,
          progress: module.progress,
          totalLessons: module.total_lessons,
          completedLessons: module.completed_lessons,
          lessons: (module.lessons || []).map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration: `${Math.floor(lesson.duration_minutes / 60)}:${(lesson.duration_minutes % 60).toString().padStart(2, '0')}`,
            type: lesson.lesson_type,
            completed: lesson.completed,
            videoUrl: lesson.video_url,
            content: lesson.content,
            resources: lesson.resources || []
          }))
        })),
        assignments: response.assignments || [],
        exams: response.exams || [],
        quizzes: response.quizzes || []
      };
      
      setCourseData(transformedData);
      
      // Set initial current lesson
      if (transformedData.modules && transformedData.modules.length > 0 && 
          transformedData.modules[0].lessons && transformedData.modules[0].lessons.length > 0) {
        const firstLesson = transformedData.modules[0].lessons[0];
        setCurrentLesson({
          moduleId: transformedData.modules[0].id,
          lessonId: firstLesson.id,
          ...firstLesson
        });
      }
      
    } catch (err) {
      console.error('Error fetching course data:', err);
      if (err.response?.status === 404) {
        setError('الدورة غير موجودة أو غير متاحة لك.');
      } else if (err.response?.status === 403) {
        setError('أنت غير مسجل في هذه الدورة.');
      } else if (err.response?.status === 401) {
        setError('يرجى تسجيل الدخول مرة أخرى.');
      } else {
        setError('حدث خطأ أثناء جلب بيانات الدورة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate course statistics
  const courseStats = courseData ? {
    totalLessons: (courseData.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0),
    completedLessons: (courseData.modules || []).reduce((sum, module) => sum + (module.completedLessons || 0), 0),
    completionPercentage: courseData.progress || 0,
    totalDuration: courseData.duration || 0,
    totalAssignments: (courseData.assignments || []).length,
    totalExams: (courseData.exams || []).length,
    totalQuizzes: (courseData.quizzes || []).length
  } : { totalLessons: 0, completedLessons: 0, completionPercentage: 0, totalDuration: 0, totalAssignments: 0, totalExams: 0, totalQuizzes: 0 };

  const nextLesson = courseData ? (() => {
    for (const module of (courseData.modules || [])) {
      const incompleteLesson = (module.lessons || []).find(lesson => !lesson.completed);
      if (incompleteLesson) {
        return { module, lesson: incompleteLesson };
      }
    }
    return null;
  })() : null;

  // Handle module expansion
  const handleModuleClick = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  // Handle lesson selection
  const handleLessonClick = (moduleId, lessonId) => {
    const module = (courseData.modules || []).find(m => m.id === moduleId);
    if (module) {
      const lesson = (module.lessons || []).find(l => l.id === lessonId);
      if (lesson) {
        setCurrentLesson({
          moduleId,
          lessonId,
          ...lesson
        });
        setIsPlaying(true);
        if (isMobile) {
          setShowSidebar(false);
        }
      }
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle video progress
  const handleProgress = (state) => {
    setVideoProgress(state.playedSeconds);
  };

  // Handle video duration
  const handleDuration = (duration) => {
    setVideoDuration(duration);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleSidebarExpand = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Instructor Info Component
  const InstructorInfo = ({ instructor, avatar }) => {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={avatar} 
            alt={instructor}
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              border: '2px solid',
              borderColor: 'primary.main',
            }} 
          />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              المعلم
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {instructor}
            </Typography>
          </Box>
        </Box>
        <Button 
          variant="outlined" 
          fullWidth 
          size="small"
          startIcon={<ChatBubbleOutline />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          مراسلة المعلم
        </Button>
      </Paper>
    );
  };

  // Course Stats Component
  const CourseStats = ({ stats }) => {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          إحصائيات الدورة
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              التقدم
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {stats.completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={stats.completionPercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
              }
            }} 
          />
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'success.dark',
                  mr: 1,
                }}
              >
                <CheckCircle sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  مكتمل
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {stats.completedLessons} دروس
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: 'warning.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'warning.dark',
                  mr: 1,
                }}
              >
                <HourglassEmpty sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  المتبقي
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {stats.remainingLessons} دروس
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          startIcon={<EmojiEvents />}
          sx={{ 
            mt: 2,
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 'bold',
            py: 1.5,
            background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
            boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 242, 254, 0.4)',
            },
          }}
        >
          احصل على الشهادة
        </Button>
      </Paper>
    );
  };

  const toggleBookmark = (lessonId) => {
    setBookmarkedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default',
        flexDirection: 'column',
        gap: 2
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchCourseData}
          sx={{ bgcolor: '#7c4dff' }}
        >
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  if (!courseId) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default',
        flexDirection: 'column',
        gap: 2
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          معرف الدورة غير صحيح
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/student/my-courses')}
          sx={{ bgcolor: '#7c4dff' }}
        >
          العودة إلى كورساتي
        </Button>
      </Box>
    );
  }

  if (!courseData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <Typography>لا توجد بيانات متاحة</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      
      {/* Mobile App Bar */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: { xs: 'flex', md: 'none' },
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleSidebar}
            sx={{ mr: 1 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {currentLesson?.title || courseData.title}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container 
        maxWidth={false} 
        sx={{ 
          flex: 1, 
          py: { xs: 2, md: 4 }, 
          px: { xs: 1, sm: 2, md: 4 },
          maxWidth: '100%',
          width: '100%',
          margin: 0
        }}
      >
        <Box sx={{ mb: 3, display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}>
            {/* Path/Breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                الرئيسية / الدورات / {courseData.title} / {currentLesson?.title || 'لوحة التتبع'}
              </Typography>
            </Box>
            
            {/* Back Button */}
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate(-1)}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              العودة
            </Button>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Sidebar Toggle Button - Fixed on mobile */}
            <Box 
              sx={{ 
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1200,
                display: { xs: 'block', md: 'none' },
                '& .MuiFab-root': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }
              }}
            >
              <Tooltip title={showSidebar ? 'إغلاق القائمة' : 'فتح القائمة'}>
                <Fab 
                  color="primary" 
                  aria-label="عرض المحتوى"
                  onClick={toggleSidebar}
                >
                  {showSidebar ? <Close /> : <MenuBook />}
                </Fab>
              </Tooltip>
            </Box>

            {/* Left Sidebar - Course Content */}
            <Box 
              sx={{
                width: { xs: '100%', md: isSidebarExpanded ? '350px' : '0' },
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                position: { xs: 'fixed', md: 'relative' },
                top: { xs: 64, md: 0 },
                bottom: 0,
                right: 0,
                zIndex: 1100,
                height: { xs: showSidebar ? 'calc(100vh - 64px + 200px)' : 0, md: 'calc(100vh + 300px)' },
                bgcolor: 'background.paper',
                boxShadow: { xs: 3, md: 1 },
                borderRadius: { xs: 0, md: 2 },
                transform: { 
                  xs: showSidebar ? 'translateX(0)' : 'translateX(100%)',
                  md: 'none'
                },
                '&:hover': {
                  boxShadow: { md: 3 },
                }
              }}
            >
              <Box sx={{ 
                p: { xs: 2, md: 2 }, 
                position: 'relative', 
                height: 'auto',
                minHeight: 'calc(100%)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible'
              }}>
                {/* Close button for mobile */}
                <IconButton
                  onClick={toggleSidebar}
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    zIndex: 1,
                  }}
                >
                  <Close />
                </IconButton>
                
                {/* Scrollable Content */}
                <Box sx={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  pr: 1,
                  maxHeight: 'none',
                  minHeight: 'calc(100% - 200px)',
                  '&::-webkit-scrollbar': { 
                    width: '4px',
                    display: 'none' 
                  },
                  '&:hover': {
                    '&::-webkit-scrollbar': {
                      display: 'block'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '4px'
                    }
                  },
                  WebkitOverflowScrolling: 'touch'
                }}>
                  <CourseContent
                    modules={courseData.modules}
                    expandedModule={expandedModule}
                    onModuleClick={handleModuleClick}
                    onLessonClick={handleLessonClick}
                    currentLessonId={currentLesson?.id}
                    setActiveQuizId={setActiveQuizId}
                    setOpenQuiz={setOpenQuiz}
                    setShowQuizResult={setShowQuizResult}
                    showFinalExamButton={courseData.hasFinalExam}
                    onFinalExamClick={() => setOpenFinalExam(true)}
                  />
                </Box>
                
                {/* Fixed Bottom Section */}
                <Box sx={{ 
                  mt: 'auto',
                  pt: 2,
                  pb: 2,
                  position: 'sticky',
                  bottom: 0,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <InstructorInfo 
                    instructor={courseData.instructor}
                    avatar={courseData.instructorAvatar}
                  />
                  <Box sx={{ mt: 2 }}>
                    <CourseStats stats={courseStats} />
                  </Box>
                </Box>
              </Box>
            </Box>
          
            {/* Main Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Video Player Section */}
              <Card 
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: 'black' }}>
                  {currentLesson ? (
                    <VideoPlayer
                      ref={playerRef}
                      url={currentLesson?.videoUrl || 'https://www.youtube.com/watch?v=ysz5S6PUM-U'}
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onProgress={handleProgress}
                      onDuration={handleDuration}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        borderRadius: theme.shape.borderRadius * 2,
                        overflow: 'hidden',
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Typography>اختر درسًا لبدء المشاهدة</Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Video Info */}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {currentLesson?.title || 'اختر درسًا لبدء التعلم'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentLesson?.content || 'قم بتحديد درس من القائمة الجانبية لبدء التعلم'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="إضافة إلى المفضلة">
                        <IconButton 
                          onClick={() => currentLesson && toggleBookmark(currentLesson.id)}
                          color={bookmarkedLessons[currentLesson?.id] ? 'primary' : 'default'}
                        >
                          {bookmarkedLessons[currentLesson?.id] ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="مشاركة">
                        <IconButton>
                          <Share />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="المزيد">
                        <IconButton>
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {/* Lesson Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<ArrowBack />}
                      disabled={!currentLesson}
                      onClick={() => {
                        // Navigate to previous lesson
                        const currentModuleIndex = (courseData.modules || []).findIndex(m => m.id === currentLesson?.moduleId);
                        if (currentModuleIndex >= 0) {
                          const currentModule = courseData.modules[currentModuleIndex];
                          const currentLessonIndex = (currentModule.lessons || []).findIndex(l => l.id === currentLesson?.id);
                          
                                                      if (currentLessonIndex > 0) {
                              // Previous lesson in same module
                              const prevLesson = (currentModule.lessons || [])[currentLessonIndex - 1];
                              handleLessonClick(currentModule.id, prevLesson.id);
                            } else if (currentModuleIndex > 0) {
                              // Last lesson of previous module
                              const prevModule = courseData.modules[currentModuleIndex - 1];
                              if ((prevModule.lessons || []).length > 0) {
                                const prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
                                handleLessonClick(prevModule.id, prevLesson.id);
                              }
                            }
                        }
                      }}
                    >
                      السابق
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      endIcon={<CheckCircle />}
                      disabled={!currentLesson}
                      onClick={() => {
                        // Mark as completed
                        console.log(`Marking lesson ${currentLesson?.id} as completed`);
                      }}
                      sx={{
                        background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                        boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(0, 242, 254, 0.4)',
                        },
                      }}
                    >
                      تمت المشاهدة
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      endIcon={<ArrowBack sx={{ transform: 'scaleX(-1)' }} />}
                      disabled={!currentLesson}
                                              onClick={() => {
                          // Navigate to next lesson
                          const currentModuleIndex = (courseData.modules || []).findIndex(m => m.id === currentLesson?.moduleId);
                          if (currentModuleIndex >= 0) {
                            const currentModule = courseData.modules[currentModuleIndex];
                            const currentLessonIndex = (currentModule.lessons || []).findIndex(l => l.id === currentLesson?.id);
                          
                                                      if (currentLessonIndex < (currentModule.lessons || []).length - 1) {
                              // Next lesson in same module
                              const nextLesson = (currentModule.lessons || [])[currentLessonIndex + 1];
                              handleLessonClick(currentModule.id, nextLesson.id);
                            } else if (currentModuleIndex < (courseData.modules || []).length - 1) {
                              // First lesson of next module
                              const nextModule = courseData.modules[currentModuleIndex + 1];
                              if ((nextModule.lessons || []).length > 0) {
                                const nextLesson = nextModule.lessons[0];
                                handleLessonClick(nextModule.id, nextLesson.id);
                              }
                            }
                        }
                      }}
                    >
                      التالي
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Lesson Content */}
              <Card 
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    عن هذا الدرس
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentLesson?.content || 'لا يوجد وصف متوفر لهذا الدرس. يرجى اختيار درس آخر.'}
                  </Typography>
                  
                  {/* Resources */}
                  {currentLesson?.resources && currentLesson.resources.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        المرفقات والموارد
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {(currentLesson.resources || []).map((resource, index) => (
                          <Paper 
                            key={index}
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Box 
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                flexShrink: 0,
                                color: 'primary.contrastText'
                              }}
                            >
                              {resource.resource_type === 'document' ? <DescriptionOutlined /> : 
                               resource.resource_type === 'video' ? <VideoLibrary /> :
                               resource.resource_type === 'link' ? <Link /> : <NoteAlt />}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {resource.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {resource.resource_type}
                              </Typography>
                            </Box>
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <Download />
                            </IconButton>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
      <Footer />
      
      {/* Quiz Modal */}
      <Modal
        open={openQuiz}
        onClose={() => setOpenQuiz(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openQuiz}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '98vw', sm: 600 },
            maxWidth: '98vw',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 1, sm: 4 },
            outline: 'none',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <IconButton
              onClick={() => setOpenQuiz(false)}
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
            >
              <Close />
            </IconButton>
            {!showQuizResult ? (
              <QuizStart
                quizId={activeQuizId}
                onFinish={() => setShowQuizResult(true)}
                onClose={() => setOpenQuiz(false)}
              />
            ) : (
              <QuizResult
                quizId={activeQuizId}
                onClose={() => setOpenQuiz(false)}
              />
            )}
          </Box>
        </Fade>
      </Modal>
      
      {/* Final Exam Modal */}
      <Modal
        open={openFinalExam}
        onClose={() => setOpenFinalExam(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openFinalExam}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '98vw', sm: 700 },
            maxWidth: '98vw',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 1, sm: 4 },
            outline: 'none',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <IconButton
              onClick={() => setOpenFinalExam(false)}
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
            >
              <Close />
            </IconButton>
            <FinalExamModal onClose={() => setOpenFinalExam(false)} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CourseTracking;
