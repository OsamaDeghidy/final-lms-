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
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(12, 0, 8),
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
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
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

  // Updated mock data
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockArticles = [

          {
            id: 7,
            title: 'أساسيات قواعد البيانات SQL و NoSQL',
            summary: 'دليل شامل لقواعد البيانات العلائقية وغير العلائقية. تعرف على كيفية اختيار قاعدة البيانات المناسبة.',
            content: 'هذا محتوى تجريبي للمقالة...',
            author: {
              name: 'ريم محمد',
              avatar: 'https://via.placeholder.com/40x40/2196F3/ffffff?text=RM'
            },
            category: 'قواعد البيانات',
            tags: ['SQL', 'NoSQL', 'قواعد بيانات'],
            image: 'https://via.placeholder.com/400x250/2196F3/ffffff?text=Database',
            published_at: '2024-01-08T13:15:00Z',
            reading_time: 16,
            views_count: 1890,
            likes_count: 73,
            comments_count: 21,
            featured: false,
            rating: 4.4
          },
          {
            id: 8,
            title: 'تطوير تطبيقات الويب باستخدام Node.js',
            summary: 'تعلم كيفية بناء تطبيقات ويب سريعة وقابلة للتطوير باستخدام Node.js و Express.js.',
            content: 'هذا محتوى تجريبي للمقالة...',
            author: {
              name: 'حسن علي',
              avatar: 'https://via.placeholder.com/40x40/4CAF50/ffffff?text=HA'
            },
            category: 'تطوير الويب',
            tags: ['Node.js', 'Express', 'JavaScript'],
            image: 'https://via.placeholder.com/400x250/4CAF50/ffffff?text=Node.js',
            published_at: '2024-01-06T10:45:00Z',
            reading_time: 18,
            views_count: 2234,
            likes_count: 95,
            comments_count: 31,
            featured: false,
            rating: 4.7
          },
        ];
        
        setArticles(mockArticles);
        setTotalPages(Math.ceil(mockArticles.length / 6));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledCard sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate(`/articles/${article.slug || article.id}`)}>
        <CardMedia
          component="img"
          height="220"
          image={article.image}
          alt={article.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={article.author.avatar} sx={{ width: 28, height: 28, mr: 1 }}>
              {article.author.name.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {article.author.name}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(article.published_at)}
            </Typography>
          </Box>
          
          <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 700, lineHeight: 1.3, minHeight: '2.4em' }}>
            {article.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, minHeight: '3.2em' }}>
            {article.summary}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {article.tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {article.views_count.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {article.reading_time} دقيقة
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="إعجاب">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleLike(article.id); }}
                  color={likedArticles.has(article.id) ? 'primary' : 'default'}
                >
                  {likedArticles.has(article.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="حفظ">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleBookmark(article.id); }}
                  color={bookmarkedArticles.has(article.id) ? 'primary' : 'default'}
                >
                  {bookmarkedArticles.has(article.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
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
                <Grid item xs={12} sm={6} key={item}>
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="text" sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="60%" />
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
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
                المدونة
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
                اكتشف أحدث المقالات والتقنيات في عالم التطوير والتصميم
              </Typography>
              
              <TextField
                placeholder="ابحث في المقالات..."
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
                  maxWidth: 500,
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '25px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  },
                }}
              />
            </motion.div>
          </Container>
        </HeroSection>

        <Container sx={{ py: 6 }}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
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
          </Paper>

          {paginatedArticles.length > 0 ? (
            <Box>
              <Grid container spacing={3}>
                {paginatedArticles.map((article) => (
                  <Grid item xs={12} sm={6} key={article.id}>
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
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                لا توجد مقالات {searchQuery && `مطابقة لـ "${searchQuery}"`}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                عرض جميع المقالات
              </Button>
            </Box>
          )}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default ArticlesPage; 