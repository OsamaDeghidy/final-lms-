import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery, styled, keyframes } from '@mui/material';
import { TrendingUp, People, School, Star, Business, EmojiEvents } from '@mui/icons-material';

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const slideInAnimation = keyframes`
  0% { transform: translateX(-50px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const waveAnimation = keyframes`
  0%, 100% { transform: translateX(0) scaleY(1); }
  50% { transform: translateX(25%) scaleY(1.1); }
`;

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(255, 152, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 152, 0, 0.6), 0 0 45px rgba(255, 152, 0, 0.4); }
`;

const SeparatorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(8, 0),
  background: '#ffffff',
  overflow: 'hidden',
  minHeight: '400px',
}));

// S-shaped Curved Path like in the image
const CurvedPath = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  zIndex: 1,
  '& svg': {
    width: '100%',
    height: '100%',
  },
}));

// Text on the curved path
const CurvedText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: '#ffffff',
  fontSize: '1.1rem',
  fontWeight: 700,
  textAlign: 'center',
  zIndex: 2,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 3,
  padding: theme.spacing(2, 0),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 800,
  color: '#0e5181',
  marginBottom: theme.spacing(1),
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  animation: `${slideInAnimation} 0.8s ease-out 0.2s both`,
  [theme.breakpoints.down('md')]: {
    fontSize: '2.2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.8rem',
  },
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 500,
  color: '#666',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: 1.6,
  animation: `${slideInAnimation} 0.8s ease-out 0.4s both`,
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(4),
  position: 'relative',
  zIndex: 3,
  padding: theme.spacing(6, 0),
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
    padding: theme.spacing(4, 0),
  },
}));

const StatItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay' && prop !== 'isHighlighted',
})(({ theme, delay = 0, isHighlighted = false }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2.5),
  background: isHighlighted 
    ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: '50%',
  border: '3px solid rgba(0, 0, 0, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInAnimation} 0.8s ease-out ${delay * 0.15}s both`,
  position: 'relative',
  width: '140px',
  height: '140px',
  flexShrink: 0,
  cursor: 'pointer',
  overflow: 'hidden',
  boxShadow: `
    0 8px 25px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
  '&:hover': {
    transform: 'translateY(-5px) scale(1.05)',
    boxShadow: `
      0 15px 35px rgba(0, 0, 0, 0.15),
      0 8px 20px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
  },
  [theme.breakpoints.down('md')]: {
    width: '120px',
    height: '120px',
    padding: theme.spacing(2),
    gap: theme.spacing(1.2),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100px',
    height: '100px',
    padding: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
}));

const StatIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})(({ theme, color = '#0e5181' }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '1.4rem',
  boxShadow: `0 4px 15px ${color}40, 0 2px 8px ${color}20`,
  animation: `${pulseAnimation} 3s ease-in-out infinite`,
  transition: 'all 0.3s ease',
  position: 'relative',
  zIndex: 2,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 6px 20px ${color}60, 0 3px 12px ${color}30`,
  },
  [theme.breakpoints.down('md')]: {
    width: '45px',
    height: '45px',
  fontSize: '1.2rem',
  },
  [theme.breakpoints.down('sm')]: {
    width: '40px',
    height: '40px',
    fontSize: '1rem',
  },
}));

const StatContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 0,
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#333',
  lineHeight: 1,
  marginBottom: '2px',
  textAlign: 'center',
  position: 'relative',
  zIndex: 2,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.3rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#666',
  lineHeight: 1.2,
  textAlign: 'center',
  position: 'relative',
  zIndex: 2,
  [theme.breakpoints.down('md')]: {
    fontSize: '0.75rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  },
}));

// Floating circular elements like in the image
const FloatingCircle = styled(Box)(({ theme, position }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
  border: '2px solid rgba(0, 0, 0, 0.1)',
  animation: `${floatAnimation} 6s ease-in-out infinite`,
  zIndex: 2,
  ...position,
}));

const FloatingElements = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2,
}));

const MotionSeparator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      icon: <People />,
      number: '10K+',
      label: 'طالب مسجل',
      color: '#0e5181',
      delay: 0,
      isHighlighted: false
    },
    {
      icon: <School />,
      number: '500+',
      label: 'دورة متاحة',
      color: '#e5978b',
      delay: 1,
      isHighlighted: true // This will be the highlighted one like in the image
    },
    {
      icon: <Star />,
      number: '4.9',
      label: 'تقييم الطلاب',
      color: '#ffc107',
      delay: 2,
      isHighlighted: false
    },
    {
      icon: <EmojiEvents />,
      number: '95%',
      label: 'معدل النجاح',
      color: '#4caf50',
      delay: 3,
      isHighlighted: false
    },
    {
      icon: <Business />,
      number: '50+',
      label: 'شريك تعليمي',
      color: '#9c27b0',
      delay: 4,
      isHighlighted: false
    },
    {
      icon: <TrendingUp />,
      number: '99%',
      label: 'رضا العملاء',
      color: '#ff5722',
      delay: 5,
      isHighlighted: false
    }
  ];

  return (
    <SeparatorContainer>
      {/* S-shaped Curved Path */}
      <CurvedPath>
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0e5181" />
              <stop offset="100%" stopColor="#1565c0" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 Q300,30 600,50 T1200,40 L1200,100 L0,100 Z"
            fill="url(#pathGradient)"
            stroke="none"
          />
        </svg>
       
      </CurvedPath>
      
      {/* Floating Background Elements */}
      <FloatingElements>
        <FloatingCircle 
          position={{ 
            top: '10%', 
            left: '15%', 
            width: '60px', 
            height: '60px',
            animationDelay: '0s'
          }} 
        />
        <FloatingCircle 
          position={{ 
            top: '25%', 
            right: '20%', 
            width: '50px', 
            height: '50px',
            animationDelay: '1s'
          }} 
        />
        <FloatingCircle 
          position={{ 
            bottom: '20%', 
            left: '10%', 
            width: '70px', 
            height: '70px',
            animationDelay: '2s'
          }} 
        />
        <FloatingCircle 
          position={{ 
            top: '60%', 
            right: '10%', 
            width: '40px', 
            height: '40px',
            animationDelay: '3s'
          }} 
        />
        <FloatingCircle 
          position={{ 
            bottom: '10%', 
            right: '25%', 
            width: '55px', 
            height: '55px',
            animationDelay: '4s'
          }} 
        />
      </FloatingElements>
      
      <Container maxWidth="lg">
        <TitleContainer>
          <MainTitle>
            إحصائيات منصتنا التعليمية
          </MainTitle>
          <SubTitle>
            نحن فخورون بما حققناه من إنجازات في مجال التعليم الإلكتروني، 
            ونسعى دائماً لتقديم أفضل تجربة تعليمية لطلابنا
          </SubTitle>
        </TitleContainer>
        
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatItem 
              key={index} 
              delay={stat.delay} 
              isHighlighted={stat.isHighlighted}
            >
              <StatIcon color={stat.color}>
                {stat.icon}
              </StatIcon>
              <StatContent>
                <StatNumber>
                  {stat.number}
                </StatNumber>
                <StatLabel>
                  {stat.label}
                </StatLabel>
              </StatContent>
            </StatItem>
          ))}
        </StatsGrid>
      </Container>
    </SeparatorContainer>
  );
};

export default MotionSeparator;
