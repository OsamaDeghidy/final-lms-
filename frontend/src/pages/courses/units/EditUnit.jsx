import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  background: theme.palette.background.paper,
  marginTop: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    padding: '0 16px',
    '& input': {
      textAlign: 'right',
      padding: '12px 0',
      fontSize: '1rem',
      '&::placeholder': {
        textAlign: 'right',
        opacity: 1,
      },
    },
    '& textarea': {
      textAlign: 'right',
      padding: '16px 0',
      fontSize: '1rem',
      lineHeight: '1.5',
      '&::placeholder': {
        textAlign: 'right',
        opacity: 1,
      },
    },
  },
  '& .MuiInputLabel-root': {
    right: 16,
    left: 'auto',
    transformOrigin: 'right',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(-14px, -9px) scale(0.75)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    textAlign: 'right',
  },
  '& .MuiInputBase-multiline': {
    padding: '8px 16px',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 20px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  '&.MuiButton-contained': {
    padding: '10px 24px',
  },
}));

// لا توجد إدارة للدروس هنا

const EditUnit = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId, unitId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [unitData, setUnitData] = useState({
    title: '',
    description: '',
    duration: '', // minutes
    isPreview: false,
    videoFile: null,
    videoUrl: '',
    pdfFile: null,
    pdfUrl: '',
  });

  useEffect(() => {
    const fetchUnitData = async () => {
      setLoading(true);
      try {
        const data = await contentAPI.getModuleById(unitId);
        setUnitData(prev => ({
          ...prev,
          title: data?.name || '',
          description: data?.description || '',
          duration: typeof data?.video_duration === 'number' ? Math.round(data.video_duration / 60) : '',
          isPreview: Boolean(data?.is_active) === false,
          videoUrl: data?.video || '',
          pdfUrl: data?.pdf || '',
        }));
      } catch (error) {
        console.error('Error fetching unit data:', error);
        setSnackbar({ open: true, message: 'حدث خطأ في تحميل بيانات الوحدة', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (unitId) fetchUnitData();
  }, [unitId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUnitData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileSelect = (type, file) => {
    setUnitData(prev => ({
      ...prev,
      [`${type}File`]: file || null,
      ...(type === 'video' ? { videoUrl: file ? '' : prev.videoUrl } : {}),
      ...(type === 'pdf' ? { pdfUrl: file ? '' : prev.pdfUrl } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      setSaving(true);
      try {
      const payload = {
        title: unitData.title,
        name: unitData.title,
        description: unitData.description,
        durationMinutes: unitData.duration ? Number(unitData.duration) : undefined,
        status: unitData.isPreview ? 'draft' : undefined,
        videoFile: unitData.videoFile,
        pdfFile: unitData.pdfFile,
      };
      await contentAPI.updateModule(unitId, payload);
      setSnackbar({ open: true, message: 'تم حفظ الوحدة بنجاح وتم تحديث البيانات!', severity: 'success' });
        navigate(`/teacher/courses/${courseId}/units`);
      } catch (error) {
        console.error('Error saving unit:', error);
      setSnackbar({ open: true, message: 'حدث خطأ في حفظ الوحدة', severity: 'error' });
      } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ 
            mr: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          تعديل الوحدة
        </Typography>
      </Box>
      
      <StyledPaper elevation={0}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            تعديل بيانات الوحدة
          </Typography>

          <StyledTextField
            fullWidth
            label="عنوان الوحدة"
            name="title"
            value={unitData.title}
            onChange={handleChange}
            variant="outlined"
            required
            size="medium"
          />

          <StyledTextField
            fullWidth
            label="وصف الوحدة"
            name="description"
            value={unitData.description}
            onChange={handleChange}
            variant="outlined"
            multiline
            rows={4}
          />

          <StyledTextField
            fullWidth
            label="مدة الوحدة (بالدقائق)"
            name="duration"
            type="number"
            value={unitData.duration}
            onChange={handleChange}
            variant="outlined"
            size="medium"
            InputProps={{ endAdornment: <InputAdornment position="end">دقيقة</InputAdornment> }}
          />

          {/* VIDEO */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>الفيديو</Typography>
            {unitData.videoFile ? (
              <Box>
                <video src={URL.createObjectURL(unitData.videoFile)} controls style={{ width: '100%', maxHeight: 360, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button color="error" onClick={() => handleFileSelect('video', null)}>مسح الفيديو</Button>
                </Box>
              </Box>
            ) : unitData.videoUrl ? (
              <Box>
                <video src={unitData.videoUrl} controls style={{ width: '100%', maxHeight: 360, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={saving}>
                    استبدال الفيديو
                    <input hidden type="file" accept="video/*" onChange={(e) => handleFileSelect('video', e.target.files && e.target.files.length ? e.target.files[0] : null)} />
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={saving}>
                رفع فيديو (MP4)
                <input hidden type="file" accept="video/*" onChange={(e) => handleFileSelect('video', e.target.files && e.target.files.length ? e.target.files[0] : null)} />
              </Button>
            )}
          </Box>
          
          {/* PDF */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>ملف PDF</Typography>
            {unitData.pdfFile ? (
              <Box>
                <Box sx={{ position: 'relative', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>
                  <iframe title="pdf-preview" src={URL.createObjectURL(unitData.pdfFile)} style={{ width: '100%', height: 480, border: 0 }} />
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button component="a" href={URL.createObjectURL(unitData.pdfFile)} target="_blank" rel="noopener noreferrer">فتح في تبويب</Button>
                  <Button color="error" onClick={() => handleFileSelect('pdf', null)}>مسح الملف</Button>
                </Box>
                </Box>
            ) : unitData.pdfUrl ? (
              <Box>
                <Box sx={{ position: 'relative', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>
                  <iframe title="pdf-preview" src={unitData.pdfUrl} style={{ width: '100%', height: 480, border: 0 }} />
              </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button component="a" href={unitData.pdfUrl} target="_blank" rel="noopener noreferrer">فتح في تبويب</Button>
                  <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={saving}>
                    استبدال الملف
                    <input hidden type="file" accept="application/pdf" onChange={(e) => handleFileSelect('pdf', e.target.files && e.target.files.length ? e.target.files[0] : null)} />
                  </Button>
          </Box>
              </Box>
            ) : (
              <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                رفع ملف PDF
                <input hidden type="file" accept="application/pdf" onChange={(e) => handleFileSelect('pdf', e.target.files && e.target.files.length ? e.target.files[0] : null)} />
              </Button>
            )}
        </Box>
        
          <FormControlLabel
            control={<Checkbox checked={unitData.isPreview} onChange={handleChange} name="isPreview" color="primary" />}
            label="متاحة كمعاينة"
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <StyledButton variant="contained" type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </StyledButton>
          </Box>
        </Box>
      </StyledPaper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditUnit; 
