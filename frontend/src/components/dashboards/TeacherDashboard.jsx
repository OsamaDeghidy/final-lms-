import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, Chip, useTheme, Divider, alpha, Skeleton, Card, CardContent, IconButton, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
  PlayArrow as PlayArrowIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  RemoveRedEye as ViewIcon
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // تحميل البيانات الحقيقية من API
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

      // تحديث البيانات الحقيقية
      setStats({
        totalCourses: statsData.totalCourses || 0,
        totalStudents: statsData.totalStudents || 0,
        totalRevenue: statsData.totalRevenue || 0,
        averageRating: statsData.averageRating || 0,
        pendingAssignments: statsData.pendingAssignments || 0,
        upcomingMeetings: statsData.upcomingMeetings || 0,
        recentEnrollments: statsData.recentEnrollments || 0
      });
      
      setCourses(coursesData || []);
      setStudentProgress(progressData || []);
      setRecentActivity(activityData || []);
      setRecentAnnouncements(announcementsData || []);
      
      // بيانات وهمية للمحاضرات القادمة - مطابقة للصورة
      const mockLectures = [
        {
          id: 1,
          title: 'كيمياء 3 - تدريب',
          time: '08:00 - 10:00',
          date: '2024-01-10',
          day: 'الثلاثاء',
          color: '#0e5181'
        },
        {
          id: 2,
          title: 'كيمياء 1',
          time: '10:00 - 11:35',
          date: '2024-01-10',
          day: 'الثلاثاء',
          color: '#0e5181'
        },
        {
          id: 3,
          title: 'كيمياء 2 - تدريب',
          time: '11:00 - 15:00',
          date: '2024-01-11',
          day: 'الأربعاء',
          color: '#0e5181'
        },
        {
          id: 4,
          title: 'كيمياء 2',
          time: '07:00 - 08:15',
          date: '2024-01-12',
          day: 'الخميس',
          color: '#0e5181'
        },
        {
          id: 5,
          title: 'كيمياء 3',
          time: '09:00 - 10:15',
          date: '2024-01-12',
          day: 'الخميس',
          color: '#0e5181'
        },
        {
          id: 6,
          title: 'كيمياء 2',
          time: '09:00 - 10:15',
          date: '2024-01-13',
          day: 'الجمعة',
          color: '#0e5181'
        },
        {
          id: 7,
          title: 'كيمياء 1',
          time: '12:00 - 13:15',
          date: '2024-01-13',
          day: 'الجمعة',
          color: '#0e5181'
        }
      ];
      
      setUpcomingLectures(mockLectures);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseView = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const handleCourseEdit = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
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
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
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
                color: '#0e5181',
                textAlign: 'center'
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
                textAlign: 'center',
                mb: 4
              }}
            >
              هذه نظرة عامة على فصولك وطلابك
            </Typography>
          </motion.div>
        </Box>

        {/* Stats Cards - 4 بطاقات إحصائيات بحجم كامل وارتفاع أقل */}
        <Box sx={{ mb: 5, px: 1 }}>
          <Grid container spacing={2}>
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
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          background: '#9c27b0',
                      color: 'white',
                      '& svg': {
                            fontSize: '1.5rem'
                      }
                    }}
                  >
                        <GroupIcon />
                  </Box>
<<<<<<< HEAD
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          عدد الطلاب
                    </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                      {stats.totalStudents || 0}
                    </Typography>
=======
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
              background: 'linear-gradient(90deg, #e5978b, #66bb6a, #81c784)',
            }
          }}>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                sx={{ 
                  mb: 1,
                  background: 'linear-gradient(45deg, #e5978b, #66bb6a)',
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
              background: 'linear-gradient(90deg, #1976d2, #ba68c8, #ce93d8)',
            }
                    }}>
                      <Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                        sx={{ 
                  mb: 1,
                  background: 'linear-gradient(45deg, #1976d2, #ba68c8)',
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
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
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
<<<<<<< HEAD
          
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
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                          background: '#2196f3',
                      color: 'white',
                      '& svg': {
                            fontSize: '1.5rem'
                      }
                    }}
                  >
                        <SchoolIcon />
                  </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          عدد الفصول
                    </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.totalCourses || 0}
                    </Typography>
