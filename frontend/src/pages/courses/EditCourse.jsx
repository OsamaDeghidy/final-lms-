import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Checkbox, 
  FormControlLabel,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Reuse the same styled components from CreateCourse
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

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];

const LANGUAGE_OPTIONS = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

const steps = ['المعلومات الأساسية', 'الوسائط والمحتوى', 'الأسعار والخصومات', 'المراجعة والنشر'];

const EditCourse = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams(); // Get course ID from URL
  const [activeStep, setActiveStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state - initialize with empty values
  const [courseData, setCourseData] = useState({
    id: id,
    title: '',
    subtitle: '',
    description: '',
    shortDescription: '',
    level: 'beginner',
    language: 'ar',
    category: '',
    tags: [],
    isFree: false,
    price: 0,
    discountPrice: null,
    status: 'draft',
    isFeatured: false,
    isCertified: false,
    image: null,
    promotionalVideo: '',
    syllabusPdf: null,
    materialsPdf: null,
  });
  
  const [newTag, setNewTag] = useState('');
  
  // Fetch course data when component mounts
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // TODO: Replace with your actual API call
        // const response = await fetch(`/api/courses/${id}`);
        // const data = await response.json();
        // setCourseData(data);
        
        // Simulate API call with timeout
        setTimeout(() => {
          setCourseData(prev => ({
            ...prev,
            title: 'دورة تطوير الويب المتكاملة',
            subtitle: 'تعلم تطوير الويب من الصفر إلى الاحتراف',
            description: 'هذه دورة شاملة لتعلم تطوير الويب تشمل HTML, CSS, JavaScript وغيرها من التقنيات الحديثة',
            level: 'beginner',
            language: 'ar',
            price: 199,
            isFree: false,
            tags: ['ويب', 'برمجة', 'تطوير'],
            status: 'published',
            promotionalVideo: 'https://www.youtube.com/watch?v=example'
          }));
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    } else {
      setIsLoading(false);
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep === steps.length - 1) {
      try {
        // In a real app, you would submit the form data to update the course
        // const response = await fetch(`/api/courses/${id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(courseData)
        // });
        
        // Show success message
        alert('تم تحديث الدورة بنجاح!');
        // Optionally navigate back to courses list or course details
        // navigate('/teacher/my-courses');
      } catch (error) {
        console.error('Error updating course:', error);
        alert('حدث خطأ أثناء تحديث الدورة. يرجى المحاولة مرة أخرى.');
      }
    } else {
      handleNext();
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e, field) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };
  
  // Render step content (same as CreateCourse)
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              المعلومات الأساسية
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <StyledTextField
                fullWidth
                label="عنوان الدورة"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                variant="outlined"
                required
                size="medium"
                sx={{ mb: 2 }}
              />
              
              <StyledTextField
                fullWidth
                label="وصف قصير"
                name="subtitle"
                value={courseData.subtitle}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <StyledTextField
                fullWidth
                label="الوصف الكامل"
                name="description"
                value={courseData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={6}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>مستوى الصعوبة</InputLabel>
                  <Select
                    name="level"
                    value={courseData.level}
                    onChange={handleChange}
                    label="مستوى الصعوبة"
                    sx={{ textAlign: 'right' }}
                  >
                    {LEVEL_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>اللغة</InputLabel>
                  <Select
                    name="language"
                    value={courseData.language}
                    onChange={handleChange}
                    label="اللغة"
                    sx={{ textAlign: 'right' }}
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>الكلمات المفتاحية</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexDirection: 'row-reverse' }}>
                  <StyledTextField
                    fullWidth
                    placeholder="أضف كلمة مفتاحية"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleAddTag}
                    startIcon={<AddIcon />}
                    sx={{ minWidth: '120px' }}
                  >
                    إضافة
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {courseData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{ 
                        backgroundColor: theme.palette.primary.light, 
                        color: theme.palette.primary.contrastText,
                        '& .MuiChip-deleteIcon': {
                          color: theme.palette.primary.contrastText,
                          '&:hover': {
                            color: theme.palette.primary.light
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        );
      
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              الوسائط والمحتوى
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>صورة الغلاف</Typography>
                <UploadArea 
                  isDragActive={isDragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'image')}
                  onClick={() => document.getElementById('image-upload').click()}
                  sx={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'image')}
                  />
                  {courseData.image ? (
                    <Box textAlign="center" width="100%">
                      <img 
                        src={URL.createObjectURL(courseData.image)} 
                        alt="Course preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          border: '1px solid #e0e0e0'
                        }} 
                      />
                      <Typography variant="body2" color="textSecondary">
                        انقر لتغيير الصورة أو اسحب صورة جديدة
                      </Typography>
                    </Box>
                  ) : (
                    <Box textAlign="center" p={3}>
                      <ImageIcon color="action" fontSize="large" sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body1" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>
                        اسحب صورة الدورة هنا أو انقر للاختيار
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        يوصى بصورة بدقة 1280x720 بكسل
                      </Typography>
                    </Box>
                  )}
                </UploadArea>
              </Box>
              
              <StyledTextField
                fullWidth
                label="رابط الفيديو التعريفي (اختياري)"
                name="promotionalVideo"
                value={courseData.promotionalVideo}
                onChange={handleChange}
                variant="outlined"
                placeholder="https://www.youtube.com/watch?v=..."
                InputProps={{
                  startAdornment: <VideoLibraryIcon color="action" sx={{ ml: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>الملفات المرفقة</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <input
                      id="syllabus-upload"
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, 'syllabusPdf')}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PdfIcon />}
                      onClick={() => document.getElementById('syllabus-upload').click()}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      {courseData.syllabusPdf ? courseData.syllabusPdf.name : 'رفع منهج الدورة (PDF)'}
                    </Button>
                  </Box>
                  
                  <Box>
                    <input
                      id="materials-upload"
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e, 'materialsPdf')}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PdfIcon />}
                      onClick={() => document.getElementById('materials-upload').click()}
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      {courseData.materialsPdf ? courseData.materialsPdf.name : 'رفع المواد التعليمية (PDF)'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        );
        
      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              الأسعار والخصومات
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={courseData.isFree}
                    onChange={handleChange}
                    name="isFree"
                    color="primary"
                  />
                }
                label="هذه الدورة مجانية"
                sx={{ mb: 2 }}
              />
              
              {!courseData.isFree && (
                <>
                  <StyledTextField
                    fullWidth
                    label="سعر الدورة (بالدولار)"
                    name="price"
                    type="number"
                    value={courseData.price}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: '$‎',
                    }}
                  />
                  
                  <StyledTextField
                    fullWidth
                    label="سعر مخفض (اختياري)"
                    name="discountPrice"
                    type="number"
                    value={courseData.discountPrice || ''}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: '$‎',
                    }}
                    helperText="سيتم عرض السعر الأصلي مشطوبًا بجانب السعر المخفض"
                  />
                </>
              )}
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={courseData.isCertified}
                    onChange={handleChange}
                    name="isCertified"
                    color="primary"
                  />
                }
                label="منح شهادة إكمال للدورة"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={courseData.isFeatured}
                    onChange={handleChange}
                    name="isFeatured"
                    color="primary"
                  />
                }
                label="إظهار الدورة في الصفحة الرئيسية"
                sx={{ mb: 2 }}
              />
            </Box>
          </>
        );
        
      case 3:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
              مراجعة المعلومات
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                معلومات الدورة
              </Typography>
              <Box sx={{ backgroundColor: theme.palette.background.paper, p: 3, borderRadius: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="textSecondary">العنوان:</Typography>
                    <Typography variant="body1" fontWeight={500}>{courseData.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="textSecondary">الوصف القصير:</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ maxWidth: '60%', textAlign: 'left' }}>{courseData.subtitle}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="textSecondary">المستوى:</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {LEVEL_OPTIONS.find(level => level.value === courseData.level)?.label}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">السعر:</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {courseData.isFree 
                        ? 'مجاناً' 
                        : courseData.discountPrice 
                          ? `$${courseData.discountPrice} (بعد الخصم من $${courseData.price})` 
                          : `$${courseData.price}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setActiveStep(0)}
                  startIcon={<EditIcon />}
                >
                  تعديل المعلومات
                </Button>
              </Box>
            </Box>
          </>
        );
      
      default:
        return 'خطأ في تحميل الخطوة';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="رجوع">
          <IconButton onClick={() => navigate(-1)} sx={{ ml: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          تعديل الدورة
        </Typography>
      </Box>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <StyledPaper>
            {/* Stepper */}
            <Box sx={{ width: '100%', mb: 4, position: 'relative' }}>
              {/* Continuous line */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: '40px',
                  left: '20px',
                  right: '20px',
                  height: '2px',
                  backgroundColor: theme.palette.grey[300],
                  zIndex: 0,
                }}
              >
                {/* Active progress line */}
                <Box 
                  sx={{
                    height: '100%',
                    width: `${(activeStep / (steps.length - 1)) * 100}%`,
                    backgroundColor: theme.palette.primary.main,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {steps.map((label, index) => (
                  <Box 
                    key={label}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      flex: 1,
                      position: 'relative',
                      zIndex: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveStep(index)}
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
                        mb: 1,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        border: `2px solid ${activeStep >= index ? theme.palette.primary.main : theme.palette.grey[300]}`,
                        backgroundColor: '#fff',
                        color: activeStep >= index ? theme.palette.primary.main : theme.palette.text.secondary,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography 
                      variant="caption" 
                      align="center" 
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: activeStep >= index ? 600 : 400,
                        color: activeStep >= index ? theme.palette.primary.main : theme.palette.text.secondary,
                        mt: 0.5,
                        textAlign: 'center',
                        px: 1,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Step Content */}
            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>
            
            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
                startIcon={<ArrowBackIcon />}
              >
                السابق
              </Button>
              
              <Box sx={{ flex: '1 1 auto' }} />
              
              <Button
                variant="contained"
                color="primary"
                type="submit"
                endIcon={<SaveIcon />}
                sx={{ minWidth: '150px' }}
              >
                {activeStep === steps.length - 1 ? 'حفظ التغييرات' : 'التالي'}
              </Button>
            </Box>
          </StyledPaper>
        </form>
      )}
    </Container>
  );
};

export default EditCourse;
