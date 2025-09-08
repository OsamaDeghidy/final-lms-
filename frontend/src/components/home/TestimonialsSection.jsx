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
    bgColor: '#0e5181'
  },
  {
    id: 2,
    name: 'سارة أحمد',
    role: 'مصممة واجهات',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    content: 'تجربة تعليمية رائعة مع معهد التطوير المهني. المحتوى منظم والمدربون محترفون للغاية.',
    rating: 5,
    bgColor: '#e5978b'
  },
  {
    id: 3,
    name: 'خالد عبدالله',
    role: 'محلل بيانات',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    content: 'استفدت كثيراً من دورات تحليل البيانات. أنصح الجميع بالانضمام إلى هذا المعهد المتميز.',
    rating: 4,
    bgColor: '#0e5181'
  },
  {
    id: 4,
    name: 'نورة سعيد',
    role: 'مسوقة رقمية',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    content: 'دورات التسويق الرقمي غنية بالمعلومات العملية والتطبيقية. شكراً لفريق العمل الرائع.',
    rating: 5,
    bgColor: '#e5978b'
  },
  {
    id: 5,
    name: 'محمد علي',
    role: 'مطور تطبيقات',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    content: 'المحتوى المقدم حديث ومتوافق مع أحدث التقنيات. أنصح بهذا المعهد لكل من يريد تطوير مهاراته التقنية.',
    rating: 4,
    bgColor: '#0e5181'
  },
];

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 0, 4, 0),
  position: 'relative',
  overflow: 'hidden',
  background: '#ffffff',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0, 0, 3, 0),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 0, 2, 0),
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.03) 0%, rgba(229, 151, 139, 0.03) 100%)',
    top: '-200px',
    right: '-200px',
    zIndex: 0,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(229, 151, 139, 0.02) 0%, rgba(14, 81, 129, 0.02) 100%)',
    bottom: '-150px',
    left: '-150px',
    zIndex: 0,
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  position: 'relative',
  display: 'inline-block',
  color: '#0e5181',
  fontSize: '2rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    right: '50%',
    bottom: -8,
    transform: 'translateX(50%)',
    width: 50,
    height: 3,
    background: '#e5978b',
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
  borderRadius: '14px',
  padding: theme.spacing(2, 2),
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
  width: 'calc(50% - 16px)',
  maxWidth: 'calc(50% - 16px)',
  minHeight: '160px',
  flex: '0 0 auto',
  margin: theme.spacing(0, 1),
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
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)',
    opacity: 1,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '3px',
    background: bgColor || theme.palette.primary.main,
    zIndex: 2,
    transition: 'all 0.3s ease',
  },
  [theme.breakpoints.down('lg')]: {
    width: 'calc(50% - 16px)',
    maxWidth: 'calc(50% - 16px)',
    minHeight: '140px',
    margin: theme.spacing(0, 1),
  },
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 16px)',
    maxWidth: 'calc(100% - 16px)',
    minHeight: '120px',
    margin: theme.spacing(0, 0.5),
    padding: theme.spacing(1.5, 1.5),
  },
  [theme.breakpoints.down('xs')]: {
    width: 'calc(100% - 12px)',
    maxWidth: 'calc(100% - 12px)',
    margin: theme.spacing(0, 0.25),
    padding: theme.spacing(1.5, 1),
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
            آراء طلابنا
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
                
                {/* Name and Date Only */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 'auto',
                  pt: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.9rem'
                  }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.8rem'
                  }}>
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Typography>
                    </Box>
              </TestimonialCard>
            ))}
          </Box>

          {/* Navigation Dots */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 1,
            mt: 4
          }}>
            {testimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => scrollToTestimonial(index)}
            sx={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: index === activeIndex ? '#0e5181' : 'rgba(14, 81, 129, 0.3)',
                  cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                    backgroundColor: index === activeIndex ? '#0e5181' : 'rgba(14, 81, 129, 0.6)',
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </SectionContainer>
  );
};

export default TestimonialsSection;
