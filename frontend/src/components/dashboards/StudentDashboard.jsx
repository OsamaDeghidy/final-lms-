import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, useTheme, Chip, Skeleton, Card, CardContent, IconButton, Tabs, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DashboardCard, StatCard, DashboardSection, ProgressCard, ActivityItem, pulse } from './DashboardLayout';
import { 
  School as SchoolIcon, 
  Assignment as AssignmentIcon, 
  Event as EventIcon, 
  Grade as GradeIcon, 
  MenuBook as MenuBookIcon, 
  Quiz as QuizIcon, 
  EmojiEvents as BadgeIcon, 
  Star as StarIcon,
  TrendingUp as TrendingUpIcon, 
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  VideoLibrary as VideoLibraryIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboard.service';
import { 
  EnhancedStatCard, 
  EnhancedCourseCard, 
  EnhancedAchievementCard, 
  EnhancedActivityItem 
} from './DashboardComponents';
import './index.css';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const StudentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    totalPoints: 0,
    learningStreak: 0,
    certificates: 0
  });
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [upcomingLectures, setUpcomingLectures] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // تحميل البيانات بالتوازي
      const [
        statsData,
        coursesData,
        achievementsData,
        activityData,
        assignmentsData,
        meetingsData
      ] = await Promise.all([
        dashboardService.getStudentStats(),
        dashboardService.getStudentCourses(),
        dashboardService.getAchievements(),
        dashboardService.getRecentActivity(),
        dashboardService.getUpcomingAssignments(),
        dashboardService.getUpcomingMeetings()
      ]);

      setStats(statsData);
      
      // إضافة بيانات وهمية للمقررات إذا لم تكن موجودة
      const mockCourses = coursesData.length > 0 ? coursesData : [
        {
          id: 1,
          title: 'الجزيئات وأساسيات علم الأحياء',
          progress: 0,
          description: 'مقدمة في الجزيئات والأساسيات البيولوجية',
          status: 'active',
          total_lessons: 20,
          completed_lessons: 0,
          duration: '1س 34د 44ث'
        },
        {
          id: 2,
          title: 'الخلايا والعضيات',
          progress: 0,
          description: 'دراسة الخلايا والعضيات المختلفة',
          status: 'active',
          total_lessons: 16,
          completed_lessons: 0,
          duration: '49د 54ث'
        }
      ];
      
      setCourses(mockCourses);
      setAchievements(achievementsData);
      setRecentActivity(activityData);
      setUpcomingAssignments(assignmentsData);
      setUpcomingMeetings(meetingsData);
      
      // بيانات وهمية للمحاضرات والواجبات القادمة - للطالب
      const mockLectures = [
        {
          id: 1,
          title: 'كيمياء 3 - محاضرة',
          time: '08:00 - 10:00',
          date: '2024-01-10',
          day: 'الثلاثاء',
          color: '#0e5181',
          type: 'lecture'
        },
        {
          id: 2,
          title: 'واجب كيمياء 1',
          time: '10:00 - 11:35',
          date: '2024-01-10',
          day: 'الثلاثاء',
          color: '#0e5181',
          type: 'assignment'
        },
        {
          id: 3,
          title: 'اختبار كيمياء 2',
          time: '11:00 - 15:00',
          date: '2024-01-11',
          day: 'الأربعاء',
          color: '#0e5181',
          type: 'exam'
        },
        {
          id: 4,
          title: 'كيمياء 2 - محاضرة',
          time: '07:00 - 08:15',
          date: '2024-01-12',
          day: 'الخميس',
          color: '#0e5181',
          type: 'lecture'
        },
        {
          id: 5,
          title: 'واجب كيمياء 3',
          time: '09:00 - 10:15',
          date: '2024-01-12',
          day: 'الخميس',
          color: '#0e5181',
          type: 'assignment'
        },
        {
          id: 6,
          title: 'كيمياء 2 - تدريب',
          time: '09:00 - 10:15',
          date: '2024-01-13',
          day: 'الجمعة',
          color: '#0e5181',
          type: 'practice'
        },
        {
          id: 7,
          title: 'اختبار نهائي',
          time: '12:00 - 13:15',
          date: '2024-01-13',
          day: 'الجمعة',
          color: '#0e5181',
          type: 'exam'
        }
      ];
      
      setUpcomingLectures(mockLectures);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseContinue = (courseId) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleCourseView = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const formatGrade = (grade) => {
    if (grade >= 90) return 'A+';
    if (grade >= 85) return 'A';
    if (grade >= 80) return 'B+';
    if (grade >= 75) return 'B';
    if (grade >= 70) return 'C+';
    if (grade >= 65) return 'C';
    if (grade >= 60) return 'D+';
    return 'D';
  };

  const getGradeColor = (grade) => {
    if (grade >= 80) return 'success';
    if (grade >= 70) return 'info';
    if (grade >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDayName = (date) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} lg={3} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <motion.div 
        initial="hidden"
        animate="show"
        variants={container}
      >
        {/* Header Section */}
        <Box sx={{ mb: 5, px: 1 }}>
          <motion.div variants={item}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                mb: 2,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #fff, #90caf9)'
                  : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              مرحباً بك، محمد! 👋
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 4,
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 24,
                  height: 3,
                  background: theme.palette.primary.main,
                  borderRadius: 2
                }
              }}
            >
              هذه نظرة عامة على أدائك الدراسي
            </Typography>
          </motion.div>
        </Box>

        {/* Stats Cards - مطابقة لشكل المعلم */}
        <Box sx={{ mb: 5, px: 1 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={3}>
         <motion.div variants={item}>
                <Card
                 sx={{ 
                    height: 100,
                    borderRadius: 3,
                  background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          background: '#9c27b0',
                      color: 'white',
                      '& svg': {
                            fontSize: '1.3rem'
                      }
                    }}
                  >
                    <SchoolIcon />
                  </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.3 }}>
                          المقررات المسجلة
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                      {stats.enrolledCourses || 0}
                    </Typography>
                </Box>
                  </Box>
                  <Box
                    sx={{
                        width: 35,
                        height: 3,
                        background: '#9c27b0',
                        borderRadius: 2
                      }}
                    />
                  </CardContent>
                </Card>
            </motion.div>
          </Grid>
          
            <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
                <Card
                sx={{
                    height: 100,
                    borderRadius: 3,
                  background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          background: '#2196f3',
                      color: 'white',
                      '& svg': {
                            fontSize: '1.3rem'
                      }
                    }}
                  >
                    <AssignmentIcon />
                  </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.3 }}>
                          الواجبات المعلقة
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                      {stats.pendingAssignments || 0}
                    </Typography>
                </Box>
                  </Box>
                  <Box
                    sx={{
                        width: 35,
                        height: 3,
                        background: '#2196f3',
                        borderRadius: 2
                      }}
                    />
                  </CardContent>
                </Card>
            </motion.div>
          </Grid>
          
            <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
                <Card
                sx={{
                    height: 100,
                    borderRadius: 3,
                  background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          background: '#ff9800',
                      color: 'white',
                      '& svg': {
                            fontSize: '1.3rem'
                      }
                    }}
                  >
                    <GradeIcon />
                  </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.3 }}>
                          المعدل الحالي
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                      {formatGrade(stats.averageGrade || 0)}
                    </Typography>
                </Box>
                  </Box>
                  <Box
                    sx={{
                        width: 35,
                        height: 3,
                        background: '#ff9800',
                        borderRadius: 2
                      }}
                    />
                  </CardContent>
                </Card>
            </motion.div>
          </Grid>
          
            <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
                <Card
                sx={{
                    height: 100,
                    borderRadius: 3,
                  background: 'white',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          background: '#4caf50',
                      color: 'white',
                      '& svg': {
                            fontSize: '1.3rem'
                      }
                    }}
                  >
                    <StarIcon />
                  </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.3 }}>
                          النقاط المكتسبة
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                      {(stats.totalPoints || 0).toLocaleString()}
                    </Typography>
                </Box>
                  </Box>
                  <Box
                    sx={{
                        width: 35,
                        height: 3,
                        background: '#4caf50',
                        borderRadius: 2
                      }}
                    />
                  </CardContent>
                </Card>
            </motion.div>
          </Grid>
        </Grid>
       </Box>

        {/* Main Content with Tabs */}
         <motion.div variants={item}>
          <Card sx={{ 
            width: '100%',
            background: 'white',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {/* Tab Header */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #0e5181, #1a6ba8)',
              borderRadius: '16px 16px 0 0',
              p: 0
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                 sx={{ 
                  '& .MuiTab-root': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 60,
                    '&.Mui-selected': {
                      color: 'white',
                      fontWeight: 700
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: 3
                  }
                }}
              >
                <Tab 
                  icon={<SchoolIcon />} 
                  label="مقرراتي" 
                  iconPosition="start"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    gap: 1
                  }}
                />
                <Tab 
                  icon={<CalendarIcon />} 
                  label="جدول المحاضرات" 
                  iconPosition="start"
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ height: 600, overflow: 'auto' }}>
              {/* My Courses Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#0e5181' }}>
                        مقرراتي النشطة
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                 تابع تقدمك في المقررات
                    </Typography>
                </Box>
                  <Button 
                    variant="contained" 
                    size="small" 
               endIcon={<TrendingUpIcon />}
                    sx={{ 
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #0e5181, #1a6ba8)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1a6ba8, #0e5181)',
                      }
                    }}
               onClick={() => navigate('/student/courses')}
                  >
               عرض الكل
                  </Button>
                </Box>

         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
           {courses.map((course, index) => (
             <motion.div key={course.id} variants={item}>
               <Card
                 sx={{
                   borderRadius: 3,
                   background: 'white',
                   border: '1px solid #e0e0e0',
                   boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                     transform: 'translateY(-2px)',
                   }
                 }}
               >
                 <CardContent sx={{ p: 3 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                       <Box
                         sx={{
                           width: 32,
                           height: 32,
                           borderRadius: '50%',
                           background: '#f5f5f5',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}
                       >
                         <SchoolIcon sx={{ color: '#666', fontSize: '1.2rem' }} />
                       </Box>
                       <Box>
                         <Typography variant="h6" fontWeight={600}>
                           {course.title}
                         </Typography>
                         <Typography variant="body2" color="text.secondary">
                           {course.instructor}
                         </Typography>
                       </Box>
                     </Box>
                     <Box sx={{ textAlign: 'right' }}>
                       <Typography variant="body2" color="text.secondary">
                         التقدم: {course.progress}%
                       </Typography>
                       <LinearProgress 
                         variant="determinate" 
                         value={course.progress} 
                         sx={{ 
                           width: 100, 
                           height: 6, 
                           borderRadius: 3,
                           mt: 1,
                           '& .MuiLinearProgress-bar': {
                             background: 'linear-gradient(45deg, #0e5181, #1a6ba8)'
                           }
                         }} 
                       />
                     </Box>
                   </Box>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
         </Box>

         <Box sx={{ mt: 3 }}>
           <Grid container spacing={3}>
             {achievements.map((achievement) => (
               <Grid item xs={12} md={4} key={achievement.id}>
                 <motion.div variants={item}>
                   <EnhancedAchievementCard achievement={achievement} />
                 </motion.div>
               </Grid>
             ))}
           </Grid>
         </Box>
        </Box>
              )}

              {/* Calendar Tab */}
              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#333' }}>
                      جدول المحاضرات والواجبات
               </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: '#666' }}
                        onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                      <Typography variant="body1" sx={{ minWidth: 120, textAlign: 'center', color: '#333', fontWeight: 600 }}>
                        {currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                    </Typography>
                      <IconButton
                        size="small"
                        sx={{ color: '#666' }}
                        onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                  </Box>
                  </Box>

                  {/* Calendar Grid - مطابق للصورة */}
                  <Box sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    background: 'white'
                  }}>
                    {/* Header Row */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '80px repeat(4, 1fr)',
                      borderBottom: '1px solid #e0e0e0',
                      background: '#f8f9fa'
                    }}>
                      <Box sx={{ 
                        p: 2, 
                        borderRight: '1px solid #e0e0e0',
               display: 'flex', 
               alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          الأيام
               </Typography>
                  </Box>
                      {['الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, index) => (
                        <Box key={day} sx={{ 
                          p: 2, 
                          borderRight: index < 3 ? '1px solid #e0e0e0' : 'none',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {day}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {10 + index}
                          </Typography>
                </Box>
                      ))}
       </Box>
      
                    {/* Time Rows */}
                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map((time, timeIndex) => (
                      <Box key={time} sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '80px repeat(4, 1fr)',
                        borderBottom: timeIndex < 6 ? '1px solid #e0e0e0' : 'none',
                        minHeight: 60
                      }}>
                        {/* Time Column */}
                        <Box sx={{ 
                          p: 2, 
                          borderRight: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                          background: '#f8f9fa'
                        }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {time}
                  </Typography>
                </Box>

                        {/* Day Columns */}
                        {[0, 1, 2, 3].map((dayIndex) => (
                          <Box 
                            key={dayIndex} 
                  sx={{
                              p: 1, 
                              borderRight: dayIndex < 3 ? '1px solid #e0e0e0' : 'none',
                              position: 'relative',
                              minHeight: 60
                            }}
                          >
                            {/* Lecture/Assignment Blocks */}
                            {upcomingLectures
                              .filter(lecture => {
                                const lectureTime = lecture.time.split(' - ')[0];
                                const lectureDay = lecture.day;
                                const dayNames = ['الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
                                return lectureTime === time && lectureDay === dayNames[dayIndex];
                              })
                              .map((lecture) => (
                                <Box
                                  key={lecture.id}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 4,
                                    right: 4,
                                    bottom: 4,
                                    background: 'rgba(14, 81, 129, 0.08)',
                                    borderRadius: 1,
                                    p: 1,
                                    color: '#0e5181',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(14, 81, 129, 0.1)'
                                  }}
                                >
                                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                                    {lecture.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.6rem', lineHeight: 1.2 }}>
                                    {lecture.time}
                                  </Typography>
                                </Box>
                              ))}
              </Box>
                        ))}
                     </Box>
                 ))}
               </Box>
                  
                  {upcomingLectures.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CalendarIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        لا توجد محاضرات أو واجبات مجدولة
                       </Typography>
                     <Button 
                       variant="contained" 
                       sx={{ 
                          background: '#e5978b',
                          '&:hover': { background: '#f0a8a0' }
                       }}
                       onClick={() => navigate('/student/calendar')}
                     >
                        عرض التقويم الكامل
                     </Button>
                   </Box>
                  )}
                </Box>
              )}
            </Box>
          </Card>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default StudentDashboard;
