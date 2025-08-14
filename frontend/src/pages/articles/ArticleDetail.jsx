import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Container,
  Skeleton,
  useTheme,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Breadcrumbs,
  Link,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Tag as TagIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Article as ArticleIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { articleAPI } from '../../services/api.service';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #1565c0 100%)`,
  color: 'white',
  padding: theme.spacing(12, 0, 8),
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
    background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    animation: 'float 6s ease-in-out infinite',
  },
  '@keyframes float': {
    '0%, 100%': { transform: 'translate(-50%, -50%) translateY(0px)' },
    '50%': { transform: 'translate(-50%, -50%) translateY(-20px)' },
  },
}));

const ArticleImage = styled(Box)(({ theme }) => ({
  width: '70%', // عرض أكبر للصورة
  height: 500, // ارتفاع أكبر
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  margin: '0 auto', // لتوسيط الصورة
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))',
  border: '2px solid rgba(25, 118, 210, 0.2)',
  [theme.breakpoints.down('lg')]: {
    width: '85%', // عرض أكبر على الشاشات المتوسطة
    height: 450,
  },
  [theme.breakpoints.down('md')]: {
    width: '90%', // عرض أكبر على الشاشات المتوسطة
    height: 400,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%', // عرض كامل على الشاشات الصغيرة
    height: 350,
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: theme.spacing(3),
    transition: 'transform 0.4s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))',
    borderRadius: theme.spacing(3),
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1565c0)',
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
    zIndex: 2,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(25, 118, 210, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 255, 0.95))',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1565c0)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s ease-in-out infinite',
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  '&:hover': {
    boxShadow: '0 20px 40px rgba(25, 118, 210, 0.15)',
    transform: 'translateY(-8px) rotateX(2deg)',
  },
}));

// New styled components for sidebar and comments
const CommentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
}));

const CommentForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
}));

const ArticleDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [articleTags, setArticleTags] = useState([]);

  // Fetch article from API
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        console.log('Fetching article with slug:', slug);
        
        // Try to get article by slug first, then by ID
        let response;
        try {
          response = await articleAPI.getArticleBySlug(slug);
        } catch (error) {
          // If slug doesn't work, try to get by ID
          const articleId = parseInt(slug);
          if (!isNaN(articleId)) {
            response = await articleAPI.getArticle(articleId);
          } else {
            throw error;
          }
        }
        
        console.log('Article API response:', response);
        
        // Extract author information from different possible fields
        const authorId = response.author || response.author_id || response.created_by || response.user;
        const authorName = response.author_name || response.author?.name || response.author?.first_name || response.author?.last_name || response.created_by_name || response.user_name || 'مؤلف غير معروف';
        const authorAvatar = response.author_avatar || response.author?.avatar || response.author?.image_profile || response.created_by_avatar || response.user_avatar || `https://via.placeholder.com/120x120/1976d2/ffffff?text=${authorName.charAt(0)}`;
        
        console.log('Extracted author info:', { authorId, authorName, authorAvatar });
        console.log('Full author response:', response.author);
        console.log('Author name from response:', response.author_name);
        
        // Transform the response to match our component structure
        const transformedArticle = {
          id: response.id,
          title: response.title || '',
          slug: response.slug || slug,
          content: response.content || '',
          summary: response.summary || '',
          author: {
            id: authorId,
            name: authorName || (response.author?.profile?.name || response.author?.first_name || response.author?.username || 'مؤلف غير معروف'),
            avatar: authorAvatar,
            bio: response.author_bio || response.author?.shortBio || response.author?.bio || response.created_by_bio || response.user_bio || 'مؤلف محترف في مجال التكنولوجيا والتعليم',
            specialization: response.author_specialization || response.author?.status || response.created_by_specialization || response.user_specialization || 'مؤلف',
            experience: response.author_experience || response.author?.experience || response.created_by_experience || response.user_experience || 'خبرة في الكتابة',
            courses_count: response.author_courses_count || response.author?.courses_count || response.created_by_courses_count || response.user_courses_count || 0,
            students_count: response.author_students_count || response.author?.students_count || response.created_by_students_count || response.user_students_count || 0,
            rating: response.author_rating || response.author?.rating || response.created_by_rating || response.user_rating || 4.5,
            social_links: response.author_social_links || response.author?.social_links || response.created_by_social_links || response.user_social_links || {
              linkedin: response.author?.linkedin || '',
              twitter: response.author?.twitter || '',
              facebook: response.author?.facebook || '',
              instagram: response.author?.instagram || '',
              github: response.author?.github || '',
              youtube: response.author?.youtube || ''
            }
          },
          category: response.category || response.category_name || 'عام',
          category_id: response.category_id,
          tags: response.tags ? (Array.isArray(response.tags) ? response.tags.map(tag => tag.name || tag) : [response.tags]) : [],
          image: response.image ? (response.image.startsWith('http') ? response.image : `http://localhost:8000${response.image}`) : 'https://via.placeholder.com/1200x600/1976d2/ffffff?text=No+Image',
          published_at: response.published_at || response.created_at,
          reading_time: response.reading_time || 5,
          views_count: response.views_count || 0,
          likes_count: response.likes_count || 0,
          comments_count: response.comments_count || 0,
          featured: response.featured || false,
          rating: response.rating || 4.5,
          meta_description: response.meta_description || '',
          meta_keywords: response.meta_keywords || ''
        };

        console.log('Transformed article data:', transformedArticle);
        console.log('Article image URL:', transformedArticle.image);

        setArticle(transformedArticle);

        // Fetch additional data in parallel
        const fetchAdditionalData = async () => {
          try {
            // Fetch comments
          const commentsResponse = await articleAPI.getArticleComments(response.id);
          console.log('Comments API response:', commentsResponse);
          
          const transformedComments = Array.isArray(commentsResponse) ? commentsResponse.map(comment => ({
            id: comment.id,
            author: comment.author_name || 'مستخدم',
            avatar: `https://via.placeholder.com/40x40/6C63FF/ffffff?text=${(comment.author_name || 'م').charAt(0)}`,
            content: comment.content || '',
            created_at: comment.created_at,
            likes: comment.likes_count || 0
          })) : [];
          
          setComments(transformedComments);

            // Fetch related articles
            const relatedResponse = await articleAPI.getRelatedArticles(response.id, response.category || response.category_name, 3);
            console.log('Related articles API response:', relatedResponse);
            
            const transformedRelated = Array.isArray(relatedResponse) ? relatedResponse.map(article => ({
              id: article.id,
              title: article.title,
              slug: article.slug,
              category: article.category || article.category_name,
              reading_time: article.reading_time || 5,
              image: article.image ? (article.image.startsWith('http') ? article.image : `http://localhost:8000${article.image}`) : null
            })) : [];
            
            setRelatedArticles(transformedRelated);

            // Fetch author profile if author ID exists
            const authorId = response.author || response.author_id || response.created_by || response.user;
            if (authorId) {
              console.log('Attempting to fetch author profile for ID:', authorId);
              try {
                // Try to get user profile first
                const authorResponse = await articleAPI.getAuthorProfile(authorId);
                console.log('Author profile response:', authorResponse);
                if (authorResponse) {
                  setAuthorProfile(authorResponse);
                  console.log('Author profile loaded successfully:', authorResponse);
                } else {
                  console.log('No author profile found, using default data');
                }
              } catch (authorError) {
                console.error('Error fetching author profile:', authorError);
                console.log('Using default author data');
              }
            } else {
              console.log('No author ID found in article response');
            }

            // Fetch article tags
            try {
              const tagsResponse = await articleAPI.getArticleTags();
              setArticleTags(tagsResponse);
            } catch (tagsError) {
              console.error('Error fetching article tags:', tagsError);
            }

          } catch (error) {
            console.error('Error fetching additional data:', error);
          }
        };

        fetchAdditionalData();
         setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const handleBookmark = async () => {
    if (!article) return;
    
    try {
      if (bookmarked) {
        await articleAPI.removeBookmark(article.id);
      } else {
        await articleAPI.bookmarkArticle(article.id);
      }
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('حدث خطأ في حفظ المقالة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    try {
      if (liked) {
        await articleAPI.unlikeArticle(article.id);
      } else {
        await articleAPI.likeArticle(article.id);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('حدث خطأ في الإعجاب بالمقالة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() && article) {
      try {
        const response = await articleAPI.createArticleComment(article.id, {
          content: comment
        });
        
        console.log('Comment created:', response);
        
        // Add the new comment to the list
        const newComment = {
          id: response.id,
          author: response.author_name || 'المستخدم الحالي',
          avatar: `https://via.placeholder.com/40x40/4A6CF7/ffffff?text=${(response.author_name || 'م').charAt(0)}`,
          content: response.content,
          created_at: response.created_at,
          likes: response.likes_count || 0
        };
        
        setComments([newComment, ...comments]);
        setComment('');
      } catch (error) {
        console.error('Error creating comment:', error);
        alert('حدث خطأ في إرسال التعليق. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <HeroSection>
            <Container>
              <Skeleton variant="text" width={600} height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" width={400} height={40} />
            </Container>
          </HeroSection>
          
          <Container sx={{ py: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Skeleton variant="rectangular" height={400} sx={{ mb: 2, borderRadius: 2 }} />
                <Skeleton variant="text" sx={{ mb: 1 }} />
                <Skeleton variant="text" sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            </Grid>
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" color="text.secondary" sx={{ mb: 2 }}>
              المقالة غير موجودة
            </Typography>
            <Button variant="contained" onClick={() => navigate('/articles')}>
              العودة إلى المقالات
            </Button>
          </Box>
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
              <Breadcrumbs sx={{ mb: 3, color: 'white' }}>
                <Link color="inherit" href="/articles" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  المقالات
                </Link>
                <Typography color="inherit">{article.category}</Typography>
                <Typography color="inherit">{article.title}</Typography>
              </Breadcrumbs>
              
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
                {article.title}
              </Typography>
              
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, lineHeight: 1.5 }}>
                {article.summary}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={article.author.avatar} sx={{ width: 48, height: 48 }}>
                      {(article.author.name || 'م').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {article.author.name || 'مؤلف غير معروف'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {formatDate(article.published_at)}
                      </Typography>
                    </Box>
                  </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VisibilityIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    {article.views_count.toLocaleString()} مشاهدة
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    {article.reading_time} دقيقة قراءة
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </HeroSection>

        <Container sx={{ py: 6 }}>
          <Grid 
            container 
            spacing={4} 
            sx={{ 
              position: 'relative',
              flexDirection: { xs: 'column-reverse', lg: 'row' }, // Reverse on mobile, row on desktop
              minHeight: '100%' // Ensure grid takes full height
            }}
          >
            {/* Main Content */}
            <Grid item sx={{
              width: { xs: '100%', lg: 'calc(100% - 396px)' },
              mr: { lg: '416px' }, // Account for sidebar width + gap
              order: { xs: 1, lg: 2 } // Content comes second on mobile
            }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ArticleImage sx={{ mb: 4 , height: '400px', width: '100%'}}>
                  <img
                    src={article.image}
                    alt={article.title}
                    onError={(e) => {
                      console.error('Image failed to load:', article.image);
                      e.target.src = 'https://via.placeholder.com/800x400/4A6CF7/ffffff?text=No+Image';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', article.image);
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '16px',
                    }}
                  />
                </ArticleImage>
                
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate('/articles')}
                      sx={{ borderRadius: 2 }}
                    >
                      العودة للمقالات
                    </Button>
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Tooltip title="إعجاب">
                      <IconButton
                        onClick={handleLike}
                        color={liked ? 'primary' : 'default'}
                        sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider',
                          backgroundColor: liked ? 'primary.main' : 'transparent',
                          color: liked ? 'white' : 'inherit',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="حفظ">
                      <IconButton
                        onClick={handleBookmark}
                        color={bookmarked ? 'primary' : 'default'}
                        sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider',
                          backgroundColor: bookmarked ? 'primary.main' : 'transparent',
                          color: bookmarked ? 'white' : 'inherit',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="مشاركة">
                      <IconButton
                        onClick={handleShare}
                        sx={{ 
                          border: '1px solid', 
                          borderColor: 'divider',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
                
                <StyledCard sx={{ mb: 4 }}>
                  <CardContent sx={{ p: 4 }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: article.content }}
                      style={{
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        color: theme.palette.text.primary,
                      }}
                    />
                  </CardContent>
                </StyledCard>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
                    الوسوم
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {article.tags && article.tags.length > 0 ? (
                      article.tags.map((tag, index) => (
                      <Chip
                          key={index}
                          label={typeof tag === 'string' ? tag : tag.name || tag}
                        variant="outlined"
                        color="primary"
                        sx={{ 
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'translateY(-2px)',
                          }
                        }}
                      />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        لا توجد وسوم لهذه المقالة
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                {/* Enhanced Comments Section */}
                <Box>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <CommentIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    التعليقات ({comments.length})
                  </Typography>
                  
                  <CommentForm>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      أضف تعليقك
                    </Typography>
                    <form onSubmit={handleCommentSubmit}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="اكتب تعليقك هنا..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!comment.trim()}
                          endIcon={<SendIcon />}
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            },
                            t: 'white',
                          }}
                        >
                          إرسال التعليق
                        </Button>
                      </Box>
                    </form>
                  </CommentForm>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((comment) => (
                      <CommentCard key={comment.id}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                     <Avatar 
                             src={comment.avatar} 
                             sx={{ 
                               width: 48, 
                               height: 48,
                               boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                             }}
                           >
                             {(comment.author || 'م').charAt(0)}
                           </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {comment.author}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ 
                                backgroundColor: 'grey.100', 
                                px: 1, 
                                py: 0.25, 
                                borderRadius: 1,
                                fontSize: '0.75rem'
                              }}>
                                {formatDate(comment.created_at)}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                              {comment.content}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <FavoriteBorderIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" color="text.secondary">
                            {comment.likes} إعجاب
                          </Typography>
                        </Box>
                      </CommentCard>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Sidebar */}
            <Grid item sx={{
              width: { xs: '100%', lg: '380px' },
              position: { xs: 'static', lg: 'absolute' },
              right: { lg: '16px' },
              top: { lg: '-40px' },
              zIndex: 10,
              order: { xs: 2, lg: 1 } // Sidebar comes first on mobile
            }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StyledCard sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                                         <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                       <PersonIcon sx={{ mr: 1.5, fontSize: 28 }} />
                      عن الكاتب
                    </Typography>
                    
                                                             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        src={authorProfile?.image_profile || authorProfile?.avatar || authorProfile?.profile_image || authorProfile?.image || article.author.avatar} 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          mb: 2,
                          border: '4px solid rgba(25, 118, 210, 0.2)',
                          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)'
                        }}
                      >
                        {(authorProfile?.name || authorProfile?.user_first_name || authorProfile?.user_last_name || authorProfile?.user_username || article.author.name || 'م').charAt(0)}
                      </Avatar>
                                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                        {authorProfile?.name || 
                         `${authorProfile?.user_first_name || ''} ${authorProfile?.user_last_name || ''}`.trim() || 
                         authorProfile?.user_username || 
                         article.author.name || 
                         'مؤلف غير معروف'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2, lineHeight: 1.6 }}>
                        {authorProfile?.shortBio || authorProfile?.bio || authorProfile?.biography || authorProfile?.description || authorProfile?.about || article.author.bio}
                        </Typography>
                      
                      {/* Additional Info */}
                      {(authorProfile?.user_email || authorProfile?.email) && (
                        <Box sx={{ 
                          backgroundColor: 'rgba(25, 118, 210, 0.05)', 
                          borderRadius: 2, 
                          p: 2, 
                          mb: 2,
                          width: '100%',
                          textAlign: 'center',
                          border: '1px solid rgba(25, 118, 210, 0.1)'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                            البريد الإلكتروني
                    </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {authorProfile?.user_email || authorProfile?.email}
                        </Typography>
                      </Box>
                      )}
                      
                      {authorProfile?.user_id && (
                        <Box sx={{ 
                          backgroundColor: 'rgba(76, 175, 80, 0.05)', 
                          borderRadius: 2, 
                          p: 2, 
                          mb: 2,
                          width: '100%',
                          textAlign: 'center',
                          border: '1px solid rgba(76, 175, 80, 0.1)'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', mb: 0.5 }}>
                            معرف المستخدم
                          </Typography>
                        <Typography variant="body2" color="text.secondary">
                            #{authorProfile?.user_id}
                        </Typography>
                      </Box>
                      )}
                       
                       {/* Specialization */}
                       <Box sx={{ 
                         backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                         borderRadius: 2, 
                         p: 2, 
                         mb: 2,
                         width: '100%',
                         textAlign: 'center'
                       }}>
                         <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                           الحالة
                    </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {authorProfile?.status || authorProfile?.specialization || authorProfile?.subject || authorProfile?.field || article.author.specialization}
                        </Typography>
                      </Box>
                      
                                                {/* Stats */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%', mb: 3 }}>
                          <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                              {authorProfile?.experience || authorProfile?.experience_years || authorProfile?.teaching_experience || authorProfile?.years_of_experience || article.author.experience}
                        </Typography>
                            <Typography variant="caption" color="text.secondary">
                              خبرة
                          </Typography>
                        </Box>
                          <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                              {authorProfile?.courses_count || authorProfile?.total_courses || authorProfile?.courses_created || authorProfile?.number_of_courses || article.author.courses_count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              دورة
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'rgba(156, 39, 176, 0.1)', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                              {(authorProfile?.students_count || authorProfile?.total_students || authorProfile?.students_enrolled || authorProfile?.number_of_students || article.author.students_count || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              طالب
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                {authorProfile?.rating || authorProfile?.average_rating || authorProfile?.teacher_rating || authorProfile?.overall_rating || article.author.rating || 4.5}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              تقييم
                            </Typography>
                          </Box>
                        </Box>
                       
                       {/* Social Links */}
                       <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                         {(authorProfile?.linkedin || article.author.social_links?.linkedin) && (
                           <IconButton 
                             size="small" 
                             onClick={() => window.open(authorProfile?.linkedin || article.author.social_links?.linkedin, '_blank')}
                             sx={{ 
                               backgroundColor: 'rgba(25, 118, 210, 0.1)',
                               color: 'primary.main',
                               '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                             }}
                           >
                             <Box component="span" sx={{ fontSize: 16 }}>in</Box>
                           </IconButton>
                         )}
                         {(authorProfile?.twitter || article.author.social_links?.twitter) && (
                           <IconButton 
                             size="small" 
                             onClick={() => window.open(authorProfile?.twitter || article.author.social_links?.twitter, '_blank')}
                             sx={{ 
                               backgroundColor: 'rgba(29, 161, 242, 0.1)',
                               color: '#1DA1F2',
                               '&:hover': { backgroundColor: '#1DA1F2', color: 'white' }
                             }}
                           >
                             <Box component="span" sx={{ fontSize: 16 }}>𝕏</Box>
                           </IconButton>
                         )}
                         {(authorProfile?.facebook || article.author.social_links?.facebook) && (
                           <IconButton 
                             size="small" 
                             onClick={() => window.open(authorProfile?.facebook || article.author.social_links?.facebook, '_blank')}
                             sx={{ 
                               backgroundColor: 'rgba(66, 103, 178, 0.1)',
                               color: '#4267B2',
                               '&:hover': { backgroundColor: '#4267B2', color: 'white' }
                             }}
                           >
                             <Box component="span" sx={{ fontSize: 16 }}>f</Box>
                           </IconButton>
                         )}
                         {(authorProfile?.instagram || article.author.social_links?.instagram) && (
                           <IconButton 
                             size="small" 
                             onClick={() => window.open(authorProfile?.instagram || article.author.social_links?.instagram, '_blank')}
                             sx={{ 
                               backgroundColor: 'rgba(225, 48, 108, 0.1)',
                               color: '#E1306C',
                               '&:hover': { backgroundColor: '#E1306C', color: 'white' }
                             }}
                           >
                             <Box component="span" sx={{ fontSize: 16 }}>📷</Box>
                           </IconButton>
                         )}
                         {(authorProfile?.github || article.author.social_links?.github) && (
                           <IconButton 
                             size="small" 
                             onClick={() => window.open(authorProfile?.github || article.author.social_links?.github, '_blank')}
                             sx={{ 
                               backgroundColor: 'rgba(36, 41, 46, 0.1)',
                               color: '#24292E',
                               '&:hover': { backgroundColor: '#24292E', color: 'white' }
                             }}
                           >
                             <Box component="span" sx={{ fontSize: 16 }}>🐙</Box>
                           </IconButton>
                         )}
                         {(authorProfile?.youtube || article.author.social_links?.youtube) && (
                           <IconButton 
                             size="small" 
                             onClick={() => window.open(authorProfile?.youtube || article.author.social_links?.youtube, '_blank')}
                             sx={{ 
                               backgroundColor: 'rgba(255, 0, 0, 0.1)',
                               color: '#FF0000',
                               '&:hover': { backgroundColor: '#FF0000', color: 'white' }
                             }}
                           >
                             <Box component="span" sx={{ fontSize: 16 }}>▶️</Box>
                           </IconButton>
                         )}
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
                

                
                <StyledCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                      <ArticleIcon sx={{ mr: 1.5, fontSize: 28 }} />
                      مقالات ذات صلة
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {relatedArticles && relatedArticles.length > 0 ? (
                        relatedArticles.map((item) => (
                          <Box
                            key={item.id} 
                            onClick={() => navigate(`/articles/${item.slug}`)}
                            sx={{
                              display: 'flex', 
                              gap: 2, 
                              cursor: 'pointer', 
                              p: 2, 
                              borderRadius: 3, 
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: '1px solid rgba(25, 118, 210, 0.1)',
                              backgroundColor: 'rgba(25, 118, 210, 0.02)',
                              '&:hover': { 
                                backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                transform: 'translateX(-8px) scale(1.02)',
                                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.2)',
                                border: '1px solid rgba(25, 118, 210, 0.3)'
                              } 
                            }}
                          >
                            <Box
                              sx={{
                                width: 70,
                                height: 70,
                                borderRadius: 3,
                                background: item.image ? 'transparent' : `linear-gradient(135deg, #1976d2, #42a5f5)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                                flexShrink: 0,
                                overflow: 'hidden'
                              }}
                            >
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <Box sx={{ 
                                display: item.image ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, #1976d2, #42a5f5)`
                              }}>
                                {(item.category || 'مقال').split(' ')[0]}
                          </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1, color: 'text.primary' }}>
                                {item.title}
                            </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {item.reading_time} دقيقة قراءة
                            </Typography>
                          </Box>
                              <Typography variant="caption" sx={{ 
                                color: 'primary.main', 
                                fontWeight: 600,
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                display: 'inline-block',
                                mt: 0.5
                              }}>
                                {item.category || 'عام'}
                              </Typography>
                        </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 3,
                          color: 'text.secondary'
                        }}>
                          <Typography variant="body2">
                            لا توجد مقالات ذات صلة متاحة حالياً
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default ArticleDetail; 