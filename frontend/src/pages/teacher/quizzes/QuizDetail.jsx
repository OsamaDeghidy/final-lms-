import React from 'react';
import { Box, Typography, Paper, Stack, IconButton, Chip, Divider, Button } from '@mui/material';
import { Edit, Delete, ArrowBack, Quiz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const mockQuiz = {
  id: 1,
  title: 'كويز الوحدة الأولى',
  type: 'module',
  module: 'مقدمة في تطوير الويب',
  course: 'دورة تطوير تطبيقات الويب المتقدمة',
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
  ],
  time_limit: 20,
  pass_mark: 60,
  is_active: true,
};

const QuizDetail = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const quiz = mockQuiz; // In real app, fetch by quizId

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Button startIcon={<ArrowBack />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        العودة
      </Button>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Quiz color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight={700}>{quiz.title}</Typography>
          <Chip label={quiz.type === 'video' ? 'فيديو' : quiz.type === 'module' ? 'وحدة' : 'سريع'} color="secondary" />
          {!quiz.is_active && <Chip label="غير نشط" color="warning" />}
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1}>
          الكورس: {quiz.course}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          الوحدة: {quiz.module}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          الزمن: {quiz.time_limit} دقيقة | النجاح: {quiz.pass_mark}%
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={700} mb={2}>الأسئلة</Typography>
        <Stack spacing={3}>
          {quiz.questions.map((q, idx) => (
            <Paper key={idx} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Typography variant="subtitle1" fontWeight={700}>{`س${idx + 1}: ${q.text}`}</Typography>
                <Chip label={q.type === 'multiple_choice' ? 'اختيار من متعدد' : q.type === 'true_false' ? 'صح أو خطأ' : 'إجابة قصيرة'} size="small" />
                <Chip label={`درجة: ${q.points}`} size="small" color="info" />
              </Stack>
              <Stack spacing={1} mt={1}>
                {q.answers.map((a, aIdx) => (
                  <Chip
                    key={aIdx}
                    label={a.text}
                    color={a.is_correct ? 'success' : 'default'}
                    variant={a.is_correct ? 'filled' : 'outlined'}
                    sx={{ mr: 1 }}
                  />
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}>
            تعديل
          </Button>
          <Button variant="contained" color="error" startIcon={<Delete />}>حذف</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizDetail; 