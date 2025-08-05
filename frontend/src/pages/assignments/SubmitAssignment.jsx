import React, { useState } from 'react';
import {
  Box, Typography, Card, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, Divider,
  LinearProgress, Chip, IconButton, Grid, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent,
  DialogActions, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import {
  Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon, Grade as GradeIcon, FileUpload as FileUploadIcon,
  Quiz as QuizIcon, Description as DescriptionIcon, CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon, School as SchoolIcon, Book as BookIcon,
  Warning as WarningIcon, Download as DownloadIcon, Upload as UploadIcon,
  Save as SaveIcon, Send as SendIcon, Cancel as CancelIcon,
  RadioButtonChecked as RadioButtonCheckedIcon, CheckBox as CheckBoxIcon,
  TextFields as TextFieldsIcon, Image as ImageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import './Assignments.css';

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

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submissionData, setSubmissionData] = useState({
    answers: {},
    files: {},
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample assignment data based on Django model
  const assignment = {
    id: assignmentId,
    title: 'واجب الرياضيات - الجبر الخطي',
    description: 'حل مسائل من 1 إلى 10 في الكتاب مع شرح الخطوات بالتفصيل.',
    course: 'الرياضيات 101',
    module: 'الجبر الخطي',
    due_date: '2024-01-25T23:59:00',
    points: 100,
    allow_late_submissions: true,
    late_submission_penalty: 10,
    has_questions: true,
    has_file_upload: true,
    assignment_file: 'math_assignment.pdf',
    is_active: true,
    created_at: '2024-01-15T10:00:00',
    questions: [
      {
        id: 1,
        text: 'ما هو حل المعادلة: 2x + 5 = 13؟',
        question_type: 'short_answer',
        points: 20,
        explanation: 'يجب إيجاد قيمة x',
        is_required: true,
        order: 1
      },
      {
        id: 2,
        text: 'أي من المعادلات التالية تمثل خط مستقيم؟',
        question_type: 'multiple_choice',
        points: 15,
        explanation: 'اختر الإجابة الصحيحة',
        is_required: true,
        order: 2,
        answers: [
          { id: 1, text: 'y = 2x + 3', is_correct: true },
          { id: 2, text: 'y = x² + 1', is_correct: false },
          { id: 3, text: 'y = 1/x', is_correct: false },
          { id: 4, text: 'y = √x', is_correct: false }
        ]
      },
      {
        id: 3,
        text: 'هل المعادلة y = 3x + 2 تمثل خط مستقيم؟',
        question_type: 'true_false',
        points: 10,
        explanation: 'صح أم خطأ',
        is_required: true,
        order: 3
      },
      {
        id: 4,
        text: 'اشرح خطوات حل المعادلة التربيعية: x² - 4x + 3 = 0',
        question_type: 'essay',
        points: 30,
        explanation: 'اشرح بالتفصيل',
        is_required: true,
        order: 4
      },
      {
        id: 5,
        text: 'ارفع ملف يحتوي على حلولك للمسائل من 6 إلى 10',
        question_type: 'file_upload',
        points: 25,
        explanation: 'يجب أن يكون الملف بصيغة PDF أو Word',
        is_required: true,
        order: 5
      }
    ],
    total_points: 100,
    questions_count: 5
  };

  const isOverdue = new Date() > new Date(assignment.due_date);
  const canSubmit = assignment.is_active && (!isOverdue || assignment.allow_late_submissions);

  const steps = [
    {
      label: 'مراجعة الواجب',
      description: 'قراءة تعليمات الواجب والمتطلبات'
    },
    {
      label: 'الإجابة على الأسئلة',
      description: 'حل جميع الأسئلة المطلوبة'
    },
    {
      label: 'رفع الملفات',
      description: 'رفع الملفات المطلوبة إن وجدت'
    },
    {
      label: 'مراجعة وإرسال',
      description: 'مراجعة الإجابات وإرسال الواجب'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAnswerChange = (questionId, value) => {
    setSubmissionData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const handleFileUpload = (questionId, file) => {
    setSubmissionData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [questionId]: file
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Submitting assignment:', submissionData);
      // Navigate to success page or show success message
      navigate('/student/assignments');
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionIcon = (questionType) => {
    switch (questionType) {
      case 'multiple_choice':
        return <RadioButtonCheckedIcon />;
      case 'true_false':
        return <CheckBoxIcon />;
      case 'short_answer':
      case 'essay':
        return <TextFieldsIcon />;
      case 'file_upload':
        return <FileUploadIcon />;
      default:
        return <QuizIcon />;
    }
  };

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <FormControl fullWidth>
            <InputLabel>اختر الإجابة الصحيحة</InputLabel>
            <Select
              value={submissionData.answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              label="اختر الإجابة الصحيحة"
            >
              {question.answers?.map((answer) => (
                <MenuItem key={answer.id} value={answer.id}>
                  {answer.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'true_false':
        return (
          <FormControl fullWidth>
            <InputLabel>اختر الإجابة</InputLabel>
            <Select
              value={submissionData.answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              label="اختر الإجابة"
            >
              <MenuItem value="true">صح</MenuItem>
              <MenuItem value="false">خطأ</MenuItem>
            </Select>
          </FormControl>
        );

      case 'short_answer':
        return (
          <TextField
            fullWidth
            label="أدخل إجابتك"
            variant="outlined"
            multiline
            rows={2}
            value={submissionData.answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      case 'essay':
        return (
          <TextField
            fullWidth
            label="اكتب إجابتك بالتفصيل"
            variant="outlined"
            multiline
            rows={6}
            value={submissionData.answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      case 'file_upload':
        return (
          <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed #e0e0e0', borderRadius: 2 }}>
            <UploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              اسحب الملف هنا أو اضغط للاختيار
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUploadIcon />}
              sx={{ mt: 2 }}
            >
              اختيار ملف
              <input
                type="file"
                hidden
                onChange={(e) => handleFileUpload(question.id, e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
              />
            </Button>
            {submissionData.files[question.id] && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                تم اختيار: {submissionData.files[question.id].name}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="assignments-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
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
            <AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              تسليم الواجب
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            {assignment.title}
          </Typography>
        </Box>
      </Box>

      {/* Assignment Info Card */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <SchoolIcon sx={{ color: '#673ab7' }} />
              <Typography variant="h6" fontWeight={600}>
                {assignment.course}
              </Typography>
            </Box>
            {assignment.module && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <BookIcon sx={{ color: '#666' }} />
                <Typography variant="body1" color="text.secondary">
                  {assignment.module}
                </Typography>
              </Box>
            )}
            <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6, mb: 2 }}>
              {assignment.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CalendarTodayIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                تاريخ التسليم: {new Date(assignment.due_date).toLocaleString('ar-SA')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <GradeIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                الدرجة: {assignment.points} نقطة
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <QuizIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                عدد الأسئلة: {assignment.questions_count}
              </Typography>
            </Box>
            {assignment.assignment_file && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => console.log('Download file:', assignment.assignment_file)}
                sx={{ mt: 1 }}
              >
                تحميل ملف الواجب
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Warning for overdue assignments */}
      {isOverdue && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>
            انتبه! هذا الواجب متأخر
          </Typography>
          <Typography variant="body2">
            تاريخ التسليم كان: {new Date(assignment.due_date).toLocaleString('ar-SA')}
            {assignment.allow_late_submissions && ` - سيتم خصم ${assignment.late_submission_penalty}% من الدرجة`}
          </Typography>
        </Alert>
      )}

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
                    <Box>
                      <Typography variant="body1" paragraph>
                        تأكد من قراءة جميع التعليمات بعناية قبل البدء في الإجابة.
                      </Typography>
                      <Typography variant="body1" paragraph>
                        يمكنك العودة وتعديل إجاباتك في أي وقت قبل الإرسال النهائي.
                      </Typography>
                    </Box>
                  )}
                  
                  {index === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        الأسئلة المطلوبة
                      </Typography>
                      <List>
                        {assignment.questions.map((question, qIndex) => (
                          <ListItem key={question.id} sx={{ mb: 2, p: 0 }}>
                            <QuestionCard sx={{ width: '100%', p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                {getQuestionIcon(question.question_type)}
                                <Typography variant="h6" fontWeight={600}>
                                  السؤال {qIndex + 1}
                                </Typography>
                                <Chip 
                                  label={`${question.points} نقطة`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                                {question.is_required && (
                                  <Chip 
                                    label="إجباري" 
                                    size="small" 
                                    color="error" 
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              
                              <Typography variant="body1" paragraph>
                                {question.text}
                              </Typography>
                              
                              {question.explanation && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                  <Typography variant="body2">
                                    {question.explanation}
                                  </Typography>
                                </Alert>
                              )}
                              
                              {renderQuestion(question)}
                            </QuestionCard>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        رفع الملفات المطلوبة
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        تأكد من رفع جميع الملفات المطلوبة بالصيغ المقبولة.
                      </Typography>
                    </Box>
                  )}
                  
                  {index === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        مراجعة الإجابات
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        راجع إجاباتك قبل الإرسال النهائي.
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="ملاحظات إضافية (اختياري)"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={submissionData.comments}
                        onChange={(e) => setSubmissionData(prev => ({ ...prev, comments: e.target.value }))}
                        sx={{ mt: 2 }}
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'إنهاء' : 'التالي'}
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
            جاهز لإرسال الواجب؟
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            تأكد من مراجعة جميع إجاباتك قبل الإرسال النهائي.
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
              disabled={isSubmitting || !canSubmit}
              startIcon={isSubmitting ? <LinearProgress /> : <SendIcon />}
              sx={{
                background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5e35b1 0%, #8e24aa 100%)',
                }
              }}
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الواجب'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Success Dialog */}
      <Dialog
        open={false} // Will be controlled by state
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 0, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: 'success.main', 
          color: 'white', 
          py: 3, 
          px: 4 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              تم إرسال الواجب بنجاح
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            تم إرسال واجبك بنجاح. يمكنك متابعة حالة التصحيح من صفحة الواجبات.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => navigate('/student/assignments')}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 4, 
              py: 1.5, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #5e35b1 0%, #8e24aa 100%)' 
              } 
            }}
          >
            العودة للواجبات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmitAssignment; 