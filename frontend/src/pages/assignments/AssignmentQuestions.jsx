import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Paper, Alert, Grid, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem,
  ListItemText, ListItemIcon, Chip, Divider, Snackbar, Accordion,
  AccordionSummary, AccordionDetails, Switch, FormControlLabel,
  Checkbox, Radio, RadioGroup
} from '@mui/material';
import {
  Quiz as QuizIcon, Add as AddIcon, Delete as DeleteIcon,
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon, RadioButtonChecked as RadioButtonCheckedIcon,
  CheckBox as CheckBoxIcon, TextFields as TextFieldsIcon,
  Description as DescriptionIcon, FileUpload as FileUploadIcon,
  Assignment as AssignmentIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import assignmentsAPI from '../../services/assignment.service';

const AssignmentQuestions = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Dialog states
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    question_type: 'essay',
    points: 10,
    explanation: '',
    order: 1,
    is_required: true,
    answers: []
  });

  const questionTypes = [
    { value: 'multiple_choice', label: 'اختيار من متعدد', icon: <RadioButtonCheckedIcon /> },
    { value: 'true_false', label: 'صح أو خطأ', icon: <CheckBoxIcon /> },
    { value: 'short_answer', label: 'إجابة قصيرة', icon: <TextFieldsIcon /> },
    { value: 'essay', label: 'مقال', icon: <DescriptionIcon /> },
    { value: 'file_upload', label: 'رفع ملف', icon: <FileUploadIcon /> }
  ];

  useEffect(() => {
    fetchAssignmentAndQuestions();
  }, [assignmentId]);

  const fetchAssignmentAndQuestions = async () => {
    setLoading(true);
    try {
      // Fetch assignment details
      const assignmentData = await assignmentsAPI.getAssignmentById(assignmentId);
      setAssignment(assignmentData);

      // Fetch questions with answers
      const questionsData = await assignmentsAPI.getAssignmentQuestions(assignmentId);
      const questionsList = Array.isArray(questionsData?.results) ? questionsData.results : (Array.isArray(questionsData) ? questionsData : []);
      
      // Fetch answers for each question
      const questionsWithAnswers = await Promise.all(
        questionsList.map(async (question) => {
          try {
            const answersData = await assignmentsAPI.getQuestionAnswers(question.id);
            const answers = Array.isArray(answersData?.results) ? answersData.results : (Array.isArray(answersData) ? answersData : []);
            return { ...question, answers };
          } catch (error) {
            console.error(`Error fetching answers for question ${question.id}:`, error);
            return { ...question, answers: [] };
          }
        })
      );
      
      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error('Error fetching assignment and questions:', error);
      setSnackbar({
        open: true,
        message: 'تعذر تحميل بيانات الواجب والأسئلة',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      text: '',
      question_type: 'essay',
      points: 10,
      explanation: '',
      order: questions.length + 1,
      is_required: true,
      answers: []
    });
    setOpenQuestionDialog(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text || '',
      question_type: question.question_type || 'essay',
      points: question.points || 10,
      explanation: question.explanation || '',
      order: question.order || 1,
      is_required: question.is_required !== false,
      answers: question.answers || []
    });
    setOpenQuestionDialog(true);
  };

  const handleSaveQuestion = async () => {
    try {
      if (!questionForm.text.trim()) {
        setSnackbar({
          open: true,
          message: 'يجب إدخال نص السؤال',
          severity: 'error'
        });
        return;
      }

      if (editingQuestion) {
        // Update existing question
        await assignmentsAPI.updateQuestion(editingQuestion.id, {
          text: questionForm.text,
          question_type: questionForm.question_type,
          points: questionForm.points,
          explanation: questionForm.explanation,
          order: questionForm.order,
          is_required: questionForm.is_required
        });

        // Update answers if needed
        for (const answer of questionForm.answers) {
          if (answer.id) {
            await assignmentsAPI.updateAnswer(answer.id, {
              text: answer.text,
              is_correct: answer.is_correct,
              explanation: answer.explanation || '',
              order: answer.order || 0
            });
          } else {
            await assignmentsAPI.createAnswer({
              question: editingQuestion.id,
              text: answer.text,
              is_correct: answer.is_correct,
              explanation: answer.explanation || '',
              order: answer.order || 0
            });
          }
        }

        setSnackbar({
          open: true,
          message: 'تم تحديث السؤال بنجاح',
          severity: 'success'
        });
      } else {
        // Create new question
        const newQuestion = await assignmentsAPI.createQuestion({
          assignment: assignmentId,
          text: questionForm.text,
          question_type: questionForm.question_type,
          points: questionForm.points,
          explanation: questionForm.explanation,
          order: questionForm.order,
          is_required: questionForm.is_required
        });

        // Create answers if any
        for (const answer of questionForm.answers) {
          await assignmentsAPI.createAnswer({
            question: newQuestion.id,
            text: answer.text,
            is_correct: answer.is_correct,
            explanation: answer.explanation || '',
            order: answer.order || 0
          });
        }

        setSnackbar({
          open: true,
          message: 'تم إضافة السؤال بنجاح',
          severity: 'success'
        });
      }

      setOpenQuestionDialog(false);
      fetchAssignmentAndQuestions(); // Refresh the list
    } catch (error) {
      console.error('Error saving question:', error);
      setSnackbar({
        open: true,
        message: 'تعذر حفظ السؤال',
        severity: 'error'
      });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      try {
        await assignmentsAPI.deleteQuestion(questionId);
        setSnackbar({
          open: true,
          message: 'تم حذف السؤال بنجاح',
          severity: 'success'
        });
        fetchAssignmentAndQuestions(); // Refresh the list
      } catch (error) {
        console.error('Error deleting question:', error);
        setSnackbar({
          open: true,
          message: 'تعذر حذف السؤال',
          severity: 'error'
        });
      }
    }
  };

  const handleAddAnswer = () => {
    setQuestionForm(prev => ({
      ...prev,
      answers: [...prev.answers, {
        text: '',
        is_correct: false,
        explanation: '',
        order: prev.answers.length + 1
      }]
    }));
  };

  const handleUpdateAnswer = (index, field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => 
        i === index ? { ...answer, [field]: value } : answer
      )
    }));
  };

  const handleDeleteAnswer = (index) => {
    setQuestionForm(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  const getQuestionIcon = (questionType) => {
    const type = questionTypes.find(t => t.value === questionType);
    return type ? type.icon : <QuizIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  return (
    <Box className="assignments-container">
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #e5978b 0%, #2e7d32 100%)',
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
            <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              إدارة أسئلة الواجب
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            {assignment?.title || 'عنوان الواجب'}
          </Typography>
        </Box>
      </Box>

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teacher/assignments')}
          sx={{ mb: 2 }}
        >
          العودة إلى الواجبات
        </Button>
      </Box>

      {/* Questions List */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            أسئلة الواجب ({questions.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
            sx={{
              background: 'linear-gradient(135deg, #e5978b 0%, #2e7d32 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
              }
            }}
          >
            إضافة سؤال جديد
          </Button>
        </Box>

        {questions.length === 0 ? (
          <Alert severity="info">
            لا توجد أسئلة لهذا الواجب. اضغط على "إضافة سؤال جديد" لبدء إضافة الأسئلة.
          </Alert>
        ) : (
          <List>
            {questions.map((question, index) => (
              <ListItem key={question.id} sx={{ mb: 2, p: 0 }}>
                <Card sx={{ width: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getQuestionIcon(question.question_type)}
                      <Typography variant="h6" fontWeight={600}>
                        السؤال {index + 1}
                      </Typography>
                      <Chip
                        label={questionTypes.find(t => t.value === question.question_type)?.label || question.question_type}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                      <Chip
                        label={`${question.points} نقطة`}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditQuestion(question)}
                        sx={{ color: '#1976d2' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuestion(question.id)}
                        sx={{ color: '#d32f2f' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {question.text}
                  </Typography>
                  
                  {question.explanation && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>شرح:</strong> {question.explanation}
                    </Typography>
                  )}

                  {/* Answers for multiple choice questions */}
                  {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && question.answers && question.answers.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        الإجابات:
                      </Typography>
                      <List dense>
                        {question.answers.map((answer, aIndex) => (
                          <ListItem key={answer.id} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              {answer.is_correct ? (
                                <CheckBoxIcon color="success" fontSize="small" />
                              ) : (
                                <RadioButtonCheckedIcon color="disabled" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={answer.text}
                              secondary={answer.explanation}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Card>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Question Dialog */}
      <Dialog
        open={openQuestionDialog}
        onClose={() => setOpenQuestionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="نص السؤال"
              variant="outlined"
              multiline
              rows={3}
              value={questionForm.text}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
              required
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع السؤال</InputLabel>
                  <Select
                    value={questionForm.question_type}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question_type: e.target.value }))}
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
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, points: Number(e.target.value) }))}
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
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
            />
            
            <TextField
              fullWidth
              label="ترتيب السؤال"
              type="number"
              variant="outlined"
              value={questionForm.order}
              onChange={(e) => setQuestionForm(prev => ({ ...prev, order: Number(e.target.value) }))}
              inputProps={{ min: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={questionForm.is_required}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, is_required: e.target.checked }))}
                />
              }
              label="سؤال إجباري"
            />

            {/* Answers for multiple choice questions */}
            {(questionForm.question_type === 'multiple_choice' || questionForm.question_type === 'true_false') && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    الإجابات ({questionForm.answers.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {questionForm.answers.map((answer, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          label={`الإجابة ${index + 1}`}
                          variant="outlined"
                          size="small"
                          value={answer.text}
                          onChange={(e) => handleUpdateAnswer(index, 'text', e.target.value)}
                        />
                        <FormControlLabel
                          control={
                            <Radio
                              checked={answer.is_correct}
                              onChange={(e) => handleUpdateAnswer(index, 'is_correct', e.target.checked)}
                            />
                          }
                          label="صحيحة"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAnswer(index)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddAnswer}
                      size="small"
                    >
                      إضافة إجابة
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuestionDialog(false)}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuestion}
            startIcon={<SaveIcon />}
          >
            {editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignmentQuestions;
