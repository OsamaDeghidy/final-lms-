import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as SchoolIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { certificateAPI } from '../../services/certificate.service';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateAPI.getMyCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('حدث خطأ أثناء تحميل الشهادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate);
    setDialogOpen(true);
  };

  const handleDownload = async (certificateId) => {
    try {
      const blob = await certificateAPI.downloadPDF(certificateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('حدث خطأ أثناء تحميل الشهادة');
    }
  };

  const handleShare = (certificate) => {
    const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verification_code}`;
    if (navigator.share) {
      navigator.share({
        title: `شهادة ${certificate.course_name}`,
        text: `شهادة إكمال دورة ${certificate.course_name}`,
        url: verificationUrl
      });
    } else {
      navigator.clipboard.writeText(verificationUrl);
      alert('تم نسخ رابط التحقق من الشهادة');
    }
  };

  const handlePrint = (certificate) => {
    const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.verification_code}`;
    window.open(verificationUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'تم التحقق';
      case 'pending':
        return 'في انتظار التحقق';
      case 'failed':
        return 'فشل التحقق';
      default:
        return 'غير محدد';
    }
  };

  const filteredCertificates = certificates.filter(certificate => {
    const matchesFilter = filter === 'all' || certificate.verification_status === filter;
    const matchesSearch = certificate.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         certificate.certificate_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          جاري تحميل الشهادات...
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
          onClick={fetchCertificates}
          startIcon={<RefreshIcon />}
        >
          إعادة المحاولة
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
          شهاداتي
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عرض جميع الشهادات التي حصلت عليها من الدورات المكتملة
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {certificates.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي الشهادات
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <VerifiedIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {certificates.filter(c => c.verification_status === 'verified').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              شهادات مؤكدة
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {certificates.filter(c => c.verification_status === 'pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              في انتظار التحقق
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <GradeIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {certificates.length > 0 ? 
                Math.round(certificates.reduce((acc, c) => acc + (c.final_grade || 0), 0) / certificates.length) : 0
              }%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              متوسط الدرجات
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label="جميع الشهادات"
                onClick={() => setFilter('all')}
                color={filter === 'all' ? 'primary' : 'default'}
                variant={filter === 'all' ? 'filled' : 'outlined'}
              />
              <Chip
                label="مؤكدة"
                onClick={() => setFilter('verified')}
                color={filter === 'verified' ? 'success' : 'default'}
                variant={filter === 'verified' ? 'filled' : 'outlined'}
              />
              <Chip
                label="في انتظار التحقق"
                onClick={() => setFilter('pending')}
                color={filter === 'pending' ? 'warning' : 'default'}
                variant={filter === 'pending' ? 'filled' : 'outlined'}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1}>
              <Box flex={1} position="relative">
                <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary' }} />
                <input
                  type="text"
                  placeholder="البحث في الشهادات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={fetchCertificates}
                startIcon={<RefreshIcon />}
              >
                تحديث
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Paper elevation={1} sx={{ p: 8, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد شهادات
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || filter !== 'all' 
              ? 'لا توجد شهادات تطابق معايير البحث المحددة'
              : 'لم تحصل على أي شهادات بعد. أكمل الدورات للحصول على شهاداتك!'
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCertificates.map((certificate) => (
            <Grid item xs={12} md={6} lg={4} key={certificate.id}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Certificate Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {certificate.course_name || 'دورة غير محددة'}
                      </Typography>
                      <Chip
                        label={getStatusText(certificate.verification_status)}
                        color={getStatusColor(certificate.verification_status)}
                        size="small"
                        icon={certificate.verification_status === 'verified' ? <VerifiedIcon /> : undefined}
                      />
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                      <SchoolIcon />
                    </Avatar>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Certificate Details */}
                  <Stack spacing={1.5} mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AssignmentIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        رقم الشهادة: {certificate.certificate_id}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        تاريخ الإصدار: {formatDate(certificate.date_issued)}
                      </Typography>
                    </Box>

                    {certificate.final_grade && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <GradeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          الدرجة النهائية: {certificate.final_grade}%
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Actions */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Tooltip title="عرض التفاصيل">
                      <IconButton
                        size="small"
                        onClick={() => handleCertificateClick(certificate)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="تحميل PDF">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(certificate.id)}
                        color="success"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="مشاركة">
                      <IconButton
                        size="small"
                        onClick={() => handleShare(certificate)}
                        color="info"
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="طباعة">
                      <IconButton
                        size="small"
                        onClick={() => handlePrint(certificate)}
                        color="secondary"
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Certificate Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedCertificate && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <SchoolIcon color="primary" />
                <Typography variant="h6">
                  تفاصيل الشهادة
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    معلومات الدورة
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        اسم الدورة
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedCertificate.course_name}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        رقم الشهادة
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedCertificate.certificate_id}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        رمز التحقق
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                        {selectedCertificate.verification_code}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    معلومات الإصدار
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        تاريخ الإصدار
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(selectedCertificate.date_issued)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        حالة التحقق
                      </Typography>
                      <Chip
                        label={getStatusText(selectedCertificate.verification_status)}
                        color={getStatusColor(selectedCertificate.verification_status)}
                        icon={selectedCertificate.verification_status === 'verified' ? <VerifiedIcon /> : undefined}
                      />
                    </Box>
                    
                    {selectedCertificate.final_grade && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          الدرجة النهائية
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedCertificate.final_grade}%
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                إغلاق
              </Button>
              <Button
                variant="contained"
                onClick={() => handleDownload(selectedCertificate.id)}
                startIcon={<DownloadIcon />}
              >
                تحميل PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default MyCertificates;
