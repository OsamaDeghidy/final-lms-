import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, Divider,
  LinearProgress, Chip, IconButton, Grid, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent,
  DialogActions, Stepper, Step, StepLabel, StepContent, CircularProgress
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
import assignmentsAPI from '../../services/assignment.service';
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
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assignment data from API
  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await assignmentsAPI.getAssignmentById(assignmentId);
        console.log('Fetched assignment:', data);
        setAssignment(data);
        
        // Check if user has already submitted this assignment
        try {
          const submissions = await assignmentsAPI.getMySubmissions();
          const existingSubmission = submissions.find(sub => sub.assignment === parseInt(assignmentId));
          if (existingSubmission) {
            setError('لقد قمت بتقديم هذا الواجب مسبقاً. لا يمكن تقديمه مرة أخرى.');
          }
        } catch (submissionErr) {
          console.log('Could not check existing submissions:', submissionErr);
        }
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('تعذر تحميل بيانات الواجب. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const isOverdue = assignment ? new Date() > new Date(assignment.due_date) : false;
  const canSubmit = assignment ? assignment.is_active && (!isOverdue || assignment.allow_late_submissions) : false;

  const handleDownloadFile = async (fileName, fileUrl) => {
    try {
      if (!fileUrl) {
        console.error('No file URL provided');
        return;
      }

      // Ensure the URL is absolute
      let downloadUrl = fileUrl;
      if (!fileUrl.startsWith('http')) {
        downloadUrl = `http://localhost:8000${fileUrl}`;
      }

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'assignment_file';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Downloading file:', fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

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
    // Check if there's an error (e.g., already submitted)
    if (error) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare submission data
      const submissionPayload = {
        assignment: assignmentId,
        submission_text: submissionData.comments || '',
        submitted_file: submissionData.files.main || null
      };

      // Add question responses if assignment has questions
      if (assignment.has_questions && assignment.questions) {
        const questionResponses = [];
        
        assignment.questions.forEach(question => {
          const answer = submissionData.answers[question.id];
          const file = submissionData.files[question.id];
          
          console.log(`Processing question ${question.id} (${question.question_type}): answer=${answer}, file=${file}`);  // Debug log
          
          if (answer || file) {
            // Determine the correct field based on question type
            let text_answer = null;
            let selected_answer = null;
            
            if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
              selected_answer = answer;
              console.log(`Setting selected_answer for ${question.question_type}: ${selected_answer}`);  // Debug log
            } else if (question.question_type === 'short_answer' || question.question_type === 'essay') {
              text_answer = answer;
              console.log(`Setting text_answer for ${question.question_type}: ${text_answer}`);  // Debug log
            }
            
            const response = {
              question: question.id,
              text_answer: text_answer,
              selected_answer: selected_answer,
              file_answer: file || null
            };
            
            console.log(`Question ${question.id} (${question.question_type}):`, response);
            questionResponses.push(response);
          }
        });

        // Add question responses to payload
        if (questionResponses.length > 0) {
        submissionPayload.question_responses = questionResponses;
        }
      }

      console.log('Submitting assignment with payload:', submissionPayload);
      
      // Submit assignment
      const response = await assignmentsAPI.createSubmission(submissionPayload);
      console.log('Submission response:', response);
      
      // Navigate to success page or show success message
      navigate('/student/assignments');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        // Validation error from backend
        const errorData = error.response.data;
        if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
          setError(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('بيانات غير صحيحة. يرجى التحقق من المدخلات.');
        }
      } else if (error.response?.status === 500) {
        setError('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      } else {
        setError('حدث خطأ أثناء إرسال الواجب. يرجى المحاولة مرة أخرى.');
      }
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

  // Show loading state
  if (loading) {
    return (
      <Box className="assignments-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box className="assignments-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/student/assignments')} variant="contained">
          العودة للواجبات
        </Button>
      </Box>
    );
  }

  // Show message if no assignment found
  if (!assignment) {
    return (
      <Box className="assignments-container">
        <Alert severity="warning" sx={{ mb: 2 }}>
          لم يتم العثور على الواجب المطلوب
        </Alert>
        <Button onClick={() => navigate('/student/assignments')} variant="contained">
          العودة للواجبات
        </Button>
      </Box>
    );
  }

  return (
    <Box className="assignments-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #0e5181 0%, #1976d2 100%)',
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
              <SchoolIcon sx={{ color: '#0e5181' }} />
              <Typography variant="h6" fontWeight={600}>
                {assignment.course_title || assignment.course?.title}
              </Typography>
            </Box>
            {(assignment.module_name || assignment.module?.name) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <BookIcon sx={{ color: '#666' }} />
                <Typography variant="body1" color="text.secondary">
                  {assignment.module_name || assignment.module?.name}
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
                تاريخ التسليم: {new Date(assignment.due_date).toLocaleString('en-GB')}
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
                عدد الأسئلة: {assignment.questions_count || 0}
              </Typography>
            </Box>
            {assignment.assignment_file && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadFile('assignment_file', assignment.assignment_file)}
                sx={{ mt: 1, color: '#1976d2', borderColor: '#1976d2' }}
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
            تاريخ التسليم كان: {new Date(assignment.due_date).toLocaleString('en-GB')}
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
                      {assignment.questions && assignment.questions.length > 0 ? (
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
                      ) : (
                        <Alert severity="info">
                          <Typography variant="body1">
                            لا توجد أسئلة لهذا الواجب. يمكنك رفع ملف أو كتابة نص في الخطوة التالية.
                          </Typography>
                        </Alert>
                      )}
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
                      
                      {assignment.has_file_upload && (
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
                              onChange={(e) => handleFileUpload('main', e.target.files[0])}
                              accept=".pdf,.doc,.docx,.txt"
                            />
                          </Button>
                          {submissionData.files.main && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                              تم اختيار: {submissionData.files.main.name}
                            </Typography>
                          )}
                        </Box>
                      )}
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
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
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
              disabled={isSubmitting || !canSubmit || error}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{
                background: 'linear-gradient(135deg, #0e5181 0%, #1976d2 100%)',
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
    </Box>
  );
};

export default SubmitAssignment; 
