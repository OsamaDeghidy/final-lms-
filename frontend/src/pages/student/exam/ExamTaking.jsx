import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, LinearProgress, Chip, CircularProgress, Alert, TextField } from '@mui/material';
import { Quiz, ArrowBack, ArrowForward, Done } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';

const ExamTaking = ({ examId, attemptId, onFinish, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (examId) {
      loadExamQuestions();
    }
  }, [examId]);

  const loadExamQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const questionsData = await examAPI.getExamQuestions(examId);
      setQuestions(questionsData.results || questionsData);
      
    } catch (err) {
      console.error('Error loading exam questions:', err);
      setError('حدث خطأ في تحميل أسئلة الامتحان. يرجى المحاولة مرة أخرى.');
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
      <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadExamQuestions}>إعادة المحاولة</Button>
      </Box>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="warning">لا توجد أسئلة متاحة لهذا الامتحان</Alert>
      </Box>
    );
  }

  const q = questions[current];
  const total = questions.length;

  const handleChange = (val) => {
    setAnswers({ ...answers, [current]: val });
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

      await examAPI.submitExamAnswers(attemptId, answersToSubmit);
      
      // Finish the attempt
      await examAPI.finishExamAttempt(attemptId);
      
      if (onFinish) {
        onFinish(attemptId);
      } else {
        navigate('result');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('حدث خطأ في إرسال الإجابات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Quiz sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>سؤال {current + 1} من {total}</Typography>
          <Chip label={`نقاط: ${q.points}`} color="info" size="small" sx={{ ml: 2 }} />
        </Box>
        <LinearProgress variant="determinate" value={((current + 1) / total) * 100} sx={{ mb: 3, height: 8, borderRadius: 2 }} />
        <Typography variant="h5" mb={3}>{q.text}</Typography>
        
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
              <Typography color="error">لا توجد إجابات متاحة لهذا السؤال</Typography>
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>السابق</Button>
          {current < total - 1 ? (
            <Button variant="contained" endIcon={<ArrowForward />} onClick={() => setCurrent(c => c + 1)}>التالي</Button>
          ) : (
            <Button 
              variant="contained" 
              endIcon={<Done />} 
              color="success" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'جاري الإرسال...' : 'إنهاء الامتحان'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ExamTaking; 