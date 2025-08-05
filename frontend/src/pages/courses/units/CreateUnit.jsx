import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  Article as ArticleIcon,
  Code as CodeIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

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

const UploadArea = styled('div')(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: '8px',
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.05)' : theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(25, 118, 210, 0.03)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const LESSON_TYPES = [
  { value: 'video', label: 'فيديو', icon: <VideoLibraryIcon /> },
  { value: 'article', label: 'مقال', icon: <ArticleIcon /> },
  { value: 'quiz', label: 'اختبار', icon: <QuizIcon /> },
  { value: 'exercise', label: 'تمرين عملي', icon: <CodeIcon /> },
];

const CreateUnit = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form state
  const [unitData, setUnitData] = useState({
    title: '',
    description: '',
    duration: '',
    isPreview: false,
    lessons: [
      {
        id: Date.now(),
        title: '',
        type: 'video',
        duration: '',
        content: '',
        isPreview: false,
        resources: [],
      },
    ],
  });

  const steps = [
    'معلومات الوحدة',
    'إضافة الدروس',
    'مراجعة النهائية',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUnitData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...unitData.lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setUnitData(prev => ({
      ...prev,
      lessons: updatedLessons
    }));
  };

  const addNewLesson = () => {
    setUnitData(prev => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: Date.now(),
          title: '',
          type: 'video',
          duration: '',
          content: '',
          isPreview: false,
          resources: [],
        },
      ],
    }));
  };

  const removeLesson = (index) => {
    if (unitData.lessons.length > 1) {
      const updatedLessons = [...unitData.lessons];
      updatedLessons.splice(index, 1);
      setUnitData(prev => ({
        ...prev,
        lessons: updatedLessons
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeStep === steps.length - 1) {
      // Submit the form data
      console.log('Unit data submitted:', unitData);
      // In a real app, you would submit the form data to your backend here
      alert('تم حفظ الوحدة بنجاح!');
      // Navigate back to the course page or units list
      navigate(`/courses/${courseId}`);
    } else {
      // Move to next step
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              معلومات الوحدة الأساسية
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
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <StyledTextField
                fullWidth
                label="مدة الوحدة (بالدقائق)"
                name="duration"
                type="number"
                value={unitData.duration}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                InputProps={{
                  endAdornment: <InputAdornment position="end">دقيقة</InputAdornment>,
                }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={unitData.isPreview}
                    onChange={handleChange}
                    name="isPreview"
                    color="primary"
                  />
                }
                label="متاحة كمعاينة"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                دروس الوحدة
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewLesson}
                sx={{ borderRadius: '8px' }}
              >
                إضافة درس جديد
              </Button>
            </Box>
            
            {unitData.lessons.map((lesson, index) => (
              <Accordion 
                key={lesson.id} 
                defaultExpanded={index === 0} 
                sx={{ 
                  mb: 2, 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  '& .MuiButtonBase-root': {
                    padding: '0 16px',
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: theme.palette.grey[50],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      {LESSON_TYPES.find(type => type.value === lesson.type)?.icon || <ArticleIcon />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {lesson.title || 'درس جديد'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {LESSON_TYPES.find(type => type.value === lesson.type)?.label || 'نوع الدرس'}
                        {lesson.duration && ` • ${lesson.duration} دقيقة`}
                      </Typography>
                    </Box>
                    {unitData.lessons.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLesson(index);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        label="عنوان الدرس"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      
                      <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                        <InputLabel>نوع المحتوى</InputLabel>
                        <Select
                          value={lesson.type}
                          onChange={(e) => handleLessonChange(index, 'type', e.target.value)}
                          label="نوع المحتوى"
                        >
                          {LESSON_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {type.icon}
                                <Box component="span" sx={{ mr: 1 }}>
                                  {type.label}
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <StyledTextField
                        fullWidth
                        label="مدة الدرس (بالدقائق)"
                        type="number"
                        value={lesson.duration}
                        onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">دقيقة</InputAdornment>,
                        }}
                      />
                      
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={lesson.isPreview}
                            onChange={(e) => handleLessonChange(index, 'isPreview', e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        }
                        label="متاح كمعاينة"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 1 }}>
                        محتوى الدرس
                      </Typography>
                      <StyledTextField
                        fullWidth
                        multiline
                        rows={5}
                        value={lesson.content}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        variant="outlined"
                        size="small"
                        placeholder="أدخل محتوى الدرس أو روابط الفيديو أو أي معلومات إضافية..."
                      />
                      
                      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        المرفقات
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        رفع ملف
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
              مراجعة الوحدة
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                معلومات الوحدة
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">العنوان:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{unitData.title}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">المدة:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{unitData.duration} دقيقة</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">الوصف:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {unitData.description || 'لا يوجد وصف'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                الدروس ({unitData.lessons.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {unitData.lessons.map((lesson, index) => (
                <Box
                  key={lesson.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: '8px',
                    backgroundColor: theme.palette.grey[50],
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                      {LESSON_TYPES.find(type => type.value === lesson.type)?.icon || <ArticleIcon />}
                    </Box>
                    <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                      {lesson.title || 'درس بدون عنوان'}
                    </Typography>
                    <Chip
                      label={LESSON_TYPES.find(type => type.value === lesson.type)?.label || 'عام'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                    {lesson.isPreview && (
                      <Chip
                        label="معاينة"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                      <AccessTimeIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
                      {lesson.duration || '0'} دقيقة
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>
        );
        
      default:
        return 'خطأ: خطوة غير معروفة';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ 
            mr: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          إضافة وحدة جديدة
        </Typography>
      </Box>
      
      <StyledPaper elevation={0}>
        {/* Stepper */}
        <Box sx={{ width: '100%', mb: 4, position: 'relative' }}>
          {/* Progress line */}
          <Box 
            sx={{
              position: 'absolute',
              top: 20,
              left: '50px',
              right: '50px',
              height: '2px',
              backgroundColor: theme.palette.grey[300],
              zIndex: 0,
            }}
          >
            <Box 
              sx={{
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
            {steps.map((label, index) => (
              <Box 
                key={label} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: activeStep >= index ? theme.palette.primary.main : theme.palette.grey[300],
                    color: activeStep >= index ? '#fff' : theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    mb: 1,
                    position: 'relative',
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxSizing: 'border-box',
                  }}
                >
                  {activeStep > index ? <CheckIcon /> : index + 1}
                </Box>
                <Typography 
                  variant="caption" 
                  align="center" 
                  sx={{ 
                    fontSize: '0.75rem',
                    color: activeStep >= index ? theme.palette.primary.main : theme.palette.text.secondary,
                    fontWeight: activeStep === index ? 600 : 'normal',
                    maxWidth: '100px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ 
                minWidth: '120px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              السابق
            </Button>
            
            <StyledButton
              variant="contained"
              color="primary"
              type="submit"
              startIcon={activeStep === steps.length - 1 ? <SaveIcon /> : null}
              sx={{ 
                minWidth: activeStep === steps.length - 1 ? '200px' : '120px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {activeStep === steps.length - 1 ? 'حفظ الوحدة' : 'التالي'}
            </StyledButton>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default CreateUnit;
