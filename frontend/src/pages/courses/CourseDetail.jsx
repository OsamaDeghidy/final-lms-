import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
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
  Fab,
  Alert,
  Snackbar,
  Fade,
  Zoom,
  Slide,
  Dialog,
  DialogContent,
  Menu,
  MenuItem,
  Tooltip
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
  SupportAgent,
  School as SchoolIcon,
  VideoLibrary as VideoLibraryIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
// إضافات أيقونات بسيطة للوحدات
import { ListAlt as ListAltIcon } from '@mui/icons-material';
import { styled, keyframes, alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { courseAPI } from '../../services/courseService';
import { paymentAPI } from '../../services/api.service';
import { cartAPI } from '../../services/courseService';

// Animation keyframes - تحسين الأنيميشن
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

const fadeInUp = keyframes`
  0% { 
    opacity: 0; 
    transform: translateY(40px) scale(0.98); 
    filter: blur(8px);
  }
  50% {
    filter: blur(4px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
    filter: blur(0);
  }
`;

const pulse = keyframes`
  0% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  50% { 
    transform: scale(1.03);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -300px 0;
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    background-position: calc(300px + 100%) 0;
    opacity: 0.5;
  }
`;

const float = keyframes`
  0% { 
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
  }
  25% {
    transform: translateY(-8px) rotate(0.5deg);
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  }
  50% {
    transform: translateY(-12px) rotate(-0.5deg);
    filter: drop-shadow(0 12px 25px rgba(0,0,0,0.2));
  }
  75% {
    transform: translateY(-8px) rotate(0.5deg);
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  }
  100% { 
    transform: translateY(0px) rotate(0deg);
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
  }
`;

// New header animations (softer and more elegant)
const gradientDrift = keyframes`
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 80% 20%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

const waveSlide = keyframes`
  0% { background-position: 0 100%; }
  100% { background-position: 2000px 100%; }
`;

const glowPulse = keyframes`
  0% { opacity: 0.15; }
  50% { opacity: 0.3; }
  100% { opacity: 0.15; }
`;

// Layout constants & visual primitives
const layout = {
  sectionY: 5,
  sectionYMobile: 3,
  gridSpacing: 3,
  cardRadius: 3,
};

const StatsPill = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2.25),
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.15)}, ${alpha(theme.palette.background.paper, 0.05)})`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
  borderRadius: 999,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 40,
  gap: theme.spacing(1.25),
  boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.25)}`,
}));

const SectionPanel = styled(Box)(({ theme }) => ({
  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.08)} 100%)`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
  borderRadius: theme.shape.borderRadius * 4,
  padding: theme.spacing(4),
  boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.25)}`,
}));

// Unified content wrapper to keep main content cohesive
const ContentSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.85)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: `0 10px 24px ${alpha(theme.palette.common.black, 0.15)}`,
}));

const SoftDivider = styled(Divider)(({ theme }) => ({
  borderColor: alpha(theme.palette.primary.main, 0.15),
}));

// Styled Components - تحسين التصميم
const StyledBreadcrumb = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  backgroundColor: 'transparent',
  '& a': {
    textDecoration: 'none',
    color: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '& svg': {
      marginLeft: theme.spacing(0.75),
    },
    '&:hover': {
      color: theme.palette.common.white,
      textDecoration: 'underline',
      transform: 'translateX(-2px)',
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
  padding: theme.spacing(layout.sectionY, 0, layout.sectionY + 2, 0),
  position: 'relative',
  overflow: 'hidden',
  color: theme.palette.primary.contrastText,
  // Animated gradient using brand colors
  background: `linear-gradient(135deg,
    ${alpha(theme.palette.primary.main, 0.96)},
    ${alpha(theme.palette.primary.dark, 0.95)}, 
    ${alpha(theme.palette.secondary.main || theme.palette.primary.dark, 0.9)},
    ${alpha(theme.palette.primary.dark, 0.95)}, 
    ${alpha(theme.palette.primary.main, 0.96)}
  )`,
  backgroundSize: '220% 220%',
  animation: `${gradientDrift} 26s ease-in-out infinite alternate`,
  // Decorative moving waves
  '&::before': {
    display: 'none',
  },
  // Soft radial glows
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient( circle at 20% 80%, ${alpha(theme.palette.primary.light, 0.25)} 0%, transparent 55%),
                 radial-gradient( circle at 85% 20%, ${alpha(theme.palette.secondary.light || theme.palette.primary.light, 0.22)} 0%, transparent 50%)`,
    animation: `${glowPulse} 8s ease-in-out infinite`,
    pointerEvents: 'none',
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
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1.5),
    textAlign: 'center',
    '& .MuiBreadcrumbs-root': {
      justifyContent: 'center',
      '& .MuiBreadcrumbs-separator': {
        margin: theme.spacing(0, 1),
      },
    },
  },
}));

const CourseTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  lineHeight: 1.1,
  marginBottom: theme.spacing(3),
  color: theme.palette.common.white,
  textShadow: '0 2px 6px rgba(0,0,0,0.2)',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
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
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  '& > *': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.75, 1.5),
    background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.15)} 0%, ${alpha(theme.palette.common.white, 0.1)} 100%)`,
    borderRadius: theme.shape.borderRadius * 3,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& svg': {
      marginRight: theme.spacing(0.75),
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.95)',
    },
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, ${alpha(theme.palette.common.white, 0.15)} 100%)`,
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.2)}`,
    },
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.5),
    flexDirection: 'row',
    justifyContent: 'center',
    '& > *': {
      flex: '0 0 calc(50% - ${theme.spacing(1.5)})',
      padding: theme.spacing(0.75, 1),
      fontSize: '0.875rem',
      justifyContent: 'center',
      '& svg': {
        fontSize: '1rem',
      },
    },
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.25),
    '& > *': {
      padding: theme.spacing(0.5, 1.25),
      fontSize: '0.875rem',
    },
  },
}));

const RatingBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.2)} 0%, ${alpha(theme.palette.common.white, 0.15)} 100%)`,
  color: theme.palette.common.white,
  padding: theme.spacing(0.75, 2),
  borderRadius: theme.shape.borderRadius * 3,
  fontWeight: 700,
  transition: 'all 0.3s ease-in-out',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.25)} 0%, ${alpha(theme.palette.common.white, 0.2)} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
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
    padding: theme.spacing(0.5, 1.5),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 4,
  boxShadow: `0 25px 50px ${alpha(theme.palette.common.black, 0.15)}`,
  overflow: 'hidden',
  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.1),
  display: 'flex',
  flexDirection: 'column',
  height: 'auto',
  marginRight: { lg: 0 },
  backdropFilter: 'blur(20px)',
  background: `linear-gradient(145deg, 
    ${alpha(theme.palette.background.paper, 0.9)}, 
    ${alpha(theme.palette.background.paper, 0.95)})`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 30px 60px ${alpha(theme.palette.common.black, 0.15)}`,
    borderColor: theme.palette.primary.light,
    '& .course-image': {
      transform: 'scale(1.05)',
    },
    '& .course-title': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiCardMedia-root': {
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const ModuleCard = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius * 4,
  overflow: 'hidden',
  boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.1),
  background: `linear-gradient(145deg, 
    ${alpha(theme.palette.background.paper, 0.95)}, 
    ${alpha(theme.palette.background.paper, 0.98)})`,
  '&:hover': {
    boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.1)}`,
    borderColor: theme.palette.primary.light,
    transform: 'translateY(-2px)',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(2, 0),
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    borderColor: theme.palette.primary.light,
  },
}));

