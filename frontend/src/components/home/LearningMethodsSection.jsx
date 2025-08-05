import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  useTheme, 
  useMediaQuery, 
  styled,
  keyframes,
  Fade,
  Grow
} from '@mui/material';
import { 
  Code, 
  School, 
  MenuBook, 
  ChevronLeft, 
  ChevronRight,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 0),
  background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(74, 108, 247, 0.07) 0%, rgba(139, 92, 246, 0.07) 100%)',
    top: '-250px',
    right: '-250px',
    zIndex: 0,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(8, 0),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(90deg, #4A6CF7 0%, #8B5CF6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '2.5rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  maxWidth: '700px',
  margin: '0 auto',
  marginBottom: theme.spacing(6),
  fontSize: '1.1rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    padding: theme.spacing(0, 2),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
    gap: theme.spacing(1),
    background: 'rgba(255, 255, 255, 0.7)',
    padding: theme.spacing(1.5, 2),
    borderRadius: '50px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: 'fit-content',
    margin: '0 auto',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    minWidth: 'auto',
    padding: theme.spacing(1, 3),
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: theme.palette.primary.main,
      transform: 'translateY(-2px)',
    },
    '&.Mui-selected': {
      color: '#fff',
      background: 'linear-gradient(90deg, #4A6CF7 0%, #8B5CF6 100%)',
      boxShadow: '0 4px 15px rgba(74, 108, 247, 0.3)',
    },
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiTabs-flexContainer': {
      padding: theme.spacing(1),
    },
    '& .MuiTab-root': {
      fontSize: '0.85rem',
      padding: theme.spacing(0.5, 1.5),
    },
  },
}));

const MethodCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'delay',
})(({ theme, delay = 0 }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.03)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
    '& .card-hover-effect': {
      opacity: 1,
      transform: 'scale(1.03)',
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: 'linear-gradient(90deg, #4A6CF7 0%, #8B5CF6 100%)',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
  },
  animation: `${floatAnimation} 6s ease-in-out infinite`,
  animationDelay: `${delay * 0.2}s`,
  opacity: 1,
}));

const MethodHeader = styled(Box)(({ theme, bgcolor }) => ({
  padding: theme.spacing(2.5, 3),
  background: 'linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
  },
  '& .MuiSvgIcon-root': {
    marginLeft: theme.spacing(1.5),
    fontSize: '2.2rem',
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '8px',
  },
  '& h3': {
    position: 'relative',
    zIndex: 1,
    margin: 0,
    fontWeight: 700,
    fontSize: '1.1rem',
  },
}));

const MethodContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  background: '#fff',
  borderRadius: '0 0 20px 20px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  '& h3': {
    marginTop: 0,
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  '& p': {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    minHeight: '72px',
    lineHeight: 1.7,
    fontSize: '0.95rem',
  },
  '& ul': {
    paddingRight: '20px',
    margin: '12px 0',
    '& li': {
      marginBottom: '8px',
      position: 'relative',
      paddingRight: '24px',
      '&:before': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: '8px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: theme.palette.primary.main,
      },
    },
  },
}));

const MethodFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 3, 3, 3),
  marginTop: 'auto',
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.3px',
    padding: '10px 24px',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    border: `1.5px solid ${theme.palette.primary.light}`,
    '&:hover': {
      backgroundColor: 'rgba(74, 108, 247, 0.04)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(74, 108, 247, 0.1)',
      borderColor: theme.palette.primary.main,
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(74, 108, 247, 0.1)',
    },
    '& .MuiButton-endIcon': {
      transition: 'transform 0.3s ease',
      marginRight: theme.spacing(0.5),
      marginLeft: 0,
    },
    '&:hover .MuiButton-endIcon': {
      transform: 'translateX(-4px)'
    },
    '& span': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
    },
  },
  '& .MuiTypography-body2': {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    '& svg': {
      color: theme.palette.primary.main,
      fontSize: '1rem',
    },
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const LearningMethodsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Sample data for each tab
  const howTos = [
    {
      id: 1,
      title: 'كيفية إنشاء قاعدة في جدار حماية Windows',
      description: 'تعلم كيفية إنشاء قاعدة جدار حماية مخصصة في نظام Windows لحماية جهازك.',
      category: 'شبكات',
      level: 'متوسط',
      icon: <Code />,
      bgColor: '#4A6CF7',
    },
    {
      id: 2,
      title: 'كيفية استخدام ListView.builder',
      description: 'دليل شامل لاستخدام ListView.builder في Flutter لإنشاء قوائم فعالة.',
      category: 'برمجة',
      level: 'مبتدئ',
      icon: <School />,
      bgColor: '#8B5CF6',
    },
    {
      id: 3,
      title: 'كيفية إنشاء Dashboard في Tableau',
      description: 'تعلم إنشاء لوحات تحكم تفاعلية باستخدام Tableau لتحليل البيانات.',
      category: 'تحليل بيانات',
      level: 'متقدم',
      icon: <MenuBook />,
      bgColor: '#6C63FF',
    },
  ];

  const courses = [
    {
      id: 1,
      title: 'أساسيات الأمن السيبراني',
      description: 'تعلم أساسيات الأمن السيبراني وكيفية حماية أنظمتك من الاختراقات.',
      duration: '10 ساعات',
      lessons: 24,
      level: 'مبتدئ',
      icon: <Code />,
      bgColor: '#4A6CF7',
    },
    {
      id: 2,
      title: 'تعلم Flutter من الصفر',
      description: 'دورة شاملة لتعلم Flutter لتطوير تطبيقات الجوال.',
      duration: '30 ساعة',
      lessons: 45,
      level: 'متوسط',
      icon: <School />,
      bgColor: '#8B5CF6',
    },
    {
      id: 3,
      title: 'تحليل البيانات باستخدام Python',
      description: 'تعلم تحليل البيانات باستخدام مكتبات Python مثل Pandas و NumPy.',
      duration: '20 ساعة',
      lessons: 35,
      level: 'متقدم',
      icon: <MenuBook />,
      bgColor: '#6C63FF',
    },
  ];

  const paths = [
    {
      id: 1,
      title: 'مسار تطوير تطبيقات الجوال',
      description: 'احترف تطوير تطبيقات الجوال من الصفر وحتى الاحتراف.',
      courses: 8,
      duration: '6 أشهر',
      level: 'مبتدئ - متقدم',
      icon: <Code />,
      bgColor: '#4A6CF7',
    },
    {
      id: 2,
      title: 'مسار علم البيانات',
      description: 'احترف تحليل البيانات وتعلم الآلة من البداية وحتى الاحتراف.',
      courses: 12,
      duration: '9 أشهر',
      level: 'متوسط - متقدم',
      icon: <School />,
      bgColor: '#8B5CF6',
    },
    {
      id: 3,
      title: 'مسار أمن المعلومات',
      description: 'تعلم أساسيات أمن المعلومات والاختراق الأخلاقي.',
      courses: 6,
      duration: '4 أشهر',
      level: 'مبتدئ - متوسط',
      icon: <MenuBook />,
      bgColor: '#6C63FF',
    },
  ];

  const renderHowTos = () => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      gap: 3,
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      px: 3,
      '& > *': {
        display: 'flex',
        height: '100%',
      }
    }}>
      {howTos.map((item, index) => (
        <Box key={item.id} sx={{ width: '100%' }}>
          <Grow in={true} timeout={index * 200}>
            <Box>
              <MethodCard delay={index}>
                <MethodHeader bgcolor={item.bgColor}>
                  {React.cloneElement(item.icon, { style: { color: '#fff' } })}
                  <Typography variant="h6" component="h3">
                    {item.category}
                  </Typography>
                </MethodHeader>
                <MethodContent>
                  <Typography variant="h6" component="h3">
                    {item.title}
                  </Typography>
                  <Typography variant="body2">{item.description}</Typography>
                </MethodContent>
                <MethodFooter>
                  <Typography variant="body2">
                    <CheckCircle fontSize="small" />
                    {item.level}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForward />}
                    disableRipple
                    disableTouchRipple
                    sx={{
                      minWidth: '140px',
                      '&:hover': {
                        backgroundColor: 'rgba(74, 108, 247, 0.05)',
                      },
                      '&:active': {
                        transform: 'none !important',
                        boxShadow: 'none !important'
                      },
                      '& .MuiTouchRipple-root': {
                        display: 'none !important'
                      },
                      '&:focus': {
                        transform: 'scale(1) !important',
                      },
                    }}
                  >
                    اقرأ المزيد
                  </Button>
                </MethodFooter>
              </MethodCard>
            </Box>
          </Grow>
        </Box>
      ))}
    </Box>
  );

  const renderCourses = () => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      gap: 3,
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      px: 3
    }}>
      {courses.map((course, index) => (
        <Box key={course.id} sx={{ width: '100%' }}>
          <Grow in={true} timeout={index * 200}>
            <Box>
              <MethodCard delay={index}>
                <MethodHeader bgcolor={course.bgColor}>
                  {React.cloneElement(course.icon, { style: { color: '#fff' } })}
                  <Typography variant="h6" component="h3">
                    {course.duration}
                  </Typography>
                </MethodHeader>
                <MethodContent>
                  <Typography variant="h6" component="h3">
                    {course.title}
                  </Typography>
                  <Typography variant="body2">{course.description}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Box sx={{
                      bgcolor: 'rgba(74, 108, 247, 0.1)',
                      color: 'primary.main',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {course.lessons} درس
                    </Box>
                    <Box sx={{
                      bgcolor: 'rgba(139, 92, 246, 0.1)',
                      color: 'secondary.main',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {course.level}
                    </Box>
                  </Box>
                </MethodContent>
                <MethodFooter>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disableRipple
                    disableTouchRipple
                    endIcon={<ArrowForward />}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(74, 108, 247, 0.05)',
                      },
                      '&:active': {
                        transform: 'none !important',
                        boxShadow: 'none !important'
                      },
                      '& .MuiTouchRipple-root': {
                        display: 'none !important'
                      },
                      '&:focus': {
                        transform: 'scale(1) !important',
                      },
                    }}
                  >
                    سجل الآن
                  </Button>
                </MethodFooter>
              </MethodCard>
            </Box>
          </Grow>
        </Box>
      ))}
    </Box>
  );

  const renderPaths = () => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      gap: 3,
      width: '100%',
      maxWidth: '1400px',
      mx: 'auto',
      px: 3
    }}>
      {paths.map((path, index) => (
        <Box key={path.id} sx={{ width: '100%' }}>
          <Grow in={true} timeout={index * 200}>
            <Box>
              <MethodCard delay={index}>
                <MethodHeader bgcolor={path.bgColor}>
                  {React.cloneElement(path.icon, { style: { color: '#fff' } })}
                  <Typography variant="h6" component="h3">
                    {path.duration}
                  </Typography>
                </MethodHeader>
                <MethodContent>
                  <Typography variant="h6" component="h3">
                    {path.title}
                  </Typography>
                  <Typography variant="body2">{path.description}</Typography>
                  <Box mt={2}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 1.5,
                      '& > *': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        '& svg': {
                          fontSize: '1rem',
                        }
                      }
                    }}>
                      <Box sx={{ color: 'primary.main' }}>
                        <School fontSize="small" />
                        {path.courses} دورات
                      </Box>
                      <Box sx={{ 
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        bgcolor: 'divider',
                      }} />
                      <Box sx={{ color: 'secondary.main' }}>
                        <MenuBook fontSize="small" />
                        {path.level}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <CheckCircle color="primary" fontSize="small" />
                        المهارات المكتسبة:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: '24px' }}>
                        <li>مهارة أولى في المجال</li>
                        <li>مهارة متوسطة المستوى</li>
                        <li>مهارة متقدمة احترافية</li>
                      </ul>
                    </Box>
                  </Box>
                </MethodContent>
                <MethodFooter>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disableRipple
                    disableTouchRipple
                    endIcon={<ArrowForward />}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(74, 108, 247, 0.05)',
                      },
                      '&:active': {
                        transform: 'none !important',
                        boxShadow: 'none !important'
                      },
                      '& .MuiTouchRipple-root': {
                        display: 'none !important'
                      }
                    }}
                  >
                    ابدأ المسار
                  </Button>
                </MethodFooter>
              </MethodCard>
            </Box>
          </Grow>
        </Box>
      ))}
    </Box>
  );

  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 1, mb: 8 }}>
          <SectionTitle 
            variant="h2" 
            component="h2"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            أساليب تعليمية مبتكرة
          </SectionTitle>
          <SectionSubtitle 
            data-aos="fade-up"
            data-aos-delay="200"
          >
            اكتشف طرق تعلم جديدة ومبتكرة تناسب احتياجاتك وتواكب متطلبات سوق العمل
          </SectionSubtitle>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={500}>
            <Box>
              <StyledTabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="learning methods tabs"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Code fontSize="small" />
                      <span>كيفية</span>
                    </Box>
                  } 
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School fontSize="small" />
                      <span>دورات</span>
                    </Box>
                  } 
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MenuBook fontSize="small" />
                      <span>مسارات</span>
                    </Box>
                  } 
                  iconPosition="start"
                />
              </StyledTabs>

              <Box mt={2}>
                <TabPanel value={value} index={0}>
                  {renderHowTos()}
                </TabPanel>
                <TabPanel value={value} index={1}>
                  {renderCourses()}
                </TabPanel>
                <TabPanel value={value} index={2}>
                  {renderPaths()}
                </TabPanel>
              </Box>
            </Box>
          </Fade>
        </Box>

        <Box mt={8} textAlign="center" data-aos="fade-up" data-aos-delay="400">
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={theme.direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
            sx={{
              background: 'linear-gradient(90deg, #4A6CF7 0%, #8B5CF6 100%)',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 10px 20px rgba(74, 108, 247, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 25px rgba(74, 108, 247, 0.3)',
                background: 'linear-gradient(90deg, #3a5bd9 0%, #7b4ad9 100%)',
              },
            }}
          >
            {value === 0 ? 'تصفح جميع الكيفيات' : value === 1 ? 'استكشف جميع الدورات' : 'اكتشف جميع المسارات'}
          </Button>
        </Box>
      </Container>
    </SectionContainer>
  );
};

export default LearningMethodsSection;
