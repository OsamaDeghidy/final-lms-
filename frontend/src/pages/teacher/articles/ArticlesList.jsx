import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Container,
  Skeleton,
  useTheme,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  alpha,
  keyframes,
  Tabs,
  Tab,
  Badge,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  PublishedWithChanges as PublishedIcon,
  Drafts as DraftIcon,
  Archive as ArchiveIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Star as StarIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 58, 183, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 58, 183, 0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(4, 0, 3),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: `${float} 6s ease-in-out infinite`,
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  overflow: 'hidden',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) rotateX(2deg)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.15)}`,
    '&::before': {
      opacity: 1,
    },
    '& .article-image': {
      transform: 'scale(1.08)'
    },
    '& .action-buttons': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  fontSize: '0.7rem',
  height: 24,
  ...(status === 'published' && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
      transform: 'translateY(-1px)',
    }
  }),
  ...(status === 'draft' && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.warning.dark,
      transform: 'translateY(-1px)',
    }
  }),
  ...(status === 'archived' && {
    backgroundColor: theme.palette.grey[500],
    color: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: theme.palette.grey[600],
      transform: 'translateY(-1px)',
    }
  }),
}));

const FilterChip = styled(Chip)(({ theme, active }) => ({
  fontWeight: 600,
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  height: 32,
  ...(active && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: 'white',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    transform: 'translateY(-2px)',
  }),
  '&:hover': {
    transform: active ? 'translateY(-2px)' : 'translateY(-1px)',
    boxShadow: active 
      ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 4px 12px ${alpha(theme.palette.grey[400], 0.3)}`,
  }
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    backgroundColor: alpha(theme.palette.common.white, 0.95),
    backdropFilter: 'blur(10px)',
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const ActionButton = styled(IconButton)(({ theme, variant }) => ({
  width: 28,
  height: 28,
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  ...(variant === 'edit' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'delete' && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
      transform: 'scale(1.1)',
    }
  }),
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.default}, ${alpha(theme.palette.primary.main, 0.05)})`,
  borderRadius: 24,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const ArticlesList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState('grid');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockArticles = [
          {
            id: 1,
            title: 'دليل شامل لتطوير تطبيقات الويب الحديثة',
            summary: 'تعرف على أحدث تقنيات تطوير الويب بما في ذلك React, Vue.js, و Angular. دليل عملي لبناء تطبيقات ويب متقدمة وسريعة.',
            status: 'published',
            views_count: 2150,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:45:00Z',
            published_at: '2024-01-16T09:00:00Z',
            featured: true,
            tags: ['React', 'Vue.js', 'Angular'],
            image: 'https://via.placeholder.com/400x250/4A6CF7/ffffff?text=Web+Development',
            reading_time: 12,
            likes_count: 89,
            comments_count: 23,
            category: 'تطوير الويب'
          },
          {
            id: 2,
            title: 'الذكاء الاصطناعي في التعليم: مستقبل التعلم',
            summary: 'استكشاف دور الذكاء الاصطناعي في تحويل التعليم. كيف يمكن للتقنيات الحديثة تحسين تجربة التعلم.',
            status: 'draft',
            views_count: 0,
            created_at: '2024-01-18T16:20:00Z',
            updated_at: '2024-01-19T11:15:00Z',
            published_at: null,
            featured: false,
            tags: ['AI', 'التعليم', 'التعلم الآلي'],
            image: 'https://via.placeholder.com/400x250/6C63FF/ffffff?text=AI+Education',
            reading_time: 8,
            likes_count: 0,
            comments_count: 0,
            category: 'الذكاء الاصطناعي'
          },
          {
            id: 3,
            title: 'أساسيات تصميم واجهات المستخدم UX/UI',
            summary: 'دليل شامل لتصميم واجهات مستخدم جذابة وسهلة الاستخدام. تعرف على مبادئ التصميم وأفضل الممارسات.',
            status: 'published',
            views_count: 1567,
            created_at: '2024-01-10T08:15:00Z',
            updated_at: '2024-01-12T13:30:00Z',
            published_at: '2024-01-11T10:00:00Z',
            featured: false,
            tags: ['UX', 'UI', 'تصميم'],
            image: 'https://via.placeholder.com/400x250/00C853/ffffff?text=UX+UI+Design',
            reading_time: 10,
            likes_count: 45,
            comments_count: 12,
            category: 'تصميم'
          },
          {
            id: 4,
            title: 'تطوير تطبيقات الموبايل باستخدام Flutter',
            summary: 'خطوة بخطوة لإنشاء تطبيقات موبايل متقدمة باستخدام Flutter. تعرف على أساسيات التطوير وأفضل الممارسات.',
            status: 'archived',
            views_count: 1423,
            created_at: '2023-12-20T12:00:00Z',
            updated_at: '2024-01-05T15:20:00Z',
            published_at: '2023-12-22T09:00:00Z',
            featured: false,
            tags: ['Flutter', 'موبايل', 'تطوير'],
            image: 'https://via.placeholder.com/400x250/FFAB00/ffffff?text=Flutter+Mobile',
            reading_time: 15,
            likes_count: 38,
            comments_count: 8,
            category: 'تطوير الموبايل'
          },
          {
            id: 5,
            title: 'أمن المعلومات: حماية البيانات في العصر الرقمي',
            summary: 'تعرف على أساسيات أمن المعلومات وكيفية حماية البيانات والأنظمة من التهديدات الإلكترونية الحديثة.',
            status: 'published',
            views_count: 1345,
            created_at: '2024-01-12T11:30:00Z',
            updated_at: '2024-01-14T16:45:00Z',
            published_at: '2024-01-13T09:00:00Z',
            featured: false,
            tags: ['أمن', 'حماية', 'بيانات'],
            image: 'https://via.placeholder.com/400x250/FF3D00/ffffff?text=Cybersecurity',
            reading_time: 14,
            likes_count: 52,
            comments_count: 18,
            category: 'الأمن السيبراني'
          },
          {
            id: 6,
            title: 'تعلم Machine Learning من الصفر إلى الاحتراف',
            summary: 'رحلة شاملة في عالم التعلم الآلي من المفاهيم الأساسية إلى التطبيقات العملية المتقدمة.',
            status: 'draft',
            views_count: 0,
            created_at: '2024-01-10T08:20:00Z',
            updated_at: '2024-01-15T12:30:00Z',
            published_at: null,
            featured: false,
            tags: ['Machine Learning', 'AI', 'تعلم آلي'],
            image: 'https://via.placeholder.com/400x250/9C27B0/ffffff?text=Machine+Learning',
            reading_time: 20,
            likes_count: 0,
            comments_count: 0,
            category: 'الذكاء الاصطناعي'
          }
        ];
        
        setArticles(mockArticles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleEdit = () => {
    if (selectedArticle) {
      navigate(`/teacher/articles/${selectedArticle.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      setArticles(prev => prev.filter(article => article.id !== selectedArticle.id));
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'updated_at':
        return new Date(b.updated_at) - new Date(a.updated_at);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'views':
        return b.views_count - a.views_count;
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStats = () => {
    const total = articles.length;
    const published = articles.filter(a => a.status === 'published').length;
    const draft = articles.filter(a => a.status === 'draft').length;
    const archived = articles.filter(a => a.status === 'archived').length;
    const totalViews = articles.reduce((sum, a) => sum + a.views_count, 0);
    
    return { total, published, draft, archived, totalViews };
  };

  const stats = getStats();

  const renderArticleCard = (article) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <ModernCard sx={{ height: '100%', cursor: 'pointer' }}>
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="140"
            image={article.image}
            alt={article.title}
            className="article-image"
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
          />
          
          {/* Action Buttons */}
          <Box 
            className="action-buttons"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              opacity: 0,
              transform: 'translateX(20px)',
              transition: 'all 0.3s ease',
              zIndex: 3
            }}
          >
            <Tooltip title="تعديل المقالة" placement="left">
              <ActionButton
                variant="edit"
                onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, article); }}
                size="small"
              >
                <EditIcon sx={{ fontSize: 12 }} />
              </ActionButton>
            </Tooltip>
            <Tooltip title="حذف المقالة" placement="left">
              <ActionButton
                variant="delete"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                size="small"
              >
                <DeleteIcon sx={{ fontSize: 12 }} />
              </ActionButton>
            </Tooltip>
          </Box>
          
          {/* Featured Badge */}
          {article.featured && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '6px',
                  px: 0.6,
                  py: 0.2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.2,
                  boxShadow: '0 2px 6px rgba(255, 215, 0, 0.4)',
                }}
              >
                <StarIcon sx={{ fontSize: 10, color: 'white' }} />
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.55rem' }}>
                  مميز
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Status Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              zIndex: 2,
            }}
          >
            <StatusChip
              label={article.status === 'published' ? 'منشور' : 
                     article.status === 'draft' ? 'مسودة' : 'مؤرشف'}
              status={article.status}
              size="small"
            />
          </Box>
        </Box>
        
        <CardContent className="card-content" sx={{ 
          flexGrow: 1, 
          p: 2, 
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                }}
              >
                <ArticleIcon sx={{ fontSize: 10 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontWeight: 500,
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {article.category}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ 
              fontSize: '0.55rem',
              opacity: 0.7
            }}>
              {formatDate(article.updated_at)}
            </Typography>
          </Box>
          
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{ 
            fontWeight: 600, 
            lineHeight: 1.3, 
            minHeight: '2.4em',
            color: theme.palette.text.primary,
            fontSize: '0.85rem',
            mb: 1
          }}>
            {article.title}
          </Typography>
          
          {/* Summary */}
          <Typography variant="body2" color="text.secondary" sx={{ 
            lineHeight: 1.4, 
            minHeight: '2.8em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '0.7rem',
            mb: 1.5
          }}>
            {article.summary}
          </Typography>
          
          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
            {article.tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.5rem', 
                  fontWeight: 500,
                  borderRadius: '3px',
                  height: 14,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              />
            ))}
          </Box>
          
          {/* Footer Stats */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto',
            pt: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.3
              }}>
                <VisibilityIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                  {article.views_count.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.3
              }}>
                <ScheduleIcon sx={{ fontSize: 10, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                  {article.reading_time} د
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </ModernCard>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <HeroSection>
          <Container>
            <Skeleton variant="text" width={400} height={60} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={600} height={40} sx={{ mx: 'auto' }} />
          </Container>
        </HeroSection>
        
        <Container sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} lg={4} key={item}>
                <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeroSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h3" component="h1" sx={{ 
              fontWeight: 700, 
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              background: 'linear-gradient(45deg, #fff, #e3f2fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              إدارة المقالات
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, fontWeight: 300 }}>
              قم بإدارة مقالاتك وإنشاء محتوى جديد
            </Typography>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/articles/create')}
                sx={{
                  background: 'linear-gradient(45deg, #4A6CF7 30%, #6C63FF 90%)',
                  borderRadius: '16px',
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: '0 6px 24px rgba(74, 108, 247, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(74, 108, 247, 0.4)',
                  },
                }}
              >
                مقالة جديدة
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </HeroSection>

      <Container sx={{ py: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatsCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      إجمالي المقالات
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <ArticleIcon />
                  </Box>
                </Box>
              </StatsCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StatsCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats.published}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      منشور
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: alpha(theme.palette.success.main, 0.15),
                      color: theme.palette.success.main,
                    }}
                  >
                    <PublishedIcon />
                  </Box>
                </Box>
              </StatsCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StatsCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {stats.draft}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      مسودة
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: alpha(theme.palette.warning.main, 0.15),
                      color: theme.palette.warning.main,
                    }}
                  >
                    <DraftIcon />
                  </Box>
                </Box>
              </StatsCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StatsCard>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {stats.totalViews.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      إجمالي المشاهدات
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: alpha(theme.palette.info.main, 0.15),
                      color: theme.palette.info.main,
                    }}
                  >
                    <VisibilityIcon />
                  </Box>
                </Box>
              </StatsCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <HeaderContainer>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mr: 2, color: 'primary.main' }}>
              تصفية المقالات:
            </Typography>
            
            <SearchBox
              placeholder="البحث في المقالات..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: 280, 
                flexGrow: 1,
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FilterChip
                label="الكل"
                onClick={() => handleFilterChange('all')}
                active={filterStatus === 'all'}
              />
              <FilterChip
                label="منشور"
                onClick={() => handleFilterChange('published')}
                active={filterStatus === 'published'}
              />
              <FilterChip
                label="مسودة"
                onClick={() => handleFilterChange('draft')}
                active={filterStatus === 'draft'}
              />
              <FilterChip
                label="مؤرشف"
                onClick={() => handleFilterChange('archived')}
                active={filterStatus === 'archived'}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {sortedArticles.length} مقالة {searchQuery && `مطابقة لـ "${searchQuery}"`}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="عرض شبكي">
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="عرض قائمة">
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </HeaderContainer>

        {sortedArticles.length > 0 ? (
          <Box>
            <AnimatePresence>
              <Grid container spacing={2}>
                {sortedArticles.map((article) => (
                  <Grid item xs={12} sm={6} lg={4} key={article.id}>
                    {renderArticleCard(article)}
                  </Grid>
                ))}
              </Grid>
            </AnimatePresence>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                لا توجد مقالات {searchQuery && `مطابقة لـ "${searchQuery}"`}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/articles/create')}
                sx={{ borderRadius: 2 }}
              >
                إنشاء مقالة جديدة
              </Button>
            </motion.div>
          </Box>
        )}
      </Container>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          تعديل
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          حذف
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف المقالة "{selectedArticle?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticlesList; 