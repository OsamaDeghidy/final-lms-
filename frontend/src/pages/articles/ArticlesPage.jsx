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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  alpha,
  keyframes
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { articleAPI } from '../../services/api.service';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #0e5181 0%, #1a5f8a 50%, #0a3d62 100%)`,
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
    background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: `${float} 6s ease-in-out infinite`,
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'row', // تغيير إلى أفقي
  borderRadius: 20,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(25, 118, 210, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1565c0)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  },
  '&:hover': {
    transform: 'translateY(-8px) rotateX(2deg)',
    boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
    '& .article-image': {
      transform: 'scale(1.1) rotate(2deg)'
    },
    '& .read-more': {
      transform: 'translateX(8px)',
    },
    '& .card-content': {
      transform: 'translateX(-4px)',
    }
  }
}));

const CategoryChip = styled(Chip)(({ theme, category }) => ({
  fontWeight: 800,
  borderRadius: '25px',
  fontSize: '0.65rem',
  height: 28,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
  ...(category === 'تطوير الويب' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
  }),
  ...(category === 'الذكاء الاصطناعي' && {
    background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    color: 'white',
  }),
  ...(category === 'تصميم' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
  }),
  ...(category === 'تطوير الموبايل' && {
    background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
    color: 'white',
  }),
  ...(category === 'الأمن السيبراني' && {
    background: 'linear-gradient(135deg, #F44336, #EF5350)',
    color: 'white',
  }),
  ...(category === 'قواعد البيانات' && {
    background: 'linear-gradient(135deg, #607D8B, #90A4AE)',
    color: 'white',
  }),
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    backgroundColor: alpha('#ffffff', 0.95),
    backdropFilter: 'blur(10px)',
    fontSize: '1.1rem',
    '&:hover fieldset': {
      borderColor: '#0e5181',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0e5181',
      borderWidth: 2,
    },
  },
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 20,
  background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8f9ff', 0.95)})`,
  backdropFilter: 'blur(20px)',
  boxShadow: `0 8px 32px ${alpha('#1976d2', 0.08)}`,
  border: `1px solid ${alpha('#1976d2', 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, #1976d2, #42a5f5, #1565c0)`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const ActionButton = styled(IconButton)(({ theme, variant }) => ({
  width: 40,
  height: 40,
  borderRadius: '14px',
  transition: 'all 0.3s ease',
  ...(variant === 'like' && {
    backgroundColor: alpha('#1976d2', 0.1),
    color: '#1976d2',
  '&:hover': {
      backgroundColor: '#1976d2',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
  ...(variant === 'bookmark' && {
    backgroundColor: alpha('#42a5f5', 0.1),
    color: '#42a5f5',
    '&:hover': {
      backgroundColor: '#42a5f5',
      color: 'white',
      transform: 'scale(1.1)',
    }
  }),
}));

const ReadMoreButton = styled(Box)(({ theme, category }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  fontWeight: 700,
  fontSize: '0.85rem',
  color: '#1976d2',
  padding: '8px 16px',
  borderRadius: '25px',
  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))',
  border: '1px solid rgba(25, 118, 210, 0.2)',
  '& .arrow-circle': {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    ...(category === 'تطوير الويب' && {
      background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    }),
    ...(category === 'الذكاء الاصطناعي' && {
      background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    }),
    ...(category === 'تصميم' && {
      background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    }),
    ...(category === 'تطوير الموبايل' && {
      background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
    }),
    ...(category === 'الأمن السيبراني' && {
      background: 'linear-gradient(135deg, #F44336, #EF5350)',
    }),
    ...(category === 'قواعد البيانات' && {
      background: 'linear-gradient(135deg, #607D8B, #90A4AE)',
    }),
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(66, 165, 245, 0.15))',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(25, 118, 210, 0.2)',
    '& .arrow-circle': {
      transform: 'scale(1.15) rotate(15deg)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
    }
  }
}));

const ArticlesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [likedArticles, setLikedArticles] = useState(new Set());

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Fetching articles from API...');
        
        const response = await articleAPI.getArticles({
          page: currentPage,
          page_size: 6,
          search: searchQuery,
          status: 'published',
          ordering: sortBy === 'latest' ? '-created_at' : 
                   sortBy === 'oldest' ? 'created_at' : 
                   sortBy === 'popular' ? '-views_count' : '-created_at'
        });
        
        console.log('Articles API response:', response);
        
        // Handle different response formats
        let articlesData = [];
        let totalCount = 0;
        
        if (Array.isArray(response)) {
          articlesData = response;
          totalCount = response.length;
        } else if (response.results) {
          articlesData = response.results;
          totalCount = response.count || response.results.length;
        } else if (response.data) {
          articlesData = response.data;
          totalCount = response.total || response.data.length;
        } else {
          articlesData = [];
          totalCount = 0;
        }
        
        // Transform articles data to match our component structure
        const transformedArticles = articlesData.map(article => ({
          id: article.id,
          title: article.title || '',
          summary: article.summary || '',
          content: article.content || '',
          author: {
            name: article.author_name || article.author?.name || article.author?.first_name || 'مؤلف غير معروف',
            avatar: article.author?.image_profile || article.author?.avatar || `https://via.placeholder.com/40x40/1976d2/ffffff?text=${(article.author_name || article.author?.name || 'A').charAt(0)}`
          },
          category: article.category || 'عام',
          tags: article.tags ? article.tags.map(tag => tag.name || tag) : [],
          image: article.image ? (article.image.startsWith('http') ? article.image : `http://localhost:8000${article.image}`) : 'https://via.placeholder.com/400x250/1976d2/ffffff?text=No+Image',
          published_at: article.published_at || article.created_at,
          reading_time: article.reading_time || 5,
          views_count: article.views_count || 0,
          likes_count: article.likes_count || 0,
          comments_count: article.comments_count || 0,
          featured: article.featured || false,
          rating: 4.5 // Default rating
        }));
        
        setArticles(transformedArticles);
        setTotalPages(Math.ceil(totalCount / 6));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'تطوير الويب', label: 'تطوير الويب' },
    { value: 'الذكاء الاصطناعي', label: 'الذكاء الاصطناعي' },
    { value: 'تصميم', label: 'التصميم' },
    { value: 'تطوير الموبايل', label: 'تطوير الموبايل' },
    { value: 'الأمن السيبراني', label: 'الأمن السيبراني' },
    { value: 'قواعد البيانات', label: 'قواعد البيانات' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'الأحدث' },
    { value: 'oldest', label: 'الأقدم' },
    { value: 'popular', label: 'الأكثر شعبية' },
    { value: 'rating', label: 'الأعلى تقييماً' }
  ];

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleBookmark = (articleId) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleLike = (articleId) => {
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.published_at) - new Date(a.published_at);
      case 'oldest':
        return new Date(a.published_at) - new Date(b.published_at);
      case 'popular':
        return b.views_count - a.views_count;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const paginatedArticles = sortedArticles.slice((currentPage - 1) * 6, currentPage * 6);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderArticleCard = (article) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
    >
      <ModernCard sx={{ 
        height: { xs: '180px', sm: '240px', md: '280px' }, 
        cursor: 'pointer',
        flexDirection: { xs: 'column', sm: 'row' }
      }} onClick={() => navigate(`/articles/${article.slug || article.id}`)}>
        {/* Image Section - Smaller */}
        <Box sx={{ 
          position: 'relative', 
          overflow: 'hidden',
          width: { xs: '140px', sm: '180px', md: '220px' },
          minWidth: { xs: '140px', sm: '180px', md: '220px' },
          height: '100%'
        }}>
          <CardMedia
            component="img"
            height="100%"
            width="100%"
            image={article.image}
            alt={article.title}
            className="article-image"
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: { xs: '20px 20px 0 0', sm: '0 20px 20px 0' }
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x180/1976d2/ffffff?text=No+Image';
            }}
          />
          
          {/* Gradient Overlay */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), transparent)',
            borderRadius: { xs: '20px 20px 0 0', sm: '0 20px 20px 0' }
          }} />
        </Box>
        
        {/* Content Section */}
        <CardContent sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1.5 },
          className: 'card-content',
          position: 'relative'
        }}>


          {/* Header with Category and Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <CategoryChip
              label={article.category}
              size="small"
              category={article.category}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={likedArticles.has(article.id) ? "إلغاء الإعجاب" : "إعجاب"}>
                <ActionButton
                  variant="like"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleLike(article.id); 
                  }}
                  sx={{
                    backgroundColor: likedArticles.has(article.id) ? '#1976d2' : alpha('#1976d2', 0.1),
                    color: likedArticles.has(article.id) ? 'white' : '#1976d2',
                    '&:hover': {
                      backgroundColor: likedArticles.has(article.id) ? '#1565c0' : '#1976d2',
                      color: 'white',
                    }
                  }}
                >
                  {likedArticles.has(article.id) ? <FavoriteIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
                </ActionButton>
              </Tooltip>
              
              <Tooltip title={bookmarkedArticles.has(article.id) ? "إلغاء الحفظ" : "حفظ"}>
                <ActionButton
                  variant="bookmark"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleBookmark(article.id); 
                  }}
                  sx={{
                    backgroundColor: bookmarkedArticles.has(article.id) ? '#42a5f5' : alpha('#42a5f5', 0.1),
                    color: bookmarkedArticles.has(article.id) ? 'white' : '#42a5f5',
                    '&:hover': {
                      backgroundColor: bookmarkedArticles.has(article.id) ? '#1976d2' : '#42a5f5',
                      color: 'white',
                    }
                  }}
                >
                  {bookmarkedArticles.has(article.id) ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
                </ActionButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Title */}
          <Typography variant="h6" component="h3" sx={{ 
            fontWeight: 800, 
            lineHeight: 1.2, 
            color: '#1a1a1a',
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: { xs: 3, sm: 4 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {article.title}
          </Typography>
          
          {/* Summary */}
          <Typography variant="body2" color="text.secondary" sx={{ 
            lineHeight: 1.4, 
            fontSize: { xs: '0.9rem', sm: '1rem' },
            mb: 2,
            color: '#666',
            display: '-webkit-box',
            WebkitLineClamp: { xs: 3, sm: 4 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {article.summary}
          </Typography>
          
          {/* Footer with Read More and Stats */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <ReadMoreButton
              category={article.category}
              className="read-more"
            >
              اقرأ المزيد
              <Box className="arrow-circle">
                <ArrowForwardIcon sx={{ fontSize: 14, color: 'white' }} />
              </Box>
            </ReadMoreButton>
            
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 1.5 }, 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                <ScheduleIcon sx={{ fontSize: 12, color: '#1976d2' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.65rem' }}>
                  {article.reading_time} د
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                <VisibilityIcon sx={{ fontSize: 12, color: '#4CAF50' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#4CAF50', fontSize: '0.65rem' }}>
                  {article.views_count.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                <FavoriteIcon sx={{ fontSize: 12, color: '#F44336' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#F44336', fontSize: '0.65rem' }}>
                  {(article.likes_count + (likedArticles.has(article.id) ? 1 : 0)).toLocaleString()}
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
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <HeroSection>
            <Container>
              <Skeleton variant="text" width={400} height={60} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width={600} height={40} sx={{ mx: 'auto' }} />
            </Container>
          </HeroSection>
          
          <Container sx={{ py: 4 }}>
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} lg={6} key={item}>
                  <Box sx={{ display: 'flex', height: 280, borderRadius: 3, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" width={250} height="100%" />
                    <Box sx={{ flex: 1, p: 2, position: 'relative' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Skeleton variant="circular" width={40} height={40} />
                        </Box>
                      </Box>
                      <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
                      <Skeleton variant="text" sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="60%" />
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Box>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  color: '#ffffff',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
                  lineHeight: 1.2,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                المدونة
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9, 
                mb: 2, 
                fontWeight: 300,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                اكتشف أحدث المقالات والتقنيات في عالم التطوير والتصميم
              </Typography>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
              >
                <Box sx={{ 
                  position: 'relative',
                  maxWidth: '400px',
                  mx: 'auto',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    right: '-2px',
                    bottom: '-2px',
                    background: 'linear-gradient(45deg, #0e5181, #1a5f8a, #0a3d62)',
                    borderRadius: '25px',
                    zIndex: -1,
                    opacity: 0.3,
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }
                }}>
                  <SearchBox
                    placeholder="ابحث في المقالات..."
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ 
                            color: '#0e5181', 
                            ml: 1,
                            fontSize: '1.1rem',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                          }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      maxWidth: 400,
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '25px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                          boxShadow: '0 0 0 2px rgba(14, 81, 129, 0.5)',
                        },
                        paddingRight: '15px',
                      },
                      '& .MuiInputBase-input': {
                        padding: '10px 15px',
                        fontSize: '0.9rem',
                        '&::placeholder': {
                          opacity: 0.7,
                          color: '#666',
                        },
                      },
                    }}
                  />
                </Box>
              </motion.div>
            </motion.div>
          </Container>
        </HeroSection>

        <Container sx={{ py: 6 }}>
          <FilterPaper sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mr: 2, 
                color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                gap: 1
              }}>
                <TrendingUpIcon />
                تصفية المقالات:
              </Typography>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="الفئة"
                  size="small"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>الترتيب</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label="الترتيب"
                  size="small"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </FilterPaper>

          {paginatedArticles.length > 0 ? (
            <Box>
              <Grid container spacing={3}>
                {paginatedArticles.map((article) => (
                  <Grid item xs={12} lg={6} key={article.id}>
                    {renderArticleCard(article)}
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                      },
                      '& .Mui-selected': {
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      }
                    }}
                  />
                </Box>
              )}
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
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  sx={{ 
                    borderRadius: 2,
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: alpha('#1976d2', 0.08),
                    }
                  }}
                >
                  عرض جميع المقالات
                </Button>
              </motion.div>
            </Box>
          )}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default ArticlesPage; 