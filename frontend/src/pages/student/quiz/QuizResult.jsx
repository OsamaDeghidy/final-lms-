import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Chip, Button, LinearProgress, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { EmojiEvents, Close, CheckCircle } from '@mui/icons-material';
import { quizAPI } from '../../../services/quiz.service';

const QuizResult = ({ onClose }) => {
  const navigate = useNavigate();
  const { quizId, attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizResult();
  }, [attemptId]);

  const loadQuizResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get quiz attempt result
      const attemptResult = await quizAPI.getQuizAttemptResult(attemptId);
      setResult(attemptResult);
      
      // Get quiz attempt answers
      const answersData = await quizAPI.getQuizAttemptAnswers(attemptId);
      setAnswers(answersData.results || answersData);
      
    } catch (err) {
      console.error('Error loading quiz result:', err);
      setError('حدث خطأ في تحميل نتيجة الكويز. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadQuizResult}>إعادة المحاولة</Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="info">لا توجد نتيجة متاحة لهذا الكويز.</Alert>
      </Box>
    );
  }

  const score = result.score || 0;
  const passed = result.passed || false;
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.is_correct).length;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          {result.quiz?.title || 'نتيجة الكويز'}
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          <Chip 
            label={`النتيجة: ${score.toFixed(1)}%`} 
            color={passed ? 'success' : 'error'} 
            icon={passed ? <CheckCircle /> : <Close />} 
            sx={{ fontSize: 18, px: 2 }} 
          />
          {passed ? (
            <Chip 
              label="ناجح" 
              color="success" 
              icon={<EmojiEvents />} 
              sx={{ fontSize: 18, px: 2 }} 
            />
          ) : (
            <Chip 
              label="راسب" 
              color="error" 
              icon={<Close />} 
              sx={{ fontSize: 18, px: 2 }} 
            />
          )}
        </Stack>
        
        <LinearProgress 
          variant="determinate" 
          value={score} 
          sx={{ mb: 3, height: 10, borderRadius: 2 }} 
        />
        
        <Typography variant="subtitle1" mb={2}>
          ملخص الإجابات ({correctAnswers} من {totalQuestions} صحيحة)
        </Typography>
        
        <Stack spacing={2} mb={4}>
          {answers.map((answer, idx) => (
            <Paper 
              key={idx} 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                bgcolor: answer.is_correct ? 'success.lighter' : 'error.lighter' 
              }}
            >
              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Typography variant="body1" fontWeight="medium">
                  {answer.question?.text || `سؤال ${idx + 1}`}
                </Typography>
                {answer.text_answer && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    إجابتك: {answer.text_answer}
                  </Typography>
                )}
                {answer.selected_answer && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    إجابتك: {answer.selected_answer?.text}
                  </Typography>
                )}
                {answer.points_earned !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    النقاط: {answer.points_earned} من {answer.question?.points || 1}
                  </Typography>
                )}
              </Box>
              {answer.is_correct ? (
                <CheckCircle color="success" sx={{ ml: 2 }} />
              ) : (
                <Close color="error" sx={{ ml: 2 }} />
              )}
            </Paper>
          ))}
        </Stack>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onClose ? onClose() : navigate(-1)} 
            sx={{ fontWeight: 'bold', px: 4 }}
          >
            اكتمال
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/student/quiz/${quizId}`)}
            sx={{ fontWeight: 'bold', px: 4 }}
          >
            إعادة المحاولة
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default QuizResult; 