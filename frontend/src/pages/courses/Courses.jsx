import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  Container, 
  Grid, 
  TextField, 
  Typography, 
  Tabs, 
  Tab, 
  Avatar, 
  InputAdornment, 
  Skeleton,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Add, 
  Star, 
  StarBorder, 
  AccessTime, 
  People, 
  Category, 
  School,
  TrendingUp,
  NewReleases,
  Whatshot,
  CheckCircle,
  ShoppingCart,
  AddShoppingCart,
  Check
} from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';

// Animation variants
const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8
    }
  }
};

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
    '& .course-image': {
      transform: 'scale(1.08)',
    },
    '& .cart-button': {
      transform: 'scale(1.1) rotate(8deg)',
      '&::after': {
        transform: 'scale(1.2)',
        opacity: 0,
      }
    },
    '& .course-title': {
      color: theme.palette.primary.main,
    },
    '& .course-instructor': {
      transform: 'translateX(5px)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #e94560, #533483)',
    opacity: 0.8,
    transition: 'all 0.3s ease',
  },
}));

const CourseMedia = styled('div')(({ theme }) => ({
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
  overflow: 'hidden',
  borderRadius: '12px 12px 0 0',
  margin: '4px',
  '& .course-image': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  },
  '& .course-badge': {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    borderRadius: '20px',
    fontWeight: 600,
    padding: '6px 12px',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: 'rgba(255, 255, 255, 0.9)',
    color: theme.palette.primary.main,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
    zIndex: 1,
  },
}));

const CartButton = styled(IconButton)(({ theme, added }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: 3,
  backgroundColor: added ? theme.palette.success.main : 'rgba(255, 255, 255, 0.95)',
  color: added ? '#fff' : theme.palette.primary.main,
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: added ? theme.palette.success.dark : theme.palette.primary.main,
    color: '#fff',
    transform: 'scale(1.1) rotate(8deg)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '50%',
    border: `2px solid ${added ? theme.palette.success.main : theme.palette.primary.main}`,
    animation: added ? `${pulse} 1.5s infinite` : 'none',
    opacity: 0.7,
  },
  '& .cart-icon': {
    transition: 'transform 0.3s ease',
  },
  '&:hover .cart-icon': {
    transform: 'scale(1.2) rotate(-8deg)',
  },
}));

const CartBadge = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  backgroundColor: theme.palette.error.main,
  color: '#fff',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.65rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  animation: `${pulse} 2s infinite`,
}));

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const AnimatedBackground = styled('div')(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23e94560\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    opacity: 0.4,
    zIndex: 2,
    animation: `${pulse} 15s ease-in-out infinite`,
  },
}));

const FloatingShape = styled('div')({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #e94560, #533483)',
  filter: 'blur(60px)',  
  opacity: 0.15,
  zIndex: 1,
  animation: `${float} 15s ease-in-out infinite`,
  '&:nth-of-type(1)': {
    width: '300px',
    height: '300px',
    top: '10%',
    right: '10%',
    animationDelay: '0s',
  },
  '&:nth-of-type(2)': {
    width: '200px',
    height: '200px',
    bottom: '20%',
    right: '15%',
    animationDelay: '5s',
  },
  '&:nth-of-type(3)': {
    width: '250px',
    height: '250px',
    top: '30%',
    left: '15%',
    animationDelay: '7s',
    background: 'linear-gradient(45deg, #0f3460, #16213e)',
  },
});

