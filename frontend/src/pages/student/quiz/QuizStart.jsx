import React, { useState } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, TextField, Stack, Chip, LinearProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

const mockQuiz = {
  id: 1,
  title: 'كويز الوحدة الأولى',
  type: 'module',
  questions: [
    {
      text: 'ما هو HTML؟',
      type: 'multiple_choice',
      points: 2,
      answers: [
        { text: 'لغة ترميز', is_correct: true },
        { text: 'لغة برمجة', is_correct: false },
      ],
    },
    {
      text: 'هل CSS لغة برمجة؟',
      type: 'true_false',
      points: 1,
      answers: [
        { text: 'نعم', is_correct: false },
        { text: 'لا', is_correct: true },
      ],
    },
    {
      text: 'اكتب مثالًا على وسم HTML.',
      type: 'short_answer',
      points: 2,
      answers: [],
    },
  ],
  time_limit: 20,
};

const QuizStart = ({ onFinish }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const quiz = mockQuiz; // In real app, fetch by quizId
  const total = quiz.questions.length;

  const handleChange = (val) => {
    setAnswers({ ...answers, [current]: val });
  };

  const handleNext = () => {
    if (current < total - 1) setCurrent(current + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const handleSubmit = () => {
    if (onFinish) {
      onFinish();
    } else {
      navigate(`/student/quiz/${quiz.id}/result`);
    }
  };

  const q = quiz.questions[current];

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={2}>{quiz.title}</Typography>
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          <Chip label={`سؤال ${current + 1} من ${total}`} color="primary" />
          <Chip label={`الزمن: ${quiz.time_limit} دقيقة`} color="secondary" />
          <Chip label={`الدرجة: ${q.points}`} color="info" />
        </Stack>
        <LinearProgress variant="determinate" value={((current + 1) / total) * 100} sx={{ mb: 3, height: 8, borderRadius: 2 }} />
        <Typography variant="h6" mb={2}>{q.text}</Typography>
        {q.type === 'multiple_choice' && (
          <RadioGroup value={answers[current] || ''} onChange={e => handleChange(e.target.value)}>
            {q.answers.map((a, idx) => (
              <FormControlLabel key={idx} value={a.text} control={<Radio />} label={a.text} />
            ))}
          </RadioGroup>
        )}
        {q.type === 'true_false' && (
          <RadioGroup value={answers[current] || ''} onChange={e => handleChange(e.target.value)}>
            {q.answers.map((a, idx) => (
              <FormControlLabel key={idx} value={a.text} control={<Radio />} label={a.text} />
            ))}
          </RadioGroup>
        )}
        {q.type === 'short_answer' && (
          <TextField
            label="إجابتك"
            value={answers[current] || ''}
            onChange={e => handleChange(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        )}
        <Stack direction="row" spacing={2} mt={4} justifyContent="space-between">
          <Button variant="outlined" onClick={handlePrev} disabled={current === 0}>السابق</Button>
          {current < total - 1 ? (
            <Button variant="contained" onClick={handleNext}>التالي</Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit}>إنهاء الكويز</Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default QuizStart; 