import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Breadcrumbs, 
  Chip, 
  Avatar, 
  Rating, 
  LinearProgress, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  IconButton, 
  Card, 
  CardContent, 
  CardMedia, 
  Divider, 
  Fab 
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Star as StarIcon, 
  StarBorder, 
  AccessTime, 
  PeopleAltOutlined, 
  CheckCircleOutline, 
  KeyboardArrowDown, 
  KeyboardArrowUp, 
  PlayCircleOutline, 
  DescriptionOutlined, 
  Favorite, 
  FavoriteBorder, 
  BookmarkBorder, 
  Bookmark as BookmarkAdded, 
  Share, 
  ShoppingCart, 
  ArrowBack,
  Check as CheckIcon,
  Article as ArticleIcon,
  Download as DownloadIcon,
  Language as LanguageIcon,
  MobileFriendly as MobileFriendlyIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  CheckCircle,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Instagram,
  ClosedCaption as ClosedCaptionIcon,
  Assignment as AssignmentIcon,
  Videocam as VideocamIcon,
  Code as CodeIcon,
  Quiz as QuizIcon,
  EmojiEvents as EmojiEventsIcon,
  AccessTime as AccessTimeFilledIcon,
  CalendarToday as CalendarTodayIcon,
  InsertDriveFile as InsertDriveFileIcon,
  OndemandVideo as VideoIcon,
  ExpandMore,
  ExpandLess,
  BookmarkAdd,
  AccessAlarm,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Quiz as QuizIconFilled,
  Info as InfoIcon,
  SupportAgent
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Animation keyframes
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

// Styled Components
const StyledBreadcrumb = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  backgroundColor: 'transparent',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: theme.palette.primary.dark,
      textDecoration: 'underline',
    },
  },
  '& .MuiBreadcrumbs-separator': {
    margin: theme.spacing(0, 0.5),
    color: theme.palette.text.secondary,
  },
}));

const TabPanel = styled('div')(({ theme }) => ({
  padding: theme.spacing(3, 0),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-scroller': {
    overflow: 'auto !important',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  '& .MuiTabs-indicator': {
    height: 4,
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiTab-root': {
      minWidth: 'auto',
      padding: theme.spacing(1, 2),
      fontSize: '0.8rem',
    },
  },
}));

const HeroSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(6, 0, 12, 0),
  background: `linear-gradient(
    -45deg, 
    ${theme.palette.primary.main}, 
    ${theme.palette.primary.dark}, 
    ${theme.palette.secondary.main}, 
    ${theme.palette.primary.dark}, 
    ${theme.palette.primary.main}
  )`,
  backgroundSize: '400% 400%',
  animation: `${gradientAnimation} 15s ease infinite`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    opacity: 0.3,
  },
}));

const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  minHeight: 400,
  [theme.breakpoints.down('md')]: {
    minHeight: 300,
    textAlign: 'center',
    alignItems: 'center',
  },
}));

const CourseHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  transition: 'all 0.3s ease-in-out',
  padding: theme.spacing(0, 2),
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: theme.spacing(2),
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const CourseSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 400,
  marginBottom: theme.spacing(3),
  opacity: 0.9,
  maxWidth: '800px',
}));

const CourseMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  '& > *': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1.25),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius * 2,
    '& svg': {
      marginRight: theme.spacing(0.75),
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transition: 'all 0.2s ease-in-out',
    },
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.25),
    '& > *': {
      padding: theme.spacing(0.4, 1),
      fontSize: '0.875rem',
    },
  },
}));

const RatingBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-1px)',
  },
  '& .MuiRating-root': {
    marginRight: theme.spacing(0.5),
    color: theme.palette.warning.main,
    '& .MuiRating-iconFilled': {
      color: theme.palette.warning.main,
    },
    '& .MuiRating-iconHover': {
      color: theme.palette.warning.dark,
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.4, 1.25),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[8], // Stronger shadow for depth
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  display: 'flex',
  flexDirection: 'column',
  height: 'auto', // Changed to auto for better content fit
  marginRight: { lg: 0 }, // Ensure it's on the right edge
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.light,
    '& .course-image': {
      transform: 'scale(1.03)',
    },
    '& .course-title': {
      color: theme.palette.primary.main,
    },
  },
}));

const ModuleCard = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.light,
  },
  '&.Mui-expanded': {
    margin: theme.spacing(2, 0),
    backgroundColor: theme.palette.action.hover,
  },
}));

const ModuleHeader = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-expanded': {
    backgroundColor: theme.palette.action.selected,
    borderBottom: `1px solid ${theme.palette.primary.light}`,
    '& .module-title': {
      color: theme.palette.primary.main,
    },
    '& .module-icon': {
      transform: 'rotate(180deg)',
      color: theme.palette.primary.main,
    },
  },
}));

