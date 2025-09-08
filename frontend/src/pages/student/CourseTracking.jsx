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
  Alert,
  Snackbar
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
  ArrowForward,
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
import certificateAPI from '../../services/certificate.service';

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

  // Check if URL is valid
  const isValidVideoUrl = url && (
    url.includes('.mp4') || 
    url.includes('.webm') || 
    url.includes('.ogg') || 
    url.includes('blob:') ||
    url.includes('http') && (url.includes('video') || url.includes('media'))
  );

  if (!isValidVideoUrl) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: 'white',
        flexDirection: 'column',
        gap: 2,
        padding: 2
      }}>
        <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
          لا يوجد فيديو متاح
        </Typography>
        <Typography variant="body2" sx={{ color: 'white', textAlign: 'center', opacity: 0.7 }}>
          {url ? `رابط الفيديو غير صحيح أو غير مدعوم` : 'لم يتم توفير رابط الفيديو'}
        </Typography>
        {url && (
          <Typography variant="caption" sx={{ color: 'white', textAlign: 'center', opacity: 0.5, wordBreak: 'break-all' }}>
            {url}
          </Typography>
        )}
      </div>
    );
  }

  return (
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
        ...style
      }}
      controls
      playsInline
      preload="metadata"
    />
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

const CourseContent = ({ modules, expandedModule, onModuleClick, onLessonClick, currentLessonId, setActiveQuizId, setOpenQuiz, setShowQuizResult, showFinalExamButton, onFinalExamClick, assignments, quizzes, exams }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('lessons');
  
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
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2 }}>
          <MenuBook sx={{ ml: 1 }} />
          محتوى الدورة
        </Typography>
        
        {/* Tabs for different content types */}
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.8rem',
              fontWeight: 'bold',
            },
            '& .Mui-selected': {
              color: theme.palette.primary.main,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3,
            }
          }}
        >
          <Tab 
            label={`الدروس (${modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0})`} 
            value="lessons"
            icon={<MenuBook sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab 
            label={`الواجبات (${assignments?.length || 0})`} 
            value="assignments"
            icon={<Assignment sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab 
            label={`الكويزات (${quizzes?.length || 0})`} 
            value="quizzes"
            icon={<Quiz sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab 
            label={`الامتحانات (${exams?.length || 0})`} 
            value="exams"
            icon={<EmojiEvents sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 'lessons' && (
        <List sx={{ p: 0 }}>
          {(modules || []).map((module, moduleIndex) => (
          <React.Fragment key={module.id}>
            <ListItem 
              component="div"
              onClick={() => onModuleClick(module.id)}
              sx={{
                bgcolor: expandedModule === module.id ? 'action.hover' : 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <Box 
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(14, 81, 129, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                      borderRadius: 2,
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #0e5181 0%, #e5978b 100%)',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }
                      }}
                    />
                  </Box>
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'right', direction: 'rtl' }}>
                    {module.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl', display: 'flex', alignItems: 'center', mt: 0.5, justifyContent: 'flex-end' }}>
                    {module.completedLessons} من {module.totalLessons} دروس
                  </Typography>
                }
                sx={{ ml: 1 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 80, mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={module.progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'grey.100',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
                        boxShadow: '0 1px 3px rgba(14, 81, 129, 0.3)',
                      }
                    }} 
                  />
                </Box>
                <Box 
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: expandedModule === module.id ? 'primary.main' : 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: expandedModule === module.id ? 'white' : 'grey.600',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: expandedModule === module.id ? 'primary.dark' : 'grey.300',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {expandedModule === module.id ? <ExpandLess sx={{ fontSize: 20 }} /> : <ExpandMore sx={{ fontSize: 20 }} />}
                </Box>
              </Box>
            </ListItem>
            
            <Collapse in={expandedModule === module.id} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {(module.lessons || []).map((lesson, lessonIndex) => (
                  <ListItem
                    key={lesson.id}
                    component="div"
                    selected={currentLessonId === lesson.id}
                    onClick={() => onLessonClick(module.id, lesson.id)}
                    sx={{
                      pl: 8,
                      pr: 2,
                      py: 1.5,
                      cursor: 'pointer',
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
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: currentLessonId === lesson.id ? 'bold' : 'normal',
                            color: currentLessonId === lesson.id ? 'primary.main' : 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {lesson.title}
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
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getLessonIcon(lesson.type)}
                            <span style={{ marginRight: '4px' }}>
                              {lesson.type === 'video' ? 'فيديو' : lesson.type === 'quiz' ? 'اختبار' : 'تمرين'}
                            </span>
                          </Box>
                          <span>{lesson.duration}</span>
                        </Typography>
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
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <List sx={{ p: 0 }}>
          {assignments && assignments.length > 0 ? (
            assignments.map((assignment, index) => (
              <ListItem
                key={assignment.id || index}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  direction: 'rtl',
                  textAlign: 'right',
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
                      bgcolor: 'warning.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'warning.dark',
                    }}
                  >
                    <Assignment sx={{ fontSize: 20 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'right', direction: 'rtl' }}>
                      {assignment.title || assignment.name || `الواجب ${index + 1}`}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ textAlign: 'right', direction: 'rtl' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl' }}>
                        {assignment.description || 'لا يوجد وصف متوفر'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, justifyContent: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, textAlign: 'right', direction: 'rtl' }}>
                          النقاط: {assignment.points || assignment.total_points || 'غير محدد'}
                        </Typography>
                        {assignment.due_date && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>•</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl' }}>
                              موعد التسليم: {new Date(assignment.due_date).toLocaleDateString('ar-SA')}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto'
                  }}
                  onClick={() => {
                    // Navigate to assignment or open assignment modal
                    console.log('Open assignment:', assignment.id);
                  }}
                >
                  عرض الواجب
                </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    لا توجد واجبات متاحة لهذه الدورة
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <List sx={{ p: 0 }}>
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz, index) => (
              <ListItem
                key={quiz.id || index}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  direction: 'rtl',
                  textAlign: 'right',
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
                      bgcolor: 'secondary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'secondary.dark',
                    }}
                  >
                    <Quiz sx={{ fontSize: 20 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'right', direction: 'rtl' }}>
                      {quiz.title || quiz.name || `الكويز ${index + 1}`}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ textAlign: 'right', direction: 'rtl' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl' }}>
                        {quiz.description || 'لا يوجد وصف متوفر'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, justifyContent: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, textAlign: 'right', direction: 'rtl' }}>
                          النقاط: {quiz.total_points || quiz.points || 'غير محدد'}
                        </Typography>
                        {quiz.time_limit && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>•</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl' }}>
                              المدة: {quiz.time_limit} دقيقة
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<QuizIcon sx={{ fontSize: '0.8rem' }} />}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto'
                  }}
                  onClick={() => {
                    setActiveQuizId && setActiveQuizId(quiz.id);
                    setOpenQuiz && setOpenQuiz(true);
                    setShowQuizResult && setShowQuizResult(false);
                  }}
                >
                  ابدأ الكويز
                </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    لا توجد كويزات متاحة لهذه الدورة
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <List sx={{ p: 0 }}>
          {exams && exams.length > 0 ? (
            exams.map((exam, index) => (
              <ListItem
                key={exam.id || index}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  direction: 'rtl',
                  textAlign: 'right',
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
                      bgcolor: 'error.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'error.dark',
                    }}
                  >
                    <EmojiEvents sx={{ fontSize: 20 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'right', direction: 'rtl' }}>
                      {exam.title || exam.name || `الامتحان ${index + 1}`}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ textAlign: 'right', direction: 'rtl' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl' }}>
                        {exam.description || 'لا يوجد وصف متوفر'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, justifyContent: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, textAlign: 'right', direction: 'rtl' }}>
                          النقاط: {exam.total_points || exam.points || 'غير محدد'}
                        </Typography>
                        {exam.time_limit && (
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ mx: 1 }}>•</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', direction: 'rtl' }}>
                              المدة: {exam.time_limit} دقيقة
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EmojiEvents sx={{ fontSize: '0.8rem' }} />}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    px: 1.5,
                    py: 0.5,
                    minWidth: 'auto'
                  }}
                  onClick={() => handleExamStart(exam.id)}
                >
                  ابدأ الامتحان
                </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    لا توجد امتحانات متاحة لهذه الدورة
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      )}
    </Paper>
  );
};

