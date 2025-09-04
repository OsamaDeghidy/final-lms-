import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery, styled, keyframes } from '@mui/material';
import { TrendingUp, People, School, Star, Business, EmojiEvents } from '@mui/icons-material';

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const slideInAnimation = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const SeparatorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4, 0),
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 30%, rgba(14, 81, 129, 0.03) 2px, transparent 2px),
      radial-gradient(circle at 80% 70%, rgba(229, 151, 139, 0.03) 2px, transparent 2px),
      radial-gradient(circle at 40% 80%, rgba(14, 81, 129, 0.02) 2px, transparent 2px)
    `,
    backgroundSize: '60px 60px, 60px 60px, 60px 60px',
    backgroundPosition: '0 0, 30px 30px, 15px 45px',
    animation: `${floatAnimation} 8s ease-in-out infinite`,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent 0%, #0e5181 50%, transparent 100%)',
    animation: `${pulseAnimation} 3s ease-in-out infinite`,
  },
}));

const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(2, 0),
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(0.5),
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const StatItem = styled(Box)(({ theme, delay = 0 }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 2),
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(14, 81, 129, 0.15)',
  transition: 'all 0.3s ease',
  animation: `${slideInAnimation} 0.6s ease-out ${delay * 0.1}s both`,
  position: 'relative',
  minWidth: '180px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(14, 81, 129, 0.2)',
    background: 'rgba(255, 255, 255, 0.95)',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '160px',
    padding: theme.spacing(1.8, 1.5),
    gap: theme.spacing(1.2),
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '140px',
    padding: theme.spacing(1.5, 1.2),
    gap: theme.spacing(1),
  },
}));

const StatIcon = styled(Box)(({ theme, color = '#0e5181' }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '1.2rem',
  boxShadow: `0 4px 12px ${color}30`,
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  [theme.breakpoints.down('sm')]: {
    width: '32px',
    height: '32px',
    fontSize: '1rem',
  },
}));

const StatContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  minWidth: 0,
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#0e5181',
  lineHeight: 1,
  marginBottom: '2px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  lineHeight: 1.2,
  textAlign: 'right',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  },
}));

const Connector = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  height: '3px',
  width: '60px',
  background: 'linear-gradient(90deg, rgba(14, 81, 129, 0.3) 0%, rgba(14, 81, 129, 0.1) 100%)',
  borderRadius: '2px',
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
    boxShadow: '0 2px 8px rgba(14, 81, 129, 0.3)',
    animation: `${pulseAnimation} 2s ease-in-out infinite`,
  },
  [theme.breakpoints.down('md')]: {
    width: '50px',
    height: '2px',
    '&:before': {
      width: '8px',
      height: '8px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide connectors on mobile
  },
}));

const FloatingElements = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  '& .floating-element': {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'rgba(14, 81, 129, 0.1)',
    animation: `${floatAnimation} 6s ease-in-out infinite`,
    '&:nth-child(1)': {
      top: '20%',
      left: '10%',
      animationDelay: '0s',
    },
    '&:nth-child(2)': {
      top: '60%',
      right: '15%',
      animationDelay: '2s',
    },
    '&:nth-child(3)': {
      bottom: '30%',
      left: '20%',
      animationDelay: '4s',
    },
  },
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
      delay: 0
    },
    {
      icon: <School />,
      number: '500+',
      label: 'دورة متاحة',
      color: '#e5978b',
      delay: 1
    },
    {
      icon: <Star />,
      number: '4.9',
      label: 'تقييم الطلاب',
      color: '#ffc107',
      delay: 2
    },
    {
      icon: <EmojiEvents />,
      number: '95%',
      label: 'معدل النجاح',
      color: '#4caf50',
      delay: 3
    },
    {
      icon: <Business />,
      number: '50+',
      label: 'شريك تعليمي',
      color: '#9c27b0',
      delay: 4
    },
    {
      icon: <TrendingUp />,
      number: '99%',
      label: 'رضا العملاء',
      color: '#ff5722',
      delay: 5
    }
  ];

  return (
    <SeparatorContainer>
      <FloatingElements>
        <Box className="floating-element" />
        <Box className="floating-element" />
        <Box className="floating-element" />
      </FloatingElements>
      
      <Container maxWidth="lg">
        <StatsGrid>
          {stats.map((stat, index) => (
            <React.Fragment key={index}>
              <StatItem delay={stat.delay}>
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
              {/* Add connector between items (except for the last one) */}
              {index < stats.length - 1 && <Connector />}
            </React.Fragment>
          ))}
        </StatsGrid>
      </Container>
    </SeparatorContainer>
  );
};

export default MotionSeparator;
