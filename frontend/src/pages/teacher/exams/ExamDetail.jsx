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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ borderRadius: 4, p: 4, mb: 4, background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 40, color: 'white' }} />
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
                {exam.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {exam.is_final && <Chip label="نهائي" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />}
                <Chip 
                  label={getExamStatus().status} 
                  sx={{ 
                    bgcolor: getExamStatus().color === 'success' ? 'rgba(76,175,80,0.2)' : 
                           getExamStatus().color === 'warning' ? 'rgba(255,152,0,0.2)' :
                           getExamStatus().color === 'error' ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.2)',
                    color: 'white', 
                    fontWeight: 600 
                  }} 
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/teacher/exams')}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              عودة للقائمة
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate(`/teacher/exams/${examId}/edit`)}
              startIcon={<Edit />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              تعديل الامتحان
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              الدورة:
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {exam.course?.title || 'غير محدد'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              الوحدة:
        </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {exam.module?.name || 'غير محدد'}
        </Typography>
          </Box>
        </Box>
        
        {exam.description && (
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            {exam.description}
          </Typography>
        )}
      </Paper>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
        
        {/* Left Column - Exam Details */}
        <Paper elevation={2} sx={{ borderRadius: 3, p: 4, height: 'fit-content' }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment sx={{ color: 'primary.main' }} />
            تفاصيل الامتحان
            </Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Basic Info */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                المعلومات الأساسية
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>الوقت المحدد:</Typography>
                  <Chip label={`${exam.time_limit || 'غير محدد'} دقيقة`} color="info" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>درجة النجاح:</Typography>
                  <Chip label={`${exam.pass_mark}%`} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>إجمالي النقاط:</Typography>
                  <Chip label={`${exam.total_points} نقطة`} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>عدد المحاولات:</Typography>
              <Chip 
                    label={exam.allow_multiple_attempts ? `${exam.max_attempts} محاولة` : 'محاولة واحدة'} 
                    color={exam.allow_multiple_attempts ? "secondary" : "default"} 
                    size="small" 
                  />
                </Box>
              </Box>
            </Box>

            {/* Schedule */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                جدول الامتحان
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {exam.start_date && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight={600}>موعد البدء:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(exam.start_date)}
                    </Typography>
                  </Box>
            )}
            {exam.end_date && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight={600}>موعد الانتهاء:</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(exam.end_date)}
                    </Typography>
                  </Box>
                )}
              </Box>
          </Box>

            {/* Settings */}
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                إعدادات الامتحان
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>إظهار الإجابات:</Typography>
            <Chip 
                    label={exam.show_answers_after ? 'نعم' : 'لا'} 
              color={exam.show_answers_after ? "success" : "default"}
              size="small"
            />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>ترتيب عشوائي:</Typography>
            <Chip 
                    label={exam.randomize_questions ? 'نعم' : 'لا'} 
              color={exam.randomize_questions ? "warning" : "default"}
              size="small"
            />
                </Box>
              </Box>
          </Box>

            {/* Time Remaining */}
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
                  <Box sx={{ p: 3, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
                    <Typography variant="h6" color="warning.dark" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      ⏰ الوقت المتبقي
                    </Typography>
                    <Typography variant="body1" color="warning.dark" fontWeight={600}>
                      {days > 0 ? `${days} يوم ` : ''}{hours > 0 ? `${hours} ساعة ` : ''}{minutes} دقيقة
            </Typography>
                </Box>
              );
            }
            return null;
          })()}
        </Box>
        </Paper>

        {/* Right Column - Questions */}
        <Paper elevation={2} sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Quiz sx={{ color: 'primary.main' }} />
              الأسئلة ({questions.length})
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
              sx={{ 
                borderRadius: 2, 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0a3d5f 0%, #d17a6f 100%)',
                }
              }}
            onClick={() => setAddQuestionDialogOpen(true)}
          >
            إضافة سؤال
          </Button>
        </Box>
        
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {questions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Quiz sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                    لا توجد أسئلة لهذا الامتحان
                  </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                ابدأ بإضافة أسئلة لإنشاء امتحان شامل
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setAddQuestionDialogOpen(true)}
                sx={{ 
                  background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0a3d5f 0%, #d17a6f 100%)',
                  }
                }}
              >
                إضافة أول سؤال
              </Button>
            </Box>
          ) : (
            <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {questions.map((question, index) => (
                <Paper 
                  key={question.id} 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': {
                      boxShadow: 3,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        السؤال {index + 1}: {question.text}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        label={getQuestionTypeLabel(question.question_type)} 
                        size="small" 
                          color="primary"
                          variant="outlined"
                      />
                      <Chip 
                          label={`${question.points} نقطة`} 
                        size="small" 
                        color="info" 
                      />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="تعديل">
                        <IconButton 
                          onClick={() => navigate(`/teacher/exams/${examId}/questions/${question.id}/edit`)}
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'primary.light' }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton 
                          onClick={() => openDeleteDialog(question)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.light' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                      {question.explanation && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                          <strong>الشرح:</strong> {question.explanation}
                        </Typography>
                    </Box>
                      )}
                  
                      {question.answers && question.answers.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            الإجابات:
                          </Typography>
                      <Box sx={{ display: 'grid', gap: 1 }}>
                        {question.answers.map((answer, answerIndex) => (
                          <Box 
                            key={answerIndex}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              p: 1.5,
                              bgcolor: answer.is_correct ? 'success.light' : 'grey.50',
                              borderRadius: 1,
                              border: answer.is_correct ? '2px solid' : '1px solid',
                              borderColor: answer.is_correct ? 'success.main' : 'grey.300'
                            }}
                          >
                            <Box sx={{ 
                              width: 20, 
                              height: 20, 
                              borderRadius: '50%',
                              bgcolor: answer.is_correct ? 'success.main' : 'grey.400',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {answerIndex + 1}
                            </Box>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {answer.text}
                            </Typography>
                            {answer.is_correct && (
                              <Chip label="إجابة صحيحة" size="small" color="success" />
                            )}
                          </Box>
                          ))}
                        </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
      </Paper>
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