const LessonItem = styled(ListItem)(({ theme, completed, preview }) => ({
  padding: theme.spacing(1.5, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    paddingLeft: theme.spacing(3.5),
    '& .lesson-play-icon': {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  ...(completed && {
    backgroundColor: theme.palette.success.light + '15',
    '& .MuiListItemIcon-root': {
      color: theme.palette.success.main,
    },
    '&:hover': {
      backgroundColor: theme.palette.success.light + '25',
    },
  }),
  ...(preview && {
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    '& .preview-badge': {
      backgroundColor: theme.palette.primary.light + '20',
      color: theme.palette.primary.dark,
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: '0.7rem',
      fontWeight: 600,
      marginLeft: 8,
    },
  }),
}));

const EnrollButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  marginBottom: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${theme.palette.primary.light}80`,
    animation: `${pulse} 1.5s infinite`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25, 3),
    fontSize: '1rem',
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  },
}));

const InstructorCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4, 3),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const StickySidebar = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(-15), // Raise up more
  zIndex: 10,
  [theme.breakpoints.up('lg')]: {
    position: 'sticky',
    top: theme.spacing(4), // Lower the sticky position
    marginTop: theme.spacing(-18), // Raise up more on large screens
  },
  [theme.breakpoints.down('lg')]: {
    marginTop: theme.spacing(4),
  },
}));

const PriceWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: theme.spacing(2, 0),
  '& .original-price': {
    textDecoration: 'line-through',
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1.5),
  },
  '& .discount-badge': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    padding: theme.spacing(0.25, 1),
    borderRadius: theme.shape.borderRadius,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
}));

const FloatingActionButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1000,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[8],
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

// Skeleton animation keyframes
const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const SkeletonPulse = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
}));

const CourseSkeleton = () => (
  <Box sx={{ py: 4 }}>
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid xs={12} lg={8}>
          <SkeletonPulse variant="rectangular" width="100%" height={400} sx={{ mb: 3, borderRadius: 2 }} />
          <Box sx={{ mb: 4 }}>
            <SkeletonPulse variant="text" width="60%" height={40} sx={{ mb: 2 }} />
            <SkeletonPulse variant="text" width="90%" height={24} sx={{ mb: 1 }} />
            <SkeletonPulse variant="text" width="80%" height={24} sx={{ mb: 3 }} />
            <SkeletonPulse variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
          </Box>
          <Tabs value={0} sx={{ mb: 3 }}>
            {['Overview', 'Curriculum', 'Instructor', 'Reviews', 'FAQs'].map((tab) => (
              <Tab key={tab} label={tab} sx={{ minWidth: 'auto' }} />
            ))}
          </Tabs>
          <SkeletonPulse variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid xs={12} lg={4}>
          <SkeletonPulse variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const courseContentRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Handle scroll for header and sidebar visibility
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 200) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Show/hide mobile sidebar button based on scroll position
      if (courseContentRef.current) {
        const contentRect = courseContentRef.current.getBoundingClientRect();
        if (contentRect.top < 100 && contentRect.bottom > window.innerHeight) {
          setSidebarVisible(true);
        } else {
          setSidebarVisible(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };
  
  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Toggle mobile sidebar
  const toggleSidebar = () => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Mock FAQ data
  const mockFAQs = [
    {
      question: 'How do I access my course after purchasing?',
      answer: 'After purchasing, you can access your course immediately by going to "My Learning" in your account. The course will be available there for lifetime access.'
    },
    {
      question: 'Do you offer a certificate of completion?',
      answer: 'Yes, you will receive a certificate of completion once you finish all the course content and pass any required assessments.'
    },
    {
      question: 'Can I download the course videos?',
      answer: 'For copyright and licensing reasons, we do not allow downloading of course videos. However, you can access them anytime through our platform with an internet connection.'
    },
    {
      question: 'What if I need help during the course?',
      answer: 'You can ask questions in the course discussion area where the instructor and other students can help. For technical issues, our support team is available 24/7.'
    },
    {
      question: 'Is there a money-back guarantee?',
      answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with the course for any reason.'
    }
  ];

  // Mock data for the course with enhanced details
  const mockCourse = {
    id: id,
    title: 'Advanced React and Redux',
    subtitle: 'Master Modern React, Hooks, Context, Redux, and More',
    instructor: 'Jane Smith',
    instructorTitle: 'Senior Frontend Engineer at Tech Corp',
    instructorBio: '10+ years of experience in building scalable web applications. Specialized in React, TypeScript, and state management solutions. Previously worked at Google and Facebook.',
    instructorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    instructorRating: 4.9,
    instructorStudents: 12500,
    instructorCourses: 8,
    bannerImage: 'https://source.unsplash.com/random/1600x500?programming,react',
    thumbnail: 'https://source.unsplash.com/random/400x225?programming,react',
    description: 'Take your React skills to the next level with advanced concepts and best practices for building scalable applications.',
    longDescription: `This comprehensive course dives deep into advanced React patterns, modern state management with Redux Toolkit, performance optimization techniques, and testing strategies. You'll build real-world applications and learn from practical examples that you can apply immediately in your projects.
    
    What makes this course special:
    • Hands-on projects that mirror real-world scenarios
    • In-depth coverage of React 18+ features
    • Performance optimization techniques used by industry experts
    • Best practices for scalable application architecture`,
    category: 'Web Development',
    level: 'Advanced',
    duration: '8 weeks',
    totalHours: 35,
    lectures: 125,
    resources: 45,
    students: 1542,
    rating: 4.8,
    reviews: 243,
    price: 99.99,
    originalPrice: 199.99,
    discount: 50,
    isBestseller: true,
    lastUpdated: 'June 2023',
    language: 'English',
    captions: ['English', 'Spanish', 'French'],
    features: [
      'Full lifetime access',
      'Access on mobile and TV',
      'Certificate of completion',
      '30-day money-back guarantee',
      'Downloadable resources',
      'Assignments & quizzes'
    ],
    isEnrolled: false,
    modules: [
      {
        id: 1,
        title: 'Getting Started with Advanced React',
        description: 'Set up your development environment and understand the core concepts',
        duration: '2h 45m',
        lessons: [
          { id: 1, title: 'Introduction to Advanced React', duration: '15:30', isPreview: true, completed: true, type: 'video' },
          { id: 2, title: 'Setting Up Your Development Environment', duration: '12:45', isPreview: true, completed: true, type: 'video' },
          { id: 3, title: 'React 18+ New Features Overview', duration: '18:20', isPreview: false, completed: false, type: 'video' },
          { id: 4, title: 'Project Setup and Configuration', duration: '22:10', isPreview: false, completed: false, type: 'video' },
          { id: 5, title: 'Course Resources and Tools', duration: '08:30', isPreview: true, completed: false, type: 'article' },
        ],
      },
      {
        id: 2,
        title: 'Advanced React Patterns',
        description: 'Master advanced React patterns and best practices',
        duration: '4h 15m',
        lessons: [
          { id: 6, title: 'Render Props Pattern', duration: '22:10', isPreview: true, completed: false, type: 'video' },
          { id: 7, title: 'Higher-Order Components (HOCs)', duration: '18:30', isPreview: true, completed: false, type: 'video' },
          { id: 8, title: 'Context API Deep Dive', duration: '20:15', isPreview: false, completed: false, type: 'video' },
          { id: 9, title: 'Compound Components Pattern', duration: '25:40', isPreview: false, completed: false, type: 'video' },
          { id: 10, title: 'React Hooks Custom Hooks', duration: '28:20', isPreview: false, completed: false, type: 'video' },
          { id: 11, title: 'Practical Exercise: Building a Modal Component', duration: '15:00', isPreview: false, completed: false, type: 'exercise' },
        ],
      },
      {
        id: 3,
        title: 'State Management with Redux',
        description: 'Master state management with Redux and Redux Toolkit',
        duration: '5h 30m',
        lessons: [
          { id: 12, title: 'Redux Fundamentals', duration: '25:20', isPreview: true, completed: false, type: 'video' },
          { id: 13, title: 'Redux Middleware and Async Logic', duration: '19:45', isPreview: false, completed: false, type: 'video' },
          { id: 14, title: 'Redux Toolkit Essentials', duration: '21:30', isPreview: true, completed: false, type: 'video' },
          { id: 15, title: 'RTK Query for Data Fetching', duration: '28:15', isPreview: false, completed: false, type: 'video' },
          { id: 16, title: 'State Normalization', duration: '17:50', isPreview: false, completed: false, type: 'video' },
          { id: 17, title: 'Project: Building a Shopping Cart', duration: '45:00', isPreview: false, completed: false, type: 'project' },
        ],
      },
      {
        id: 4,
        title: 'Performance Optimization',
        description: 'Learn how to optimize React applications for maximum performance',
        duration: '3h 45m',
        lessons: [
          { id: 18, title: 'React.memo and useMemo', duration: '20:10', isPreview: true, completed: false, type: 'video' },
          { id: 19, title: 'useCallback and useRef', duration: '18:30', isPreview: false, completed: false, type: 'video' },
          { id: 20, title: 'Code Splitting and Lazy Loading', duration: '25:45', isPreview: false, completed: false, type: 'video' },
          { id: 21, title: 'React Profiler and Performance Tools', duration: '22:15', isPreview: false, completed: false, type: 'video' },
          { id: 22, title: 'Performance Optimization Case Study', duration: '30:00', isPreview: false, completed: false, type: 'case-study' },
        ],
      },
    ],
    whatYouWillLearn: [
      'Build scalable and maintainable React applications using advanced patterns and best practices',
      'Master Redux and Redux Toolkit for predictable state management',
      'Optimize React application performance with advanced techniques',
      'Implement testing strategies for React components and applications',
      'Leverage React 18+ features like concurrent rendering and transitions',
      'Create reusable component libraries and design systems',
      'Handle complex state management with Context API and Redux',
      'Implement server-side rendering with Next.js',
      'Use TypeScript with React for type safety',
      'Deploy and optimize React applications for production',
    ],
    requirements: [
      '6+ months of experience with React and JavaScript',
      'Familiarity with ES6+ features (arrow functions, destructuring, spread operator, etc.)',
      'Basic understanding of Redux (helpful but not required)',
      'Node.js and npm/yarn installed on your computer',
      'Code editor (VS Code recommended)',
      'Basic knowledge of HTML, CSS, and web development concepts',
    ],
    whoIsThisFor: [
      'Intermediate React developers looking to level up their skills',
      'Frontend developers transitioning to React',
      'Full-stack developers working with React',
      'Developers who want to build scalable and maintainable applications',
      'Anyone preparing for React technical interviews',
    ],
    curriculum: [
      { title: 'Getting Started', duration: '2h 45m', lectures: 5, completed: 2 },
      { title: 'Advanced React Patterns', duration: '4h 15m', lectures: 6, completed: 0 },
      { title: 'State Management with Redux', duration: '5h 30m', lectures: 6, completed: 0 },
      { title: 'Performance Optimization', duration: '3h 45m', lectures: 5, completed: 0 },
      { title: 'Testing React Applications', duration: '3h 15m', lectures: 4, completed: 0 },
      { title: 'Advanced Hooks and Custom Hooks', duration: '3h 00m', lectures: 5, completed: 0 },
      { title: 'Server-Side Rendering with Next.js', duration: '4h 00m', lectures: 5, completed: 0 },
      { title: 'Building a Full-Stack Application', duration: '6h 30m', lectures: 7, completed: 0 },
    ],
    reviews: [
      {
        id: 1,
        user: 'Alex Johnson',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 5,
        date: '2 weeks ago',
        title: 'Excellent course!',
        content: 'This course took my React skills to the next level. The instructor explains complex concepts in a way that\'s easy to understand. The projects are challenging but rewarding.',
        likes: 42,
        isLiked: false,
      },
      {
        id: 2,
        user: 'Sarah Williams',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 5,
        date: '1 month ago',
        title: 'Worth every penny!',
        content: 'The Redux section alone is worth the price. The instructor breaks down complex topics into manageable chunks. I\'ve already implemented several techniques in my job.',
        likes: 28,
        isLiked: true,
      },
      {
        id: 3,
        user: 'Michael Chen',
        avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        rating: 4,
        date: '2 months ago',
        title: 'Great content, but could use more exercises',
        content: 'The course content is top-notch, but I would have liked more hands-on exercises. The instructor is very knowledgeable and presents the material clearly.',
        likes: 15,
        isLiked: false,
      },
    ],
  };

  // Mock related courses
  const mockRelatedCourses = [
    {
      id: 2,
      title: 'React Hooks in Depth',
      instructor: 'John Doe',
      image: 'https://source.unsplash.com/random/400x200?react',
      rating: 4.7,
      students: 1245,
      price: 79.99,
    },
    {
      id: 3,
      title: 'Mastering Redux',
      instructor: 'Alex Johnson',
      image: 'https://source.unsplash.com/random/400x200?javascript',
      rating: 4.9,
      students: 987,
      price: 89.99,
    },
  ];

  // Initialize all modules as collapsed by default
  const initializeExpandedModules = (modules) => {
    const initialExpanded = {};
    modules?.forEach(module => {
      initialExpanded[module.id] = false;
    });
    return initialExpanded;
  };

  // Load course data
  useEffect(() => {
    // Simulate API call
    const fetchCourse = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCourse(courseWithFAQs);
        setRelatedCourses(mockRelatedCourses);
        setExpandedModules(initializeExpandedModules(courseWithFAQs.modules));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course:', error);
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Add FAQ data to the course - include in the initial course data
  const courseWithFAQs = {
    ...mockCourse,
    faqs: [
      {
        question: 'How do I access my course after purchasing?',
        answer: 'After purchasing, you can access your course immediately by going to "My Learning" in your account. The course will be available there for lifetime access.'
      },
      {
        question: 'Do you offer a certificate of completion?',
        answer: 'Yes, you will receive a certificate of completion once you finish all the course content and pass any required assessments.'
      },
      {
        question: 'Can I download the course videos?',
        answer: 'For copyright and licensing reasons, we do not allow downloading of course videos. However, you can access them anytime through our platform with an internet connection.'
      },
      {
        question: 'What if I need help during the course?',
        answer: 'You can ask questions in the course discussion area where the instructor and other students can help. For technical issues, our support team is available 24/7.'
      },
      {
        question: 'Is there a money-back guarantee?',
        answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with the course for any reason.'
      }
    ]
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEnroll = (courseId) => {
    // TODO: Implement actual enrollment logic with API call
    console.log('Enrolling in course:', courseId);
    setIsEnrolled(true);
    // In a real app, you would make an API call here to enroll the user
    // and update the UI based on the response
  };

  const handleAddToWishlist = () => {
    // Toggle wishlist status
    setIsInWishlist(!isInWishlist);
    // TODO: Implement actual wishlist logic with API call
    console.log('Wishlist status:', !isInWishlist);
  };

  if (loading) {
    return <CourseSkeleton />;
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Course Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The course you're looking for doesn't exist or has been removed.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/courses')}
          startIcon={<ArrowBack />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          Browse All Courses
        </Button>
      </Container>
    );
  }

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = course.modules.flatMap(m => m.lessons).filter(l => l.completed).length;
  const progress = Math.round((completedLessons / totalLessons) * 100) || 0;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection>
        <CourseHeader>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ maxWidth: '800px' }}>
              {/* Breadcrumb */}
              <StyledBreadcrumb>
                <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    Home
                  </Link>
                  <Link to="/courses" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Courses
                  </Link>
                  <Typography color="primary.contrastText">{course.category}</Typography>
                </Breadcrumbs>
              </StyledBreadcrumb>

              {/* Course Title and Subtitle */}
              <CourseTitle variant="h2" component="h1">
                {course.title}
              </CourseTitle>
              <CourseSubtitle variant="h5" component="h2">
                {course.subtitle}
              </CourseSubtitle>

              {/* Course Meta */}
              <CourseMeta>
                <RatingBadge>
                  <Rating 
                    value={course.rating} 
                    precision={0.5} 
                    readOnly 
                    size="small"
                    emptyIcon={<StarBorder fontSize="inherit" />}
                  />
                  <Box component="span" sx={{ ml: 0.5, fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)' }}>
                    {course.rating.toFixed(1)}
                  </Box>
                </RatingBadge>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <PeopleAltOutlined fontSize="inherit" />
                  <Box component="span" sx={{ ml: 0.5 }}>
                    {course.students >= 1000 
                      ? `${(course.students / 1000).toFixed(1)}K` 
                      : course.students.toLocaleString()}
                  </Box>
                </Typography>
                
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <AccessTime fontSize="inherit" />
                  <Box component="span" sx={{ ml: 0.5 }}>{course.duration}</Box>
                </Typography>
                
                <Chip 
                  label={course.level} 
                  size="small" 
                  color={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'error'}
                  sx={{ 
                    fontWeight: 700,
                    color: 'white',
                    '& .MuiChip-label': { 
                      px: 1.5,
                      py: 0.5,
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}
                />
                
                {course.isBestseller && (
                  <Chip 
                    label="Bestseller" 
                    size="small" 
                    color="secondary"
                    sx={{ 
                      fontWeight: 700,
                      '& .MuiChip-label': { px: 1.5 }
                    }}
                  />
                )}
              </CourseMeta>

              {/* Instructor Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                <Avatar 
                  src={course.instructorAvatar} 
                  alt={course.instructor}
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    mr: 2,
                    border: '2px solid white',
                    boxShadow: 2
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {course.instructor}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)" fontSize="0.8rem">
                    {course.instructorTitle}
                  </Typography>
                </Box>
              </Box>

              {/* Last Updated */}
              <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 2 }}>
                Last updated {course.lastUpdated}
              </Typography>

              {/* Progress Bar (for enrolled students) */}
              {isEnrolled && (
                <Box sx={{ mt: 3, maxWidth: '600px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Your progress: {progress}% complete
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedLessons} of {totalLessons} lessons
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: 'success.main'
                      }
                    }} 
                  />
                </Box>
              )}
            </Box>
          </Container>
        </CourseHeader>
      </HeroSection>

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          pt: 6, 
          pb: 12, 
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: '60vh' // Ensure minimum height to prevent footer from jumping up
        }}
      >
        <Grid 
          container 
          spacing={4} 
          ref={courseContentRef} 
          sx={{ 
            position: 'relative',
            flexDirection: { xs: 'column-reverse', lg: 'row' }, // Reverse on mobile, row on desktop
            minHeight: '100%' // Ensure grid takes full height
          }}
        >
          {/* Left Column - Sidebar */}
          <Grid sx={{
            width: { xs: '100%', lg: '380px' },
            position: { xs: 'static', lg: 'absolute' },
            left: { lg: '16px' },
            top: { lg: '-40px' },
            zIndex: 10,
            order: { xs: 2, lg: 1 } // Sidebar comes first on mobile
          }}>
            <StickySidebar ref={sidebarRef}>
              <CourseCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnail}
                  alt={course.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  {/* Price and Discount */}
                  <PriceWrapper>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${course.price.toFixed(2)}
                    </Typography>
                    {course.discount > 0 && (
                      <>
                        <Typography variant="body1" className="original-price">
                          ${course.originalPrice.toFixed(2)}
                        </Typography>
                        <Box className="discount-badge">
                          {course.discount}% OFF
                        </Box>
                      </>
                    )}
                  </PriceWrapper>
                  
                  {/* Enroll Button */}
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <EnrollButton 
                      variant="contained" 
                      color="primary"
                      size="large"
                      fullWidth
                      onClick={() => handleEnroll(course.id)}
                      startIcon={isEnrolled ? <CheckCircleOutline /> : <ShoppingCart />}
                    >
                      {isEnrolled ? 'Go to Course' : 'Enroll Now'}
                    </EnrollButton>
                    
                    {!isEnrolled && (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        30-Day Money-Back Guarantee
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Course Features */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      This course includes:
                    </Typography>
                    <List dense disablePadding>
                      {course.features.map((feature, index) => (
                        <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography variant="body2">
                                {feature}
                              </Typography>
                            } 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  {/* Share and Wishlist */}
                  <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={isInWishlist ? <BookmarkAdded /> : <BookmarkBorder />}
                      onClick={handleAddToWishlist}
                      sx={{
                        textTransform: 'none',
                        py: 1,
                        borderRadius: 2,
                        color: isInWishlist ? 'primary.main' : 'text.primary',
                        borderColor: isInWishlist ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {isInWishlist ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Share />}
                      sx={{
                        textTransform: 'none',
                        py: 1,
                        borderRadius: 2,
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </CourseCard>
              
              {/* Course Details Card */}
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Course Details
                </Typography>
                <List dense disablePadding>
                  <ListItem disableGutters sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                      <AccessTimeFilledIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body2">
                          {course.totalHours} hours on-demand video
                        </Typography>
                      } 
                    />
                  </ListItem>
                </List>
              </Box>
            </StickySidebar>
          </Grid>

          {/* Main Content */}
          <Grid sx={{
            width: { xs: '100%', lg: 'calc(100% - 396px)' },
            ml: { lg: '416px' }, // Account for sidebar width + gap
            order: { xs: 1, lg: 2 } // Content comes second on mobile
          }}>
            {/* Course Navigation Tabs */}
            <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }} elevation={0}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTabs-flexContainer': {
                    gap: 1,
                    '& .MuiButtonBase-root': {
                      minWidth: 'auto',
                      py: 1.5,
                      px: 2,
                      mx: 0.5,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 1,
                      transition: 'all 0.2s ease',
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: 'action.selected',
                        fontWeight: 600,
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '@media (min-width: 600px)': {
                        py: 2,
                        px: 3,
                        mx: 0,
                        '&:not(:last-child)': {
                          marginRight: 2,
                        },
                      },
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                  },
                  '& .MuiTabs-scrollButtons': {
                    '&.Mui-disabled': { 
                      opacity: 0.3 
                    },
                  },
                }}
              >
                <Tab label="Overview" />
                <Tab label="Curriculum" />
                <Tab label="Instructor" />
                <Tab label="Reviews" />
                <Tab label="FAQ" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box sx={{ mb: 6 }}>
              {tabValue === 0 && (
                <Box>
                  {/* وصف الدورة */}
                  <SectionTitle variant="h5" component="h2" gutterBottom>
                    وصف الدورة
                  </SectionTitle>
                  <Typography variant="body1" paragraph dir="rtl">
                    {course.longDescription}
                  </Typography>

                  {/* ماهو ما ستتعلمه من هذا الدورة */}
                  <Box sx={{ my: 5 }}>
                    <SectionTitle variant="h5" component="h2" gutterBottom>
                      ماهو ما ستتعلمه من هذا الدورة
                    </SectionTitle>
                    <Grid container spacing={2} sx={{ mt: 2, width: '100%' }}>
                      {course.whatYouWillLearn.map((item, index) => (
                        <Grid key={index} xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                            <CheckCircleOutline 
                              color="primary" 
                              sx={{ 
                                mr: 1.5, 
                                mt: '2px', 
                                flexShrink: 0,
                                fontSize: '1.2rem' 
                              }} 
                            />
                            <Typography variant="body1" dir="rtl">{item}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* المتطلبات */}
                  <Box sx={{ my: 5 }}>
                    <SectionTitle variant="h5" component="h2" gutterBottom>
                      المتطلبات
                    </SectionTitle>
                    <Grid container spacing={2} sx={{ mt: 2, width: '100%' }}>
                      {course.requirements.map((req, index) => (
                        <Grid key={index} xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                            <CheckCircleOutline 
                              color="primary" 
                              sx={{ 
                                mr: 1.5, 
                                mt: '2px', 
                                flexShrink: 0,
                                fontSize: '1.2rem' 
                              }} 
                            />
                            <Typography variant="body1" dir="rtl">{req}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* من هو هذا الدورة؟ */}
                  <Box sx={{ my: 5 }}>
                    <SectionTitle variant="h5" component="h2" gutterBottom>
                      من هو هذا الدورة؟
                    </SectionTitle>
                    <Grid container spacing={2} sx={{ mt: 2, width: '100%' }}>
                      {course.whoIsThisFor.map((item, index) => (
                        <Grid key={index} xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                            <CheckCircleOutline 
                              color="primary" 
                              sx={{ 
                                mr: 1.5, 
                                mt: '2px', 
                                flexShrink: 0,
                                fontSize: '1.2rem' 
                              }} 
                            />
                            <Typography variant="body1" dir="rtl">{item}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <SectionTitle variant="h5" component="h2" sx={{ mb: 0 }}>
                      Course Content
                    </SectionTitle>
                    <Typography variant="body2" color="text.secondary">
                      {course.modules.length} sections • {totalLessons} lectures • {course.totalHours} total length
                    </Typography>
                  </Box>

                  {/* Course Curriculum */}
                  <Box sx={{ mb: 4 }}>
                    {course.modules.map((module, moduleIndex) => (
                      <ModuleCard 
                        key={module.id} 
                        elevation={0}
                        sx={{ 
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <ModuleHeader 
                          onClick={() => toggleModule(module.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            bgcolor: 'background.paper',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {moduleIndex + 1}. {module.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              {module.duration} • {module.lessons.length} lessons
                            </Typography>
                          </Box>
                          {expandedModules[module.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </ModuleHeader>
                        <Collapse in={expandedModules[module.id]} timeout="auto" unmountOnExit>
                          <List disablePadding>
                            {module.lessons.map((lesson, lessonIndex) => (
                              <LessonItem 
                                key={lesson.id}
                                completed={lesson.completed}
                                preview={lesson.isPreview}
                                sx={{
                                  pl: 6,
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {lesson.completed ? (
                                    <CheckCircle color="success" />
                                  ) : lesson.isPreview ? (
                                    <PlayCircleOutline color="primary" />
                                  ) : (
                                    <DescriptionOutlined color="action" />
                                  )}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={
                                    <Typography 
                                      variant="body1" 
                                      color={lesson.isPreview ? 'primary.main' : 'text.primary'}
                                      fontWeight={lesson.isPreview ? 500 : 400}
                                    >
                                      {lesson.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                      <AccessTime fontSize="small" sx={{ fontSize: '0.8rem', mr: 0.5, opacity: 0.7 }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {lesson.duration}
                                      </Typography>
                                      {lesson.isPreview && (
                                        <Chip 
                                          label="Preview" 
                                          size="small" 
                                          color="primary" 
                                          variant="outlined"
                                          sx={{ 
                                            ml: 1.5, 
                                            height: 20, 
                                            fontSize: '0.65rem',
                                            '& .MuiChip-label': { px: 1 }
                                          }} 
                                        />
                                      )}
                                    </Box>
                                  }
                                />
                              </LessonItem>
                            ))}
                          </List>
                        </Collapse>
                      </ModuleCard>
                    ))}
                  </Box>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <SectionTitle variant="h5" component="h2" gutterBottom>
                    About the Instructor
                  </SectionTitle>
                  
                  <InstructorCard elevation={0}>
                    <Avatar 
                      src={course.instructorAvatar} 
                      alt={course.instructor}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mb: 3,
                        border: '3px solid',
                        borderColor: 'primary.main',
                        boxShadow: 3
                      }}
                    />
                    <Typography variant="h6" component="h3" gutterBottom>
                      {course.instructor}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {course.instructorTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating 
                        value={course.instructorRating} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                        emptyIcon={<StarBorder fontSize="inherit" />}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {course.instructorRating.toFixed(1)} Instructor Rating
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {course.instructorStudents.toLocaleString()}+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Students
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {course.instructorCourses}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Courses
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                      {course.instructorBio}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      View Full Profile
                    </Button>
                  </InstructorCard>
                </Box>
              )}

              {tabValue === 3 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <SectionTitle variant="h5" component="h2" sx={{ mb: 0.5 }}>
                        Student Feedback
                      </SectionTitle>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h4" component="span" sx={{ mr: 1 }}>
                          {course.rating.toFixed(1)}
                        </Typography>
                        <Rating 
                          value={course.rating} 
                          precision={0.1} 
                          readOnly 
                          size="medium"
                          emptyIcon={<StarBorder fontSize="inherit" />}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Course Rating • {course.reviews.length} reviews
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<DescriptionOutlined />}
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Write a Review
                    </Button>
                  </Box>

                  {/* Rating Distribution */}
                  <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Rating Breakdown
                    </Typography>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: 80, display: 'flex', justifyContent: 'space-between', mr: 2 }}>
                          <Typography variant="body2">{star} Star</Typography>
                          <Box sx={{ width: 8 }} />
                        </Box>
                        <Box sx={{ flexGrow: 1, mx: 2 }}>
                          <Box sx={{ width: '100%', height: 8, bgcolor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
                            <Box 
                              sx={{ 
                                height: '100%', 
                                width: `${(star / 5) * 100}%`, 
                                bgcolor: 'warning.main',
                                borderRadius: 4
                              }} 
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                          {Math.round((star / 5) * course.reviews.length)} reviews
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Reviews List */}
                  <Box>
                    {Array.isArray(course.reviews) ? course.reviews.map((review) => (
                      <Box 
                        key={review.id} 
                        sx={{ 
                          p: 3, 
                          mb: 3, 
                          bgcolor: 'background.paper', 
                          borderRadius: 2, 
                          border: '1px solid', 
                          borderColor: 'divider' 
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={review.avatar} alt={review.user} sx={{ width: 48, height: 48, mr: 2 }} />
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {review.user}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating 
                                  value={review.rating} 
                                  precision={0.5} 
                                  readOnly 
                                  size="small"
                                  emptyIcon={<StarBorder fontSize="inherit" />}
                                  sx={{ mr: 1, color: 'warning.main' }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {review.date}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <IconButton 
                            size="small" 
                            color={review.isLiked ? 'primary' : 'default'}
                            onClick={() => {}}
                          >
                            {review.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {review.likes}
                            </Typography>
                          </IconButton>
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                          {review.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {review.content}
                        </Typography>
                      </Box>
                    )) : null}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        sx={{ 
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 500
                        }}
                      >
                        Load More Reviews
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

              {tabValue === 4 && (
                <Box>
                  <SectionTitle variant="h5" component="h2" gutterBottom>
                    Frequently Asked Questions
                  </SectionTitle>
                  <Box sx={{ mb: 4 }}>
                    {course.faqs && course.faqs.length > 0 ? (
                      course.faqs.map((faq, index) => (
                        <Accordion 
                          key={index} 
                          elevation={0}
                          sx={{
                            mb: 1,
                            border: '1px solid', 
                            borderColor: 'divider',
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': {
                              margin: 0,
                              '&:not(:last-child)': {
                                borderBottom: 0,
                              },
                            },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls={`faq-panel-${index}`}
                            id={`faq-header-${index}`}
                            sx={{
                              minHeight: 60,
                              '&.Mui-expanded': {
                                minHeight: 60,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              },
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              {faq.question}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body1" color="text.secondary">
                              {faq.answer}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No frequently asked questions available at the moment.
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Still have questions?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      If you can't find the answer to your question, feel free to contact our support team.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<SupportAgent />}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      Contact Support
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton 
        color="primary" 
        aria-label="enroll"
        onClick={toggleSidebar}
        sx={{ 
          display: { xs: 'flex', lg: 'none' },
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          boxShadow: 6,
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 8,
          },
          transition: 'all 0.3s ease',
        }}
      >
        {sidebarVisible ? (
          <ShoppingCart />
        ) : (
          <KeyboardArrowUp />
        )}
      </FloatingActionButton>

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
};

export default CourseDetail;
