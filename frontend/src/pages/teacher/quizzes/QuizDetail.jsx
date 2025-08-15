import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, IconButton, Chip, Divider, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit, Delete, ArrowBack, Quiz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizDetail = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizData = await quizAPI.getQuiz(quizId);
      setQuiz(quizData);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('حدث خطأ في تحميل بيانات الكويز');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await quizAPI.deleteQuiz(quizId);
      setDeleteDialogOpen(false);
      navigate('/teacher/quizzes');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('حدث خطأ في حذف الكويز');
    }
  };

  const getQuizTypeLabel = (type) => {
    const typeLabels = {
      'video': 'فيديو',
      'module': 'وحدة',
      'quick': 'سريع'
    };
    return typeLabels[type] || type;
  };

  const getQuestionTypeLabel = (type) => {
    const typeLabels = {
      'multiple_choice': 'اختيار من متعدد',
      'true_false': 'صح أو خطأ',
      'short_answer': 'إجابة قصيرة'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Button startIcon={<ArrowBack />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
          العودة
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Button startIcon={<ArrowBack />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
          العودة
        </Button>
        <Alert severity="warning">
          الكويز غير موجود
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Button startIcon={<ArrowBack />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        العودة
      </Button>
      
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Quiz color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight={700}>{quiz.title}</Typography>
          <Chip label={getQuizTypeLabel(quiz.quiz_type)} color="secondary" />
          {!quiz.is_active && <Chip label="غير نشط" color="warning" />}
        </Stack>
        
        {quiz.description && (
          <Typography variant="body1" color="text.secondary" mb={2}>
            {quiz.description}
          </Typography>
        )}
        
        {quiz.course && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            الكورس: {quiz.course.title}
          </Typography>
        )}
        
        {quiz.module && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            الوحدة: {quiz.module.name}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" mb={2}>
          {quiz.time_limit && `الزمن: ${quiz.time_limit} دقيقة | `}
          {quiz.pass_mark && `النجاح: ${quiz.pass_mark}%`}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" fontWeight={700} mb={2}>
          الأسئلة ({quiz.questions?.length || 0})
        </Typography>
        
        {quiz.questions && quiz.questions.length > 0 ? (
          <Stack spacing={3}>
            {quiz.questions.map((q, idx) => (
              <Paper key={q.id || idx} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {`س${idx + 1}: ${q.text}`}
                  </Typography>
                  <Chip 
                    label={getQuestionTypeLabel(q.question_type)} 
                    size="small" 
                  />
                  <Chip 
                    label={`درجة: ${q.points}`} 
                    size="small" 
                    color="info" 
                  />
                </Stack>
                
                {q.explanation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>شرح:</strong> {q.explanation}
                  </Typography>
                )}
                
                {q.answers && q.answers.length > 0 && (
                  <Stack spacing={1} mt={1}>
                    {q.answers.map((a, aIdx) => (
                      <Chip
                        key={a.id || aIdx}
                        label={a.text}
                        color={a.is_correct ? 'success' : 'default'}
                        variant={a.is_correct ? 'filled' : 'outlined'}
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </Stack>
                )}
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            لا توجد أسئلة في هذا الكويز
          </Typography>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<Edit />} 
            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
          >
            تعديل
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            حذف
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الكويز "{quiz.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleDeleteQuiz} 
            color="error" 
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizDetail; 