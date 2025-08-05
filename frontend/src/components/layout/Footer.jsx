import { Box, Container, Grid, Typography, Link, IconButton, Divider, useMediaQuery, useTheme, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import logo from '../../assets/images/logo.png';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1A1A2E',
  color: '#FFFFFF',
  padding: theme.spacing(8, 0, 4),
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.1) 100%)',
    pointerEvents: 'none',
  },
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: theme.spacing(3),
  position: 'relative',
  fontSize: '1.2rem',
  paddingBottom: theme.spacing(1),
  '&:after': {
    content: '""',
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 50,
    height: 3,
    background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
    borderRadius: 3,
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: '#E6E6E6',
  marginBottom: theme.spacing(1.5),
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  fontSize: '0.95rem',
  '&:hover': {
    color: '#4ECDC4',
    paddingRight: theme.spacing(1),
    '& .arrow-icon': {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
}));

const ArrowIcon = styled(ArrowBackIcon)({
  fontSize: '1rem',
  marginRight: 8,
  opacity: 0,
  transform: 'translateX(-5px)',
  transition: 'all 0.3s ease',
});

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    marginTop: 4,
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#FFFFFF',
  margin: theme.spacing(0, 1, 1, 0),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#4ECDC4',
    color: '#1A1A2E',
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(78, 205, 196, 0.3)',
  },
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const contactInfo = [
    { icon: <PhoneIcon />, text: '+966 12 345 6789' },
    { icon: <EmailIcon />, text: 'info@academy.edu.sa' },
    { icon: <LocationIcon />, text: 'المملكة العربية السعودية' },
  ];




  const importantLinks = [
    { text: 'من نحن', to: '/about-us' },
    { text: 'سياسة الخصوصية', to: '/privacy-policy' },
    { text: 'سياسة الاستبدال والاسترجاع', to: '/return-policy' },
    { text: 'الشروط والأحكام', to: '/terms' },
    { text: 'حقوق الملكية الفكرية', to: '/intellectual-property' },
  ];



  const supportLinks = [
    { text: 'الأسئلة الشائعة', to: '/faq' },
    { text: 'سياسة الخصوصية', to: '/privacy-policy' },
    { text: 'الشروط والأحكام', to: '/terms' },
    { text: 'سياسة الإرجاع', to: '/refund-policy' },
    { text: 'المساعدة والدعم', to: '/support' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, url: 'https://facebook.com' },
    { icon: <TwitterIcon />, url: 'https://twitter.com' },
    { icon: <InstagramIcon />, url: 'https://instagram.com' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com' },
    { icon: <YouTubeIcon />, url: 'https://youtube.com' },
  ];
  
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Contact Bar - Top Row */}
        <Box 
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
            p: 2,
            mb: 4,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#4ECDC4', fontWeight: 600 }}>
            تواصل معنا
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {contactInfo.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: '#4ECDC4' }}>{item.icon}</Box>
                <Typography variant="body2" sx={{ color: '#E6E6E6', fontSize: '0.85rem' }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        <Grid container spacing={isMobile ? 4 : 6}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Box mb={2}>
              <Box display="flex" alignItems="center" mb={3}>
                <img 
                  src={logo} 
                  alt="شعار المعهد" 
                  style={{ height: 40 }} 
                />
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mr: 1 }}>
                معهد التطوير المهني العالي للتدريب
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#E6E6E6', lineHeight: 1.8, mb: 3 }}>
              معنا تحقق أهدافك التدريبية باحترافية وجودة، حيث يعد التطوير المهني اليوم ميزة أساسية لاختيار وترقية الموظفين.
              <br />
              أوقات العمل 8 ص - 12 ص
              </Typography>
              <Box mt={2}>
                {socialLinks.map((social, index) => (
                  <SocialIcon 
                    key={index} 
                    component="a" 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </SocialIcon>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Important Links */}
          <Grid item xs={12} sm={8} md={4}>
            <FooterTitle>روابط مهمة</FooterTitle>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                {importantLinks.slice(0, Math.ceil(importantLinks.length / 2)).map((link, index) => (
                  <Box key={index} mb={1.5}>
                    <FooterLink 
                      component={RouterLink} 
                      to={link.to}
                      underline="none"
                    >
                      <ArrowIcon className="arrow-icon" />
                      {link.text}
                    </FooterLink>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={6}>
                {importantLinks.slice(Math.ceil(importantLinks.length / 2)).map((link, index) => (
                  <Box key={index} mb={1.5}>
                    <FooterLink 
                      component={RouterLink} 
                      to={link.to}
                      underline="none"
                    >
                      <ArrowIcon className="arrow-icon" />
                      {link.text}
                    </FooterLink>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Copyright Section */}
        <Box 
          sx={{ 
            mt: 6, 
            pt: 3, 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ color: '#A0A0A0', textAlign: isMobile ? 'center' : 'left' }}>
            © {currentYear} جميع الحقوق محفوظة لأكاديمية التطوير
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent={isMobile ? 'center' : 'flex-end'}>
            <Typography variant="body2" color="text.secondary" align="center">
              تم التطوير بواسطة فريق التطوير المهني
            </Typography>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
