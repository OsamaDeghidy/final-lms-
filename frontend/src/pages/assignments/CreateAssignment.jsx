import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, Divider,
  LinearProgress, Chip, IconButton, Grid, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent,
  DialogActions, Stepper, Step, StepLabel, StepContent,
  Switch, FormControlLabel, Checkbox, Radio, RadioGroup,
  Accordion, AccordionSummary, AccordionDetails, Snackbar
} from '@mui/material';
import {
  Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon, Grade as GradeIcon, FileUpload as FileUploadIcon,
  Quiz as QuizIcon, Description as DescriptionIcon, CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon, School as SchoolIcon, Book as BookIcon,
  Warning as WarningIcon, Download as DownloadIcon, Upload as UploadIcon,
  Save as SaveIcon, Send as SendIcon, Cancel as CancelIcon,
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ExpandMore as ExpandMoreIcon, RadioButtonChecked as RadioButtonCheckedIcon,
  CheckBox as CheckBoxIcon, TextFields as TextFieldsIcon, Image as ImageIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import './Assignments.css';
import assignmentsAPI from '../../services/assignment.service';
import api, { courseAPI } from '../../services/api.service';
import contentAPI from '../../services/content.service';

// Styled Components
const QuestionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid #e0e0e0',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    course: '', // store course id
    module: '',
    due_date: '',
    duration: 60,
    points: 100,
    allow_late_submissions: false,
    late_submission_penalty: 0,
    has_questions: false,
    has_file_upload: false,
    assignment_file: null,
    max_attempts: 1,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getCourses();
        const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : data?.courses || []);
        const normalized = arr.map(c => ({ id: c.id, title: c.title }));
        setCourses(normalized);
      } catch (e) {
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  // Load modules when course changes
  useEffect(() => {
    const fetchModules = async () => {
      const courseId = assignmentData.course;
      if (!courseId) {
        setModules([]);
        return;
      }
      setLoadingModules(true);
      try {
        const data = await contentAPI.getModules(courseId);
        const items = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : data?.modules || [];
        const normalized = items.map((m) => ({ id: m.id, title: m.name || m.title || `وحدة ${m.id}` }));
        setModules(normalized);
      } catch (e) {
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, [assignmentData.course]);

  const steps = [
    {
      label: 'معلومات الواجب الأساسية',
      description: 'عنوان الواجب والوصف والمقرر'
    },
    {
      label: 'إعدادات الواجب',
      description: 'التواريخ والدرجات والإعدادات'
    },
    {
      label: 'مراجعة وإرسال',
      description: 'مراجعة الواجب وإنشاؤه'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAssignmentChange = (field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!assignmentData.title || !assignmentData.description || !assignmentData.course || !assignmentData.due_date) {
        setSnackbar({ 
          open: true, 
          message: 'يرجى ملء جميع الحقول المطلوبة (العنوان، الوصف، المقرر، تاريخ التسليم)', 
          severity: 'error' 
        });
        return;
      }

      // Debug: Check authentication
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('User data:', localStorage.getItem('user'));
      
      // Map to API payload (clean up undefined/null values)
      const payload = {
        title: assignmentData.title,
        description: assignmentData.description,
        course: assignmentData.course,
        module: assignmentData.module || null,
        due_date: assignmentData.due_date,
        points: assignmentData.points,
        allow_late_submissions: assignmentData.allow_late_submissions,
        late_submission_penalty: assignmentData.late_submission_penalty,
        has_questions: assignmentData.has_questions,
        has_file_upload: assignmentData.has_file_upload,
        assignment_file: assignmentData.assignment_file,
        is_active: assignmentData.is_active,
      };
      
      console.log('Sending payload:', payload);
      const created = await assignmentsAPI.createAssignment(payload);
      console.log('Assignment creation response:', created);
      
      // Get assignment ID from response
      const assignmentId = created?.id;
      console.log('Assignment created with ID:', assignmentId);
      
      if (!assignmentId) {
        console.error('Could not get assignment ID from response:', created);
        setSnackbar({ 
          open: true, 
          message: 'تم إنشاء الواجب بنجاح، لكن لم نتمكن من الحصول على معرف الواجب.', 
          severity: 'warning' 
        });
        navigate('/teacher/assignments');
        return;
      }
      
      // Show success message
      const fileMessage = assignmentData.assignment_file ? ' مع ملف مرفق' : '';
      
      setSnackbar({ 
        open: true, 
        message: `تم إنشاء الواجب "${assignmentData.title}" بنجاح${fileMessage}. يمكنك الآن إضافة الأسئلة من صفحة إدارة الواجبات.`, 
        severity: 'success' 
      });
      
      // Navigate to assignments list
      setTimeout(() => {
      navigate('/teacher/assignments');
      }, 2000);
    } catch (error) {
      console.error('Error creating assignment:', error);
      
      let errorMessage = 'تعذر إنشاء الواجب. تحقق من الحقول.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = `أخطاء في الحقول:\n${fieldErrors}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Add more specific error messages
      if (error?.response?.status === 404) {
        errorMessage = 'خطأ في الـ API endpoint. تأكد من أن الخادم يعمل.';
      } else if (error?.response?.status === 500) {
        errorMessage = 'خطأ في الخادم. حاول مرة أخرى لاحقاً.';
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="assignments-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CreateIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              إنشاء واجب جديد
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            إنشاء واجب جديد - يمكنك إضافة الأسئلة لاحقاً
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6" fontWeight={600}>
                  {step.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {index === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label="عنوان الواجب"
                        variant="outlined"
                        value={assignmentData.title}
                        onChange={(e) => handleAssignmentChange('title', e.target.value)}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        label="وصف الواجب"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={assignmentData.description}
                        onChange={(e) => handleAssignmentChange('description', e.target.value)}
                        required
                      />
                      
                      <FormControl fullWidth>
                        <InputLabel>المقرر</InputLabel>
                        <Select
                          value={assignmentData.course}
                          onChange={(e) => handleAssignmentChange('course', e.target.value)}
                          label="المقرر"
                        >
                          {courses.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                              {course.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {assignmentData.course && (
                        <FormControl fullWidth>
                          <InputLabel>الوحدة</InputLabel>
                          <Select
                            value={assignmentData.module}
                            onChange={(e) => handleAssignmentChange('module', e.target.value)}
                            label="الوحدة"
                          >
                            <MenuItem value="">—</MenuItem>
                            {modules.map((mod) => (
                              <MenuItem key={mod.id} value={mod.id} disabled={loadingModules}>
                                {mod.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  )}
                  
                  {index === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Grid container spacing={2}>
                        <Grid xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="تاريخ ووقت التسليم"
                            type="datetime-local"
                            variant="outlined"
                            value={assignmentData.due_date}
                            onChange={(e) => handleAssignmentChange('due_date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                          />
                        </Grid>
                        <Grid xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="المدة (بالدقائق)"
                            type="number"
                            variant="outlined"
                            value={assignmentData.duration}
                            onChange={(e) => handleAssignmentChange('duration', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                      </Grid>
                      
                      <Grid container spacing={2}>
                        <Grid xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="الدرجة الكلية"
                            type="number"
                            variant="outlined"
                            value={assignmentData.points}
                            onChange={(e) => handleAssignmentChange('points', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="الحد الأقصى للمحاولات"
                            type="number"
                            variant="outlined"
                            value={assignmentData.max_attempts}
                            onChange={(e) => handleAssignmentChange('max_attempts', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                      </Grid>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={assignmentData.allow_late_submissions}
                            onChange={(e) => handleAssignmentChange('allow_late_submissions', e.target.checked)}
                          />
                        }
                        label="السماح بالتسليم المتأخر"
                      />
                      
                      {assignmentData.allow_late_submissions && (
                        <TextField
                          fullWidth
                          label="خصم التسليم المتأخر (%)"
                          type="number"
                          variant="outlined"
                          value={assignmentData.late_submission_penalty}
                          onChange={(e) => handleAssignmentChange('late_submission_penalty', Number(e.target.value))}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      )}
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={assignmentData.has_questions}
                            onChange={(e) => handleAssignmentChange('has_questions', e.target.checked)}
                          />
                        }
                        label="يحتوي على أسئلة (يمكن إضافتها لاحقاً)"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={assignmentData.has_file_upload}
                            onChange={(e) => handleAssignmentChange('has_file_upload', e.target.checked)}
                          />
                        }
                        label="يسمح برفع ملفات"
                      />
                      
                      {assignmentData.has_file_upload && (
                        <Box sx={{ mt: 2 }}>
                          <input
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            id="assignment-file-upload"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleAssignmentChange('assignment_file', file);
                              }
                            }}
                          />
                          <label htmlFor="assignment-file-upload">
                                        <Button
                                          variant="outlined"
                              component="span"
                              startIcon={<FileUploadIcon />}
                              sx={{ mb: 2 }}
                            >
                              رفع ملف الواجب
                                        </Button>
                          </label>
                          {assignmentData.assignment_file && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <FileUploadIcon color="success" />
                              <Typography variant="body2" color="success.main">
                                تم اختيار: {assignmentData.assignment_file.name}
                              </Typography>
                                      </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        مراجعة الواجب
                      </Typography>
                      
                      <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          {assignmentData.title || 'عنوان الواجب'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                          {assignmentData.description || 'وصف الواجب'}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              المقرر: {assignmentData.course || 'غير محدد'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              الوحدة: {assignmentData.module || 'غير محدد'}
                            </Typography>
                          </Grid>
                          <Grid xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              تاريخ التسليم: {assignmentData.due_date ? new Date(assignmentData.due_date).toLocaleString('en-GB') : 'غير محدد'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              الدرجة: {assignmentData.points} نقطة
                            </Typography>
                          </Grid>
                        </Grid>
                      </Card>
                      
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>ملاحظة:</strong> بعد إنشاء الواجب، يمكنك إضافة الأسئلة من صفحة إدارة الواجبات.
                        </Typography>
                      </Alert>
                      
                      <Typography variant="body2" color="text.secondary">
                        تأكد من مراجعة جميع المعلومات قبل إنشاء الواجب.
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => (index === steps.length - 1 ? handleSubmit() : handleNext())}
                      sx={{ mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'إنشاء الواجب' : 'التالي'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      السابق
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Submit Button */}
      {activeStep === steps.length && (
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            جاهز لإنشاء الواجب؟
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            تأكد من مراجعة جميع المعلومات قبل إنشاء الواجب.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
              startIcon={<CancelIcon />}
            >
              العودة للتعديل
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <LinearProgress /> : <CreateIcon />}
              sx={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff5252 0%, #e64a19 100%)',
                }
              }}
            >
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الواجب'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateAssignment; 
