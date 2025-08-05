import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Paper, Stack, IconButton, Divider, Chip } from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const moduleOptions = [
  { id: 'm1', name: 'مقدمة في تطوير الويب' },
  { id: 'm2', name: 'CSS المتقدم' },
  { id: 'm3', name: 'جافاسكريبت الحديثة' },
];
const courseOptions = [
  { id: 'c1', title: 'دورة تطوير تطبيقات الويب المتقدمة' },
];
const quizTypes = [
  { value: 'video', label: 'فيديو كويز' },
  { value: 'module', label: 'كويز وحدة' },
  { value: 'quick', label: 'كويز سريع' },
];
const questionTypes = [
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'true_false', label: 'صح أو خطأ' },
  { value: 'short_answer', label: 'إجابة قصيرة' },
];

const QuizForm = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const isEdit = Boolean(quizId);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    type: 'video',
    module: '',
    course: '',
    time_limit: 10,
    pass_mark: 60,
    questions: [],
  });

  const handleChange = (e) => {
    setQuiz({ ...quiz, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: '',
          type: 'multiple_choice',
          points: 1,
          answers: [{ text: '', is_correct: false }],
        },
      ],
    });
  };

  const handleQuestionChange = (idx, field, value) => {
    const questions = quiz.questions.map((q, i) =>
      i === idx ? { ...q, [field]: value } : q
    );
    setQuiz({ ...quiz, questions });
  };

  const handleAddAnswer = (qIdx) => {
    const questions = quiz.questions.map((q, i) =>
      i === qIdx ? { ...q, answers: [...q.answers, { text: '', is_correct: false }] } : q
    );
    setQuiz({ ...quiz, questions });
  };

  const handleAnswerChange = (qIdx, aIdx, field, value) => {
    const questions = quiz.questions.map((q, i) =>
      i === qIdx
        ? {
            ...q,
            answers: q.answers.map((a, j) =>
              j === aIdx ? { ...a, [field]: value } : a
            ),
          }
        : q
    );
    setQuiz({ ...quiz, questions });
  };

  const handleDeleteQuestion = (idx) => {
    const questions = quiz.questions.filter((_, i) => i !== idx);
    setQuiz({ ...quiz, questions });
  };

  const handleDeleteAnswer = (qIdx, aIdx) => {
    const questions = quiz.questions.map((q, i) =>
      i === qIdx ? { ...q, answers: q.answers.filter((_, j) => j !== aIdx) } : q
    );
    setQuiz({ ...quiz, questions });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Button startIcon={<ArrowBack />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        العودة
      </Button>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          {isEdit ? 'تعديل الكويز' : 'إضافة كويز جديد'}
        </Typography>
        <Stack spacing={2}>
          <TextField label="عنوان الكويز" name="title" value={quiz.title} onChange={handleChange} fullWidth />
          <TextField label="وصف الكويز" name="description" value={quiz.description} onChange={handleChange} fullWidth multiline rows={2} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="نوع الكويز" name="type" value={quiz.type} onChange={handleChange} sx={{ minWidth: 180 }}>
              {quizTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField select label="الوحدة" name="module" value={quiz.module} onChange={handleChange} sx={{ minWidth: 180 }}>
              {moduleOptions.map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
              ))}
            </TextField>
            <TextField select label="الكورس" name="course" value={quiz.course} onChange={handleChange} sx={{ minWidth: 180 }}>
              {courseOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="الزمن بالدقائق" name="time_limit" type="number" value={quiz.time_limit} onChange={handleChange} sx={{ minWidth: 180 }} />
            <TextField label="درجة النجاح (%)" name="pass_mark" type="number" value={quiz.pass_mark} onChange={handleChange} sx={{ minWidth: 180 }} />
          </Stack>
        </Stack>
        <Divider sx={{ my: 4 }} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              الأسئلة
            </Typography>
            <Button startIcon={<Add />} sx={{ ml: 2 }} onClick={handleAddQuestion}>
              إضافة سؤال
            </Button>
          </Box>
          <Stack spacing={3}>
            {quiz.questions.map((q, qIdx) => (
              <Paper key={qIdx} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
                <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, left: 8 }} onClick={() => handleDeleteQuestion(qIdx)}>
                  <Delete />
                </IconButton>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
                  <TextField label="نص السؤال" value={q.text} onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)} fullWidth />
                  <TextField select label="نوع السؤال" value={q.type} onChange={e => handleQuestionChange(qIdx, 'type', e.target.value)} sx={{ minWidth: 180 }}>
                    {questionTypes.map((qt) => (
                      <MenuItem key={qt.value} value={qt.value}>{qt.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="الدرجة" type="number" value={q.points} onChange={e => handleQuestionChange(qIdx, 'points', e.target.value)} sx={{ minWidth: 120 }} />
                </Stack>
                <Box>
                  <Typography variant="subtitle2" mb={1}>الإجابات</Typography>
                  <Stack spacing={1}>
                    {q.answers.map((a, aIdx) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={aIdx}>
                        <TextField label={`إجابة ${aIdx + 1}`} value={a.text} onChange={e => handleAnswerChange(qIdx, aIdx, 'text', e.target.value)} sx={{ flex: 1 }} />
                        <Chip
                          label={a.is_correct ? 'صحيحة' : 'خاطئة'}
                          color={a.is_correct ? 'success' : 'default'}
                          onClick={() => handleAnswerChange(qIdx, aIdx, 'is_correct', !a.is_correct)}
                          sx={{ cursor: 'pointer' }}
                        />
                        <IconButton size="small" color="error" onClick={() => handleDeleteAnswer(qIdx, aIdx)}>
                          <Delete />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                  <Button startIcon={<Add />} sx={{ mt: 1 }} onClick={() => handleAddAnswer(qIdx)}>
                    إضافة إجابة
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            إلغاء
          </Button>
          <Button variant="contained" startIcon={<Save />} sx={{ fontWeight: 'bold', px: 4 }}>
            {isEdit ? 'حفظ التعديلات' : 'حفظ الكويز'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizForm; 