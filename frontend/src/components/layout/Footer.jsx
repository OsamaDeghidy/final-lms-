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
  backgroundColor: '#FFFFFF',
  color: '#0e5181',
  padding: theme.spacing(8, 0, 0),
  position: 'relative',
  overflow: 'hidden',
  borderTop: '2px solid rgba(14, 81, 129, 0.1)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.02) 0%, rgba(229, 151, 139, 0.02) 100%)',
    zIndex: 0,
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, rgba(14, 81, 129, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 80% 80%, rgba(229, 151, 139, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 40% 60%, rgba(14, 81, 129, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px, 50px 50px, 50px 50px',
    backgroundPosition: '0 0, 25px 25px, 12px 30px',
    zIndex: 0,
  },
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: '#0e5181',
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
    background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
    borderRadius: 3,
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: '#333333',
  marginBottom: theme.spacing(1.5),
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  fontSize: '0.95rem',
  fontWeight: '500',
  '&:hover': {
    color: '#e5978b',
    paddingRight: theme.spacing(1),
    fontWeight: '600',
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
    color: '#0e5181',
    marginTop: 4,
    fontSize: '1.2rem',
  },
  '& .contact-text': {
    color: '#333333',
    fontWeight: '500',
    fontSize: '0.95rem',
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(14, 81, 129, 0.15)',
  color: '#0e5181',
  margin: theme.spacing(0, 1, 1, 0),
  transition: 'all 0.3s ease',
  border: '2px solid rgba(14, 81, 129, 0.2)',
  '&:hover': {
    backgroundColor: '#e5978b',
    color: '#FFFFFF',
    borderColor: '#e5978b',
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(229, 151, 139, 0.4)',
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
    <>
      {/* Decorative Wave Separator */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '60px',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <path
            d="M0,120V73.71c47.79-22.2,103.59-32.17,158-28,70.36,5.37,136.33,33.31,206.8,37.5C438.64,87.57,512.34,66.33,583,47.95c69.27-18,138.3-24.88,209.4-13.08,36.15,6,69.85,17.84,104.45,29.34C989.49,95,1113,134.29,1200,67.53V120Z"
            opacity=".25"
            fill="#0e5181"
          />
          <path
            d="M0,120V104.19C13,83.08,27.64,63.14,47.69,47.95,99.41,8.73,165,9,224.58,28.42c31.15,10.15,60.09,26.07,89.67,39.8,40.92,19,84.73,46,130.83,49.67,36.26,2.85,70.9-9.42,98.6-31.56,31.77-25.39,62.32-62,103.63-73,40.44-10.46,81.35,6.69,119.13,24.28s75.16,39,116.92,43.05c59.73,5.85,113.28-22.88,168.9-38.84,30.2-8.66,59-6.17,87.09,7.5,22.43,10.89,48,26.93,60.65,49.24V120Z"
            opacity=".5"
            fill="#0e5181"
          />
          <path
            d="M0,120V114.37C149.93,61,314.09,48.68,475.83,77.43c43,7.64,84.23,20.12,127.61,26.46,59,8.63,112.48-12.24,165.56-35.4C827.93,42.78,886,24.76,951.2,30c86.53,7,172.46,45.71,248.8,84.81V120Z"
            fill="#0e5181"
          />
        </svg>
      </Box>

      <FooterContainer component="footer">
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Contact Bar - Top Row */}
          <Box 
            sx={{ 
              backgroundColor: 'rgba(14, 81, 129, 0.08)',
              borderRadius: 2,
              p: 3,
              mb: 4,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              border: '1px solid rgba(14, 81, 129, 0.15)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#0e5181', fontWeight: 600 }}>
              تواصل معنا
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {contactInfo.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: '#0e5181' }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ color: '#333333', fontSize: '0.85rem', fontWeight: '500' }}>
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
                    style={{ height: 50 }} 
                  />
                  <Typography variant="h6" sx={{ color: '#0e5181', fontWeight: 700, mr: 1 }}>
                  معهد التطوير المهني العالي للتدريب
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#333333', lineHeight: 1.8, mb: 3, fontWeight: '500' }}>
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
              mt: 2, 
              pt: 1.5, 
              pb: 1.5,
              borderTop: '1px solid rgba(14, 81, 129, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(14, 81, 129, 0.03) 0%, rgba(229, 151, 139, 0.03) 100%)',
                zIndex: -1,
              },
              '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                height: '100%',
                background: `
                  radial-gradient(circle at 20% 20%, rgba(14, 81, 129, 0.02) 1px, transparent 1px),
                  radial-gradient(circle at 80% 80%, rgba(229, 151, 139, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px, 40px 40px',
                backgroundPosition: '0 0, 20px 20px',
                zIndex: -1,
              },
            }}
          >
            <Typography variant="body2" sx={{ color: '#0e5181', textAlign: 'center', fontWeight: '500', fontSize: '0.85rem' }}>
              © {currentYear} جميع الحقوق محفوظة لأكاديمية التطوير
            </Typography>
          </Box>
      </Container>
    </FooterContainer>
    </>
  );
};

export default Footer;
