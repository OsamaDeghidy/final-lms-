import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, Divider,
  LinearProgress, Chip, IconButton, Grid, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent,
  DialogActions, Stepper, Step, StepLabel, StepContent,
  Switch, FormControlLabel, Checkbox, Radio, RadioGroup,
  Accordion, AccordionSummary, AccordionDetails
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
    questions: [],
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

  // removed mock courses; real courses are loaded via API into `courses` state

  const questionTypes = [
    { value: 'multiple_choice', label: 'اختيار من متعدد', icon: <RadioButtonCheckedIcon /> },
    { value: 'true_false', label: 'صح أو خطأ', icon: <CheckBoxIcon /> },
    { value: 'short_answer', label: 'إجابة قصيرة', icon: <TextFieldsIcon /> },
    { value: 'essay', label: 'مقال', icon: <DescriptionIcon /> },
    { value: 'file_upload', label: 'رفع ملف', icon: <FileUploadIcon /> }
  ];

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
      label: 'إضافة الأسئلة',
      description: 'إنشاء أسئلة الواجب'
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

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `tmp-${Date.now()}`,
      text: '',
      question_type: 'essay',
      points: 10,
      explanation: '',
      is_required: true,
      order: assignmentData.questions.length + 1,
      answers: []
    };
    setAssignmentData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const handleQuestionChange = (questionId, field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleDeleteQuestion = (questionId) => {
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleAddAnswer = (questionId) => {
    const newAnswer = {
      id: Date.now(),
      text: '',
      is_correct: false,
      explanation: '',
      order: assignmentData.questions.find(q => q.id === questionId)?.answers?.length || 0
    };
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, answers: [...(q.answers || []), newAnswer] }
          : q
      )
    }));
  };

  const handleAnswerChange = (questionId, answerId, field, value) => {
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? {
              ...q,
              answers: q.answers?.map(a => 
                a.id === answerId ? { ...a, [field]: value } : a
              ) || []
            }
          : q
      )
    }));
  };

  const handleDeleteAnswer = (questionId, answerId) => {
    setAssignmentData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? {
              ...q,
              answers: q.answers?.filter(a => a.id !== answerId) || []
            }
          : q
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Map to API payload (supports file upload & extended fields)
      const payload = {
        title: assignmentData.title,
        description: assignmentData.description,
        course: assignmentData.course || null,
        module: assignmentData.module || undefined,
        due_date: assignmentData.due_date,
        points: assignmentData.points,
        allow_late_submissions: assignmentData.allow_late_submissions,
        late_submission_penalty: assignmentData.late_submission_penalty,
        has_questions: assignmentData.has_questions,
        has_file_upload: assignmentData.has_file_upload,
        assignment_file: assignmentData.assignment_file,
        is_active: assignmentData.is_active,
      };
      const created = await assignmentsAPI.createAssignment(payload);
      const assignmentId = created?.id;
      // Persist questions and answers if any
      if (assignmentId && assignmentData.has_questions && assignmentData.questions.length) {
        for (const q of assignmentData.questions) {
          const qRes = await assignmentsAPI.createQuestion({
            assignment: assignmentId,
            text: q.text,
            question_type: q.question_type,
            points: q.points,
            explanation: q.explanation,
            order: q.order,
            is_required: q.is_required,
          });
          const questionId = qRes?.id;
          if (questionId && q.answers?.length) {
            for (const a of q.answers) {
              await assignmentsAPI.createAnswer({
                question: questionId,
                text: a.text,
                is_correct: !!a.is_correct,
                explanation: a.explanation || '',
                order: a.order || 0,
              });
            }
          }
        }
      }
      setSnackbar({ open: true, message: 'تم إنشاء الواجب بنجاح', severity: 'success' });
      navigate('/teacher/assignments');
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.response?.data?.error || 'تعذر إنشاء الواجب. تحقق من الحقول.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionIcon = (questionType) => {
    const type = questionTypes.find(t => t.value === questionType);
    return type ? type.icon : <QuizIcon />;
  };

  const totalPoints = assignmentData.questions.reduce((sum, q) => sum + q.points, 0);

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
            إنشاء واجب جديد مع الأسئلة والإعدادات
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
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
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
                        label="يحتوي على أسئلة"
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
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                          أسئلة الواجب
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddQuestion}
                          sx={{
                            background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5e35b1 0%, #8e24aa 100%)',
                            }
                          }}
                        >
                          إضافة سؤال
                        </Button>
                      </Box>
                      
                      {assignmentData.questions.length === 0 ? (
                        <Alert severity="info">
                          لا توجد أسئلة بعد. اضغط على "إضافة سؤال" لبدء إنشاء الأسئلة.
                        </Alert>
                      ) : (
                        <List>
                          {assignmentData.questions.map((question, index) => (
                            <ListItem key={question.id} sx={{ mb: 2, p: 0 }}>
                              <QuestionCard sx={{ width: '100%', p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getQuestionIcon(question.question_type)}
                                    <Typography variant="h6" fontWeight={600}>
                                      السؤال {index + 1}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    sx={{ color: '#d32f2f' }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                                
                                <TextField
                                  fullWidth
                                  label="نص السؤال"
                                  variant="outlined"
                                  multiline
                                  rows={2}
                                  value={question.text}
                                  onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                                  sx={{ mb: 2 }}
                                />
                                
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                  <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                      <InputLabel>نوع السؤال</InputLabel>
                                      <Select
                                        value={question.question_type}
                                        onChange={(e) => handleQuestionChange(question.id, 'question_type', e.target.value)}
                                        label="نوع السؤال"
                                      >
                                        {questionTypes.map((type) => (
                                          <MenuItem key={type.value} value={type.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              {type.icon}
                                              {type.label}
                                            </Box>
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <TextField
                                      fullWidth
                                      label="الدرجة"
                                      type="number"
                                      variant="outlined"
                                      value={question.points}
                                      onChange={(e) => handleQuestionChange(question.id, 'points', Number(e.target.value))}
                                      inputProps={{ min: 1 }}
                                    />
                                  </Grid>
                                </Grid>
                                
                                <TextField
                                  fullWidth
                                  label="شرح السؤال (اختياري)"
                                  variant="outlined"
                                  multiline
                                  rows={2}
                                  value={question.explanation}
                                  onChange={(e) => handleQuestionChange(question.id, 'explanation', e.target.value)}
                                  sx={{ mb: 2 }}
                                />
                                
                                {/* Answers for multiple choice questions */}
                                {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
                                  <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        الإجابات
                                      </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {question.answers?.map((answer, aIndex) => (
                                          <Box key={answer.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <TextField
                                              fullWidth
                                              label={`الإجابة ${aIndex + 1}`}
                                              variant="outlined"
                                              size="small"
                                              value={answer.text}
                                              onChange={(e) => handleAnswerChange(question.id, answer.id, 'text', e.target.value)}
                                            />
                                            <FormControlLabel
                                              control={
                                                <Radio
                                                  checked={answer.is_correct}
                                                  onChange={(e) => handleAnswerChange(question.id, answer.id, 'is_correct', e.target.checked)}
                                                />
                                              }
                                              label="صحيحة"
                                            />
                                            <IconButton
                                              size="small"
                                              onClick={() => handleDeleteAnswer(question.id, answer.id)}
                                              sx={{ color: '#d32f2f' }}
                                            >
                                              <DeleteIcon />
                                            </IconButton>
                                          </Box>
                                        ))}
                                        <Button
                                          variant="outlined"
                                          startIcon={<AddIcon />}
                                          onClick={() => handleAddAnswer(question.id)}
                                          size="small"
                                        >
                                          إضافة إجابة
                                        </Button>
                                      </Box>
                                    </AccordionDetails>
                                  </Accordion>
                                )}
                                
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={question.is_required}
                                      onChange={(e) => handleQuestionChange(question.id, 'is_required', e.target.checked)}
                                    />
                                  }
                                  label="سؤال إجباري"
                                />
                              </QuestionCard>
                            </ListItem>
                          ))}
                        </List>
                      )}
                      
                      {assignmentData.questions.length > 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          إجمالي الدرجات: {totalPoints} نقطة
                        </Alert>
                      )}
                    </Box>
                  )}
                  
                  {index === 3 && (
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
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              المقرر: {assignmentData.course || 'غير محدد'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              الوحدة: {assignmentData.module || 'غير محدد'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              تاريخ التسليم: {assignmentData.due_date ? new Date(assignmentData.due_date).toLocaleString('ar-SA') : 'غير محدد'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              الدرجة: {assignmentData.points} نقطة
                            </Typography>
                          </Grid>
                        </Grid>
                      </Card>
                      
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
    </Box>
  );
};

export default CreateAssignment; 
