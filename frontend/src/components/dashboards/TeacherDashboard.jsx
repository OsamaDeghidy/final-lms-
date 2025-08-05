import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, Chip, useTheme, Divider, alpha } from '@mui/material';
import { DashboardCard, StatCard, DashboardSection, ProgressCard, ActivityItem, AnnouncementCard } from './DashboardLayout';
import { School as SchoolIcon, Group as GroupIcon, 
  Assignment as AssignmentIcon, Event as EventIcon, 
  Notifications as NotificationsIcon, BarChart as BarChartIcon,
  Class as ClassIcon, PersonAdd as PersonAddIcon, 
  TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon,
  Message as MessageIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const [stats] = useState({
    courses: 4,
    students: 85,
    pending: 3,
    announcements: 2,
    attendance: 92,
    rating: 4.7
  });

  const recentCourses = [
    { 
      id: 1, 
      name: 'الرياضيات المتقدمة', 
      students: 25, 
      assignments: 5,
      progress: 75,
      color: 'primary',
      icon: <TrendingUpIcon />,
      nextClass: 'غدًا 10:00 ص',
      pendingAssignments: 12
    },
    { 
      id: 2, 
      name: 'الفيزياء', 
      students: 30, 
      assignments: 3,
      progress: 60,
      color: 'secondary',
      icon: <SchoolIcon />,
      nextClass: 'بعد غد 2:00 م',
      pendingAssignments: 5
    },
    { 
      id: 3, 
      name: 'اللغة العربية', 
      students: 30, 
      assignments: 4,
      progress: 85,
      color: 'success',
      icon: <ClassIcon />,
      nextClass: 'الاثنين 11:00 ص',
      pendingAssignments: 2
    },
  ];

  const recentAnnouncements = [
    { 
      id: 1, 
      title: 'موعد الاختبار النهائي', 
      course: 'الرياضيات المتقدمة', 
      date: '2023-11-15',
      read: false
    },
    { 
      id: 2, 
      title: 'تم رفع الدرجات', 
      course: 'الفيزياء', 
      date: '2023-11-10',
      read: true
    },
  ];

  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <motion.div 
        initial="hidden"
        animate="show"
        variants={container}
      >
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

      {/* Stats Cards */}
      <DashboardSection 
        title="نظرة عامة" 
        subtitle="إحصائياتك التدريسية في لمحة"
      >
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <StatCard 
                title="المقررات" 
                value={stats.courses} 
                icon={<SchoolIcon />} 
                color="primary"
                trend="up"
                trendValue={1}
                trendLabel="من الشهر الماضي"
              />
            </motion.div>
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <StatCard 
                title="الطلاب" 
                value={stats.students} 
                icon={<GroupIcon />} 
                color="secondary"
                trend="up"
                trendValue={12}
                trendLabel="من الشهر الماضي"
              />
            </motion.div>
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <StatCard 
                title="الواجبات" 
                value={stats.assignments} 
                icon={<AssignmentIcon />} 
                color="info"
                trend="down"
                trendValue={2}
                trendLabel="من الشهر الماضي"
              />
            </motion.div>
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <motion.div variants={item}>
              <StatCard 
                title="متوسط التقييم" 
                value={stats.rating} 
                icon={<BarChartIcon />} 
                color="warning"
                trend="up"
                trendValue={0.5}
                trendLabel="من الشهر الماضي"
                valueSuffix={
                  <Box component="span" sx={{ color: 'warning.main', ml: 0.5 }}>★</Box>
                }
              />
            </motion.div>
          </Grid>
        </Grid>
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection 
        title="إجراءات سريعة" 
        subtitle="الوصول السريع للمهام الشائعة"
      >
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={3}>
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
          
          <Grid xs={12} sm={6} md={3}>
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
          
          <Grid xs={12} sm={6} md={3}>
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
          
          <Grid xs={12} sm={6} md={3}>
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
      </DashboardSection>

      {/* Recent Courses */}
      <DashboardSection 
        title="مقرراتي النشطة" 
        subtitle="إدارة فصولك الدراسية بسهولة"
        action={
          <Button 
            variant="outlined" 
            size="small" 
            endIcon={<TrendingUpIcon />}
            sx={{ borderRadius: 3 }}
          >
            عرض الكل
          </Button>
        }
      >
        <Grid container spacing={3}>
        {recentCourses.map((course) => (
          <Grid xs={12} md={6} lg={4} key={course.id}>
            <motion.div 
              variants={item}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <DashboardCard
                sx={{
                  '&::before': {
                    background: `radial-gradient(circle, ${theme.palette[course.color || 'primary'].main} 0%, transparent 70%)`,
                  },
                  '&:hover': {
                    '& .course-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box
                    className="course-icon"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme.palette.mode === 'dark'
                        ? alpha(theme.palette[course.color || 'primary'].main, 0.2)
                        : alpha(theme.palette[course.color || 'primary'].light, 0.3),
                      color: theme.palette[course.color || 'primary'].main,
                      transition: 'all 0.3s ease',
                      mr: 2,
                      '& svg': {
                        fontSize: '1.8rem'
                      }
                    }}
                  >
                    {course.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        {course.name}
                      </Typography>
                      <Chip 
                        label={`${course.students} طالب`} 
                        size="small" 
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          تقدم الطلاب
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {course.progress}%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        height: 6, 
                        borderRadius: 3, 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.grey[700], 0.5) 
                          : alpha(theme.palette.grey[300], 0.8),
                        overflow: 'hidden'
                      }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${course.progress}%`,
                            background: theme.palette.mode === 'dark'
                              ? `linear-gradient(90deg, ${theme.palette[course.color || 'primary'].dark}, ${theme.palette[course.color || 'primary'].main})`
                              : `linear-gradient(90deg, ${theme.palette[course.color || 'primary'].light}, ${theme.palette[course.color || 'primary'].main})`,
                            borderRadius: 3,
                            transition: 'width 0.6s ease, background 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2,
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`
                    }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          <ScheduleIcon sx={{ fontSize: '0.9rem', verticalAlign: 'middle', ml: 0.5 }} />
                          {course.nextClass}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${course.pendingAssignments} واجب قيد التصحيح`}
                        size="small"
                        color={course.pendingAssignments > 5 ? 'error' : 'warning'}
                        sx={{ 
                          height: 24,
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth
                    sx={{ 
                      borderRadius: 3,
                      fontWeight: 600,
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(45deg, ${theme.palette[course.color || 'primary'].dark}, ${theme.palette[course.color || 'primary'].main})`
                        : `linear-gradient(45deg, ${theme.palette[course.color || 'primary'].main}, ${theme.palette[course.color || 'primary'].light})`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px 0 ${alpha(theme.palette[course.color || 'primary'].main, 0.3)}`
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    إدارة المقرر
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ 
                      borderRadius: 3,
                      minWidth: 40,
                      px: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <MessageIcon fontSize="small" />
                  </Button>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
        ))}
        </Grid>
      </DashboardSection>
      
      {/* Student Progress */}
      <DashboardSection title="تقدم الطلاب" subtitle="تابع أداء طلابك">
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((student) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={student}>
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
                    {['أحمد', 'سارة', 'محمد', 'نورا'][student-1].charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {['أحمد محمد', 'سارة أحمد', 'محمد علي', 'نورا خالد'][student-1]}
                      </Typography>
                      <Chip 
                        label={['ممتاز', 'جيد جداً', 'جيد', 'مقبول'][student-1]}
                        size="small"
                        color={['success', 'info', 'warning', 'error'][student-1]}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={[92, 85, 78, 65][student-1]}
                        color={['success', 'info', 'warning', 'error'][student-1]}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          التقدم
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {[92, 85, 78, 65][student-1]}%
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
      </DashboardSection>

      {/* Upcoming Tasks & Announcements */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DashboardSection title="المهام القادمة" subtitle="مواعيدك الهامة">
              {[
                { id: 1, title: 'تصحيح واجب الرياضيات', due: 'غداً', priority: 'high', type: 'grading' },
                { id: 2, title: 'إعداد اختبار الفصل الثاني', due: 'بعد غد', priority: 'medium', type: 'preparation' },
                { id: 3, title: 'اجتماع أولياء الأمور', due: 'الخميس', priority: 'low', type: 'meeting' },
              ].map((task, index) => (
                <motion.div key={task.id} variants={item}>
                  <DashboardCard sx={{ mb: index < 2 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.light, 0.3),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {
                          task.type === 'grading' ? <AssignmentIcon fontSize="small" /> :
                          task.type === 'preparation' ? <SchoolIcon fontSize="small" /> :
                          <EventIcon fontSize="small" />
                        }
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {task.title}
                          </Typography>
                          <Chip 
                            label={task.due}
                            size="small"
                            color={
                              task.priority === 'high' ? 'error' :
                              task.priority === 'medium' ? 'warning' : 'info'
                            }
                            variant="outlined"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            الأولوية:
                          </Typography>
                          <Chip 
                            label={
                              task.priority === 'high' ? 'عاجل' :
                              task.priority === 'medium' ? 'متوسط' : 'منخفض'
                            }
                            size="small"
                            color={
                              task.priority === 'high' ? 'error' :
                              task.priority === 'medium' ? 'warning' : 'info'
                            }
                            sx={{ 
                              height: 18, 
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              '& .MuiChip-label': {
                                px: 0.5
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </DashboardCard>
                </motion.div>
              ))}
            </DashboardSection>
          </Grid>
          <Grid xs={12} md={6}>
            <DashboardSection 
              title="آخر الإعلانات" 
              subtitle="آخر المستجدات"
              action={
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<PersonAddIcon />}
                  sx={{ borderRadius: 3 }}
                >
                  إعلان جديد
                </Button>
              }
            >
              {recentAnnouncements.map((announcement) => (
                <motion.div key={announcement.id} variants={item}>
                  <AnnouncementCard announcement={announcement} />
                </motion.div>
              ))}
            </DashboardSection>
          </Grid>
        </Grid>
      </Box>
      </motion.div>
    </Box>
  );
};

export default TeacherDashboard;
