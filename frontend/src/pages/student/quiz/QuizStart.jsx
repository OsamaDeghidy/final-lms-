import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, TextField, Stack, Chip, LinearProgress, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizStart = ({ quizId, onFinish }) => {
  const navigate = useNavigate();
  const { quizId: urlQuizId } = useParams();
  const actualQuizId = quizId || urlQuizId;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [actualQuizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get quiz details with questions and answers
      const quizData = await quizAPI.getQuiz(actualQuizId);
      setQuiz(quizData);
      
      // Extract questions from quiz data
      const questionsData = quizData.questions || [];
      setQuestions(questionsData);
      
      // Start quiz attempt
      const attemptData = await quizAPI.startQuizAttempt(actualQuizId);
      setAttemptId(attemptData.id);
      
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('حدث خطأ في تحميل الكويز. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (val) => {
    setAnswers({ ...answers, [current]: val });
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (!attemptId) {
        setError('لم يتم العثور على معرف المحاولة. يرجى إعادة تحميل الصفحة.');
        return;
      }
      
      // Submit all answers
      const answersToSubmit = questions.map((question, index) => ({
        question_id: question.id,
        selected_answer_id: answers[index]?.selected_answer || null,
        text_answer: answers[index]?.text_answer || null
      }));
      
      console.log('Answers to submit:', answersToSubmit);

      await quizAPI.submitQuizAnswers(attemptId, answersToSubmit);
      
      // Finish the attempt
      await quizAPI.finishQuizAttempt(attemptId);
      
      if (onFinish) {
        onFinish(attemptId);
      } else {
        navigate(`/student/quiz/${actualQuizId}/result/${attemptId}`);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('حدث خطأ في إرسال الإجابات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
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
        <Button variant="contained" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </Box>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="info">لا توجد أسئلة متاحة لهذا الكويز.</Alert>
      </Box>
    );
  }

  const q = questions[current];
  const total = questions.length;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>{quiz.title}</Typography>
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Chip label={`سؤال ${current + 1} من ${total}`} color="primary" />
          {quiz.time_limit && (
            <Chip label={`الزمن: ${quiz.time_limit} دقيقة`} color="secondary" />
          )}
          <Chip label={`الدرجة: ${q.points}`} color="info" />
        </Stack>
        <LinearProgress variant="determinate" value={((current + 1) / total) * 100} sx={{ mb: 3, height: 8, borderRadius: 2 }} />
        
        <Typography variant="h6" mb={2}>{q.text}</Typography>
        
        {q.question_type === 'multiple_choice' && (
          <RadioGroup 
            value={answers[current]?.selected_answer || ''} 
            onChange={e => handleChange({ ...answers[current], selected_answer: e.target.value })}
          >
            {q.answers && q.answers.length > 0 ? (
              q.answers.map((a, idx) => (
                <FormControlLabel 
                  key={idx} 
                  value={a.id} 
                  control={<Radio />} 
                  label={a.text} 
                />
              ))
            ) : (
              <Box>
                <Typography color="error" sx={{ mb: 1 }}>لا توجد إجابات متاحة لهذا السؤال</Typography>
                <Typography variant="caption" color="text.secondary">
                  يرجى التواصل مع المعلم لإضافة إجابات لهذا السؤال
                </Typography>
              </Box>
            )}
          </RadioGroup>
        )}
        
        {q.question_type === 'true_false' && (
          <RadioGroup 
            value={answers[current]?.selected_answer || ''} 
            onChange={e => handleChange({ ...answers[current], selected_answer: e.target.value })}
          >
            <FormControlLabel 
              value="true" 
              control={<Radio />} 
              label="صح" 
            />
            <FormControlLabel 
              value="false" 
              control={<Radio />} 
              label="خطأ" 
            />
          </RadioGroup>
        )}
        
        {q.question_type === 'short_answer' && (
          <TextField
            label="إجابتك"
            value={answers[current]?.text_answer || ''}
            onChange={e => handleChange({ ...answers[current], text_answer: e.target.value })}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        )}
        
        <Stack direction="row" spacing={2} mt={4} justifyContent="space-between">
          <Button 
            variant="outlined" 
            onClick={handlePrev} 
            disabled={current === 0}
          >
            السابق
          </Button>
          
          {current < total - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              التالي
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'جاري الإرسال...' : 'إنهاء الكويز'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default QuizStart; 