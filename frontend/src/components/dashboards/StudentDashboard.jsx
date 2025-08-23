import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, useTheme, Chip, Skeleton } from '@mui/material';
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
  Schedule as ScheduleIcon
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
      setCourses(coursesData);
      setAchievements(achievementsData);
      setRecentActivity(activityData);
      setUpcomingAssignments(assignmentsData);
      setUpcomingMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseContinue = (courseId) => {
    navigate(`/courses/${courseId}/learn`);
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
        <Box sx={{ mb: 4 }}>
          <motion.div variants={item}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
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

             {/* Stats Cards - نظرة عامة محسنة */}
       <Box sx={{ mb: 4 }}>
         <motion.div variants={item}>
           <Box sx={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center', 
             mb: 3,
             p: 3,
             background: theme.palette.mode === 'dark'
               ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))'
               : 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.03))',
             borderRadius: 4,
             border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
             position: 'relative',
             overflow: 'hidden',
             '&::before': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: 3,
               background: 'linear-gradient(90deg, #1976d2, #42a5f5, #90caf9)',
             }
           }}>
             <Box>
               <Typography 
                 variant="h5" 
                 fontWeight={700} 
                 sx={{ 
                   mb: 1,
                   background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   display: 'inline-block'
                 }}
               >
                 نظرة عامة
               </Typography>
               <Typography 
                 variant="body1" 
                 color="text.secondary"
                 sx={{ 
                   display: 'flex',
                   alignItems: 'center',
                   gap: 1,
                   '&::before': {
                     content: '""',
                     display: 'block',
                     width: 20,
                     height: 2,
                     background: theme.palette.primary.main,
                     borderRadius: 1
                   }
                 }}
               >
                 إحصائياتك الدراسية في لمحة
               </Typography>
             </Box>
             <Box sx={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: 1,
               p: 1.5,
               borderRadius: 2,
               background: alpha(theme.palette.primary.main, 0.1),
               border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
             }}>
               <SchoolIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
               <Typography variant="caption" fontWeight={600} color="primary.main">
                 لوحة الإحصائيات
               </Typography>
             </Box>
           </Box>
         </motion.div>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  height: 200,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                      {stats.enrolledCourses}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, opacity: 0.9 }}>
                      المقررات المسجلة
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      مقررات نشطة
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.2)',
                      '& svg': {
                        fontSize: '2rem'
                      }
                    }}
                  >
                    <SchoolIcon />
                  </Box>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  height: 200,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ff9800, #ffcc02)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                      {stats.pendingAssignments}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, opacity: 0.9 }}>
                      الواجبات المعلقة
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      واجبات تحتاج تسليم
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.2)',
                      '& svg': {
                        fontSize: '2rem'
                      }
                    }}
                  >
                    <AssignmentIcon />
                  </Box>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  height: 200,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4caf50, #81c784)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                      {formatGrade(stats.averageGrade)}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, opacity: 0.9 }}>
                      المعدل الحالي
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {stats.averageGrade}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.2)',
                      '& svg': {
                        fontSize: '2rem'
                      }
                    }}
                  >
                    <GradeIcon />
                  </Box>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  height: 200,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #673ab7, #9575cd)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                      {stats.totalPoints.toLocaleString()}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, opacity: 0.9 }}>
                      النقاط المكتسبة
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      نقاط إجمالية
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.2)',
                      '& svg': {
                        fontSize: '2rem'
                      }
                    }}
                  >
                    <StarIcon />
                  </Box>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
        </Grid>
       </Box>

             {/* Recent Courses - مقرراتي النشطة محسنة */}
       <Box sx={{ mb: 4 }}>
         <motion.div variants={item}>
           <Box sx={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center', 
             mb: 3,
             p: 3,
             background: theme.palette.mode === 'dark'
               ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))'
               : 'linear-gradient(135deg, rgba(232, 245, 233, 0.8), rgba(232, 245, 233, 0.4))',
             borderRadius: 4,
             border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
             position: 'relative',
             overflow: 'hidden',
             '&::before': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: 3,
               background: 'linear-gradient(90deg, #4caf50, #66bb6a, #81c784)',
             }
           }}>
             <Box>
               <Typography 
                 variant="h5" 
                 fontWeight={700} 
                 sx={{ 
                   mb: 1,
                   background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   display: 'inline-block'
                 }}
               >
                 مقرراتي النشطة
               </Typography>
               <Typography 
                 variant="body1" 
                 color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                   gap: 1,
                   '&::before': {
                     content: '""',
                     display: 'block',
                     width: 20,
                     height: 2,
                     background: theme.palette.success.main,
                     borderRadius: 1
                   }
                 }}
               >
                 تابع تقدمك في المقررات
                    </Typography>
                </Box>
                  <Button 
                    variant="contained" 
                    size="small" 
               endIcon={<TrendingUpIcon />}
                    sx={{ 
                      borderRadius: 3,
                 background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                      '&:hover': {
                   background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                 }
                    }}
               onClick={() => navigate('/student/courses')}
                  >
               عرض الكل
                  </Button>
                </Box>
         </motion.div>

         <Grid container spacing={3}>
           {courses.map((course) => (
             <Grid item xs={12} md={6} lg={4} key={course.id}>
               <motion.div variants={item}>
                 <EnhancedCourseCard
                   course={course}
                   variant="student"
                   onContinue={() => handleCourseContinue(course.id)}
                   onView={() => handleCourseView(course.id)}
                 />
            </motion.div>
          </Grid>
        ))}
         </Grid>
       </Box>

             {/* Achievements Section - إنجازاتي محسنة */}
       <Box sx={{ mb: 4 }}>
         <motion.div variants={item}>
           <Box sx={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center', 
             mb: 3,
             p: 3,
             background: theme.palette.mode === 'dark'
               ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))'
               : 'linear-gradient(135deg, rgba(255, 248, 225, 0.8), rgba(255, 248, 225, 0.4))',
             borderRadius: 4,
             border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
             position: 'relative',
             overflow: 'hidden',
             '&::before': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: 3,
               background: 'linear-gradient(90deg, #ffc107, #ffca28, #ffd54f)',
             }
           }}>
             <Box>
               <Typography 
                 variant="h5" 
                 fontWeight={700} 
                 sx={{ 
                   mb: 1,
                   background: 'linear-gradient(45deg, #ffc107, #ffca28)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   display: 'inline-block'
                 }}
               >
                 إنجازاتي
               </Typography>
               <Typography 
                 variant="body1" 
                 color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                   gap: 1,
                   '&::before': {
                     content: '""',
                     display: 'block',
                     width: 20,
                     height: 2,
                     background: theme.palette.warning.main,
                     borderRadius: 1
                   }
                 }}
               >
                 احصل على المزيد من النقاط والإنجازات
                    </Typography>
                  </Box>
                  <Box sx={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: 1,
               p: 1.5,
               borderRadius: 2,
               background: alpha(theme.palette.warning.main, 0.1),
               border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
             }}>
               <BadgeIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
               <Typography variant="caption" fontWeight={600} color="warning.main">
                 نظام الإنجازات
               </Typography>
                  </Box>
                </Box>
            </motion.div>

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
      
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <motion.div variants={item}>
            <DashboardCard 
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(56, 14, 93, 0.3), rgba(103, 58, 183, 0.1))'
                  : 'linear-gradient(135deg, rgba(237, 231, 246, 0.8), rgba(237, 231, 246, 0.4))',
                border: 'none',
                '&:hover': {
                  transform: 'none',
                  boxShadow: theme.shadows[5]
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.primary.main, 0.15),
                    color: theme.palette.primary.main,
                    mr: 2,
                    '& svg': {
                      fontSize: '1.8rem'
                    }
                  }}
                >
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    أيام متتالية
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {stats.learningStreak}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      يوم
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                  احرزت {stats.learningStreak} أيام متتالية من التعلم! استمر في التقدم.
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div variants={item}>
            <DashboardCard 
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(26, 35, 126, 0.3), rgba(57, 73, 171, 0.1))'
                  : 'linear-gradient(135deg, rgba(232, 234, 246, 0.8), rgba(232, 234, 246, 0.4))',
                border: 'none',
                '&:hover': {
                  transform: 'none',
                  boxShadow: theme.shadows[5]
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.info.main, 0.15),
                    color: theme.palette.info.main,
                    mr: 2,
                    '& svg': {
                      fontSize: '1.8rem'
                    }
                  }}
                >
                    <MenuBookIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                      الدروس المكتملة
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {stats.completedLessons}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        درس
                      </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                  أكملت {stats.completedLessons} درساً حتى الآن.
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div variants={item}>
            <DashboardCard 
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(0, 77, 64, 0.3), rgba(0, 121, 107, 0.1))'
                  : 'linear-gradient(135deg, rgba(224, 242, 241, 0.8), rgba(224, 242, 241, 0.4))',
                border: 'none',
                '&:hover': {
                  transform: 'none',
                  boxShadow: theme.shadows[5]
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.success.main, 0.15),
                    color: theme.palette.success.main,
                    mr: 2,
                    '& svg': {
                      fontSize: '1.8rem'
                    }
                  }}
                >
                    <BadgeIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                      الشهادات
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {stats.certificates}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        شهادة
                      </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                  حصلت على {stats.certificates} شهادة من المقررات المكتملة.
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>
      </Grid>

                 {/* Recent Activity & Upcoming - محسن */}
         <Box sx={{ mt: 4 }}>
           <Grid container spacing={3}>
             <Grid item xs={12} md={6}>
               <Box sx={{ mb: 3 }}>
                 <motion.div variants={item}>
                   <Box sx={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center', 
                     mb: 3,
                     p: 3,
                     background: theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.05))'
                       : 'linear-gradient(135deg, rgba(243, 229, 245, 0.8), rgba(243, 229, 245, 0.4))',
                     borderRadius: 4,
                     border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                     position: 'relative',
                     overflow: 'hidden',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: 3,
                       background: 'linear-gradient(90deg, #9c27b0, #ba68c8, #ce93d8)',
                     }
                   }}>
                     <Box>
                       <Typography 
                         variant="h5" 
                         fontWeight={700} 
                         sx={{ 
                           mb: 1,
                           background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           display: 'inline-block'
                         }}
                       >
                         النشاطات الأخيرة
                       </Typography>
                       <Typography 
                         variant="body1" 
                         color="text.secondary"
                         sx={{ 
                           display: 'flex',
                           alignItems: 'center',
                           gap: 1,
                           '&::before': {
                             content: '""',
                             display: 'block',
                             width: 20,
                             height: 2,
                             background: theme.palette.secondary.main,
                             borderRadius: 1
                           }
                         }}
                       >
                         آخر ما فعلته في المنصة
                       </Typography>
                     </Box>
                   </Box>
                 </motion.div>
                 
                 {recentActivity.map((activity) => (
                   <motion.div key={activity.id} variants={item}>
                     <EnhancedActivityItem activity={activity} />
                   </motion.div>
                 ))}
               </Box>
             </Grid>
             
             <Grid item xs={12} md={6}>
               <Box sx={{ mb: 3 }}>
                 <motion.div variants={item}>
                   <Box sx={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center', 
                     mb: 3,
                     p: 3,
                     background: theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))'
                       : 'linear-gradient(135deg, rgba(255, 235, 238, 0.8), rgba(255, 235, 238, 0.4))',
                     borderRadius: 4,
                     border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                     position: 'relative',
                     overflow: 'hidden',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: 3,
                       background: 'linear-gradient(90deg, #f44336, #ef5350, #e57373)',
                     }
                   }}>
                     <Box>
                       <Typography 
                         variant="h5" 
                         fontWeight={700} 
                         sx={{ 
                           mb: 1,
                           background: 'linear-gradient(45deg, #f44336, #ef5350)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           display: 'inline-block'
                         }}
                       >
                         المواعيد القادمة
                       </Typography>
                       <Typography 
                         variant="body1" 
                         color="text.secondary"
                         sx={{ 
                           display: 'flex',
                           alignItems: 'center',
                           gap: 1,
                           '&::before': {
                             content: '""',
                             display: 'block',
                             width: 20,
                             height: 2,
                             background: theme.palette.error.main,
                             borderRadius: 1
                           }
                         }}
                       >
                         لا تنسى مواعيد تسليم الواجبات والاختبارات
                       </Typography>
                     </Box>
                     <Button 
                       variant="contained" 
                       size="small" 
                       endIcon={<EventIcon />}
                       sx={{ 
                         borderRadius: 3,
                         background: 'linear-gradient(45deg, #f44336, #ef5350)',
                         '&:hover': {
                           background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                         }
                       }}
                       onClick={() => navigate('/student/calendar')}
                     >
                       عرض التقويم
                     </Button>
                   </Box>
                 </motion.div>
                 
                 {upcomingAssignments.map((item) => (
                   <motion.div key={item.id} variants={item}>
                     <EnhancedActivityItem activity={item} />
                   </motion.div>
                 ))}
                 {upcomingMeetings.map((meeting) => (
                   <motion.div key={meeting.id} variants={item}>
                     <EnhancedActivityItem activity={meeting} />
                   </motion.div>
                 ))}
               </Box>
             </Grid>
           </Grid>
         </Box>
    </motion.div>
  </Box>
  );
};

export default StudentDashboard;
