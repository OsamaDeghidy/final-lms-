import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, Chip, useTheme, Divider, alpha, Skeleton } from '@mui/material';
import { DashboardCard, StatCard, DashboardSection, ProgressCard, ActivityItem, AnnouncementCard } from './DashboardLayout';
import { 
  School as SchoolIcon, 
  Group as GroupIcon, 
  Assignment as AssignmentIcon, 
  Event as EventIcon, 
  Notifications as NotificationsIcon, 
  BarChart as BarChartIcon,
  Class as ClassIcon, 
  PersonAdd as PersonAddIcon, 
  TrendingUp as TrendingUpIcon, 
  CheckCircle as CheckCircleIcon,
  Message as MessageIcon, 
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboard.service';
import { 
  EnhancedStatCard, 
  EnhancedCourseCard, 
  EnhancedActivityItem, 
  EnhancedAnnouncementCard 
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

const TeacherDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingAssignments: 0,
    upcomingMeetings: 0,
    recentEnrollments: 0
  });
  const [courses, setCourses] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

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
        progressData,
        activityData,
        announcementsData
      ] = await Promise.all([
        dashboardService.getTeacherStats(),
        dashboardService.getTeacherCourses(),
        dashboardService.getStudentProgress(),
        dashboardService.getRecentActivity(),
        dashboardService.getRecentAnnouncements()
      ]);

      setStats(statsData);
      setCourses(coursesData);
      setStudentProgress(progressData);
      setRecentActivity(activityData);
      setRecentAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseView = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
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
              مرحباً بك، أستاذ/ة! 👩‍🏫
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
              هذه نظرة عامة على فصولك وطلابك
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
                إحصائياتك التدريسية في لمحة
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
                  borderRadius: 4,
                  background: 'white',
                  color: 'text.primary',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #0e5181',
                  boxShadow: '0 4px 20px rgba(14, 81, 129, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(14, 81, 129, 0.15)',
                    border: '2px solid #0e5181',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', p: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: '#0e5181', lineHeight: 1 }}>
                      {stats.totalCourses}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, color: 'text.primary', fontWeight: 600 }}>
                      المقررات
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                      مقررات نشطة
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #0e5181, #1a6ba8)',
                      color: 'white',
                      boxShadow: '0 6px 20px rgba(14, 81, 129, 0.3)',
                      '& svg': {
                        fontSize: '2.2rem'
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
                  borderRadius: 4,
                  background: 'white',
                  color: 'text.primary',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #e5978b',
                  boxShadow: '0 4px 20px rgba(229, 151, 139, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(229, 151, 139, 0.15)',
                    border: '2px solid #e5978b',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', p: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: '#e5978b', lineHeight: 1 }}>
                      {stats.totalStudents}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, color: 'text.primary', fontWeight: 600 }}>
                      الطلاب
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                      طلاب مسجلين
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #e5978b, #f0a8a0)',
                      color: 'white',
                      boxShadow: '0 6px 20px rgba(229, 151, 139, 0.3)',
                      '& svg': {
                        fontSize: '2.2rem'
                      }
                    }}
                  >
                    <GroupIcon />
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
                  borderRadius: 4,
                  background: 'white',
                  color: 'text.primary',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #0e5181',
                  boxShadow: '0 4px 20px rgba(14, 81, 129, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(14, 81, 129, 0.15)',
                    border: '2px solid #0e5181',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', p: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: '#0e5181', lineHeight: 1 }}>
                      {formatCurrency(stats.totalRevenue)}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, color: 'text.primary', fontWeight: 600 }}>
                      الإيرادات
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                      إجمالي الأرباح
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #0e5181, #1a6ba8)',
                      color: 'white',
                      boxShadow: '0 6px 20px rgba(14, 81, 129, 0.3)',
                      '& svg': {
                        fontSize: '2.2rem'
                      }
                    }}
                  >
                    <MoneyIcon />
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
                  borderRadius: 4,
                  background: 'white',
                  color: 'text.primary',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #e5978b',
                  boxShadow: '0 4px 20px rgba(229, 151, 139, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 30px rgba(229, 151, 139, 0.15)',
                    border: '2px solid #e5978b',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', p: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1, color: '#e5978b', lineHeight: 1 }}>
                      {stats.averageRating.toFixed(1)}★
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 0.5, color: 'text.primary', fontWeight: 600 }}>
                      متوسط التقييم
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                      من 5 نجوم
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #e5978b, #f0a8a0)',
                      color: 'white',
                      boxShadow: '0 6px 20px rgba(229, 151, 139, 0.3)',
                      '& svg': {
                        fontSize: '2.2rem'
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

      {/* Quick Actions - إجراءات سريعة محسنة */}
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
                إجراءات سريعة
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
                الوصول السريع للمهام الشائعة
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              background: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}>
              <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
              <Typography variant="caption" fontWeight={600} color="success.main">
                أدوات سريعة
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/teacher/courses/new')}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    color: 'white',
                    mx: 'auto',
                    mb: 2,
                    '& svg': {
                      fontSize: '2rem'
                    }
                  }}
                >
                  <SchoolIcon />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  إنشاء مقرر جديد
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  أضف مقرراً جديداً إلى منصتك
                </Typography>
              </DashboardCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/teacher/articles/create')}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                    color: 'white',
                    mx: 'auto',
                    mb: 2,
                    '& svg': {
                      fontSize: '2rem'
                    }
                  }}
                >
                  <AssignmentIcon />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  كتابة مقالة جديدة
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  شارك معرفتك مع الطلاب
                </Typography>
              </DashboardCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/teacher/assignments/new')}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                    color: 'white',
                    mx: 'auto',
                    mb: 2,
                    '& svg': {
                      fontSize: '2rem'
                    }
                  }}
                >
                  <AssignmentIcon />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  إنشاء واجب جديد
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  أضف واجباً جديداً للطلاب
                </Typography>
              </DashboardCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <motion.div variants={item}>
              <DashboardCard
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/teacher/meetings')}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                    color: 'white',
                    mx: 'auto',
                    mb: 2,
                    '& svg': {
                      fontSize: '2rem'
                    }
                  }}
                >
                  <EventIcon />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  جدولة محاضرة
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  أنشئ محاضرة مباشرة جديدة
                </Typography>
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
                    background: theme.palette.warning.main,
                    borderRadius: 1
                  }
                }}
              >
                إدارة فصولك الدراسية بسهولة
                      </Typography>
                    </Box>
            <Button 
              variant="contained" 
              size="small" 
              endIcon={<TrendingUpIcon />}
                          sx={{
                            borderRadius: 3,
                background: 'linear-gradient(45deg, #ffc107, #ffca28)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f57c00, #ffc107)',
                }
              }}
              onClick={() => navigate('/teacher/courses')}
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
                  variant="teacher"
                  onView={() => handleCourseView(course.id)}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
                    </Box>
                    
      {/* Student Progress - تقدم الطلاب محسن */}
      <Box sx={{ mb: 4 }}>
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
                تقدم الطلاب
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
                تابع أداء طلابك
              </Typography>
                </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              background: alpha(theme.palette.secondary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
            }}>
              <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.2rem' }} />
              <Typography variant="caption" fontWeight={600} color="secondary.main">
                متابعة الأداء
              </Typography>
            </Box>
          </Box>
            </motion.div>
      
        <Grid container spacing={3}>
          {studentProgress.slice(0, 4).map((student) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={student.id}>
              <motion.div variants={item}>
                <DashboardCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                      {student.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                          {student.name}
                      </Typography>
                      <Chip 
                          label={student.grade}
                        size="small"
                          color={student.grade === 'ممتاز' ? 'success' : 
                                 student.grade === 'جيد جداً' ? 'info' : 
                                 student.grade === 'جيد' ? 'warning' : 'error'}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                          value={student.progress}
                          color={student.progress >= 80 ? 'success' : 
                                 student.progress >= 60 ? 'info' : 
                                 student.progress >= 40 ? 'warning' : 'error'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          التقدم
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            {student.progress}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
        ))}
        </Grid>
      </Box>

        {/* Recent Activity & Announcements - محسن */}
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
                        آخر ما حدث في منصتك
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
                        آخر الإعلانات
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
                        آخر المستجدات
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                            size="small"
                      startIcon={<PersonAddIcon />}
                      sx={{ 
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #f44336, #ef5350)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                        }
                      }}
                      onClick={() => navigate('/teacher/announcements/new')}
                    >
                      إعلان جديد
                    </Button>
                  </Box>
                </motion.div>
                
                {recentAnnouncements.map((announcement) => (
                  <motion.div key={announcement.id} variants={item}>
                    <EnhancedAnnouncementCard announcement={announcement} />
                  </motion.div>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
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
                      background: alpha(theme.palette.warning.main, 0.15),
                      color: theme.palette.warning.main,
                      mr: 2,
                      '& svg': {
                        fontSize: '1.8rem'
                      }
                    }}
                  >
                    <AssignmentIcon />
                        </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      الواجبات المعلقة
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {stats.pendingAssignments}
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        واجب
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
                          <Typography variant="caption" color="text.secondary">
                  {stats.pendingAssignments} واجب يحتاج تصحيح.
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
                    <EventIcon />
                        </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      المحاضرات القادمة
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {stats.upcomingMeetings}
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        محاضرة
                      </Typography>
                    </Typography>
                      </Box>
                    </Box>
                <Typography variant="caption" color="text.secondary">
                  {stats.upcomingMeetings} محاضرة مجدولة.
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
                    <PersonAddIcon />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      التسجيلات الجديدة
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                      {stats.recentEnrollments}
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        طالب
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stats.recentEnrollments} طالب جديد انضم هذا الأسبوع.
                </Typography>
              </DashboardCard>
                </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default TeacherDashboard;
