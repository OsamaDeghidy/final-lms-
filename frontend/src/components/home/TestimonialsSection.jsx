import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { FormatQuote, Star, StarBorder, StarHalf } from '@mui/icons-material';

const testimonials = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'مطور ويب',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    content: 'الدورات المقدمة ممتازة وسهلة الفهم. ساعدتني في تطوير مهاراتي البرمجية بشكل كبير.',
    rating: 5,
    bgColor: '#4A6CF7'
  },
  {
    id: 2,
    name: 'سارة أحمد',
    role: 'مصممة واجهات',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'تجربة تعليمية رائعة مع معهد التطوير المهني. المحتوى منظم والمدربون محترفون للغاية.',
    rating: 5,
    bgColor: '#8B5CF6'
  },
  {
    id: 3,
    name: 'خالد عبدالله',
    role: 'محلل بيانات',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    content: 'استفدت كثيراً من دورات تحليل البيانات. أنصح الجميع بالانضمام إلى هذا المعهد المتميز.',
    rating: 4,
    bgColor: '#6C63FF'
  },
  {
    id: 4,
    name: 'نورة سعيد',
    role: 'مسوقة رقمية',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    content: 'دورات التسويق الرقمي غنية بالمعلومات العملية والتطبيقية. شكراً لفريق العمل الرائع.',
    rating: 5,
    bgColor: '#4A6CF7'
  },
  {
    id: 5,
    name: 'محمد علي',
    role: 'مطور تطبيقات',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    content: 'المحتوى المقدم حديث ومتوافق مع أحدث التقنيات. أنصح بهذا المعهد لكل من يريد تطوير مهاراته التقنية.',
    rating: 4,
    bgColor: '#8B5CF6'
  },
];

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 0),
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(74, 108, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    top: '-250px',
    right: '-250px',
    zIndex: 0,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(74, 108, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    bottom: '-150px',
    left: '-150px',
    zIndex: 0,
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(6),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(3),
  position: 'relative',
  display: 'inline-block',
  background: 'linear-gradient(90deg, #4A6CF7 0%, #8B5CF6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '2.5rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    right: '50%',
    bottom: -10,
    transform: 'translateX(50%)',
    width: 60,
    height: 4,
    background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)',
    borderRadius: 2,
  },
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  maxWidth: 700,
  margin: '0 auto',
  fontSize: '1.1rem',
  lineHeight: 1.8,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}));

const QuoteIcon = styled(FormatQuote)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  bottom: theme.spacing(2),
  color: 'rgba(0, 0, 0, 0.03)',
  fontSize: '6rem',
  zIndex: 0,
  transform: 'scaleX(-1)',
}));

const TestimonialName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: 2,
  color: theme.palette.text.primary,
  fontSize: '1.1rem',
}));

const TestimonialContent = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  paddingRight: theme.spacing(5),
  fontSize: '1.1rem',
  lineHeight: 1.9,
  color: theme.palette.text.secondary,
  '&:before': {
    content: '"\u201C"',
    position: 'absolute',
    right: 0,
    top: -15,
    fontSize: '5rem',
    lineHeight: 1,
    color: 'rgba(74, 108, 247, 0.1)',
    fontFamily: 'Georgia, serif',
    zIndex: -1,
  },
}));

const TestimonialFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
}));

const TestimonialAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})(({ theme, bgColor }) => ({
  width: 60,
  height: 60,
  marginRight: theme.spacing(2),
  border: `3px solid #fff`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  backgroundColor: bgColor || theme.palette.primary.main,
}));

const TestimonialInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

const TestimonialRole = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  opacity: 0.8,
}));

const Rating = styled(Box)(({ theme, rating }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
    color: '#FFD700',
  },
}));

const NavigationButton = styled('button')(({ theme, disabled }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'all 0.3s ease',
  '&:hover:not(:disabled)': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
  },
  '&:focus': {
    outline: 'none',
    boxShadow: `0 0 0 3px ${theme.palette.primary.light}`,
  },
}));

const PrevButton = styled(NavigationButton)(({ theme }) => ({
  right: -24,
  [theme.breakpoints.down('md')]: {
    right: -16,
  },
}));

const NextButton = styled(NavigationButton)(({ theme }) => ({
  left: -24,
  [theme.breakpoints.down('md')]: {
    left: -16,
  },
}));

const TestimonialCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'isActive',
})(({ theme, bgColor, isActive }) => ({
  backgroundColor: '#fff',
  borderRadius: '20px',
  padding: theme.spacing(4, 3.5),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  width: 'calc(100% - 40px)',
  maxWidth: '420px',
  minHeight: '300px',
  flex: '0 0 auto',
  margin: theme.spacing(0, 2.5),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  zIndex: isActive ? 2 : 1,
  opacity: isActive ? 1 : 0.8,
  transform: isActive ? 'scale(1.02)' : 'scale(0.98)',
  '&:hover': {
    transform: isActive ? 'scale(1.05)' : 'scale(1.02)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
    opacity: 1,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '5px',
    background: bgColor || theme.palette.primary.main,
    zIndex: 2,
    transition: 'all 0.3s ease',
  },
  [theme.breakpoints.down('lg')]: {
    width: 'calc(100% - 40px)',
    maxWidth: '380px',
    minHeight: '280px',
    margin: theme.spacing(0, 2),
  },
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 32px)',
    maxWidth: '320px',
    minHeight: '260px',
    margin: theme.spacing(0, 1.5),
    padding: theme.spacing(3, 3),
  },
  [theme.breakpoints.down('xs')]: {
    width: 'calc(100% - 24px)',
    margin: theme.spacing(0, 1),
    padding: theme.spacing(3, 2.5),
  },
}));

const TestimonialsSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollToTestimonial = (index) => {
    if (!containerRef.current || isScrolling) return;
    
    setIsScrolling(true);
    const container = containerRef.current;
    const cards = container.querySelectorAll('[data-testimonial-card]');
    
    if (index >= 0 && index < cards.length) {
      const card = cards[index];
      const containerWidth = container.offsetWidth;
      const cardWidth = card.offsetWidth;
      const scrollLeft = card.offsetLeft - (containerWidth - cardWidth) / 2;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      
      setActiveIndex(index);
      
      // Reset scrolling state after animation completes
      setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    }
  };
  
  const handleScroll = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(activeIndex + 1, testimonials.length - 1)
      : Math.max(activeIndex - 1, 0);
    
    scrollToTestimonial(newIndex);
  };
  
  // Auto-scroll to next testimonial
  useEffect(() => {
    if (isMobile) return;
    
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % testimonials.length;
      scrollToTestimonial(nextIndex);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [activeIndex, isMobile]);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      i < Math.floor(rating) ? 
        <Star key={i} /> : 
        (i < rating ? <StarHalf key={i} /> : <StarBorder key={i} />)
    ));
  };

  return (
    <SectionContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <SectionHeader>
          <SectionTitle variant="h2" component="h2">
            آراء عملائنا
          </SectionTitle>
          <SectionSubtitle>
            اكتشف ما يقوله طلابنا عن تجربتهم مع منصتنا التعليمية
          </SectionSubtitle>
        </SectionHeader>

        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            padding: theme.spacing(3, 0, 6),
            '&:hover .nav-button': {
              opacity: 1,
            },
          }}
        >
          <Box 
            ref={containerRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              padding: theme.spacing(4, 0),
              margin: theme.spacing(0, 'auto'),
              maxWidth: '1400px',
              width: '100%',
              '& > *': {
                scrollSnapAlign: 'center',
              },
              [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(3, 0),
                scrollPadding: '0 24px',
              },
            }}
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={testimonial.id}
                data-testimonial-card
                bgColor={testimonial.bgColor}
                isActive={activeIndex === index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onClick={() => scrollToTestimonial(index)}
              >
                <TestimonialContent>
                  {testimonial.content}
                </TestimonialContent>
                <QuoteIcon />
                <TestimonialFooter>
                  <TestimonialAvatar 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    bgColor={testimonial.bgColor}
                  />
                  <TestimonialInfo>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <TestimonialName>{testimonial.name}</TestimonialName>
                        <TestimonialRole>{testimonial.role}</TestimonialRole>
                      </Box>
                      <Rating rating={testimonial.rating}>
                        {renderStars(testimonial.rating)}
                      </Rating>
                    </Box>
                  </TestimonialInfo>
                </TestimonialFooter>
              </TestimonialCard>
            ))}
          </Box>

          <IconButton 
            className="nav-button"
            onClick={() => handleScroll('prev')}
            disabled={activeIndex === 0}
            sx={{
              position: 'absolute',
              left: { xs: 8, sm: 16, md: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'background.paper',
              boxShadow: 3,
              zIndex: 2,
              opacity: { xs: 1, md: 0.7 },
              transition: 'all 0.3s ease',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: 'background.paper',
                opacity: 1,
                transform: 'translateY(-50%) scale(1.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.2,
              },
              [theme.breakpoints.down('sm')]: {
                display: 'none',
              },
            }}
          >
            <Box component="span" sx={{ 
              transform: 'rotate(180deg)', 
              display: 'inline-block',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}>→</Box>
          </IconButton>

          <IconButton 
            className="nav-button"
            onClick={() => handleScroll('next')}
            disabled={activeIndex === testimonials.length - 1}
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 16, md: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'background.paper',
              boxShadow: 3,
              zIndex: 2,
              opacity: { xs: 1, md: 0.7 },
              transition: 'all 0.3s ease',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: 'background.paper',
                opacity: 1,
                transform: 'translateY(-50%) scale(1.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.2,
              },
              [theme.breakpoints.down('sm')]: {
                display: 'none',
              },
            }}
          >
            <Box component="span" sx={{ 
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}>→</Box>
          </IconButton>
        </Box>
      </Container>
    </SectionContainer>
  );
};

export default TestimonialsSection;
