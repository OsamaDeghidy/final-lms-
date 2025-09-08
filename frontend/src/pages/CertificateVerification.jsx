import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as SchoolIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  QrCode as QrCodeIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import certificateAPI from '../services/certificate.service';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const CertificateVerification = () => {
  const { verificationCode } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (verificationCode) {
      verifyCertificate();
    }
  }, [verificationCode]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await certificateAPI.verifyCertificate(verificationCode);
      setCertificate(result.certificate);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('الشهادة غير صالحة أو غير موجودة');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      const result = await certificateAPI.shareCertificate(certificate);
      if (result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      alert('حدث خطأ أثناء مشاركة الشهادة');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          جاري التحقق من الشهادة...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
        >
          العودة للرئيسية
        </Button>
      </Container>
    );
  }

  if (!certificate) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          لم يتم العثور على الشهادة
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
        >
          العودة للرئيسية
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            التحقق من الشهادة
          </Typography>
          <Typography variant="body1" color="text.secondary">
            تحقق من صحة الشهادة واطلع على تفاصيلها
          </Typography>
        </Box>

        {/* Certificate Card */}
        <Card 
          elevation={8} 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            border: '2px solid #e3f2fd'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Certificate Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'success.main',
                  fontSize: '2rem'
                }}
              >
                <VerifiedIcon />
              </Avatar>
              <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
                شهادة معتمدة
              </Typography>
              <Chip
                label="تم التحقق من صحة الشهادة"
                color="success"
                icon={<VerifiedIcon />}
                sx={{ fontSize: '1rem', py: 2, px: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Certificate Details */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  معلومات الدورة
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      اسم الدورة
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {certificate.course_title || certificate.course_name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      اسم الطالب
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {certificate.student_name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      اسم المؤسسة
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {certificate.institution_name}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  تفاصيل الشهادة
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      رقم الشهادة
                    </Typography>
                    <Typography variant="h6" fontWeight={600} fontFamily="monospace">
                      {certificate.certificate_id}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإصدار
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {formatDate(certificate.date_issued)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      رمز التحقق
                    </Typography>
                    <Typography variant="h6" fontWeight={600} fontFamily="monospace">
                      {certificate.verification_code}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {/* Performance Details */}
            {(certificate.final_grade || certificate.completion_percentage) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                  الأداء والإنجاز
                </Typography>
                <Grid container spacing={3}>
                  {certificate.final_grade && (
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)'
                        }}
                      >
                        <GradeIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {certificate.final_grade}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          الدرجة النهائية
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {certificate.completion_percentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        نسبة الإكمال
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Actions */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #2196f3 0%, #21cbf3 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976d2 0%, #1cb5e0 100%)',
                  }
                }}
              >
                طباعة الشهادة
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              >
                مشاركة
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1.5
                }}
              >
                العودة للرئيسية
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Verification Info */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            تم التحقق من هذه الشهادة في {formatDate(new Date())} - 
            رمز التحقق: <strong>{verificationCode}</strong>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default CertificateVerification;