const HeroSection = styled('div')(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  color: 'white',
  padding: '80px 0 60px',
  margin: '0 0 40px 0',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(233, 69, 96, 0.15) 0%, transparent 50%)',
    zIndex: 1,
    animation: `${pulse} 15s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23e94560\' fill-opacity=\'0.08\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    opacity: 0.6,
    zIndex: 2,
    animation: `${rotate} 120s linear infinite`,
  },
}));

// Floating shape styles are now defined in the keyframes section above

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  '& .search-input': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50px',
    padding: '12px 24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
      boxShadow: '0 0 0 2px rgba(30, 136, 229, 0.2)',
    },
  },
  '& .search-button': {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.palette.primary.main,
  },
}));

const CategoryChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'selected',
})(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: selected 
    ? alpha(theme.palette.primary.main, 0.1) 
    : theme.palette.background.paper,
  color: selected 
    ? theme.palette.primary.main 
    : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minHeight: '3.6em',
  fontWeight: 700,
  lineHeight: 1.3,
  marginBottom: '12px',
  color: theme.palette.text.primary,
  transition: 'color 0.3s ease'
}));

const InstructorInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: '12px',
  borderTop: '1px solid rgba(0,0,0,0.05)'
}));

const CourseMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  '& > *': {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1.5),
    '& svg': {
      fontSize: '1rem',
      marginLeft: theme.spacing(0.5)
    }
  }
}));

const AnimatedBackgroundComponent = () => (
  <AnimatedBackground>
    <FloatingShape />
    <FloatingShape style={{ width: '200px', height: '200px', bottom: '20%', right: '15%', animationDelay: '5s' }} />
    <FloatingShape style={{ width: '250px', height: '250px', top: '30%', left: '15%', animationDelay: '7s' }} />
  </AnimatedBackground>
);

const Courses = () => {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState({});
  // Animation will be handled by framer-motion's whileInView prop

  const categories = [
    { id: 'all', name: 'الكل', icon: <Category /> },
    { id: 'web', name: 'تطوير الويب', icon: <Category /> },
    { id: 'mobile', name: 'تطبيقات الموبايل', icon: <Category /> },
    { id: 'design', name: 'التصميم', icon: <Category /> },
    { id: 'marketing', name: 'التسويق', icon: <Category /> },
    { id: 'business', name: 'أعمال', icon: <Category /> },
    { id: 'photography', name: 'التصوير', icon: <Category /> },
  ];

  const filters = {
    category: activeCategory === 'all' ? '' : activeCategory,
    level: tabValue === 'all' ? '' : tabValue,
  };

  // Simulate API call to fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Enhanced mock data with more variety
        const mockCourses = [
          {
            id: 1,
            title: 'مقدمة في تطوير تطبيقات الويب',
            description: 'تعلم أساسيات تطوير تطبيقات الويب باستخدام أحدث التقنيات والأدوات.',
            image: 'https://source.unsplash.com/random/800x450?web,development',
            category: 'web',
            level: 'beginner',
            duration: '4 أسابيع',
            students: 2541,
            rating: 4.7,
            instructor: 'أحمد محمد',
            instructorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            price: 299,
            discountPrice: 199,
            isNew: true,
            isPopular: true,
            lessons: 42,
            language: 'العربية',
          },
          {
            id: 2,
            title: 'البرمجة المتقدمة بلغة جافا سكريبت',
            description: 'إتقان المفاهيم المتقدمة في جافا سكريبت وأنماط التصميم.',
            image: 'https://source.unsplash.com/random/800x450?javascript,code',
            category: 'web',
            level: 'advanced',
            duration: '6 أسابيع',
            students: 1892,
            rating: 4.8,
            instructor: 'سارة أحمد',
            instructorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            price: 399,
            lessons: 58,
            language: 'العربية',
          },
          {
            id: 3,
            title: 'أساسيات تصميم تجربة المستخدم UI/UX',
            description: 'تعلم مبادئ تصميم تجربة المستخدم وواجهات المستخدم الجذابة.',
            image: 'https://source.unsplash.com/random/800x450?design,ui,ux',
            category: 'design',
            level: 'beginner',
            duration: '3 أسابيع',
            students: 3567,
            rating: 4.6,
            instructor: 'محمد علي',
            instructorAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            price: 249,
            discountPrice: 199,
            isPopular: true,
            lessons: 35,
            language: 'العربية',
          },
          {
            id: 4,
            title: 'تطوير تطبيقات الهاتف باستخدام Flutter',
            description: 'أنشئ تطبيقات الهاتف المتكاملة لنظامي iOS و Android باستخدام Flutter.',
            image: 'https://source.unsplash.com/random/800x450?mobile,flutter',
            category: 'mobile',
            level: 'intermediate',
            duration: '5 أسابيع',
            students: 2983,
            rating: 4.9,
            instructor: 'نورا خالد',
            instructorAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
            price: 349,
            lessons: 47,
            language: 'العربية',
          },
          {
            id: 5,
            title: 'تعلم التسويق الرقمي من الصفر',
            description: 'أساسيات التسويق الرقمي وكيفية بناء استراتيجية تسويقية ناجحة.',
            image: 'https://source.unsplash.com/random/800x450?marketing,digital',
            category: 'marketing',
            level: 'beginner',
            duration: '4 أسابيع',
            students: 4123,
            rating: 4.5,
            instructor: 'خالد عبدالله',
            instructorAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            price: 279,
            isNew: true,
            lessons: 38,
            language: 'العربية',
          },
          {
            id: 6,
            title: 'تحليل البيانات باستخدام Python',
            description: 'تعلم تحليل البيانات وتصورها باستخدام مكتبات Python مثل Pandas و Matplotlib.',
            image: 'https://source.unsplash.com/random/800x450?python,data',
            category: 'business',
            level: 'intermediate',
            duration: '6 أسابيع',
            students: 1876,
            rating: 4.7,
            instructor: 'ليلى سعيد',
            instructorAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
            price: 329,
            lessons: 52,
            language: 'العربية',
          },
          {
            id: 7,
            title: 'التصوير الفوتوغرافي للمبتدئين',
            description: 'أساسيات التصوير الفوتوغرافي وتقنيات الإضاءة والتركيب.',
            image: 'https://source.unsplash.com/random/800x450?photography,camera',
            category: 'photography',
            level: 'beginner',
            duration: '3 أسابيع',
            students: 2987,
            rating: 4.8,
            instructor: 'عمر راشد',
            instructorAvatar: 'https://randomuser.me/api/portraits/men/28.jpg',
            price: 229,
            discountPrice: 179,
            lessons: 31,
            language: 'العربية',
          },
          {
            id: 8,
            title: 'تطوير تطبيقات الويب باستخدام React',
            description: 'تعلم بناء تطبيقات ويب تفاعلية باستخدام مكتبة React.',
            image: 'https://source.unsplash.com/random/800x450?react,web',
            category: 'web',
            level: 'intermediate',
            duration: '5 أسابيع',
            students: 3245,
            rating: 4.9,
            instructor: 'نورا محمد',
            instructorAvatar: 'https://randomuser.me/api/portraits/women/42.jpg',
            price: 379,
            isPopular: true,
            lessons: 49,
            language: 'العربية',
          },
        ];
        
        setCourses(mockCourses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesLevel = !filters.level || course.level === filters.level.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const toggleCartItem = (courseId) => {
    setCartItems(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const getLevelLabel = (level) => {
    switch(level.toLowerCase()) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Box sx={{ py: 8, px: { xs: 2, md: 4 } }}>
          <Container maxWidth="xl">
            <Grid container spacing={4}>
              {[1, 2, 3, 4].map((item) => (
                <Grid key={item} sx={{
                  width: { xs: '100%', sm: 'calc(50% - 32px)', md: 'calc(33.333% - 32px)', lg: 'calc(25% - 32px)' },
                  flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 32px)', md: '0 0 calc(33.333% - 32px)', lg: '0 0 calc(25% - 32px)' },
                  px: 2,
                  mb: 4
                }}>
                  <Card>
                    <Skeleton variant="rectangular" height={160} animation="wave" />
                    <CardContent>
                      <Skeleton width="80%" height={24} animation="wave" />
                      <Skeleton width="60%" height={20} animation="wave" sx={{ mt: 1 }} />
                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton width="40%" height={20} animation="wave" sx={{ mr: 1 }} />
                      </Box>
                      <Skeleton width="100%" height={40} animation="wave" sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AnimatedBackground>
        <FloatingShape />
        <FloatingShape style={{ width: '200px', height: '200px', bottom: '20%', right: '15%', animationDelay: '5s' }} />
        <FloatingShape style={{ width: '250px', height: '250px', top: '30%', left: '15%', animationDelay: '7s' }} />
      </AnimatedBackground>
      <Header />
      
      {/* Hero Section */}
      <HeroSection>
        {/* Animated Background Elements */}
        <FloatingShape style={{ width: '300px', height: '300px', top: '-100px', right: '-100px', animationDelay: '0s' }} />
        <FloatingShape style={{ width: '200px', height: '200px', bottom: '-50px', right: '20%', animationDelay: '2s', animationDuration: '15s' }} />
        <FloatingShape style={{ width: '400px', height: '400px', bottom: '-200px', left: '-150px', animationDelay: '4s', animationDuration: '20s' }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ 
              textAlign: 'center', 
              py: 10,
              position: 'relative',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(40px)',
                zIndex: -1,
              },
              '&::before': {
                top: '20%',
                left: '10%',
                animation: `${pulse} 8s ease-in-out infinite`,
              },
              '&::after': {
                bottom: '10%',
                right: '15%',
                animation: `${pulse} 10s ease-in-out infinite reverse`,
              }
            }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 3,
                  background: 'linear-gradient(90deg, #fff, #e94560)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                اكتشف دوراتنا التعليمية
              </Typography>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    maxWidth: '700px', 
                    mx: 'auto', 
                    mb: 4,
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    lineHeight: 1.6,
                    fontWeight: 300,
                    textShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  تعلم المهارات الجديدة وتقدم في مسيرتك المهنية مع دوراتنا المتنوعة والمتخصصة
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="ابحث عن دورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '50px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                        boxShadow: '0 0 0 2px rgba(233, 69, 96, 0.5)',
                      },
                      paddingRight: '20px',
                    },
                    '& .MuiInputBase-input': {
                      padding: '15px 24px',
                      fontSize: '1rem',
                      '&::placeholder': {
                        opacity: 0.7,
                        color: theme.palette.text.secondary,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', ml: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </HeroSection>
      
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flex: 1, py: 6, position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" component="h2" fontWeight={700}>
              {activeCategory === 'all' ? 'جميع الدورات' : `دورات ${categories.find(c => c.id === activeCategory)?.name}`}
              {searchTerm && `: نتائج البحث عن "${searchTerm}"`}
            </Typography>
            
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
                '& .MuiTab-root': {
                  minHeight: 36,
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontWeight: 500,
                  minWidth: 'auto',
                  '&.Mui-selected': {
                    color: 'white',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <Tab value="all" label="الكل" />
              <Tab value="beginner" label="مبتدئ" icon={<School fontSize="small" />} iconPosition="start" />
              <Tab value="intermediate" label="متوسط" icon={<TrendingUp fontSize="small" />} iconPosition="start" />
              <Tab value="advanced" label="متقدم" icon={<Whatshot fontSize="small" />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {filteredCourses.length > 0 ? (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { 
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)' 
              },
              gap: 3,
              width: '100%'
            }}>
              {filteredCourses.map((course, index) => (
                <Box key={course.id} sx={{ width: '100%' }}>
                  <motion.div
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={cardVariants}
                    style={{ height: '100%' }}
                  >
                    <StyledCard elevation={0} component={Link} to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <CourseMedia>
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="course-image"
                        />
                        {course.isNew && (
                          <Chip 
                            label="جديد" 
                            color="primary" 
                            size="small" 
                            className="course-badge"
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {course.isPopular && (
                          <Chip 
                            label="الأكثر شعبية" 
                            color="secondary" 
                            size="small" 
                            className="course-badge"
                            sx={{ 
                              bgcolor: 'secondary.main',
                              color: 'white',
                              fontWeight: 600,
                              top: course.isNew ? 50 : 16,
                            }}
                          />
                        )}
                        <CartButton 
                          className="cart-button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCartItem(course.id);
                          }}
                          added={cartItems[course.id]}
                        >
                          {cartItems[course.id] ? (
                            <Check className="cart-icon" />
                          ) : (
                            <AddShoppingCart className="cart-icon" />
                          )}
                          {!cartItems[course.id] && <CartBadge>+</CartBadge>}
                        </CartButton>
                      </CourseMedia>
                      
                      <CardContent sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        flexGrow: 1,
                        p: 3,
                      }}>
                        <Box sx={{ mb: 1.5 }}>
                          <Chip 
                            label={getLevelLabel(course.level)}
                            size="small"
                            color={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'error'}
                            sx={{ 
                              mb: 1.5,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                          <CourseTitle variant="h6" component="h3" gutterBottom>
                            {course.title}
                          </CourseTitle>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minHeight: '2.8em',
                              lineHeight: '1.4',
                            }}
                          >
                            {course.description}
                          </Typography>
                        </Box>
                        
                        <InstructorInfo>
                          <Avatar 
                            src={course.instructorAvatar} 
                            alt={course.instructor}
                            sx={{ width: 32, height: 32, ml: 1.5 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              المدرب
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={500}>
                              {course.instructor}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Star color="warning" fontSize="small" sx={{ ml: 0.5 }} />
                              <Typography variant="body2" fontWeight={600}>
                                {course.rating.toFixed(1)}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              ({course.students.toLocaleString()})
                            </Typography>
                          </Box>
                        </InstructorInfo>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <CourseMeta>
                            <Box>
                              <AccessTime fontSize="small" />
                              <Typography variant="caption" sx={{ mr: 0.5 }}>
                                {course.duration}
                              </Typography>
                            </Box>
                            <Box>
                              <People fontSize="small" />
                              <Typography variant="caption" sx={{ mr: 0.5 }}>
                                {course.students.toLocaleString()}
                              </Typography>
                            </Box>
                          </CourseMeta>
                          
                          <Box sx={{ textAlign: 'left' }}>
                            {course.discountPrice ? (
                              <>
                                <Typography variant="body2" color="error" sx={{ textDecoration: 'line-through', opacity: 0.7, fontSize: '0.8rem' }}>
                                  {course.price} ر.س
                                </Typography>
                                <Typography variant="h6" color="primary" sx={{ lineHeight: 1, mt: -0.5 }}>
                                  {course.discountPrice} ر.س
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="h6" color="primary">
                                {course.price} ر.س
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </motion.div>
                </Box>
              ))}
            </Box>
          ) : (
            <Box 
              textAlign="center" 
              py={8} 
              sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ maxWidth: 400, margin: '0 auto' }}>
                <School sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  لا توجد دورات متطابقة مع بحثك
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  لا يمكننا العثور على أي دورات تطابق معايير البحث الخاصة بك. حاول تغيير الفلتر أو مسح عوامل التصفية للعثور على ما تبحث عنه.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                    setTabValue('all');
                  }}
                  startIcon={<FilterList />}
                  sx={{ mt: 2 }}
                >
                  مسح كل الفلاتر
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default Courses;
