import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
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
import certificateAPI from '../../services/certificate.service';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { API_CONFIG } from '../../config/api.config';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add print styles
  useEffect(() => {
    const printStyles = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden;
        }
        .certificate-print, .certificate-print * {
          visibility: visible;
        }
        .certificate-print {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        @page {
          margin: 0;
          size: A4 landscape;
        }
      }
    `;
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  
  // Debug dialog state
  useEffect(() => {
    console.log('Dialog state changed:', dialogOpen);
  }, [dialogOpen]);
  
  // Debug selected certificate
  useEffect(() => {
    console.log('Selected certificate changed:', selectedCertificate);
  }, [selectedCertificate]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Debug URL params
  useEffect(() => {
    console.log('URL params:', {
      courseId: searchParams.get('courseId'),
      autoOpen: searchParams.get('autoOpen'),
      fullURL: location.pathname + location.search
    });
  }, [searchParams, location]);

  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  // Handle URL parameters for auto-opening certificate
  useEffect(() => {
    const courseId = searchParams.get('courseId');
    const autoOpen = searchParams.get('autoOpen');
    
    console.log('URL params check:', { courseId, autoOpen, certificatesLength: certificates.length, loading });
    
    if (courseId && autoOpen === 'true' && certificates.length > 0 && !loading) {
      // Find certificate for the specific course
      const courseCertificate = certificates.find(cert => 
        cert.course_id === parseInt(courseId) || 
        cert.course?.id === parseInt(courseId)
      );
      
      if (courseCertificate) {
        console.log('Auto-opening certificate for course:', courseId);
        console.log('Found certificate:', courseCertificate);
        setSelectedCertificate(courseCertificate);
        setDialogOpen(true);
        console.log('Dialog should be open now');
      } else {
        console.log('No certificate found for course:', courseId);
        console.log('Available certificates:', certificates.map(c => ({ id: c.id, course_id: c.course_id, course: c.course })));
      }
    }
  }, [certificates, searchParams, loading]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateAPI.getMyCertificates();
      console.log('Fetched certificates data:', data);
      if (data && data.length > 0) {
        console.log('First certificate template:', data[0].template);
        if (data[0].template?.template_file) {
          console.log('First certificate template file:', data[0].template.template_file);
        }
        // Log all certificates with their course info
        data.forEach((cert, index) => {
          console.log(`Certificate ${index}:`, {
            id: cert.id,
            course_id: cert.course_id,
            course: cert.course,
            course_title: cert.course_title
          });
        });
      }
      setCertificates(data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('حدث خطأ أثناء تحميل الشهادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateClick = (certificate) => {
    console.log('Certificate clicked:', certificate);
    console.log('Template data:', certificate.template);
    if (certificate.template?.template_file) {
      console.log('Template file URL:', getAbsoluteUrl(certificate.template.template_file));
    }
    setSelectedCertificate(certificate);
    setDialogOpen(true);
  };

  const handleDownload = async (certificateId) => {
    try {
      const result = await certificateAPI.downloadPDF(certificateId);
      if (result.download_url) {
        // If it's a PDF file, download it
        if (result.download_url.endsWith('.pdf')) {
        const link = document.createElement('a');
          link.href = result.download_url;
        link.download = `certificate-${certificateId}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        } else {
          // If it's not a PDF, find the certificate and open its details
          const certificate = certificates.find(cert => cert.id === certificateId);
          if (certificate) {
            handleCertificateClick(certificate);
          } else {
            // Fallback: open the verification page
            window.open(result.download_url, '_blank');
          }
        }
        
        if (result.message) {
          // Show a more user-friendly message
          console.log(result.message);
        }
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('حدث خطأ أثناء تحميل الشهادة');
    }
  };

  const handleShare = async (certificate) => {
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

  const handlePrint = (certificate) => {
    // Set the certificate and open dialog, then trigger print
    setSelectedCertificate(certificate);
    setDialogOpen(true);
    
    // Wait for dialog to open, then trigger print
    setTimeout(() => {
      // Add additional print styles before printing
      const additionalPrintStyles = `
        @media print {
          .certificate-print {
            background-image: url(${getAbsoluteUrl(certificate.template?.template_file)}) !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
      
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = additionalPrintStyles;
      document.head.appendChild(styleSheet);
      
      window.print();
      
      // Remove the additional styles after printing
      setTimeout(() => {
        document.head.removeChild(styleSheet);
      }, 1000);
    }, 500);
  };

  // Table pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    const courseName = certificate.course_title || certificate.course_name || '';
    const matchesSearch = courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  // Helper function to convert relative URLs to absolute URLs
  const getAbsoluteUrl = (url) => {
    console.log('getAbsoluteUrl called with:', url);
    console.log('API_CONFIG.baseURL:', API_CONFIG.baseURL);
    
    if (!url) {
      console.log('getAbsoluteUrl: No URL provided');
      return null;
    }
    if (url.startsWith('http')) {
      console.log('getAbsoluteUrl: Already absolute URL:', url);
      return url;
    }
    const absoluteUrl = `${API_CONFIG.baseURL}${url}`;
    console.log('getAbsoluteUrl: Converted URL:', url, '->', absoluteUrl);
    return absoluteUrl;
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
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -30, 
          left: -30, 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.08)',
          zIndex: 1
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              شهاداتي
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            عرض جميع الشهادات التي حصلت عليها من الدورات المكتملة
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Compact Statistics Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <SchoolIcon sx={{ color: '#ff9800', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                {certificates.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                إجمالي الشهادات
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <VerifiedIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {certificates.filter(c => c.verification_status === 'verified').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                شهادات مؤكدة
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <ScheduleIcon sx={{ color: '#f57c00', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {certificates.filter(c => c.verification_status === 'pending').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                في انتظار التحقق
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            backgroundColor: 'background.paper', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            minWidth: 140,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <GradeIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="secondary.main">
                {certificates.length > 0 ? 
                  Math.round(certificates.reduce((acc, c) => acc + (c.final_grade || 0), 0) / certificates.length) : 0
                }%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                متوسط الدرجات
              </Typography>
            </Box>
          </Box>
        </Box>

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

      {/* Certificates Table */}
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
        <Paper elevation={1} sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>اسم الدورة</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>رقم الشهادة</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>تاريخ الإصدار</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>الدرجة النهائية</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>حالة التحقق</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertificates
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((certificate) => (
                    <TableRow 
                      key={certificate.id}
                sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleCertificateClick(certificate)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <SchoolIcon />
                          </Avatar>
                    <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                        {certificate.course_title || certificate.course_name || 'دورة غير محددة'}
                      </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {certificate.student_name || 'اسم الطالب'}
                            </Typography>
                    </Box>
                  </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {certificate.certificate_id}
                      </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(certificate.date_issued)}
                      </Typography>
                      </TableCell>
                      <TableCell>
                        {certificate.final_grade ? (
                          <Chip 
                            label={`${certificate.final_grade}%`}
                            color={certificate.final_grade >= 80 ? 'success' : certificate.final_grade >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        ) : (
                        <Typography variant="body2" color="text.secondary">
                            غير محدد
                        </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(certificate.verification_status)}
                          color={getStatusColor(certificate.verification_status)}
                          size="small"
                          icon={certificate.verification_status === 'verified' ? <VerifiedIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} justifyContent="center">
                    <Tooltip title="عرض التفاصيل">
                      <IconButton
                        size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCertificateClick(certificate);
                              }}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="تحميل PDF">
                      <IconButton
                        size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(certificate.id);
                              }}
                        color="success"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="مشاركة">
                      <IconButton
                        size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(certificate);
                              }}
                        color="info"
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="طباعة">
                      <IconButton
                        size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrint(certificate);
                              }}
                        color="secondary"
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCertificates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد الصفوف في الصفحة:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
          />
        </Paper>
      )}

      {/* Certificate Preview Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        {selectedCertificate && (
          <>
            <DialogTitle className="no-print">
              <Box display="flex" alignItems="center" justifyContent="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6">
                    معاينة الشهادة
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0, overflow: 'auto' }}>
              {/* Certificate Template Preview */}
              <Box sx={{ 
                p: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '70vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
              }}>
                <Paper 
                  elevation={8}
                  className="certificate-print"
                  sx={{ 
                    width: '100%',
                    maxWidth: '800px',
                    aspectRatio: '4/3',
                    background: selectedCertificate.template?.template_file 
                      ? `url(${getAbsoluteUrl(selectedCertificate.template.template_file)})` 
                      : 'white',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none',
                    borderRadius: 2,
                    '@media print': {
                      background: selectedCertificate.template?.template_file 
                        ? `url(${getAbsoluteUrl(selectedCertificate.template.template_file)})` 
                        : 'white',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      width: '100%',
                      height: '100vh',
                      maxWidth: 'none',
                      aspectRatio: 'none',
                      margin: 0,
                      padding: 0,
                      boxShadow: 'none',
                      border: 'none',
                      borderRadius: 0,
                      '-webkit-print-color-adjust': 'exact',
                      'color-adjust': 'exact',
                      'print-color-adjust': 'exact',
                    }
                  }}
                >
                   {/* Institution Logo - positioned absolutely */}
                     {selectedCertificate.template?.institution_logo && (
                       <Box sx={{ 
                         position: 'absolute', 
                       top: 50,
                       left: 40,
                       width: 80,
                       height: 80,
                       zIndex: 10
                       }}>
                         <img 
                           src={getAbsoluteUrl(selectedCertificate.template.institution_logo)} 
                           alt="شعار المؤسسة"
                           style={{
                             width: '100%',
                             height: '100%',
                             objectFit: 'contain'
                           }}
                         />
                       </Box>
                     )}

                  {/* Certificate Content */}
                  <Box sx={{ 
                    p: 4, 
                    pb: 5, // إضافة padding من الأسفل
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    position: 'relative'
                  }}>
                     {/* Main Content */}
                     <Box sx={{ 
                       flex: 1, 
                       display: 'flex', 
                       flexDirection: 'column', 
                       justifyContent: 'center',
                       alignItems: 'center',
                       textAlign: 'center',
                       maxWidth: '700px',
                       mx: 'auto',
                       py: 4
                     }}>
                       {/* Use template text if available, otherwise use default */}
                       {selectedCertificate.template?.certificate_text ? (
                         <Box sx={{ 
                           mb: 4,
                           lineHeight: 2
                         }}>
                           {selectedCertificate.template.certificate_text
                             .replace('{student_name}', selectedCertificate.student_name || 'اسم الطالب')
                             .replace('{course_name}', selectedCertificate.course_title || selectedCertificate.course_name || 'اسم الدورة')
                             .replace('{completion_date}', formatDate(selectedCertificate.date_issued))
                             .replace('{institution_name}', selectedCertificate.template.institution_name || 'أكاديمية التعلم الإلكتروني')
                             .replace('{final_grade}', selectedCertificate.final_grade && selectedCertificate.final_grade > 0 ? selectedCertificate.final_grade : 'غير محدد')
                             .replace('{course_duration}', selectedCertificate.course_duration_hours || 'غير محدد')
                             .split('\n').map((line, index) => (
                               <Typography 
                                 key={index}
                                 variant={line.includes(selectedCertificate.student_name) || line.includes(selectedCertificate.course_title) ? "h4" : "body1"}
                                 fontWeight={line.includes(selectedCertificate.student_name) || line.includes(selectedCertificate.course_title) ? "bold" : "normal"}
                                 sx={{ 
                                   mb: line.includes(selectedCertificate.student_name) || line.includes(selectedCertificate.course_title) ? 3 : 1.5, 
                                   fontSize: line.includes(selectedCertificate.student_name) || line.includes(selectedCertificate.course_title) ? '2rem' : '1.3rem',
                                   lineHeight: 1.6,
                                   color: line.includes(selectedCertificate.student_name) || line.includes(selectedCertificate.course_title) ? 
                                     '#0e5181' : '#2c3e50',
                                   textAlign: 'center',
                                   fontFamily: line.includes(selectedCertificate.student_name) || line.includes(selectedCertificate.course_title) ? 
                                     '"Cairo", "Arial", sans-serif' : '"Cairo", "Arial", sans-serif'
                                 }}
                               >
                                 {line}
                               </Typography>
                             ))
                           }
                         </Box>
                       ) : (
                         <Box sx={{ 
                           mb: 4,
                           lineHeight: 2
                         }}>
                           <Typography 
                             variant="body1" 
                             sx={{ 
                               mb: 2, 
                               fontSize: '1.5rem', 
                               lineHeight: 1.8,
                               color: '#2c3e50',
                               textAlign: 'center',
                               fontFamily: '"Cairo", "Arial", sans-serif'
                             }}
                           >
                             هذا يشهد بأن
                           </Typography>
                           
                           <Typography 
                             variant="h4" 
                             fontWeight="bold" 
                             sx={{ 
                               mb: 3, 
                               fontSize: '2.2rem',
                               color: '#0e5181',
                               textAlign: 'center',
                               fontFamily: '"Cairo", "Arial", sans-serif'
                             }}
                           >
                             {selectedCertificate.student_name || 'اسم الطالب'}
                           </Typography>
                           
                           <Typography 
                             variant="body1" 
                             sx={{ 
                               mb: 2, 
                               fontSize: '1.5rem', 
                               lineHeight: 1.8,
                               color: '#2c3e50',
                               textAlign: 'center',
                               fontFamily: '"Cairo", "Arial", sans-serif'
                             }}
                           >
                             قد أكمل بنجاح دورة
                           </Typography>
                           
                           <Typography 
                             variant="h5" 
                             fontWeight="bold" 
                             sx={{ 
                               mb: 3, 
                               fontSize: '1.8rem',
                               color: '#0e5181',
                               textAlign: 'center',
                               fontFamily: '"Cairo", "Arial", sans-serif'
                             }}
                           >
                             {selectedCertificate.course_title || selectedCertificate.course_name || 'اسم الدورة'}
                           </Typography>
                           
                           <Typography 
                             variant="body1" 
                             sx={{ 
                               mb: 2, 
                               fontSize: '1.3rem', 
                               lineHeight: 1.8,
                               color: '#666',
                               textAlign: 'center',
                               fontFamily: '"Cairo", "Arial", sans-serif'
                             }}
                           >
                             بتاريخ {formatDate(selectedCertificate.date_issued)}
                           </Typography>
                         </Box>
                       )}

                       {/* Show grade if template includes it or if available */}
                       {(selectedCertificate.template?.include_grade || selectedCertificate.final_grade) && selectedCertificate.final_grade && selectedCertificate.final_grade > 0 && (
                         <Box sx={{ 
                           mb: 3,
                           mt: 2
                         }}>
                           <Typography 
                             variant="h6" 
                             sx={{ 
                               color: '#2e7d32', 
                               fontWeight: 'bold',
                               textAlign: 'center',
                               fontSize: '1.4rem',
                               fontFamily: '"Cairo", "Arial", sans-serif'
                             }}
                           >
                           بدرجة: {selectedCertificate.final_grade}%
                         </Typography>
                         </Box>
                       )}

                       {/* Show course duration if template includes it
                       {selectedCertificate.template?.include_course_duration && selectedCertificate.course_duration_hours && (
                         <Box sx={{ 
                           mb: 2
                         }}>
                           <Typography 
                             variant="body1" 
                             sx={{ 
                               color: '#666', 
                               fontSize: '1.2rem',
                               textAlign: 'center'
                             }}
                           >
                           مدة الدورة: {selectedCertificate.course_duration_hours} ساعة
                         </Typography>
                         </Box>
                       )} */}
                     </Box>

                    {/* Certificate Footer */}
                    <Box sx={{ 
                      position: 'absolute',
                      bottom: 100, // زيادة المسافة من الأسفل
                      left: 20,
                      right: 20,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end'
                    }}>
                       {/* Institution Info */}
                       <Box sx={{ textAlign: 'center', flex: 1 }}>
                         <Typography 
                           variant="h6" 
                           fontWeight="bold" 
                           sx={{ 
                             color: '#0e5181', 
                             mb: 1,
                             fontSize: '1.1rem',
                             fontFamily: '"Cairo", "Arial", sans-serif'
                           }}
                         >
                           {selectedCertificate.template?.institution_name || selectedCertificate.institution_name || 'أكاديمية التعلم الإلكتروني'}
                         </Typography>
                         <Typography 
                           variant="body2" 
                           sx={{ 
                             color: '#666',
                             fontSize: '0.9rem',
                             fontFamily: '"Cairo", "Arial", sans-serif'
                           }}
                         >
                           {selectedCertificate.template?.institution_description || 'مؤسسة تعليمية معتمدة'}
                         </Typography>
                       </Box>

                       {/* Signature */}
                       <Box sx={{ textAlign: 'center', flex: 1 }}>
                         <Box sx={{ 
                           height: 70, 
                           borderBottom: '2px solid #0e5181', 
                           mb: 1,
                           position: 'relative',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                         }}>
                           {selectedCertificate.template?.signature_image ? (
                             <Box
                               component="img"
                               src={getAbsoluteUrl(selectedCertificate.template.signature_image)}
                               alt="توقيع"
                               sx={{
                                 height: '100%',
                                 objectFit: 'contain'
                               }}
                             />
                           ) : (
                             <Typography 
                               variant="body2" 
                               sx={{ 
                                 color: '#0e5181',
                                 fontStyle: 'italic'
                               }}
                             >
                               توقيع
                             </Typography>
                           )}
                         </Box>
                         <Typography 
                           variant="body2" 
                           fontWeight="bold" 
                           sx={{ 
                             color: '#0e5181',
                             fontSize: '0.9rem',
                             fontFamily: '"Cairo", "Arial", sans-serif'
                           }}
                         >
                           {selectedCertificate.template?.signature_name || 'مدير الأكاديمية'}
                         </Typography>
                         <Typography 
                           variant="caption" 
                           sx={{ 
                             color: '#666',
                             fontSize: '0.8rem',
                             fontFamily: '"Cairo", "Arial", sans-serif'
                           }}
                         >
                           {selectedCertificate.template?.signature_title || 'مدير التعليم'}
                         </Typography>
                       </Box>
                    </Box>
                  </Box>

                   {/* Certificate ID and QR Code */}
                   <Box sx={{ 
                     position: 'absolute', 
                     bottom: 70, // زيادة المسافة من الأسفل
                     left: 60, 
                     right: 120,
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center'
                   }}>
                     <Typography 
                       variant="caption" 
                       sx={{ 
                         color: '#666', 
                         fontFamily: '"Cairo", "Arial", sans-serif',
                         fontSize: '0.8rem',
                         fontWeight: 'bold'
                       }}
                     >
                       رقم الشهادة: {selectedCertificate.certificate_id}
                     </Typography>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       {selectedCertificate.verification_code && (
                         <Typography 
                           variant="caption" 
                           sx={{ 
                             color: '#666', 
                             fontFamily: '"Cairo", "Arial", sans-serif',
                             fontSize: '0.8rem',
                             fontWeight: 'bold'
                           }}
                         >
                           رمز التحقق: {selectedCertificate.verification_code}
                         </Typography>
                       )}
                       {selectedCertificate.template?.include_qr_code && selectedCertificate.qr_code_image && (
                         <Box sx={{ width: 25, height: 25 }}>
                           <img 
                             src={selectedCertificate.qr_code_image} 
                             alt="QR Code"
                             style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                           />
                         </Box>
                       )}
                     </Box>
                   </Box>

                </Paper>
              </Box>
            </DialogContent>
            <DialogActions className="no-print" sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={() => setDialogOpen(false)}>
                إغلاق
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      </Container>
    </Box>
  );
};

export default MyCertificates;
