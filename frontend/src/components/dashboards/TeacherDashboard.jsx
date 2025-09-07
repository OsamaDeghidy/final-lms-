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
      
      // إضافة بيانات وهمية للنشاطات إذا لم تكن موجودة
      const mockActivity = activityData && activityData.length > 0 ? activityData : [
        {
          id: 1,
          title: 'تم تسليم واجب جديد',
          description: 'الطالب أحمد محمد سلم واجب الكيمياء',
          time: 'منذ 5 دقائق',
          type: 'assignment',
          course: 'كيمياء 1'
        },
        {
          id: 2,
          title: 'انضمام طالب جديد',
          description: 'انضم الطالب سارة أحمد إلى مقرر الأحياء',
          time: 'منذ ساعة',
          type: 'enrollment',
          course: 'الأحياء'
        }
      ];
      
      setRecentActivity(mockActivity);
      
      // إضافة بيانات وهمية للإعلانات إذا لم تكن موجودة
      const mockAnnouncements = announcementsData && announcementsData.length > 0 ? announcementsData : [
        {
          id: 1,
          title: 'إعلان مهم',
          content: 'سيتم عقد امتحان نهائي الأسبوع القادم',
          date: '2024-01-15',
          read: false,
          course: 'كيمياء 1'
        },
        {
          id: 2,
          title: 'تحديث المنهج',
          content: 'تم تحديث منهج مقرر الأحياء',
          date: '2024-01-14',
          read: true,
          course: 'الأحياء'
        }
      ];
      
      setRecentAnnouncements(mockAnnouncements);
      
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
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          عدد الطلاب
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.totalStudents || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                          background: '#0e5181',
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
                          المقررات
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.totalCourses || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <AssignmentIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          الواجبات المعلقة
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.pendingAssignments || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <StarIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                          متوسط التقييم
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#333', lineHeight: 1 }}>
                          {stats.averageRating.toFixed(1)}★
                        </Typography>
                      </Box>
                    </Box>
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
