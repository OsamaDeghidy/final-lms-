import { Box, Button, Container, Typography } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          غير مصرح بالوصول
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          sx={{ mt: 3 }}
        >
          العودة للصفحة الرئيسية
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
