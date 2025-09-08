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
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Checkbox
} from '@mui/material';
import { 
  School as SchoolIcon, 
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  SentimentSatisfiedAlt,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VideoLibrary as VideoIcon,
  PictureAsPdf as PdfIcon,
  GridView as BitesIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/system';
import { courseAPI } from '../../services/api.service';
import { contentAPI } from '../../services/content.service';
import { assignmentsAPI } from '../../services/assignment.service';
import { quizAPI } from '../../services/quiz.service';
import { examAPI } from '../../services/exam.service';

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



const EmptyState = ({ isCompleted = false }) => (
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
        {isCompleted ? 'لا توجد كورسات مكتملة بعد' : 'لا توجد كورسات مسجلة بعد'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {isCompleted 
          ? 'أكمل الكورسات المسجلة لتحصل على شهادات الإنجاز' 
          : 'يمكنك تصفح الكورسات المتاحة والتسجيل فيها لتبدأ رحلة التعلم'
        }
      </Typography>
      {!isCompleted && (
        <Button 
          variant="contained" 
          size="large" 
          sx={{ 
            bgcolor: '#0e5181', 
            borderRadius: 3, 
            px: 5, 
            py: 1.5, 
            fontWeight: 700, 
            '&:hover': { bgcolor: '#0a3d5f' } 
          }}
          onClick={() => window.location.href = '/courses'}
        >
          تصفح الكورسات
        </Button>
      )}
    </Box>
  </Fade>
);

const CourseCard = ({ course, onClick }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [courseContent, setCourseContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [calculatedData, setCalculatedData] = useState({
    totalLessons: 0,
    completedLessons: 0,
    duration: "0د"
  });
  
  // Ensure progress is a valid number between 0 and 100
  const progress = Math.min(Math.max(course.progress || 0, 0), 100);
  
  // Calculate completed lessons and total runtime from course data
  const totalLessons = calculatedData.totalLessons || course.totalLessons || course.total_lessons || course.lessons_count || 0;
  const completedLessons = calculatedData.completedLessons || course.completedLessons || Math.floor((progress / 100) * totalLessons);
  const totalRuntime = calculatedData.duration || course.duration || course.total_duration || "0د";
  
  // Ensure progress is properly calculated from enrollment data
  const actualProgress = course.progress !== undefined ? course.progress : progress;
  
  // Debug logging
  console.log('Course data:', {
    id: course.id,
    title: course.title,
    progress: course.progress,
    totalLessons: course.totalLessons,
    completedLessons: course.completedLessons,
    duration: course.duration,
    total_duration: course.total_duration
  });
  
  const handleExpandClick = async () => {
    if (!expanded && courseContent.length === 0) {
      setLoadingContent(true);
      try {
        const allContent = [];
        let totalLessonsCount = 0;
        let completedLessonsCount = 0;
        let totalDurationSeconds = 0;
        
        // Fetch course modules and lessons
        const modulesResponse = await contentAPI.getModules(course.id);
        console.log('Modules fetched:', modulesResponse);
        
        // Extract modules from paginated response
        const modules = modulesResponse.results || modulesResponse || [];
        console.log('Modules array:', modules);
        
        if (!Array.isArray(modules)) {
          console.error('Modules is not an array:', modules);
          throw new Error('Invalid modules data format');
        }
        
        for (const module of modules) {
          // Get lessons for this module
          const lessonsResponse = await contentAPI.getLessons({ moduleId: module.id });
          console.log(`Lessons for module ${module.id}:`, lessonsResponse);
          
          // Extract lessons from paginated response
          const lessons = lessonsResponse.results || lessonsResponse || [];
          console.log(`Lessons array for module ${module.id}:`, lessons);
          
          if (!Array.isArray(lessons)) {
            console.error(`Lessons for module ${module.id} is not an array:`, lessons);
            continue; // Skip this module if lessons data is invalid
          }
          
          const mappedLessons = lessons.map(lesson => {
            totalLessonsCount++;
            if (lesson.is_completed) completedLessonsCount++;
            
            // Calculate duration in seconds
            if (lesson.duration) {
              const durationParts = lesson.duration.split(':');
              if (durationParts.length === 3) {
                const hours = parseInt(durationParts[0]) || 0;
                const minutes = parseInt(durationParts[1]) || 0;
                const seconds = parseInt(durationParts[2]) || 0;
                totalDurationSeconds += hours * 3600 + minutes * 60 + seconds;
              }
            }
            
            return {
              id: `lesson-${lesson.id}`,
              title: lesson.title,
              type: lesson.content_type || 'video',
              duration: lesson.duration || null,
              completed: lesson.is_completed || false,
              progress: lesson.progress_percentage || 0,
              module_title: module.title,
              module_id: module.id,
              content_id: lesson.id,
              content_type: 'lesson'
            };
          });
          allContent.push(...mappedLessons);
        }
        
        // Fetch assignments for this course
        try {
          const assignmentsResponse = await assignmentsAPI.getAssignments({ course: course.id });
          console.log('Assignments fetched:', assignmentsResponse);
          
          // Extract assignments from paginated response
          const assignments = assignmentsResponse.results || assignmentsResponse || [];
          console.log('Assignments array:', assignments);
          
          if (!Array.isArray(assignments)) {
            console.error('Assignments is not an array:', assignments);
            throw new Error('Invalid assignments data format');
          }
          
          const mappedAssignments = assignments.map(assignment => ({
            id: `assignment-${assignment.id}`,
            title: assignment.title,
            type: 'assignment',
            duration: assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('ar-EG') : null,
            completed: assignment.is_submitted || false,
            progress: assignment.grade ? Math.round((assignment.grade / assignment.max_grade) * 100) : 0,
            module_title: assignment.module?.title || 'Assignment',
            module_id: assignment.module?.id,
            content_id: assignment.id,
            content_type: 'assignment',
            due_date: assignment.due_date,
            grade: assignment.grade,
            max_grade: assignment.max_grade
          }));
          allContent.push(...mappedAssignments);
        } catch (error) {
          console.log('No assignments found for course:', course.id);
        }
        
        // Fetch quizzes for this course
        try {
          const quizzesResponse = await quizAPI.getQuizzes({ course: course.id });
          console.log('Quizzes fetched:', quizzesResponse);
          
          // Extract quizzes from paginated response
          const quizzes = quizzesResponse.results || quizzesResponse || [];
          console.log('Quizzes array:', quizzes);
          
          if (!Array.isArray(quizzes)) {
            console.error('Quizzes is not an array:', quizzes);
            throw new Error('Invalid quizzes data format');
          }
          
          const mappedQuizzes = quizzes.map(quiz => ({
            id: `quiz-${quiz.id}`,
            title: quiz.title,
            type: 'quiz',
            duration: quiz.time_limit ? `${quiz.time_limit} min` : null,
            completed: quiz.is_completed || false,
            progress: quiz.score ? Math.round((quiz.score / quiz.max_score) * 100) : 0,
            module_title: quiz.module?.title || 'Quiz',
            module_id: quiz.module?.id,
            content_id: quiz.id,
            content_type: 'quiz',
            score: quiz.score,
            max_score: quiz.max_score,
            attempts: quiz.attempts || 0
          }));
          allContent.push(...mappedQuizzes);
        } catch (error) {
          console.log('No quizzes found for course:', course.id);
        }
        
        // Fetch exams for this course
        try {
          const examsResponse = await examAPI.getExams({ course: course.id });
          console.log('Exams fetched:', examsResponse);
          
          // Extract exams from paginated response
          const exams = examsResponse.results || examsResponse || [];
          console.log('Exams array:', exams);
          
          if (!Array.isArray(exams)) {
            console.error('Exams is not an array:', exams);
            throw new Error('Invalid exams data format');
          }
          
          const mappedExams = exams.map(exam => ({
            id: `exam-${exam.id}`,
            title: exam.title,
            type: 'exam',
            duration: exam.duration ? `${exam.duration} min` : null,
            completed: exam.is_completed || false,
            progress: exam.score ? Math.round((exam.score / exam.max_score) * 100) : 0,
            module_title: exam.module?.title || 'Exam',
            module_id: exam.module?.id,
            content_id: exam.id,
            content_type: 'exam',
            score: exam.score,
            max_score: exam.max_score,
            attempts: exam.attempts || 0
          }));
          allContent.push(...mappedExams);
        } catch (error) {
          console.log('No exams found for course:', course.id);
        }
        
        // Add course resources if available
        if (course.resources && course.resources.length > 0) {
          course.resources.forEach(resource => {
            allContent.unshift({
              id: `resource-${resource.id}`,
              title: resource.title || 'Resources',
              type: 'resource',
              duration: null,
              completed: false,
              progress: 0,
              module_title: 'Resources',
              content_id: resource.id,
              content_type: 'resource',
              resource_url: resource.file_url
            });
          });
        }
        
        // Sort content by module order and then by type
        allContent.sort((a, b) => {
          // First sort by module_id if available
          if (a.module_id && b.module_id && a.module_id !== b.module_id) {
            return a.module_id - b.module_id;
          }
          // Then sort by content type priority
          const typeOrder = { 'resource': 0, 'lesson': 1, 'assignment': 2, 'quiz': 3, 'exam': 4 };
          return (typeOrder[a.content_type] || 5) - (typeOrder[b.content_type] || 5);
        });
        
        // Update course data with calculated values
        const calculatedProgress = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
        const calculatedDuration = totalDurationSeconds > 0 ? 
          `${Math.floor(totalDurationSeconds / 3600)}س ${Math.floor((totalDurationSeconds % 3600) / 60)}د` : 
          "0د";
        
        console.log('Calculated data:', {
          totalLessonsCount,
          completedLessonsCount,
          calculatedProgress,
          calculatedDuration
        });
        
        // Update calculated data
        setCalculatedData({
          totalLessons: totalLessonsCount,
          completedLessons: completedLessonsCount,
          duration: calculatedDuration
        });
        
        setCourseContent(allContent);
      } catch (error) {
        console.error('Error fetching course content:', error);
        // Show error message instead of fallback data
        setCourseContent([]);
        
        // Show user-friendly error message
        if (error.message.includes('Invalid')) {
          console.error('Data format error:', error.message);
        } else if (error.response?.status === 404) {
          console.error('Course content not found');
        } else if (error.response?.status === 403) {
          console.error('Access denied to course content');
        } else {
          console.error('Unexpected error:', error.message);
        }
        
        console.warn('Failed to load course content. Please try again later.');
      } finally {
        setLoadingContent(false);
      }
    }
    setExpanded(!expanded);
  };

  const getContentTypeIcon = (type, contentType) => {
    switch (contentType) {
      case 'lesson':
        switch (type?.toLowerCase()) {
          case 'video': 
          case 'video_lesson': return <VideoIcon sx={{ fontSize: 16, color: '#666' }} />;
          case 'text': 
          case 'article': return <SchoolIcon sx={{ fontSize: 16, color: '#666' }} />;
          default: return <PlayArrowIcon sx={{ fontSize: 16, color: '#666' }} />;
        }
      case 'assignment': return <EditIcon sx={{ fontSize: 16, color: '#666' }} />;
      case 'quiz': return <BitesIcon sx={{ fontSize: 16, color: '#666' }} />;
      case 'exam': return <CheckCircleIcon sx={{ fontSize: 16, color: '#666' }} />;
      case 'resource': return <PdfIcon sx={{ fontSize: 16, color: '#666' }} />;
      default: return <PlayArrowIcon sx={{ fontSize: 16, color: '#666' }} />;
    }
  };

  const getContentTypeColor = (contentType) => {
    switch (contentType) {
      case 'lesson': return '#4caf50'; // Green for lessons
      case 'assignment': return '#ff9800'; // Orange for assignments
      case 'quiz': return '#9c27b0'; // Purple for quizzes
      case 'exam': return '#f44336'; // Red for exams
      case 'resource': return '#666'; // Grey for resources
      default: return '#666';
    }
  };

  const getContentTypeLabel = (contentType) => {
    switch (contentType) {
      case 'lesson': return 'درس';
      case 'assignment': return 'واجب';
      case 'quiz': return 'كويز';
      case 'exam': return 'امتحان';
      case 'resource': return 'مورد';
      default: return 'محتوى';
    }
  };

  const getContentActionIcon = (item) => {
    switch (item.content_type) {
      case 'resource': return <DownloadIcon sx={{ fontSize: 16 }} />;
      case 'lesson': return <PlayArrowIcon sx={{ fontSize: 16 }} />;
      case 'assignment': return <EditIcon sx={{ fontSize: 16 }} />;
      case 'quiz': return <BitesIcon sx={{ fontSize: 16 }} />;
      case 'exam': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      default: return <PlayArrowIcon sx={{ fontSize: 16 }} />;
    }
  };

  const handleContentClick = (item) => {
    switch (item.content_type) {
      case 'resource':
        if (item.resource_url) {
          window.open(item.resource_url, '_blank');
        }
        break;
      case 'lesson':
        // Navigate to lesson page
        navigate(`/student/courses/${course.id}/lessons/${item.content_id}`);
        break;
      case 'assignment':
        // Navigate to assignment page
        navigate(`/student/courses/${course.id}/assignments/${item.content_id}`);
        break;
      case 'quiz':
        // Navigate to quiz page
        navigate(`/student/courses/${course.id}/quizzes/${item.content_id}`);
        break;
      case 'exam':
        // Navigate to exam page
        navigate(`/student/courses/${course.id}/exams/${item.content_id}`);
        break;
      default:
        // Default to course page
        onClick(course.id);
    }
  };
  
  return (
  <Card
    sx={{
        borderRadius: '16px',
      mb: 3,
      overflow: 'hidden',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease-in-out',
      '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      {/* Course Content with Image on Side */}
      <Box sx={{ 
        display: 'flex', 
        minHeight: 200,
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        
        {/* Course Content */}
        <Box sx={{ 
          flex: 1, 
          p: 3, 
          pb: 2, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: '#333'
              }}>
                {course.title}
              </Typography>
              {course.status && (
                <Chip 
                  label={course.status === 'completed' ? 'مكتمل' : 'نشط'} 
                  size="small"
                  sx={{
                    bgcolor: course.status === 'completed' ? '#4caf50' : '#2196f3',
                    color: 'white',
                    fontSize: '10px',
                    height: 20
                  }}
                />
              )}
            </Box>
            
            {course.description && (
              <Typography variant="body2" sx={{ 
                color: '#666', 
                fontSize: '14px',
                mb: 1,
                lineHeight: 1.4
              }}>
                {course.description}
              </Typography>
            )}
            
            {/* Course Meta Info */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
              {course.instructor && (
                <Typography variant="caption" sx={{ 
                  color: '#999', 
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <SchoolIcon sx={{ fontSize: 14 }} />
                  {course.instructor}
                </Typography>
              )}
              {course.category && (
                <Typography variant="caption" sx={{ 
                  color: '#999', 
                  fontSize: '12px'
                }}>
                  {course.category}
                </Typography>
              )}
              {course.enrollment_date && (
                <Typography variant="caption" sx={{ 
                  color: '#999', 
                  fontSize: '12px'
                }}>
                  مسجل منذ: {new Date(course.enrollment_date).toLocaleDateString('ar-EG')}
                </Typography>
              )}
            </Box>
            
            {/* Progress Bar */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '12px', fontWeight: 500 }}>
                  التقدم
                </Typography>
                <Typography variant="caption" sx={{ color: '#0e5181', fontSize: '12px', fontWeight: 600 }}>
                  {Math.round(actualProgress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={actualProgress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    background: actualProgress >= 100 
                      ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                      : 'linear-gradient(90deg, #0e5181, #1a6ba8)',
                    borderRadius: 3
                  }
                }} 
              />
            </Box>
            
            <Typography variant="body2" sx={{ 
              color: '#666', 
              fontSize: '14px',
              mb: 2
            }}>
              {totalLessons > 0 ? `${completedLessons} من ${totalLessons} درس مكتمل` : 'لا توجد دروس متاحة'} • {totalRuntime} مدة الكورس
              {course.grade && (
                <span style={{ marginLeft: '8px', color: '#4caf50', fontWeight: 'bold' }}>
                  • الدرجة: {course.grade}
                </span>
              )}
              <span style={{ marginLeft: '8px', color: '#0e5181', fontWeight: 'bold' }}>
                • التقدم: {Math.round(actualProgress)}%
              </span>
            </Typography>
            
            
            {/* Show content summary */}
            {expanded && courseContent.length > 0 && (
              <Typography variant="caption" sx={{ 
                color: '#4caf50', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {courseContent.length} عنصر محتوى متاح
              </Typography>
            )}
            
            {/* Show content breakdown */}
            {expanded && courseContent.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {(() => {
                  const contentTypes = courseContent.reduce((acc, item) => {
                    acc[item.content_type] = (acc[item.content_type] || 0) + 1;
                    return acc;
                  }, {});
                  
                  return Object.entries(contentTypes).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${count} ${getContentTypeLabel(type)}`}
                      size="small"
                      sx={{
                        bgcolor: getContentTypeColor(type),
                        color: 'white',
                        fontSize: '10px',
                        height: 20
                      }}
                    />
                  ));
                })()}
              </Box>
            )}
            
            
            {/* Show last updated time */}
            {expanded && courseContent.length > 0 && (
              <Typography variant="caption" sx={{ 
                color: '#999', 
                fontSize: '10px',
                fontStyle: 'italic'
              }}>
                آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
              </Typography>
            )}
            
            {/* Show error message if content failed to load */}
            {expanded && courseContent.length === 0 && !loadingContent && (
              <Typography variant="caption" sx={{ 
                color: '#f44336', 
                fontSize: '11px',
                fontStyle: 'italic'
              }}>
                فشل في تحميل محتوى الكورس. يرجى المحاولة مرة أخرى.
              </Typography>
            )}
            
            {/* Show retry button if content failed to load */}
            {expanded && courseContent.length === 0 && !loadingContent && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleExpandClick}
                sx={{
                  mt: 1,
                  fontSize: '10px',
                  py: 0.5,
                  px: 2,
                  minWidth: 'auto'
                }}
              >
                إعادة المحاولة
              </Button>
            )}
            
            {/* Show loading indicator */}
            {loadingContent && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CircularProgress size={16} sx={{ color: '#7c4dff' }} />
                <Typography variant="caption" sx={{ 
                  color: '#666', 
                  fontSize: '11px'
                }}>
                  جاري تحميل المحتوى...
                </Typography>
              </Box>
            )}
            
            
            {/* Show content types preview */}
            {!expanded && courseContent.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                {(() => {
                  const contentTypes = courseContent.reduce((acc, item) => {
                    acc[item.content_type] = (acc[item.content_type] || 0) + 1;
                    return acc;
                  }, {});
                  
                  return Object.entries(contentTypes).slice(0, 3).map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${count} ${getContentTypeLabel(type)}`}
                      size="small"
                      sx={{
                        bgcolor: getContentTypeColor(type),
                        color: 'white',
                        fontSize: '9px',
                        height: 18
                      }}
                    />
                  ));
                })()}
                {Object.keys(courseContent.reduce((acc, item) => {
                  acc[item.content_type] = (acc[item.content_type] || 0) + 1;
                  return acc;
                }, {})).length > 3 && (
                  <Typography variant="caption" sx={{ 
                    color: '#999', 
                    fontSize: '9px',
                    alignSelf: 'center'
                  }}>
                    +{Object.keys(courseContent.reduce((acc, item) => {
                      acc[item.content_type] = (acc[item.content_type] || 0) + 1;
                      return acc;
                    }, {})).length - 3} أكثر
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Show progress preview */}
            {!expanded && courseContent.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" sx={{ 
                  color: '#0e5181', 
                  fontSize: '10px',
                  fontWeight: 500
                }}>
                  التقدم: {Math.round((courseContent.filter(item => item.completed).length / courseContent.length) * 100)}% مكتمل
                </Typography>
              </Box>
            )}
            
            
            
            {/* Show loading preview */}
            {!expanded && loadingContent && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <CircularProgress size={12} sx={{ color: '#7c4dff' }} />
                <Typography variant="caption" sx={{ 
                  color: '#666', 
                  fontSize: '10px'
                }}>
                  جاري التحميل...
                </Typography>
              </Box>
            )}
            
            
            
      </Box>
          
        <Button 
          variant="contained" 
          sx={{
              bgcolor: course.status === 'completed' ? '#4caf50' : '#2196f3',
              color: 'white',
              borderRadius: '8px',
              px: 3,
              py: 1,
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 100,
              alignSelf: 'flex-start',
              mt: 2,
            '&:hover': { 
                bgcolor: course.status === 'completed' ? '#45a049' : '#1976d2'
            }
          }}
            onClick={(e) => {
            e.stopPropagation();
            onClick(course.id);
          }}
        >
            {course.status === 'completed' ? 'مراجعة' : actualProgress > 0 ? 'متابعة' : 'ابدأ'}
        </Button>
        </Box>
        
        {/* Expand/Collapse Button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 2,
          borderTop: '1px solid #f0f0f0',
          pt: 2,
          bgcolor: '#fafafa'
        }}>
          <IconButton
            onClick={handleExpandClick}
            sx={{
              color: '#666',
              border: 'none',
              outline: 'none',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)'
              },
              '&:focus': {
                outline: 'none',
                border: 'none'
              }
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Course Content Dropdown */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ 
          borderTop: '1px solid #f0f0f0',
          bgcolor: '#fafafa'
        }}>
          {loadingContent ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: '#7c4dff' }} />
              <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                جاري تحميل محتوى الكورس...
              </Typography>
            </Box>
          ) : courseContent.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
              <SchoolIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                لا يوجد محتوى متاح لهذا الكورس حالياً
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                سيتم إضافة المحتوى قريباً
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {courseContent.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 3,
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.02)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        checked={item.completed}
                        sx={{
                          p: 0.5,
                          '&.Mui-checked': {
                            color: '#4caf50'
                          }
                        }}
                      />
                    </ListItemIcon>
                    
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {getContentTypeIcon(item.type, item.content_type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getContentTypeLabel(item.content_type)}
                            size="small"
                            sx={{
                              bgcolor: getContentTypeColor(item.content_type),
                              color: 'white',
                              fontSize: '11px',
                              height: 20,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '14px', color: '#333' }}>
                            {item.title}
                          </Typography>
                          {item.module_title && (
                            <Typography variant="caption" sx={{ 
                              fontSize: '11px', 
                              color: '#999',
                              ml: 1,
                              fontStyle: 'italic'
                            }}>
                              ({item.module_title})
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Show progress for assignments, quizzes, and exams */}
                      {(item.content_type === 'assignment' || item.content_type === 'quiz' || item.content_type === 'exam') && item.progress !== undefined ? (
                        <>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                            {item.content_type === 'assignment' && item.grade ? 
                              `${item.grade}/${item.max_grade}` : 
                              item.duration || `${Math.round(item.progress)}%`
                            }
                          </Typography>
                          <Box sx={{ width: 40, height: 4, bgcolor: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ 
                              width: `${item.progress}%`, 
                              height: '100%', 
                              bgcolor: getContentTypeColor(item.content_type),
                              borderRadius: 2
                            }} />
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '12px' }}>
                          {item.content_type === 'resource' 
                            ? 'تحميل الملف' 
                            : item.duration || '--:--'
                          }
                        </Typography>
                      )}
                      <IconButton 
                        size="small" 
                        sx={{ color: '#999' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContentClick(item);
                        }}
                      >
                        {getContentActionIcon(item)}
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < courseContent.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
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
      borderRadius: '16px',
      minHeight: 200,
      boxShadow: '0 8px 32px 0 rgba(229, 151, 139, 0.15)',
      mb: 3,
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #fdf2f2 0%, #fff 100%)',
      transition: 'transform 0.25s, box-shadow 0.25s',
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
    {/* Course Content with Image on Side */}
    <Box sx={{ 
      display: 'flex', 
      width: '100%',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      
      {/* Course Content */}
      <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '12px', fontWeight: 500 }}>
                التقدم
              </Typography>
              <Typography variant="caption" sx={{ color: '#e5978b', fontSize: '12px', fontWeight: 600 }}>
                {Math.round(progress)}%
              </Typography>
            </Box>
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
      </Box>
    </Box>
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
      
      // Process and validate course data
      const processedEnrolledCourses = (response.enrolled_courses || []).map(course => ({
        ...course,
        progress: Math.min(Math.max(course.progress || 0, 0), 100),
        totalLessons: course.totalLessons || course.total_lessons || 0,
        completedLessons: course.completedLessons || Math.floor(((course.progress || 0) / 100) * (course.totalLessons || course.total_lessons || 0)),
        duration: course.duration || course.total_duration || "0د"
      }));
      
      const processedCompletedCourses = (response.completed_courses || []).map(course => ({
        ...course,
        progress: 100, // Completed courses should always show 100%
        totalLessons: course.totalLessons || course.total_lessons || 0,
        completedLessons: course.totalLessons || course.total_lessons || 0,
        duration: course.duration || course.total_duration || "0د"
      }));
      
      setEnrolledCourses(processedEnrolledCourses);
      setCompletedCourses(processedCompletedCourses);
      
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
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
        <Typography variant="h6" sx={{ color: '#7c4dff', fontWeight: 600 }}>
          جاري تحميل الكورسات...
        </Typography>
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
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              onClick={fetchMyCourses}
              sx={{ 
                bgcolor: '#7c4dff',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': { bgcolor: '#6a3dcc' }
              }}
            >
              إعادة المحاولة
            </Button>
          </Box>
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
        <Box>
          {tab === 0
            ? (enrolledCourses.length > 0
                ? enrolledCourses.map(course => (
                    <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
                  ))
                : <EmptyState isCompleted={false} />)
            : (completedCourses.length > 0
                ? completedCourses.map(course => (
                    <CompletedCourseCard key={course.id} course={course} />
                  ))
                : <EmptyState isCompleted={true} />)
          }
        </Box>
    </Container>
    </Box>
  );
};

export default MyCourses;
