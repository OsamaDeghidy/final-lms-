import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, LinearProgress, useTheme, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DashboardCard, StatCard, DashboardSection, ProgressCard, ActivityItem, pulse } from './DashboardLayout';
import { School as SchoolIcon, Assignment as AssignmentIcon, 
  Event as EventIcon, Grade as GradeIcon, 
  MenuBook as MenuBookIcon, Quiz as QuizIcon, 
  EmojiEvents as BadgeIcon, Star as StarIcon,
  TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

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
  const [stats] = useState({
    courses: 5,
    assignments: 3,
    upcoming: 2,
    averageGrade: 'B+',
    streak: 7,
    points: 1245
  });

  const recentCourses = [
    { 
      id: 1, 
      name: 'الرياضيات المتقدمة', 
      progress: 75, 
      teacher: 'أ. أحمد محمد',
      icon: <TrendingUpIcon />,
      color: 'primary',
      lastActivity: 'منذ ساعتين',
      nextSession: 'غدًا 10:00 ص'
    },
    { 
      id: 2, 
      name: 'الفيزياء', 
      progress: 45, 
      teacher: 'د. سارة أحمد',
      icon: <SchoolIcon />,
      color: 'secondary',
      lastActivity: 'منذ يومين',
      nextSession: 'بعد غد 2:00 م'
    },
    { 
      id: 3, 
      name: 'اللغة العربية', 
      progress: 90, 
      teacher: 'أ. محمد علي',
      icon: <MenuBookIcon />,
      color: 'success',
      lastActivity: 'اليوم 9:00 ص',
      nextSession: 'الاثنين 11:00 ص'
    },
  ];

  const upcomingAssignments = [
    { 
      id: 1, 
      title: 'واجب الرياضيات', 
      course: 'الرياضيات المتقدمة', 
      dueDate: '2023-11-15', 
      type: 'assignment',
      priority: 'high',
      subject: 'math'
    },
    { 
      id: 2, 
      title: 'اختبار الفصل الثاني', 
      course: 'الفيزياء', 
      dueDate: '2023-11-20', 
      type: 'quiz',
      priority: 'medium',
      subject: 'physics'
    },
  ];

  const achievements = [
    { id: 1, title: 'المثابر', description: 'أكمل 5 أيام متتالية من التعلم', icon: <BadgeIcon />, progress: 100, color: 'warning' },
    { id: 2, title: 'الطموح', description: 'احصل على درجة A+ في أي مادة', icon: <StarIcon />, progress: 75, color: 'info' },
    { id: 3, title: 'المجتهد', description: 'أكمل 10 واجبات', icon: <CheckCircleIcon />, progress: 30, color: 'success' },
  ];

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

      {/* Stats Cards */}
      <DashboardSection 
        title="نظرة عامة" 
        subtitle="إحصائياتك الدراسية في لمحة"
      >
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div variants={item}>
            <StatCard 
              title="المقررات المسجلة" 
              value={stats.courses} 
              icon={<SchoolIcon />} 
              color="primary"
              trend="up"
              trendValue={12}
              trendLabel="من الشهر الماضي"
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div variants={item}>
            <StatCard 
              title="الواجبات المعلقة" 
              value={stats.assignments} 
              icon={<AssignmentIcon />} 
              color="warning"
              trend="down"
              trendValue={25}
              trendLabel="من الأسبوع الماضي"
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div variants={item}>
            <StatCard 
              title="المواعيد القادمة" 
              value={stats.upcoming} 
              icon={<EventIcon />} 
              color="info"
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div variants={item}>
            <StatCard 
              title="المعدل الحالي" 
              value={stats.averageGrade} 
              icon={<GradeIcon />} 
              color="success"
              trend="up"
              trendValue={5}
              trendLabel="من الترم الماضي"
            />
          </motion.div>
        </Grid>
      </DashboardSection>

      {/* Recent Courses */}
      <DashboardSection 
        title="مقرراتي النشطة" 
        subtitle="تابع تقدمك في المقررات"
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
        {recentCourses.map((course, index) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
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
                        label={`${course.progress}%`} 
                        size="small" 
                        color={course.progress > 80 ? 'success' : course.progress > 50 ? 'primary' : 'warning'}
                        sx={{ fontWeight: 600, minWidth: 60 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {course.teacher}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<EventIcon fontSize="small" />} 
                        label={`الجلسة القادمة: ${course.nextSession}`} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 2,
                          fontSize: '0.7rem',
                          '& .MuiChip-icon': {
                            marginLeft: 0,
                            marginRight: '4px !important'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">التقدم</Typography>
                    <Typography variant="caption" fontWeight={600}>{course.progress}%</Typography>
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
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ 
                      flex: 1, 
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
                    استمر في التعلم
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
                    <MenuBookIcon fontSize="small" />
                  </Button>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
        ))}
      </DashboardSection>

      {/* Achievements Section */}
      <DashboardSection 
        title="إنجازاتي" 
        subtitle="احصل على المزيد من النقاط والإنجازات"
      >
        {achievements.map((achievement, index) => (
          <Grid item xs={12} md={4} key={achievement.id}>
            <motion.div 
              variants={item}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <DashboardCard>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme.palette.mode === 'dark'
                        ? alpha(theme.palette[achievement.color].main, 0.2)
                        : alpha(theme.palette[achievement.color].light, 0.3),
                      color: theme.palette[achievement.color].main,
                      mr: 2,
                      '& svg': {
                        fontSize: '1.5rem'
                      }
                    }}
                  >
                    {achievement.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {achievement.progress}% مكتمل
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {achievement.progress}/100
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
                        width: `${achievement.progress}%`,
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(90deg, ${theme.palette[achievement.color].dark}, ${theme.palette[achievement.color].main})`
                          : `linear-gradient(90deg, ${theme.palette[achievement.color].light}, ${theme.palette[achievement.color].main})`,
                        borderRadius: 3,
                        transition: 'width 0.6s ease, background 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              </DashboardCard>
            </motion.div>
          </Grid>
        ))}
      </DashboardSection>

      {/* Upcoming Assignments */}
      <DashboardSection 
        title="المواعيد القادمة" 
        subtitle="لا تنسى مواعيد تسليم الواجبات والاختبارات"
        action={
          <Button 
            variant="text" 
            size="small" 
            endIcon={<EventIcon />}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent'
              }
            }}
          >
            عرض التقويم
          </Button>
        }
      >
        {upcomingAssignments.map((item, index) => (
          <Grid item xs={12} key={item.id}>
            <motion.div 
              variants={item}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <ActivityItem
                key={item.id}
                icon={item.type === 'quiz' ? <QuizIcon /> : <AssignmentIcon />}
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{item.title}</span>
                    <Chip 
                      label={item.type === 'quiz' ? 'اختبار' : 'واجب'}
                      size="small"
                      color={item.type === 'quiz' ? 'warning' : 'primary'}
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                    {item.priority === 'high' && (
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'error.main',
                          animation: `${pulse} 2s infinite`
                        }} 
                      />
                    )}
                  </Box>
                }
                description={`مقرر: ${item.course}`}
                time={item.dueDate}
                color={item.type === 'quiz' ? 'warning' : 'primary'}
                unread={index === 0}
              />
            </motion.div>
          </Grid>
        ))}
      </DashboardSection>
      
      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
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
                    {stats.streke}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      يوم
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                احرزت {stats.streke} أيام متتالية من التعلم! استمر في التقدم.
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
                  <GradeIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    النقاط
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                    {stats.points.toLocaleString()}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      نقطة
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                أنت في المرتبة 12 من أصل 150 طالبًا في مستواك.
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
                  <CheckCircleIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    معدل الإنجاز
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>
                    78%
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      من هدفك
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                أنجزت 12 من أصل 15 مهمة لهذا الأسبوع.
              </Typography>
            </DashboardCard>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  </Box>
  );
};

export default StudentDashboard;