const CourseTracking = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedModule, setExpandedModule] = useState(null);
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
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [examStep, setExamStep] = useState('start');
  const [openFinalExam, setOpenFinalExam] = useState(false);
  const [openExam, setOpenExam] = useState(false);
  const [activeExamId, setActiveExamId] = useState(null);
  const [activeExamAttemptId, setActiveExamAttemptId] = useState(null);
  const [showExamResult, setShowExamResult] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [courseCompletionStatus, setCourseCompletionStatus] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  
  // Fetch course data on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      checkCourseCompletion();
    }
  }, [courseId]);

  // Check course completion status
  const checkCourseCompletion = async () => {
    try {
      const status = await certificateAPI.checkCourseCompletion(courseId);
      console.log('Course completion status from API:', status);
      console.log('API says - Total modules:', status.total_modules, 'Completed modules:', status.completed_modules);
      console.log('API says - is_completed:', status.is_completed, 'has_certificate:', status.has_certificate);
      setCourseCompletionStatus(status);
    } catch (error) {
      console.error('Error checking course completion:', error);
    }
  };

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
        quizzes: response.quizzes || [],
        final_exam: response.final_exam || null
      };
      
      
      setCourseData(transformedData);
      
      // Set initial expanded module to first module
      if (transformedData.modules && transformedData.modules.length > 0) {
        setExpandedModule(transformedData.modules[0].id);
      }
      
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
    totalQuizzes: (courseData.quizzes || []).length,
    remainingLessons: (courseData.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0) - (courseData.modules || []).reduce((sum, module) => sum + (module.completedLessons || 0), 0)
  } : { totalLessons: 0, completedLessons: 0, completionPercentage: 0, totalDuration: 0, totalAssignments: 0, totalExams: 0, totalQuizzes: 0, remainingLessons: 0 };


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

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setVideoProgress(0);
  };

  // Mark lesson as completed
  const markLessonAsCompleted = async () => {
    if (!currentLesson || !courseId) return;
    
    try {
      await courseAPI.markLessonCompleted(courseId, currentLesson.id);
      
      // Update local state
      setCourseData(prevData => {
        const updatedModules = prevData.modules.map(module => {
          if (module.id === currentLesson.moduleId) {
            const updatedLessons = module.lessons.map(lesson => {
              if (lesson.id === currentLesson.id) {
                return { ...lesson, completed: true };
              }
              return lesson;
            });
            return {
              ...module,
              lessons: updatedLessons,
              completedLessons: updatedLessons.filter(l => l.completed).length
            };
          }
          return module;
        });
        
        return {
          ...prevData,
          modules: updatedModules
        };
      });
      
      showSnackbar('تم إكمال الدرس بنجاح!', 'success');
      
      // Check course completion status after lesson completion
      await checkCourseCompletion();
      
      // Auto-advance to next lesson if available
      setTimeout(() => {
        navigateToNextLesson();
      }, 2000);
      
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      showSnackbar('حدث خطأ أثناء إكمال الدرس', 'error');
    }
  };

  // Navigate to next lesson
  const navigateToNextLesson = () => {
    if (!currentLesson || !courseData) return;
    
    const currentModuleIndex = courseData.modules.findIndex(m => m.id === currentLesson.moduleId);
    if (currentModuleIndex >= 0) {
      const currentModule = courseData.modules[currentModuleIndex];
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
      
      if (currentLessonIndex < currentModule.lessons.length - 1) {
        // Next lesson in same module
        const nextLesson = currentModule.lessons[currentLessonIndex + 1];
        handleLessonClick(currentModule.id, nextLesson.id);
      } else if (currentModuleIndex < courseData.modules.length - 1) {
        // First lesson of next module
        const nextModule = courseData.modules[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) {
          const nextLesson = nextModule.lessons[0];
          handleLessonClick(nextModule.id, nextLesson.id);
        }
      }
    }
  };

  // Navigate to previous lesson
  const navigateToPreviousLesson = () => {
    if (!currentLesson || !courseData) return;
    
    const currentModuleIndex = courseData.modules.findIndex(m => m.id === currentLesson.moduleId);
    if (currentModuleIndex >= 0) {
      const currentModule = courseData.modules[currentModuleIndex];
      const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
      
      if (currentLessonIndex > 0) {
        // Previous lesson in same module
        const prevLesson = currentModule.lessons[currentLessonIndex - 1];
        handleLessonClick(currentModule.id, prevLesson.id);
      } else if (currentModuleIndex > 0) {
        // Last lesson of previous module
        const prevModule = courseData.modules[currentModuleIndex - 1];
        if (prevModule.lessons.length > 0) {
          const prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
          handleLessonClick(prevModule.id, prevLesson.id);
        }
      }
    }
  };

  // Download resource
  const downloadResource = async (resource) => {
    try {
      if (resource.file_url) {
        // Direct download for file resources
        const link = document.createElement('a');
        link.href = resource.file_url;
        link.download = resource.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSnackbar('تم بدء تحميل الملف', 'success');
      } else if (resource.url) {
        // Open external link
        window.open(resource.url, '_blank');
        showSnackbar('تم فتح الرابط في نافذة جديدة', 'info');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      showSnackbar('حدث خطأ أثناء تحميل الملف', 'error');
    }
  };

  // Track video progress
  const trackVideoProgress = async (progress) => {
    if (!currentLesson || !courseId) return;
    
    try {
      await courseAPI.trackLessonProgress(courseId, currentLesson.id, {
        content_type: 'video',
        progress_percentage: progress.played * 100,
        current_time: progress.playedSeconds,
        duration: videoDuration
      });
    } catch (error) {
      console.error('Error tracking video progress:', error);
    }
  };

  // Handle video progress with throttling
  const handleProgressWithTracking = (state) => {
    setVideoProgress(state.playedSeconds);
    
    // Track progress every 10 seconds or when video ends
    if (state.playedSeconds % 10 < 1 || state.played >= 0.95) {
      trackVideoProgress(state);
    }
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleSidebarExpand = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Snackbar handlers
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Generate certificate
  const handleGenerateCertificate = async () => {
    try {
      setIsGeneratingCertificate(true);
      console.log('Attempting to generate certificate for course:', courseId);
      console.log('Current course completion status:', courseCompletionStatus);
      console.log('Current course stats:', courseStats);
      
      const result = await certificateAPI.generateCertificate(courseId);
      
      if (result.certificate) {
        showSnackbar('تم إنشاء الشهادة بنجاح!', 'success');
        // Update completion status
        await checkCourseCompletion();
        // Navigate to certificates page or show certificate
        setTimeout(() => {
          navigate('/student/certificates');
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      const errorMessage = error.response?.data?.error || 'حدث خطأ أثناء إنشاء الشهادة';
      console.log('Error details:', error.response?.data);
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  // Exam handlers
  const handleExamStart = (examId) => {
    setActiveExamId(examId);
    setOpenExam(true);
    setShowExamResult(false);
    setExamStep('start');
  };

  const handleExamFinish = (attemptId) => {
    setActiveExamAttemptId(attemptId);
    setShowExamResult(true);
    setExamStep('result');
  };

  const handleExamClose = () => {
    setOpenExam(false);
    setActiveExamId(null);
    setActiveExamAttemptId(null);
    setShowExamResult(false);
    setExamStep('start');
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
        
        {(() => {
          const shouldShowCertificateButton = (courseCompletionStatus?.is_completed || courseStats.completionPercentage === 100);
          console.log('Should show certificate button:', shouldShowCertificateButton);
          console.log('courseCompletionStatus?.is_completed:', courseCompletionStatus?.is_completed);
          console.log('courseStats.completionPercentage:', courseStats.completionPercentage);
          return shouldShowCertificateButton;
        })() ? (
          courseCompletionStatus?.has_certificate ? (
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              startIcon={<EmojiEvents />}
              onClick={() => navigate(`/student/certificates?courseId=${courseId}&autoOpen=true`)}
              sx={{ 
                mt: 2,
                borderRadius: 2, 
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5,
                background: 'linear-gradient(45deg, #4caf50 0%, #8bc34a 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                },
              }}
            >
              عرض الشهادة
            </Button>
          ) : (
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              startIcon={isGeneratingCertificate ? <CircularProgress size={20} color="inherit" /> : <EmojiEvents />}
              onClick={handleGenerateCertificate}
              disabled={isGeneratingCertificate}
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
              {isGeneratingCertificate ? 'جاري إنشاء الشهادة...' : 'احصل على الشهادة'}
            </Button>
          )
        ) : (
          <Button 
            variant="outlined" 
            fullWidth 
            size="large"
            startIcon={<EmojiEvents />}
            disabled
            sx={{ 
              mt: 2,
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
              opacity: 0.6,
            }}
          >
            أكمل الدورة للحصول على الشهادة
          </Button>
        )}
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
                    assignments={courseData.assignments}
                    quizzes={courseData.quizzes}
                    exams={courseData.exams}
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
                      url={currentLesson?.videoUrl}
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onProgress={handleProgressWithTracking}
                      onDuration={handleDuration}
                      onEnded={handleVideoEnd}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                    <IconButton 
                      variant="outlined" 
                      disabled={!currentLesson}
                      onClick={navigateToPreviousLesson}
                      sx={{
                        width: 48,
                        height: 48,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          transform: 'scale(1.1)',
                        },
                        '&:disabled': {
                          borderColor: 'grey.300',
                          color: 'grey.300',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowForward />
                    </IconButton>
                    
                    <Button 
                      variant="contained" 
                      endIcon={<CheckCircle />}
                      disabled={!currentLesson}
                      onClick={markLessonAsCompleted}
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
                    
                    <IconButton 
                      variant="outlined" 
                      disabled={!currentLesson}
                      onClick={navigateToNextLesson}
                      sx={{
                        width: 48,
                        height: 48,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          transform: 'scale(1.1)',
                        },
                        '&:disabled': {
                          borderColor: 'grey.300',
                          color: 'grey.300',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
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
                            <IconButton size="small" sx={{ ml: 1 }} onClick={() => downloadResource(resource)}>
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
        onClose={() => {
          setOpenQuiz(false);
          setShowQuizResult(false);
          setActiveAttemptId(null);
        }}
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
              onClick={() => {
                setOpenQuiz(false);
                setShowQuizResult(false);
                setActiveAttemptId(null);
              }}
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
            >
              <Close />
            </IconButton>
            {!showQuizResult ? (
              <QuizStart
                quizId={activeQuizId}
                onFinish={(attemptId) => {
                  console.log('Quiz finished with attempt ID:', attemptId);
                  setActiveAttemptId(attemptId);
                  setShowQuizResult(true);
                }}
                onClose={() => {
                  setOpenQuiz(false);
                  setShowQuizResult(false);
                  setActiveAttemptId(null);
                }}
              />
            ) : (
              <QuizResult
                quizId={activeQuizId}
                attemptId={activeAttemptId}
                onClose={() => {
                  setOpenQuiz(false);
                  setShowQuizResult(false);
                  setActiveAttemptId(null);
                }}
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
            <FinalExamModal 
              onClose={() => setOpenFinalExam(false)} 
              finalExamData={courseData?.final_exam}
              courseId={courseId}
            />
          </Box>
        </Fade>
      </Modal>

      {/* Exam Modal */}
      <Modal
        open={openExam}
        onClose={handleExamClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openExam}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '98vw', sm: 800 },
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
              onClick={handleExamClose}
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
            >
              <Close />
            </IconButton>
            {examStep === 'start' && (
              <ExamStart
                examId={activeExamId}
                onStart={(attemptId) => {
                  setActiveExamAttemptId(attemptId);
                  setExamStep('taking');
                }}
                onClose={handleExamClose}
              />
            )}
            {examStep === 'taking' && (
              <ExamTaking
                examId={activeExamId}
                attemptId={activeExamAttemptId}
                onFinish={handleExamFinish}
                onClose={handleExamClose}
              />
            )}
            {examStep === 'result' && (
              <ExamResult
                examId={activeExamId}
                attemptId={activeExamAttemptId}
                onClose={handleExamClose}
              />
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseTracking;
