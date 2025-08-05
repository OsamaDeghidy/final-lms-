import React from 'react';
import { Box, Typography, Paper, Stack, Chip, Button, LinearProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { EmojiEvents, Close, CheckCircle } from '@mui/icons-material';

const mockResult = {
  score: 80,
  passed: true,
  total: 5,
  correct: 4,
  quiz: {
    title: 'كويز الوحدة الأولى',
    questions: [
      { text: 'ما هو HTML؟', correct: true },
      { text: 'هل CSS لغة برمجة؟', correct: true },
      { text: 'اكتب مثالًا على وسم HTML.', correct: false },
      { text: 'ما هو JavaScript؟', correct: true },
      { text: 'ما هو CSS؟', correct: false },
    ],
  },
};

const QuizResult = ({ onClose }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const result = mockResult;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>{result.quiz.title}</Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          <Chip label={`النتيجة: ${result.score}%`} color={result.passed ? 'success' : 'error'} icon={result.passed ? <CheckCircle /> : <Close />} sx={{ fontSize: 18, px: 2 }} />
          {result.passed ? (
            <Chip label="ناجح" color="success" icon={<EmojiEvents />} sx={{ fontSize: 18, px: 2 }} />
          ) : (
            <Chip label="راسب" color="error" icon={<Close />} sx={{ fontSize: 18, px: 2 }} />
          )}
        </Stack>
        <LinearProgress variant="determinate" value={result.score} sx={{ mb: 3, height: 10, borderRadius: 2 }} />
        <Typography variant="subtitle1" mb={2}>ملخص الإجابات</Typography>
        <Stack spacing={2} mb={4}>
          {result.quiz.questions.map((q, idx) => (
            <Paper key={idx} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: q.correct ? 'success.lighter' : 'error.lighter' }}>
              <Typography>{q.text}</Typography>
              {q.correct ? <CheckCircle color="success" /> : <Close color="error" />}
            </Paper>
          ))}
        </Stack>
        <Button variant="contained" color="primary" onClick={() => onClose ? onClose() : navigate(-1)} sx={{ fontWeight: 'bold', px: 4 }}>
          اكتمال
        </Button>
      </Paper>
    </Box>
  );
};

export default QuizResult; 