const ModuleHeader = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
    '&::before': {
      left: '100%',
    },
  },
  '&.Mui-expanded': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderBottomColor: alpha(theme.palette.primary.main, 0.2),
    '& .module-title': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    '& .module-icon': {
      transform: 'rotate(180deg)',
      color: theme.palette.primary.main,
    },
  },
}));

const LessonItem = styled(ListItem)(({ theme, completed, preview }) => ({
  padding: theme.spacing(2.5, 4),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  background: completed 
    ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.03)} 100%)`
    : 'transparent',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    paddingLeft: theme.spacing(4),
    transform: 'translateX(-5px)',
    '& .lesson-play-icon': {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  ...(completed && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    '& .MuiListItemIcon-root': {
      color: theme.palette.success.main,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.success.main, 0.15),
    },
  }),
  ...(preview && {
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    '& .preview-badge': {
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
      color: theme.palette.primary.contrastText,
      padding: '4px 12px',
      borderRadius: 16,
      fontSize: '0.75rem',
      fontWeight: 700,
      marginLeft: 8,
      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  }),
}));

const EnrollButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2.5, 4),
  fontSize: '1.3rem',
  fontWeight: 700,
  borderRadius: theme.shape.borderRadius * 4,
  textTransform: 'none',
  marginBottom: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 50%,
    ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
  boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)},
              0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  },
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2.5),
    fontSize: '1.1rem',
  },
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateX(-5px)',
  },
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
    fontSize: '1.2rem',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '80px',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    borderRadius: '2px',
  },
}));

const InstructorCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(6, 5),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 4,
  boxShadow: `0 15px 35px ${alpha(theme.palette.common.black, 0.12)},
              0 5px 15px ${alpha(theme.palette.common.black, 0.05)}`,
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  background: `linear-gradient(145deg, 
    ${alpha(theme.palette.background.paper, 0.97)} 0%, 
    ${alpha(theme.palette.background.paper, 0.99)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const StickySidebar = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(-15),
  zIndex: 10,
  [theme.breakpoints.up('lg')]: {
    position: 'sticky',
    top: theme.spacing(4),
    marginTop: theme.spacing(-18),
  },
  [theme.breakpoints.down('lg')]: {
    marginTop: theme.spacing(4),
  },
  '& .MuiCard-root': {
    backdropFilter: 'blur(15px)',
    background: `linear-gradient(145deg, 
      ${alpha(theme.palette.background.paper, 0.98)} 0%, 
      ${alpha(theme.palette.background.default, 0.95)} 50%,
      ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
    borderRadius: theme.shape.borderRadius * 4,
    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)},
                0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 25px 50px ${alpha(theme.palette.common.black, 0.15)},
                  0 12px 25px ${alpha(theme.palette.common.black, 0.1)}`,
    },
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
    fontSize: '1.1rem',
  },
  '& .discount-badge': {
    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
    color: theme.palette.error.contrastText,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.shape.borderRadius * 2,
    fontSize: '0.8rem',
    fontWeight: 700,
    boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
  },
}));

const FloatingActionButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 1000,
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1) translateY(-2px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    width: 50,
    height: 50,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [overviewSubTab, setOverviewSubTab] = useState(0);
  const courseContentRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  
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

  // Preview dialog handlers
  const handleOpenPreview = () => setIsPreviewOpen(true);
  const handleClosePreview = () => setIsPreviewOpen(false);
  const handleOpenShare = (e) => setShareAnchorEl(e.currentTarget);
  const handleCloseShare = () => setShareAnchorEl(null);
  const handleOverviewSubTabChange = (e, v) => setOverviewSubTab(v);

  // Choose lesson icon by status/type
  const getLessonIcon = (lesson) => {
    if (lesson?.completed) {
      return <CheckCircle htmlColor={theme.palette.success.main} />;
    }
    if (lesson?.type === 'video') {
      return <VideoIcon htmlColor={theme.palette.primary.main} />;
    }
    if (lesson?.type === 'article') {
      return <InsertDriveFileIcon htmlColor={alpha(theme.palette.text.primary, 0.8)} />;
    }
    if (lesson?.type === 'quiz' || lesson?.type === 'exercise') {
      return <QuizIconFilled htmlColor={theme.palette.primary.main} />;
    }
    if (lesson?.isPreview) {
      return <PlayCircleOutline htmlColor={theme.palette.primary.main} />;
    }
    return <DescriptionOutlined htmlColor={alpha(theme.palette.text.primary, 0.7)} />;
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
    if (Array.isArray(modules)) {
      modules.forEach(module => {
        if (module && module.id) {
          initialExpanded[module.id] = false;
        }
      });
    }
    return initialExpanded;
  };

  // Load course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch course details
        const courseData = await courseAPI.getCourseById(id);
        console.log('Course data from API:', courseData);
        
        // Fetch related courses
        let relatedCoursesData = [];
        try {
          const relatedResponse = await courseAPI.getRelatedCourses(id);
          relatedCoursesData = relatedResponse.results || relatedResponse || [];
        } catch (error) {
          console.warn('Could not fetch related courses:', error);
        }
        
        // Fetch course modules if available
        let modulesData = [];
        try {
          const modulesResponse = await courseAPI.getCourseModules(id);
          console.log('Modules response:', modulesResponse);
          
          // Handle different response formats
          if (modulesResponse && typeof modulesResponse === 'object') {
            if (Array.isArray(modulesResponse)) {
              modulesData = modulesResponse;
            } else if (modulesResponse.modules && Array.isArray(modulesResponse.modules)) {
              modulesData = modulesResponse.modules;
            } else if (modulesResponse.results && Array.isArray(modulesResponse.results)) {
              modulesData = modulesResponse.results;
            } else {
              modulesData = [];
            }
          } else {
            modulesData = [];
          }
          
          console.log('Processed modules data:', modulesData);
        } catch (error) {
          console.warn('Could not fetch course modules:', error);
          // If it's a 403 error, user is not enrolled
          if (error.response && error.response.status === 403) {
            console.log('User is not enrolled in this course, modules will not be available');
          }
          modulesData = [];
        }
        
        // Transform API data to match expected format
        const transformedCourse = transformCourseData(courseData, modulesData);
        console.log('Transformed course:', transformedCourse);
        console.log('Transformed course modules:', transformedCourse.modules);
        
        setCourse(transformedCourse);
        setRelatedCourses(relatedCoursesData);
        setExpandedModules(initializeExpandedModules(transformedCourse.modules));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        let errorMessage = 'Failed to load course data';
        
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 404) {
            errorMessage = 'Course not found';
          } else if (error.response.status === 403) {
            errorMessage = 'You do not have permission to view this course';
          } else if (error.response.status === 401) {
            errorMessage = 'Please log in to view this course';
          } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          // Other error
          errorMessage = error.message || 'An unexpected error occurred';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Transform API data to match expected format
  const transformCourseData = (apiCourse, modulesData = []) => {
    // Handle image URLs
    const getImageUrl = (imageField) => {
      if (!imageField) return 'https://source.unsplash.com/random/1600x500?programming,react';
      if (typeof imageField === 'string') return imageField;
      if (imageField.url) return imageField.url;
      return 'https://source.unsplash.com/random/1600x500?programming,react';
    };

    // Handle file URLs (e.g., PDFs)
    const getFileUrl = (fileField) => {
      if (!fileField) return null;
      if (typeof fileField === 'string') return fileField;
      if (fileField.url) return fileField.url;
      return null;
    };

    // Handle price calculations
    const price = parseFloat(apiCourse.price) || 0;
    const discountPrice = parseFloat(apiCourse.discount_price) || 0;
    const discount = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

    return {
      id: apiCourse.id,
      title: apiCourse.title || '',
      subtitle: apiCourse.subtitle || '',
      description: apiCourse.description || '',
      longDescription: apiCourse.description || '',
      instructor: apiCourse.instructors?.[0]?.name || 'Unknown Instructor',
      instructorTitle: apiCourse.instructors?.[0]?.bio || '',
      instructorBio: apiCourse.instructors?.[0]?.bio || '',
      instructorAvatar: getImageUrl(apiCourse.instructors?.[0]?.profile_pic),
      instructorRating: 4.9,
      instructorStudents: apiCourse.total_enrollments || 0,
      instructorCourses: 8,
      bannerImage: getImageUrl(apiCourse.image),
      thumbnail: getImageUrl(apiCourse.image),
      category: apiCourse.category?.name || 'Web Development',
      level: apiCourse.level || 'beginner',
      duration: '8 weeks',
      totalHours: 35,
      lectures: 125,
      resources: 45,
      students: apiCourse.total_enrollments || 0,
      rating: apiCourse.average_rating || 4.8,
      reviews: apiCourse.reviews?.length || 0,
      price: price,
      originalPrice: discountPrice > 0 ? price : price,
      discount: discount,
      isBestseller: apiCourse.is_featured || false,
      lastUpdated: apiCourse.updated_at ? new Date(apiCourse.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently',
      language: apiCourse.language || 'English',
      captions: ['English', 'Spanish', 'French'],
      features: [
        'وصول مدى الحياة',
        'الوصول عبر الجوال والتلفاز',
        'شهادة إتمام الدورة',
        'ضمان استرداد الأموال خلال 30 يوم',
        'موارد قابلة للتحميل',
        'واجبات واختبارات'
      ],
      isEnrolled: apiCourse.is_enrolled || false,
      planPdfUrl: getFileUrl(apiCourse.timeline_pdf || apiCourse.plan_pdf || apiCourse.plan) || null,
      enrichmentPdfUrl: getFileUrl(apiCourse.enrichment_pdf || apiCourse.resources_pdf) || null,
      modules: transformModulesData(modulesData, apiCourse),
      curriculum: [
        { title: 'البداية', duration: '2h 45m', lectures: 5, completed: 2 },
        { title: 'أنماط React المتقدمة', duration: '4h 15m', lectures: 6, completed: 0 },
        { title: 'إدارة الحالة مع Redux', duration: '5h 30m', lectures: 6, completed: 0 },
        { title: 'تحسين الأداء', duration: '3h 45m', lectures: 5, completed: 0 },
      ],
      reviews: apiCourse.reviews || [],
    faqs: [
      {
        question: 'كيف يمكنني الوصول إلى دورتي بعد الشراء؟',
        answer: 'بعد الشراء، يمكنك الوصول إلى دورتك فوراً عن طريق الذهاب إلى "تعلمي" في حسابك. ستكون الدورة متاحة هناك للوصول مدى الحياة.'
      },
      {
        question: 'هل تقدمون شهادة إتمام؟',
        answer: 'نعم، ستحصل على شهادة إتمام بمجرد إنهاء جميع محتوى الدورة واجتياز أي تقييمات مطلوبة.'
      },
      {
        question: 'هل يمكنني تحميل فيديوهات الدورة؟',
        answer: 'لأسباب حقوق النشر والترخيص، لا نسمح بتحميل فيديوهات الدورة. ومع ذلك، يمكنك الوصول إليها في أي وقت من خلال منصتنا مع اتصال بالإنترنت.'
      },
      {
        question: 'ماذا لو احتجت إلى مساعدة أثناء الدورة؟',
        answer: 'يمكنك طرح الأسئلة في منطقة مناقشة الدورة حيث يمكن للمدرب والطلاب الآخرين المساعدة. للمشكلات التقنية، فريق الدعم لدينا متاح على مدار الساعة طوال أيام الأسبوع.'
      },
      {
        question: 'هل هناك ضمان استرداد الأموال؟',
        answer: 'نعم، نقدم ضمان استرداد الأموال لمدة 30 يوماً إذا لم تكن راضياً عن الدورة لأي سبب.'
      }
    ]
    };
  };

  // Transform modules data
  const transformModulesData = (modulesData, courseData) => {
    console.log('transformModulesData called with:', { modulesData, courseData });
    
    // Ensure modulesData is an array
    if (!modulesData || !Array.isArray(modulesData)) {
      console.log('modulesData is not an array, using empty array');
      modulesData = [];
    }
    
    if (modulesData.length === 0) {
      // Return default modules if no modules data
      return [
        {
          id: 1,
          title: 'مقدمة متقدمة في React',
          description: 'إعداد بيئة التطوير وفهم المفاهيم الأساسية',
          duration: '2h 45m',
          lessons: [
            { id: 1, title: 'مقدمة إلى React المتقدم', duration: '15:30', isPreview: true, completed: true, type: 'video' },
            { id: 2, title: 'إعداد بيئة التطوير', duration: '12:45', isPreview: true, completed: true, type: 'video' },
            { id: 3, title: 'نظرة عامة على مزايا React 18+', duration: '18:20', isPreview: false, completed: false, type: 'video' },
            { id: 4, title: 'إعداد المشروع والتهيئة', duration: '22:10', isPreview: false, completed: false, type: 'video' },
            { id: 5, title: 'موارد الدورة والأدوات', duration: '08:30', isPreview: true, completed: false, type: 'article' },
          ],
        },
        {
          id: 2,
          title: 'أنماط React المتقدمة',
          description: 'إتقان أنماط React المتقدمة وأفضل الممارسات',
          duration: '4h 15m',
          lessons: [
            { id: 6, title: 'نمط Render Props', duration: '22:10', isPreview: true, completed: false, type: 'video' },
            { id: 7, title: 'المكوّنات عالية الترتيب (HOCs)', duration: '18:30', isPreview: true, completed: false, type: 'video' },
            { id: 8, title: 'التعمق في Context API', duration: '20:15', isPreview: false, completed: false, type: 'video' },
            { id: 9, title: 'نمط المكونات المركبة', duration: '25:40', isPreview: false, completed: false, type: 'video' },
            { id: 10, title: 'سلاسل React Hooks المخصصة', duration: '28:20', isPreview: false, completed: false, type: 'video' },
            { id: 11, title: 'تمرين عملي: بناء مكوّن نافذة منبثقة', duration: '15:00', isPreview: false, completed: false, type: 'exercise' },
          ],
        },
      ];
    }

    const result = modulesData.map((module, index) => ({
      id: module.id || index + 1,
      title: module.name || module.title || `الوحدة ${index + 1}`,
      description: module.description || '',
      duration: module.duration || '1h 00m',
      lessons: Array.isArray(module.lessons || module.content || []) 
        ? (module.lessons || module.content || []).map((lesson, lIndex) => ({
            ...lesson,
            title: lesson?.title || `الدرس ${lIndex + 1}`
          }))
        : []
    }));
    
    console.log('transformModulesData result:', result);
    return result;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle enrollment with better error handling
  const handleEnroll = async (courseId) => {
    try {
      setLoading(true);
      const response = await courseAPI.enrollInCourse(courseId);
      console.log('Enrollment response:', response);
    setIsEnrolled(true);
      // Show success message
      // You might want to add a snackbar or toast notification here
    } catch (error) {
      console.error('Error enrolling in course:', error);
      let errorMessage = 'Failed to enroll in course';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to enroll in this course';
        } else if (error.response.status === 409) {
          errorMessage = 'You are already enrolled in this course';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      // Show error message
      // You might want to add a snackbar or toast notification here
      console.error('Enrollment error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = () => {
    // Toggle wishlist status
    setIsInWishlist(!isInWishlist);
    // TODO: Implement actual wishlist logic with API call
    console.log('Wishlist status:', !isInWishlist);
  };

  // Handle adding course to cart
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      // Add course to cart via API
      const response = await cartAPI.addToCart(course.id);
      console.log('Added to cart:', response);
      
      // Update cart state
      setCartItems(prev => [...prev, course]);
      setCartTotal(prev => prev + course.price);
      
      // Show success message
      alert('تم إضافة الدورة إلى السلة بنجاح!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('حدث خطأ أثناء إضافة الدورة إلى السلة');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle direct enrollment (payment)
  const handleEnrollNow = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Create Moyasar payment
      const { url } = await paymentAPI.createMoyasarPayment();
      
      // Redirect to Moyasar payment page
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      alert('حدث خطأ أثناء بدء عملية الدفع');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle direct payment page navigation
  const handleDirectPayment = () => {
    navigate(`/payment/${course.id}`);
  };

  // Handle view cart
  const handleViewCart = () => {
    navigate('/cart');
  };

  // Show loading skeleton while loading
  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <CourseSkeleton />
        <Box sx={{ mt: 'auto' }}>
          <Footer />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            خطأ في تحميل الدورة
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => window.location.reload()}
            startIcon={<ArrowBack />}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            حاول مرة أخرى
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            onClick={() => navigate('/courses')}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            تصفح الدورات
          </Button>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            الدورة غير موجودة
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            الدورة التي تبحث عنها غير موجودة أو تم حذفها.
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
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          تصفح جميع الدورات
        </Button>
      </Container>
    );
  }

  const totalLessons = Array.isArray(course.modules) ? course.modules.reduce((total, module) => total + (Array.isArray(module.lessons) ? module.lessons.length : 0), 0) : 0;
  const completedLessons = Array.isArray(course.modules) ? course.modules.flatMap(m => Array.isArray(m.lessons) ? m.lessons : []).filter(l => l.completed).length : 0;
  const progress = Math.round((completedLessons / totalLessons) * 100) || 0;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection>
        <CourseHeader>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }} dir="rtl">
            {/* Top header like screenshots: centered title, icon on right, meta pills, CTA */}
            <Grid container spacing={4} alignItems="center">
              <Grid xs={12} lg={9} sx={{ mx: 'auto' }}>
              {/* Breadcrumb */}
              <StyledBreadcrumb sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                  <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 1, fontSize: 20 }} />
                    الرئيسية
                  </Link>
                  <Link to="/courses" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    الدورات
                  </Link>
                  <Typography color="primary.contrastText">{course.category}</Typography>
                </Breadcrumbs>
              </StyledBreadcrumb>

                {/* Course Title and Subtitle + actions */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, alignItems: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <CourseTitle variant="h3" component="h1" sx={{ textAlign: 'right', mb: 1 }}>
                {course.title}
              </CourseTitle>
                    <CourseSubtitle variant="subtitle1" component="h2" sx={{ textAlign: 'right', opacity: 0.85 }}>
                {course.subtitle}
              </CourseSubtitle>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton color={isInWishlist ? 'primary' : 'default'} onClick={handleAddToWishlist} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }}>
                      {isInWishlist ? <BookmarkAdded /> : <BookmarkBorder />}
                    </IconButton>
                    <IconButton onClick={handleOpenShare} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }}>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Menu anchorEl={shareAnchorEl} open={Boolean(shareAnchorEl)} onClose={handleCloseShare}>
                  <MenuItem onClick={handleCloseShare}><WhatsApp sx={{ mr: 1 }} /> واتساب</MenuItem>
                  <MenuItem onClick={handleCloseShare}><Facebook sx={{ mr: 1 }} /> فيسبوك</MenuItem>
                  <MenuItem onClick={handleCloseShare}><Twitter sx={{ mr: 1 }} /> تويتر</MenuItem>
                  <MenuItem onClick={handleCloseShare}><LinkedIn sx={{ mr: 1 }} /> لينكدإن</MenuItem>
                </Menu>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1.25, mt: 1.5 }}>
                  <StatsPill>
                    <StarIcon fontSize="small" sx={{ ml: 0.5 }} />
                    {(() => {
                      const rating = course.rating;
                      const val = typeof rating === 'number' ? rating.toFixed(1) : (isNaN(parseFloat(rating)) ? '0.0' : parseFloat(rating).toFixed(1));
                      return `${val}`;
                    })()} • {Array.isArray(course.reviews) ? course.reviews.length : 0} تقييم
                  </StatsPill>
                  <StatsPill>
                    <GroupIcon fontSize="small" sx={{ ml: 0.5 }} />
                    {(() => {
                          const students = course.students;
                      if (typeof students === 'number') return students.toLocaleString();
                      const n = parseFloat(students);
                      return isNaN(n) ? '0' : n.toLocaleString();
                    })()} مشترك
                  </StatsPill>
                  <StatsPill>
                    <AccessTime fontSize="small" sx={{ ml: 0.5 }} /> {course.duration}
                  </StatsPill>
                  <StatsPill>
                    <TrendingUpIcon fontSize="small" sx={{ ml: 0.5 }} /> {course.level === 'Beginner' ? 'مبتدئ' : course.level === 'Intermediate' ? 'متوسط' : course.level === 'Advanced' ? 'متقدم' : course.level}
                  </StatsPill>
                  <StatsPill>
                    <LanguageIcon fontSize="small" sx={{ ml: 0.5 }} /> {course.language}
                  </StatsPill>
                  <StatsPill>
                    <ClosedCaptionIcon fontSize="small" sx={{ ml: 0.5 }} /> CC: {Array.isArray(course.captions) ? course.captions.join(', ') : 'غير متوفر'}
                  </StatsPill>
                  </Box>

                 {/* Instructor Info plus reviews count */}
                 <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2, justifyContent: 'space-between', gap: 2 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={course.instructorAvatar} 
                  alt={course.instructor}
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    mr: 2.5,
                    border: '2px solid white',
                    boxShadow: 2
                  }}
                />
                <Box sx={{ mr: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {course.instructor}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)" fontSize="0.8rem" >
                    {course.instructorTitle}
                  </Typography>
                </Box>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Rating 
                       value={course.rating} 
                       precision={0.1} 
                       readOnly 
                       size="small"
                       emptyIcon={<StarBorder fontSize="inherit" />}
                       sx={{ ml: 3 }}
                     />
                     <Typography variant="body2" color="primary.contrastText">
                       {(() => {
                         const rating = course.rating;
                         if (typeof rating === 'number') {
                           return rating.toFixed(1);
                         } else if (typeof rating === 'string') {
                           const numRating = parseFloat(rating);
                           return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
                         } else {
                           return '0.0';
                         }
                       })()} ({Array.isArray(course.reviews) ? course.reviews.length : 0})
                  </Typography>
                </Box>
              </Box>

              {/* Last Updated */}
              <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 2 }}>
                آخر تحديث {course.lastUpdated}
              </Typography>

              {/* Progress Bar (for enrolled students) */}
              {isEnrolled && (
                <Box sx={{ mt: 3, maxWidth: '600px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={500}>
                      تقدمك: {progress}% مكتمل
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedLessons} من {totalLessons} درس
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: (theme) => `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
                      }
                    }} 
                  />
                </Box>
              )}
                {/* CTA buttons centered like screenshots with smaller height */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    sx={{ 
                      borderRadius: 999, px: 4, py: 1.25, fontWeight: 700, 
                      borderColor: 'common.white', color: 'common.white', 
                      '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.12)' },
                      '& .MuiButton-startIcon': { ml: 1, mr: 0 }
                    }} 
                    onClick={handleOpenPreview} 
                    startIcon={<PlayCircleOutline sx={{ color: 'common.white' }} />}
                  >
                    مشاهدة نبذة
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    disabled={isAddingToCart}
                    sx={{ 
                      borderRadius: 999, px: 4, py: 1.25, fontWeight: 700, 
                      borderColor: 'common.white', color: 'common.white', 
                      '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.12)' },
                      '& .MuiButton-startIcon': { ml: 1, mr: 0 }
                    }} 
                    onClick={handleAddToCart} 
                    startIcon={isAddingToCart ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart sx={{ color: 'common.white' }} />}
                  >
                    {isAddingToCart ? 'جاري الإضافة...' : 'أضف للسلة'}
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    disabled={isProcessingPayment}
                    sx={{ borderRadius: 999, px: 4, py: 1.25, fontWeight: 700, '& .MuiButton-startIcon': { ml: 1, mr: 0 } }} 
                    onClick={handleDirectPayment} 
                    startIcon={isProcessingPayment ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  >
                    {isProcessingPayment ? 'جاري التوجيه...' : 'اشترك الآن'}
                  </Button>
                </Box>
              </Grid>
    
            </Grid>
          </Container>
        </CourseHeader>
      </HeroSection>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <Box 
              component="iframe"
              src={course.previewUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              title="Course Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sx={{
                border: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          pt: { xs: layout.sectionYMobile, md: layout.sectionY }, 
          pb: { xs: layout.sectionYMobile + 2, md: layout.sectionY + 2 }, 
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: '60vh'
        }}
      >
        <Grid 
          container 
          spacing={layout.gridSpacing} 
          ref={courseContentRef} 
          sx={{ 
            position: 'relative',
            minHeight: '100%'
          }}
        >
          {/* Main Content */}
          <Grid xs={12} lg={12} sx={{ order: { xs: 1, lg: 1 }, width: '100%' }}>
                          {/* Course Navigation Tabs */}
              <Paper sx={{ mb: 4, borderRadius: 3, overflow: 'visible', boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}` }} elevation={0}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  centered
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTabs-flexContainer': {
                      '& .MuiButtonBase-root': {
                        flex: 1,
                        minWidth: 'auto',
                        maxWidth: 'none',
                        flexBasis: 0,
                        width: 'auto',
                        justifyContent: 'center',
                        textAlign: 'center',
                        py: 2,
                        px: 2,
                        minHeight: 56,
                        fontSize: '1rem',
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 999,
                        mx: 0.75,
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.3s ease',
                        color: 'text.secondary',
                        '&.Mui-selected': {
                          color: 'primary.main',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          fontWeight: 600,
                          boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.18)}`,
                        },
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                        },
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: 4,
                      borderRadius: 2,
                    },
                  }}
                >
                  <Tab label="نظرة عامة" />
                  <Tab label="المنهج" />
                  <Tab label="المدرب والتقييمات" />
                  <Tab label="الأسئلة الشائعة" />
                </Tabs>
              </Paper>

            {/* Tab Content */}
            <Box sx={{ mb: 6 }}>
              {tabValue === 0 && (
                <ContentSection>
                  {/* Nested tabs under Overview */}
                  <Tabs
                    value={overviewSubTab}
                    onChange={handleOverviewSubTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 3, '& .MuiTab-root': { minWidth: 'auto' } }}
                  >
                    <Tab label="وصف الدورة" />
                    <Tab label="الخطة الزمنية" />
                    <Tab label="المحتوى الإثرائي" />
                  </Tabs>

                  {overviewSubTab === 0 && (
                    <Box>
                  <SectionTitle variant="h5" component="h2" gutterBottom>
                    وصف الدورة
                  </SectionTitle>
                  <Typography variant="body1" paragraph dir="rtl" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    {course.longDescription}
                  </Typography>

                  {/* بطاقة معلومات سريعة */}
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid xs={6} md={3}>
                      <FeatureItem>
                        <ScheduleIcon />
                        <Typography variant="body2">المدة: {course.duration}</Typography>
                      </FeatureItem>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <FeatureItem>
                        <VideoLibraryIcon />
                        <Typography variant="body2">المحاضرات: {totalLessons}</Typography>
                      </FeatureItem>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <FeatureItem>
                        <LanguageIcon />
                        <Typography variant="body2">اللغة: {course.language}</Typography>
                      </FeatureItem>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <FeatureItem>
                        <WorkspacePremiumIcon />
                        <Typography variant="body2">شهادة: نعم</Typography>
                      </FeatureItem>
                    </Grid>
                  </Grid>

                  <SoftDivider sx={{ my: 3 }} />

                  {/* أقسام إضافية مقترحة */}
                  <Grid container spacing={2}>
                    {Array.isArray(course.requirements) && course.requirements.length > 0 && (
                      <Grid xs={12} md={6}>
                        <SectionTitle variant="h6" component="h3" sx={{ mb: 2 }}>المتطلبات</SectionTitle>
                        <List disablePadding>
                          {course.requirements.map((req, idx) => (
                            <ListItem key={idx} disableGutters sx={{ py: 0.75 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircle color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={<Typography variant="body2" dir="rtl">{req}</Typography>} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                    {Array.isArray(course.whoIsThisFor) && course.whoIsThisFor.length > 0 && (
                      <Grid xs={12} md={6}>
                        <SectionTitle variant="h6" component="h3" sx={{ mb: 2 }}>هذه الدورة مناسبة لـ</SectionTitle>
                        <List disablePadding>
                          {course.whoIsThisFor.map((who, idx) => (
                            <ListItem key={idx} disableGutters sx={{ py: 0.75 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircle color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={<Typography variant="body2" dir="rtl">{who}</Typography>} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                    </Box>
                  )}

                  {overviewSubTab === 1 && (
                    <Box>
                      <SectionTitle variant="h5" component="h2" gutterBottom>
                        الخطة الزمنية
                      </SectionTitle>
                      {course.planPdfUrl ? (
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                          <Box component="iframe" src={course.planPdfUrl} title="الخطة الزمنية" width="100%" height="600px" style={{ border: 0 }} />
                          <Box sx={{ p: 1, textAlign: 'left' }}>
                            <Button variant="outlined" size="small" component={Link} to={course.planPdfUrl} target="_blank" rel="noopener">
                              فتح في نافذة جديدة
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Alert severity="info">لا توجد خطة زمنية متاحة حالياً.</Alert>
                      )}
                    </Box>
                  )}

                  {overviewSubTab === 2 && (
                    <Box>
                      <SectionTitle variant="h5" component="h2" gutterBottom>
                        المحتوى الإثرائي
                      </SectionTitle>
                      {course.enrichmentPdfUrl ? (
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                          <Box component="iframe" src={course.enrichmentPdfUrl} title="المحتوى الإثرائي" width="100%" height="600px" style={{ border: 0 }} />
                          <Box sx={{ p: 1, textAlign: 'left' }}>
                            <Button variant="outlined" size="small" component={Link} to={course.enrichmentPdfUrl} target="_blank" rel="noopener">
                              فتح في نافذة جديدة
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Alert severity="info">لا يوجد محتوى إثرائي متاح حالياً.</Alert>
                      )}
                    </Box>
                  )}
                </ContentSection>
              )}

              {tabValue === 1 && (
                <ContentSection>
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <VideoLibraryIcon sx={{ color: 'primary.main' }} />
                    <SectionTitle variant="h5" component="h2" sx={{ mb: 0 }}>
                           محتوى الدورة
                         </SectionTitle>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Chip size="small" color="default" variant="outlined" icon={<VideoLibraryIcon />} label={`${Array.isArray(course.modules) ? course.modules.length : 0} أقسام`} />
                      <Chip size="small" color="default" variant="outlined" icon={<ArticleIcon />} label={`${totalLessons} محاضرة`} />
                      <Chip size="small" color="default" variant="outlined" icon={<AccessTime />} label={`${course.totalHours} ساعة`} />
                    </Box>
                   </Box>

                  {/* Course Curriculum styled like screenshots */}
                   <Box sx={{ mb: 1 }}>
                    {Array.isArray(course.modules) ? course.modules.map((module, moduleIndex) => (
                      <ModuleCard 
                        key={module.id} 
                        elevation={0}
                        sx={{ 
                          mb: 2.5,
                          borderRadius: 3,
                          background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha(theme.palette.common.black, 0.2)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                          boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.35)}`,
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
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                             <Box sx={{ 
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                               display: 'flex', 
                               alignItems: 'center', 
                               justifyContent: 'center',
                              fontWeight: 800,
                                color: 'text.primary'
                             }}>
                               {moduleIndex + 1}
                             </Box>
                             <Typography variant="subtitle1" fontWeight={700} dir="rtl" sx={{ color: 'text.primary' }}>
                                {module.title}
                              </Typography>
                            </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {(() => {
                              const completedInModule = module?.lessons?.filter((l) => l?.completed)?.length || 0;
                              const totalInModule = module?.lessons?.length || 0;
                              const percent = totalInModule ? Math.round((completedInModule / totalInModule) * 100) : 0;
                              return (
                                <Chip 
                                  size="small" 
                                  color="success" 
                                  variant="outlined" 
                                  icon={<CheckCircleOutline />} 
                                  label={`إنجاز: ${completedInModule}/${totalInModule} (${percent}%)`} 
                                  sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.08) }}
                                />
                              );
                            })()}
                            <AccessTime fontSize="small" sx={{ color: 'text.secondary', opacity: 0.9 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.9 }}>
                                {module.duration}
                              </Typography>
                            </Box>
                          {expandedModules[module.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </ModuleHeader>
                        {/* إزالة أي شريط أسفل أول وحدة لإخفاء الخط الأزرق */}
                        <Box sx={{ height: 0 }} />
                        <Collapse in={expandedModules[module.id]} timeout="auto" unmountOnExit>
                            <List disablePadding sx={{ px: 2, pb: 2, bgcolor: 'background.paper' }}>
                              {Array.isArray(module.lessons) ? module.lessons.map((lesson, lessonIndex) => (
                                <LessonItem 
                                  key={lesson.id}
                                  completed={lesson.completed}
                                  preview={lesson.isPreview}
                                  sx={{
                                    bgcolor: 'background.paper',
                                    px: 0,
                                    py: 1,
                                    transform: 'none',
                                    '&:hover': { transform: 'none', backgroundColor: 'transparent' }
                                  }}
                                >
                                  <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexDirection: 'row-reverse',
                                    border: (theme) => `1px solid ${alpha(theme.palette.grey[400], 0.7)}`,
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1.25,
                                    bgcolor: 'background.paper',
                                    '&:hover': { borderColor: (theme) => alpha(theme.palette.primary.main, 0.5) }
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                      {/* Icon on the far right (RTL) */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', opacity: 0.95 }}>
                                        {lesson?.type === 'video' && <VideocamIcon fontSize="small" />}
                                        {lesson?.type === 'article' && <InsertDriveFileIcon fontSize="small" />}
                                        {lesson?.type === 'quiz' && <QuizIconFilled fontSize="small" />}
                                        {(lesson?.type === 'list' || lesson?.type === 'requirements') && <ListAltIcon fontSize="small" />}
                                        {!lesson?.type && getLessonIcon(lesson)}
                                      </Box>
                                      <Typography variant="body2" dir="rtl" sx={{ color: 'text.primary' }}>
                                          {lesson.title}
                                    </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {lesson.duration}
                                        </Typography>
                                      </Box>
                                  </Box>
                                </LessonItem>
                              )) : null}
                            </List>
                        </Collapse>
                      </ModuleCard>
                    )) : null}
                  </Box>
                </ContentSection>
              )}

              {tabValue === 2 && (
                <ContentSection>
                  {/* Compact horizontal instructor strip */}
                  <Box sx={{
                    mb: 3,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={course.instructorAvatar} 
                      alt={course.instructor}
                        sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'primary.main' }}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                      {course.instructor}
                    </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {course.instructorTitle}
                    </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating 
                        value={course.instructorRating} 
                        precision={0.1} 
                        readOnly 
                          size="small"
                        emptyIcon={<StarBorder fontSize="inherit" />}
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {(() => {
                            const r = course.instructorRating;
                            if (typeof r === 'number') return r.toFixed(1);
                            const n = parseFloat(r);
                            return isNaN(n) ? '0.0' : n.toFixed(1);
                          })()} / 5.0
                      </Typography>
                    </Box>
                      <Chip size="small" color="default" variant="outlined" label={`${course.instructorStudents?.toLocaleString?.() || course.instructorStudents || 0} طالب`} />
                      <Chip size="small" color="default" variant="outlined" label={`${course.instructorCourses || 0} دورة`} />
                      <Button variant="text" size="small" sx={{ textTransform: 'none' }}>
                        عرض الملف الشخصي
                      </Button>
                      </Box>
                      </Box>

                  {/* Reviews section below instructor */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                      <SectionTitle variant="h5" component="h2" sx={{ mb: 0.5 }}>
                        تقييمات الطلاب
                      </SectionTitle>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h3" component="span" sx={{ mr: 1, fontWeight: 700 }}>
                          {(() => {
                          const rating = course.rating;
                          if (typeof rating === 'number') {
                            return rating.toFixed(1);
                          } else if (typeof rating === 'string') {
                            const numRating = parseFloat(rating);
                            return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
                          } else {
                            return '0.0';
                          }
                        })()}
                        </Typography>
                        <Rating 
                          value={course.rating} 
                          precision={0.1} 
                          readOnly 
                          size="large"
                          emptyIcon={<StarBorder fontSize="inherit" />}
                          sx={{ mr: 1.25 }}
                        />
                        <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                          تقييم الدورة • {course.reviews.length} تقييم
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<DescriptionOutlined />}
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      }}
                    >
                      كتابة تقييم
                    </Button>
                  </Box>

                  {/* Rating Distribution */}
                  <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      تفصيل التقييمات
                    </Typography>
                    {[5, 4, 3, 2, 1].map((star) => (
                                              <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ width: 80, display: 'flex', justifyContent: 'space-between', mr: 2 }}>
                            <Typography variant="body2" fontWeight={500}>{star} نجمة</Typography>
                            <Box sx={{ width: 8 }} />
                          </Box>
                          <Box sx={{ flexGrow: 1, mx: 2 }}>
                            <Box sx={{ width: '100%', height: 10, bgcolor: 'divider', borderRadius: 5, overflow: 'hidden' }}>
                              <Box 
                                sx={{ 
                                  height: '100%', 
                                  width: `${(star / 5) * 100}%`, 
                                  background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
                                  borderRadius: 5
                                }} 
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                            {Math.round((star / 5) * course.reviews.length)} تقييم
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
                              <Typography variant="subtitle1" fontWeight={600} dir="rtl">
                                {review.user}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating 
                                  value={review.rating} 
                                  precision={0.5} 
                                  readOnly 
                                  size="small"
                                  emptyIcon={<StarBorder fontSize="inherit" />}
                                  sx={{ mr: 1.25, color: 'warning.main' }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                  {review.date}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <IconButton 
                            size="small" 
                            color={review.isLiked ? 'primary' : 'default'}
                            onClick={() => {}}
                            sx={{ 
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {review.isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {review.likes}
                            </Typography>
                          </IconButton>
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }} dir="rtl">
                          {review.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" dir="rtl" sx={{ lineHeight: 1.8 }}>
                          {review.content}
                        </Typography>
                      </Box>
                    )) : null}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        sx={{ 
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        تحميل المزيد من التقييمات
                      </Button>
                    </Box>
                  </Box>
                </ContentSection>
              )}

              {tabValue === 3 && (
                <Box>
                  <SectionTitle variant="h5" component="h2" gutterBottom>
                    الأسئلة الشائعة
                  </SectionTitle>
                  <Box sx={{ mb: 4 }}>
                    {course.faqs && course.faqs.length > 0 ? (
                      course.faqs.map((faq, index) => (
                        <Accordion 
                          key={index} 
                          elevation={0}
                          sx={{
                            mb: 2,
                            border: '1px solid', 
                            borderColor: 'divider',
                            borderRadius: 2,
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
                              minHeight: 70,
                              '&.Mui-expanded': {
                                minHeight: 70,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              },
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={600} dir="rtl">
                              {faq.question}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body1" color="text.secondary" dir="rtl" sx={{ lineHeight: 1.8 }}>
                              {faq.answer}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        لا توجد أسئلة شائعة متاحة في الوقت الحالي.
                      </Typography>
                    )}
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
            width: 60,
            height: 60,
            borderRadius: '50%',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
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

        {/* Related Courses Section */}
        {Array.isArray(relatedCourses) && relatedCourses.length > 0 && (
        <Container maxWidth="lg" sx={{ pt: 1, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ mb: 1 }}>
            <SectionTitle variant="h4" component="h2" gutterBottom>
              الدورات ذات الصلة
            </SectionTitle>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              إخترنا لك مجموعة من الدورات التي قد تعجبك
            </Typography>
          </Box>
          
          {/* Grid Container */}
          <Grid container spacing={4}>
            {Array.isArray(relatedCourses) ? relatedCourses.slice(0, 3).map((relatedCourse) => (
              <Grid key={relatedCourse.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    },
                  }}
                  onClick={() => navigate(`/courses/${relatedCourse.id}`)}
                >
                  {/* Card Header with Bookmark and Provider */}
                  <Box sx={{ position: 'relative', p: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      {/* Bookmark Icon */}
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        <BookmarkBorder fontSize="small" />
                      </IconButton>
                      
                      {/* Provider Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={relatedCourse.instructorAvatar} 
                          alt={relatedCourse.instructor}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          معهد التطوير المهني
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Course Image */}
                  <Box sx={{ position: 'relative', px: 2, pb: 2 }}>
                    <Box sx={{
                      width: '100%',
                      height: 160,
                      borderRadius: 2,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      <img 
                        src={relatedCourse.image || 'https://source.unsplash.com/random/400x160?programming'}
                        alt={relatedCourse.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Course Content */}
                  <CardContent sx={{ p: 2, pt: 0 }}>
                    {/* Category Tag */}
                    <Chip 
                      label="التدريب الإلكتروني" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ 
                        mb: 2,
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                    
                    {/* Course Details (Lessons & Students) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VideoIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {relatedCourse.lectures || 4} درس
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleAltOutlined fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {relatedCourse.students || 6} طالب
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Course Title */}
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.3,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '1rem',
                      }}
                      dir="rtl"
                    >
                      {relatedCourse.title}
                    </Typography>
                    
                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating 
                        value={(() => {
                          const rating = relatedCourse.rating;
                          if (typeof rating === 'number') {
                            return rating;
                          } else if (typeof rating === 'string') {
                            const numRating = parseFloat(rating);
                            return isNaN(numRating) ? 0 : numRating;
                          } else {
                            return 0;
                          }
                        })()} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                        emptyIcon={<StarBorder fontSize="inherit" />}
                        sx={{ 
                          mr: 1.25,
                          '& .MuiRating-iconFilled': {
                            color: 'warning.main',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        {(() => {
                          const rating = relatedCourse.rating;
                          if (typeof rating === 'number') {
                            return rating.toFixed(1);
                          } else if (typeof rating === 'string') {
                            const numRating = parseFloat(rating);
                            return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
                          } else {
                            return '0.0';
                          }
                        })()}/5.00
                      </Typography>
                    </Box>
                    
                    {/* Price */}
                    <Typography 
                      variant="h6" 
                      color="warning.main" 
                      fontWeight={700}
                      sx={{ fontSize: '1.1rem' }}
                    >
                      {(() => {
                        const price = relatedCourse.price;
                        if (typeof price === 'number') {
                          return price.toFixed(2);
                        } else if (typeof price === 'string') {
                          const numPrice = parseFloat(price);
                          return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
                        } else {
                          return '0.00';
                        }
                      })()} ر.س
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )) : null}
          </Grid>
        </Container>
      )}

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
};

export default CourseDetail;
