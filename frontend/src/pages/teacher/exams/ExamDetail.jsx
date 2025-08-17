import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { Edit, Delete, Add, Assessment, Quiz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';

const ExamDetail = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    question_type: 'multiple_choice',
    points: 1,
    explanation: '',
    answers: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  // Fetch exam and questions on component mount
  useEffect(() => {
    if (examId) {
      fetchExam();
      fetchQuestions();
    }
  }, [examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const examData = await examAPI.getExam(examId);
      console.log('🔍 Exam data received:', examData);
      console.log('🔍 Course data:', examData.course);
      console.log('🔍 Module data:', examData.module);
      setExam(examData);
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('حدث خطأ في تحميل بيانات الامتحان');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsData = await examAPI.getExamQuestions(examId);
      setQuestions(questionsData.results || questionsData);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('حدث خطأ في تحميل الأسئلة');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await examAPI.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('حدث خطأ في حذف السؤال');
    }
  };

  const handleAddQuestion = async () => {
    try {
      // Validate question data
      if (!newQuestion.text.trim()) {
        setError('يجب إدخال نص السؤال');
        return;
      }

      if (newQuestion.question_type === 'multiple_choice') {
        const validAnswers = newQuestion.answers.filter(answer => answer.text.trim());
        if (validAnswers.length < 2) {
          setError('يجب إدخال إجابتين على الأقل');
          return;
        }
        const correctAnswers = newQuestion.answers.filter(answer => answer.is_correct);
        if (correctAnswers.length === 0) {
          setError('يجب اختيار إجابة صحيحة واحدة على الأقل');
          return;
        }
      }

      if (newQuestion.question_type === 'true_false') {
        const correctAnswers = newQuestion.answers.filter(answer => answer.is_correct);
        if (correctAnswers.length === 0) {
          setError('يجب اختيار إجابة صحيحة');
          return;
        }
      }

      if (newQuestion.question_type === 'short_answer') {
        if (!newQuestion.answers[0]?.text.trim()) {
          setError('يجب إدخال الإجابة الصحيحة');
          return;
        }
      }

      const questionData = {
        ...newQuestion,
        exam: examId,
        points: parseInt(newQuestion.points)
      };
      
      await examAPI.addQuestion(examId, questionData);
      setAddQuestionDialogOpen(false);
      setError(null); // Clear any previous errors
      setNewQuestion({
        text: '',
        question_type: 'multiple_choice',
        points: 1,
        explanation: '',
        answers: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      });
      fetchQuestions(); // Refresh questions list
    } catch (err) {
      console.error('Error adding question:', err);
      setError('حدث خطأ في إضافة السؤال');
    }
  };

  const openDeleteDialog = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const handleCorrectAnswerChange = (index) => {
    const updatedAnswers = newQuestion.answers.map((answer, i) => ({
      ...answer,
      is_correct: i === index
    }));
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const addAnswer = () => {
    setNewQuestion({
      ...newQuestion,
      answers: [...newQuestion.answers, { text: '', is_correct: false }]
    });
  };

  const removeAnswer = (index) => {
    if (newQuestion.answers.length > 2) {
      const updatedAnswers = newQuestion.answers.filter((_, i) => i !== index);
      setNewQuestion({ ...newQuestion, answers: updatedAnswers });
    }
  };

  const handleQuestionTypeChange = (type) => {
    let answers = [];
    if (type === 'multiple_choice') {
      answers = [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ];
    } else if (type === 'true_false') {
      answers = [
        { text: 'صح', is_correct: false },
        { text: 'خطأ', is_correct: false }
      ];
    } else if (type === 'short_answer') {
      answers = [
        { text: '', is_correct: true }
      ];
    }
    
    setNewQuestion({
      ...newQuestion,
      question_type: type,
      answers: answers
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'غير محدد';
      
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'غير محدد';
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'اختيار من متعدد';
      case 'true_false':
        return 'صح أو خطأ';
      case 'short_answer':
        return 'إجابة قصيرة';
      default:
        return type;
    }
  };

  const getExamStatus = () => {
    const now = new Date();
    const startDate = exam.start_date ? new Date(exam.start_date) : null;
    const endDate = exam.end_date ? new Date(exam.end_date) : null;

    if (!exam.is_active) {
      return { status: 'معطل', color: 'default' };
    }

    if (startDate && now < startDate) {
      return { status: 'لم يبدأ بعد', color: 'warning' };
    }

    if (endDate && now > endDate) {
      return { status: 'منتهي', color: 'error' };
    }

    if (startDate && endDate && now >= startDate && now <= endDate) {
      return { status: 'مفتوح', color: 'success' };
    }

    return { status: 'متاح', color: 'primary' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">لم يتم العثور على الامتحان</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>{exam.title}</Typography>
          {exam.is_final && <Chip label="نهائي" color="success" size="small" />}
          <Chip label={getExamStatus().status} color={getExamStatus().color} size="small" />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            <strong>الدورة:</strong> {exam.course?.title || 'غير محدد'}
        </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            <strong>الوحدة:</strong> {exam.module?.name || 'غير محدد'}
        </Typography>
        </Box>
        
        {exam.description && (
          <Typography variant="body1" mb={2} dangerouslySetInnerHTML={{ __html: exam.description }} />
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip label={`الوقت: ${exam.time_limit || 'غير محدد'} دقيقة`} color="info" />
          <Chip label={`درجة النجاح: ${exam.pass_mark}%`} color="success" />
          <Chip label={`إجمالي النقاط: ${exam.total_points}`} color="warning" />
          {exam.allow_multiple_attempts && (
            <Chip label={`الحد الأقصى: ${exam.max_attempts} محاولة`} color="secondary" />
          )}
        </Box>

        {/* Exam Schedule and Attempts */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            جدول الامتحان والمحاولات
            </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {exam.start_date && (
              <Chip 
                label={`موعد البدء: ${formatDate(exam.start_date)}`} 
                color="primary" 
                variant="outlined"
              />
            )}
            {exam.end_date && (
              <Chip 
                label={`موعد الانتهاء: ${formatDate(exam.end_date)}`} 
                color="error" 
                variant="outlined"
              />
            )}
            <Chip 
              label={`المحاولات: ${exam.allow_multiple_attempts ? 'متعددة' : 'واحدة'}`} 
              color={exam.allow_multiple_attempts ? "success" : "default"}
            />
            {exam.allow_multiple_attempts && exam.max_attempts && (
              <Chip 
                label={`عدد المحاولات: ${exam.max_attempts}`} 
                color="info"
              />
            )}
          </Box>

          {/* Additional Settings */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              label={`إظهار الإجابات: ${exam.show_answers_after ? 'نعم' : 'لا'}`} 
              color={exam.show_answers_after ? "success" : "default"}
              size="small"
            />
            <Chip 
              label={`ترتيب عشوائي: ${exam.randomize_questions ? 'نعم' : 'لا'}`} 
              color={exam.randomize_questions ? "warning" : "default"}
              size="small"
            />
          </Box>

          {/* Time Remaining (if exam is active) */}
          {exam.is_active && exam.start_date && exam.end_date && (() => {
            const now = new Date();
            const startDate = new Date(exam.start_date);
            const endDate = new Date(exam.end_date);
            
            if (now >= startDate && now <= endDate) {
              const timeRemaining = endDate - now;
              const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              
              return (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                  <Typography variant="body2" color="warning.dark" fontWeight={600}>
                    ⏰ الوقت المتبقي: {days > 0 ? `${days} يوم ` : ''}{hours > 0 ? `${hours} ساعة ` : ''}{minutes} دقيقة
            </Typography>
                </Box>
              );
            }
            return null;
          })()}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            <Quiz sx={{ mr: 1 }} /> الأسئلة ({questions.length})
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
            onClick={() => setAddQuestionDialogOpen(true)}
          >
            إضافة سؤال
          </Button>
        </Box>
        
        <List>
          {questions.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" color="text.secondary" align="center">
                    لا توجد أسئلة لهذا الامتحان
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            questions.map((question) => (
              <ListItem key={question.id} divider>
              <ListItemText
                  primary={<Typography fontWeight={600}>{question.text}</Typography>}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={getQuestionTypeLabel(question.question_type)} 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={`نقاط: ${question.points}`} 
                        size="small" 
                        color="info" 
                      />
                      {question.explanation && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          <strong>الشرح:</strong> {question.explanation}
                        </Typography>
                      )}
                      {question.answers && question.answers.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                            الإجابات:
                          </Typography>
                          {question.answers.map((answer, index) => (
                            <Chip
                              key={index}
                              label={`${index + 1}. ${answer.text}`}
                              size="small"
                              color={answer.is_correct ? "success" : "default"}
                              variant={answer.is_correct ? "filled" : "outlined"}
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
              />
              <ListItemSecondaryAction>
                  <Tooltip title="تعديل">
                    <IconButton onClick={() => navigate(`/teacher/exams/${examId}/questions/${question.id}/edit`)}>
                      <Edit color="warning" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف">
                    <IconButton onClick={() => openDeleteDialog(question)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            ))
          )}
        </List>
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
      <Button variant="outlined" onClick={() => navigate('/teacher/exams')}>
        عودة للقائمة
      </Button>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/teacher/exams/${examId}/edit`)}
          startIcon={<Edit />}
        >
          تعديل الامتحان
        </Button>
      </Box>

      {/* Delete Question Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد حذف السؤال</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف السؤال "{questionToDelete?.text}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={() => handleDeleteQuestion(questionToDelete?.id)} 
            color="error" 
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog 
        open={addQuestionDialogOpen} 
        onClose={() => setAddQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        dir="rtl"
      >
        <DialogTitle sx={{ textAlign: 'right' }}>إضافة سؤال جديد</DialogTitle>
        <DialogContent sx={{ direction: 'rtl' }}>
          <Box sx={{ pt: 1, textAlign: 'right' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
              <TextField
                label="نص السؤال"
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                fullWidth
                multiline
                minRows={3}
              sx={{ mb: 2 }}
              inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
              />
              <TextField
                select
                label="نوع السؤال"
              value={newQuestion.question_type}
              onChange={(e) => handleQuestionTypeChange(e.target.value)}
                fullWidth
              sx={{ mb: 2 }}
              inputProps={{ dir: 'rtl' }}
              >
                <MenuItem value="multiple_choice">اختيار من متعدد</MenuItem>
                <MenuItem value="true_false">صح أو خطأ</MenuItem>
                <MenuItem value="short_answer">إجابة قصيرة</MenuItem>
              </TextField>
              <TextField
                label="النقاط"
                type="number"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: e.target.value })}
                fullWidth
              sx={{ mb: 2 }}
              inputProps={{ min: 1, dir: 'rtl', style: { textAlign: 'right' } }}
              />
              <TextField
              label="شرح الإجابة (اختياري)"
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              sx={{ mb: 3 }}
              inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
            />

            {/* Answers Section */}
            <Typography variant="h6" sx={{ mb: 2, mt: 3, textAlign: 'right' }}>
              الإجابات
            </Typography>
            
            {newQuestion.question_type === 'multiple_choice' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                  اختر الإجابة الصحيحة:
                </Typography>
                {newQuestion.answers.map((answer, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, direction: 'rtl' }}>
                    <TextField
                      label={`الإجابة ${index + 1}`}
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                      fullWidth
                      sx={{ ml: 1 }}
                      inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={answer.is_correct}
                          onChange={() => handleCorrectAnswerChange(index)}
                        />
                      }
                      label="صحيح"
                      sx={{ direction: 'rtl' }}
                    />
                    {newQuestion.answers.length > 2 && (
                      <IconButton 
                        onClick={() => removeAnswer(index)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button 
                  variant="outlined" 
                  onClick={addAnswer}
                  startIcon={<Add />}
                  sx={{ mt: 1, direction: 'rtl' }}
                >
                  إضافة إجابة
                </Button>
              </Box>
            )}

            {newQuestion.question_type === 'true_false' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                  اختر الإجابة الصحيحة:
                </Typography>
                {newQuestion.answers.map((answer, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, direction: 'rtl' }}>
                    <Typography sx={{ minWidth: 60, ml: 2 }}>
                      {answer.text}:
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={answer.is_correct}
                          onChange={() => handleCorrectAnswerChange(index)}
                        />
                      }
                      label="صحيح"
                      sx={{ direction: 'rtl' }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {newQuestion.question_type === 'short_answer' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                  الإجابة الصحيحة:
                </Typography>
                <TextField
                  label="الإجابة الصحيحة"
                  value={newQuestion.answers[0]?.text || ''}
                  onChange={(e) => handleAnswerChange(0, 'text', e.target.value)}
                  fullWidth
                  inputProps={{ dir: 'rtl', style: { textAlign: 'right' } }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ direction: 'rtl' }}>
          <Button onClick={() => setAddQuestionDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleAddQuestion} 
            variant="contained"
            disabled={!newQuestion.text.trim()}
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamDetail; 