=======
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
                      background: 'linear-gradient(90deg, #1976d2, #ba68c8, #ce93d8)',
                    }
                  }}>
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700} 
                        sx={{ 
                          mb: 1,
                          background: 'linear-gradient(45deg, #1976d2, #ba68c8)',
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
>>>>>>> 9aa98372e81e42f9ef2516701e4b63696545131b
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
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                          background: '#ff9800',
                    color: 'white',
                    '& svg': {
                            fontSize: '1.5rem'
                    }
                  }}
                >
                        <BarChartIcon />
                </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          المقررات قيد التقدم
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
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                          width: 45,
                          height: 45,
                          borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                          background: '#4caf50',
                    color: 'white',
                    '& svg': {
                            fontSize: '1.5rem'
                    }
                  }}
                >
                        <CheckCircleIcon />
                </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          المقررات المكتملة
                </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.upcomingMeetings || 0}
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
          
        {/* Main Content - نظام التبويبات */}
        <Box sx={{ px: 1, width: '100%' }}>
            <motion.div variants={item}>
            <Card
                sx={{
                borderRadius: 4,
                background: 'white',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Tabs Header */}
                <Box
                  sx={{
                  background: 'linear-gradient(135deg, #0e5181, #1a6ba8)',
                  color: 'white'
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      minHeight: 60,
                      '&.Mui-selected': {
                    color: 'white',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'white',
                      height: 3
                    }
                  }}
                >
                  <Tab 
                    label="مقرراتي" 
                    icon={<SchoolIcon />} 
                    iconPosition="start"
                    sx={{ flex: 1 }}
                  />
                  <Tab 
                    label="جدول المحاضرات" 
                    icon={<CalendarIcon />} 
                    iconPosition="start"
                    sx={{ flex: 1 }}
                  />
                </Tabs>
                </Box>

              {/* Tab Content */}
              <Box sx={{ height: 600, overflow: 'auto' }}>
                {/* My Courses Tab */}
                {activeTab === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#0e5181' }}>
                        إدارة فصولك الدراسية
                </Typography>
                <Typography variant="body2" color="text.secondary">
                        عرض وإدارة جميع مقرراتك
                </Typography>
                    </Box>
                    
                    {courses.length > 0 ? (
                      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="courses table">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                              <TableCell sx={{ fontWeight: 700, color: '#0e5181', borderBottom: '2px solid #0e5181', textAlign: 'right' }}>
                                المقرر
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700, color: '#0e5181', borderBottom: '2px solid #0e5181' }}>
                                عدد الطلاب
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700, color: '#0e5181', borderBottom: '2px solid #0e5181' }}>
                                التقييم
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700, color: '#0e5181', borderBottom: '2px solid #0e5181' }}>
                                التصنيف
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700, color: '#0e5181', borderBottom: '2px solid #0e5181' }}>
                                الحالة
                              </TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700, color: '#0e5181', borderBottom: '2px solid #0e5181' }}>
                                الإجراءات
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {courses.map((course) => (
                              <TableRow 
                                key={course.id}
                sx={{
                                  '&:last-child td, &:last-child th': { border: 0 },
                                  '&:hover': { backgroundColor: '#f8f9fa' },
                  cursor: 'pointer',
                                  transition: 'background-color 0.2s ease'
                }}
                            onClick={() => handleCourseView(course.id)}
              >
                                <TableCell component="th" scope="row" sx={{ textAlign: 'right', verticalAlign: 'top' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexDirection: 'row-reverse' }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#333', textAlign: 'right', mb: 0.5, lineHeight: 1.3 }}>
                                        {course.title || 'مقرر جديد'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', display: 'block', lineHeight: 1.4 }}>
                                        {course.description || 'لا يوجد وصف'}
                                      </Typography>
                                    </Box>
                <Box
                  sx={{
                                        width: 40,
                                        height: 40,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #0e5181, #1a6ba8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                                        flexShrink: 0,
                    '& svg': {
                                          fontSize: '1.2rem'
                    }
                  }}
                >
                                <SchoolIcon />
                </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <GroupIcon sx={{ fontSize: 16, color: '#666' }} />
                                    <Typography variant="body2" fontWeight={500}>
                                      {course.students || 0}
                </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                                    <Typography variant="body2" fontWeight={500}>
                                      {course.rating || 0}
                </Typography>
      </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={course.category || 'بدون تصنيف'} 
                                    size="small" 
                sx={{ 
                                      backgroundColor: '#e3f2fd',
                                      color: '#1976d2',
                                      fontWeight: 500
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={course.status === 'published' ? 'منشور' : 'مسودة'} 
                                    size="small"
                    sx={{
                                      backgroundColor: course.status === 'published' ? '#e8f5e8' : '#fff3e0',
                                      color: course.status === 'published' ? '#2e7d32' : '#f57c00',
                                      fontWeight: 500
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        color: '#0e5181',
                                        backgroundColor: 'rgba(14, 81, 129, 0.08)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(14, 81, 129, 0.15)',
                                          color: '#1a6ba8'
                                        }
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCourseView(course.id);
                                      }}
                                      title="عرض المقرر"
                                    >
                                      <ViewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
              size="small" 
                          sx={{
                                        color: '#e5978b',
                                        backgroundColor: 'rgba(229, 151, 139, 0.08)',
                '&:hover': {
                                          backgroundColor: 'rgba(229, 151, 139, 0.15)',
                                          color: '#d17a6f'
                                        }
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCourseEdit(course.id);
                                      }}
                                      title="تعديل المقرر"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
          </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <SchoolIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          لا توجد مقررات بعد
              </Typography>
            <Button 
              variant="contained" 
                    sx={{ 
                            background: '#0e5181',
                            '&:hover': { background: '#1a6ba8' }
                          }}
                          onClick={() => navigate('/teacher/courses/new')}
                        >
                          إنشاء مقرر جديد
            </Button>
                </Box>
                    )}
            </Box>
                )}

                {/* Calendar Tab */}
                {activeTab === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#333' }}>
                        جدول المحاضرات
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
                              {/* Lecture Blocks */}
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
                          لا توجد محاضرات مجدولة
                </Typography>
                        <Button
                          variant="contained"
                sx={{
                            background: '#e5978b',
                            '&:hover': { background: '#f0a8a0' }
                          }}
                          onClick={() => navigate('/teacher/meetings')}
                        >
                          جدولة محاضرة
                        </Button>
                  </Box>
                    )}
                  </Box>
                )}
                </Box>
            </Card>
                </motion.div>
        </Box>

      </motion.div>
    </Box>
  );
};

export default TeacherDashboard;
