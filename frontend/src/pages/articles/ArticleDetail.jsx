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

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(8, 0, 6),
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

const ArticleImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 400,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 100%)',
    borderRadius: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
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

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockArticle = {
          id: 1,
          title: 'دليل شامل لتطوير تطبيقات الويب الحديثة',
          slug: slug,
          content: `
            <h2>مقدمة</h2>
            <p>تطوير الويب هو عملية إنشاء مواقع الويب وتطبيقات الويب. يتضمن تطوير الويب مجموعة من المهارات والتقنيات المختلفة التي تشمل تصميم الواجهات، وبرمجة الخادم، وإدارة قواعد البيانات، وأكثر من ذلك.</p>
            
            <h2>أساسيات HTML5</h2>
            <p>HTML5 هي أحدث إصدار من لغة ترميز النص التشعبي. تأتي مع العديد من الميزات الجديدة التي تجعل تطوير الويب أسهل وأكثر قوة.</p>
            <ul>
              <li>العناصر الدلالية الجديدة</li>
              <li>دعم الفيديو والصوت</li>
              <li>Canvas للرسومات</li>
              <li>تخزين محلي</li>
            </ul>
            
            <h2>CSS3 والتنسيقات المتقدمة</h2>
            <p>CSS3 يقدم مجموعة من الميزات الجديدة التي تجعل تصميم الويب أكثر جاذبية وتفاعلية.</p>
            <ul>
              <li>Flexbox و Grid</li>
              <li>التحولات والرسوم المتحركة</li>
              <li>الظلال والحدود المتقدمة</li>
              <li>الاستعلامات الإعلامية</li>
            </ul>
            
            <h2>JavaScript الحديث</h2>
            <p>JavaScript هي لغة البرمجة الأساسية للويب. مع ES6+، أصبحت JavaScript أكثر قوة وسهولة في الاستخدام.</p>
            <ul>
              <li>Arrow Functions</li>
              <li>Classes</li>
              <li>Modules</li>
              <li>Async/Await</li>
            </ul>
            
            <h2>أطر العمل الشائعة</h2>
            <p>هناك العديد من أطر العمل التي تسهل تطوير الويب:</p>
            <ul>
              <li>React.js - مكتبة JavaScript للواجهات</li>
              <li>Vue.js - إطار عمل تقدمي</li>
              <li>Angular - إطار عمل شامل</li>
              <li>Node.js - بيئة تشغيل JavaScript</li>
            </ul>
            
            <h2>الخاتمة</h2>
            <p>تطوير الويب مجال متطور باستمرار. من المهم البقاء محدثاً بأحدث التقنيات والاتجاهات لبناء تطبيقات ويب عالية الجودة.</p>
          `,
          summary: 'تعرف على أحدث تقنيات تطوير الويب بما في ذلك React, Vue.js, و Angular. دليل عملي لبناء تطبيقات ويب متقدمة وسريعة.',
          author: {
            name: 'أحمد محمد',
            avatar: 'https://via.placeholder.com/60x60/4A6CF7/ffffff?text=AM',
            bio: 'مطور ويب محترف مع خبرة 5 سنوات في تطوير تطبيقات الويب الحديثة'
          },
          category: 'تطوير الويب',
          tags: ['React', 'Vue.js', 'Angular', 'JavaScript', 'CSS3', 'HTML5'],
          image: 'https://via.placeholder.com/800x400/4A6CF7/ffffff?text=Web+Development',
          published_at: '2024-01-15T10:30:00Z',
          reading_time: 12,
          views_count: 2150,
          likes_count: 89,
          comments_count: 23,
          featured: true,
          rating: 4.8,
          meta_description: 'دليل شامل لتعلم أساسيات تطوير الويب',
          meta_keywords: 'ويب, تطوير, تقنيات, برمجة'
        };

        const mockComments = [
          {
            id: 1,
            author: 'سارة أحمد',
            avatar: 'https://via.placeholder.com/40x40/6C63FF/ffffff?text=SA',
            content: 'مقالة ممتازة ومفيدة جداً! شكراً لك على هذه المعلومات القيمة.',
            created_at: '2024-01-16T14:30:00Z',
            likes: 5
          },
          {
            id: 2,
            author: 'محمد علي',
            avatar: 'https://via.placeholder.com/40x40/00C853/ffffff?text=MA',
            content: 'أحسنت! المقالة منظمة بشكل جيد ومفيدة للمبتدئين.',
            created_at: '2024-01-17T09:15:00Z',
            likes: 3
          }
        ];

        setArticle(mockArticle);
        setComments(mockComments);
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

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleLike = () => {
    setLiked(!liked);
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

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: 'المستخدم الحالي',
        avatar: 'https://via.placeholder.com/40x40/4A6CF7/ffffff?text=U',
        content: comment,
        created_at: new Date().toISOString(),
        likes: 0
      };
      setComments([newComment, ...comments]);
      setComment('');
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
                    {article.author.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {article.author.name}
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
                <ArticleImage
                  sx={{
                    backgroundImage: `url(${article.image})`,
                    mb: 4
                  }}
                />
                
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
                    {article.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
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
                    ))}
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
                            }
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
                            {comment.author.charAt(0)}
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
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      عن الكاتب
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={article.author.avatar} sx={{ width: 64, height: 64, mr: 2 }}>
                        {article.author.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {article.author.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          {article.author.bio}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
                
                <StyledCard sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                      إحصائيات المقالة
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          المشاهدات
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {article.views_count.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الإعجابات
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {article.likes_count}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          التعليقات
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {article.comments_count}
                        </Typography>
                      </Box>
                      
                      <Divider />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          التقييم
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {article.rating}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
                
                <StyledCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      مقالات ذات صلة
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1, 2, 3].map((item) => (
                        <Box key={item} sx={{ display: 'flex', gap: 2, cursor: 'pointer', p: 1.5, borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { backgroundColor: 'primary.main', color: 'white', transform: 'translateX(-4px)' } }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 2,
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            مقال {item}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                              عنوان المقالة ذات الصلة {item}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item} دقيقة قراءة
                            </Typography>
                          </Box>
                        </Box>
                      ))}
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