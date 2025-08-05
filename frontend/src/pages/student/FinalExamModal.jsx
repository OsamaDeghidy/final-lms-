import React, { useState } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, TextField, Chip, Divider, Stack } from '@mui/material';
import { Assessment, Done, AccessTime, EmojiEvents, PlayArrow } from '@mui/icons-material';
import ExamResult from './exam/ExamResult';

const mockExam = {
  id: 1,
  title: 'الامتحان النهائي - تطوير الويب',
  description: 'امتحان شامل يغطي جميع وحدات الدورة. لديك 60 دقيقة للإجابة.',
  time_limit: 60,
  pass_mark: 60,
  total_points: 100,
  questions: [
    {
      id: 1,
      text: 'ما هو React؟',
      type: 'multiple_choice',
      options: ['مكتبة جافاسكريبت', 'لغة برمجة', 'نظام تشغيل', 'متصفح'],
      points: 2,
    },
    {
      id: 2,
      text: 'هل HTML لغة برمجة؟',
      type: 'true_false',
      options: ['صح', 'خطأ'],
      points: 1,
    },
    {
      id: 3,
      text: 'اشرح مفهوم SPA.',
      type: 'short_answer',
      points: 3,
    },
  ],
};

const FinalExamModal = ({ onClose }) => {
  const [step, setStep] = useState('start'); // start | questions | result
  const [answers, setAnswers] = useState({});

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleStart = () => setStep('questions');
  const handleSubmit = () => {
    setStep('result');
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', p: 0 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, p: 3, mb: 2, boxShadow: '0 4px 24px 0 rgba(63,81,181,0.10)' }}>
        {step === 'start' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={800} mb={1} sx={{ textAlign: 'center', letterSpacing: 1 }}>
              {mockExam.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2} sx={{ textAlign: 'center', fontSize: 15 }}>
              {mockExam.description}
            </Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip icon={<AccessTime />} label={`${mockExam.time_limit} دقيقة`} size="small" color="info" />
              <Chip icon={<EmojiEvents />} label={`النجاح: ${mockExam.pass_mark}%`} size="small" color="success" />
              <Chip label={`الدرجة: ${mockExam.total_points}`} size="small" color="primary" />
            </Stack>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayArrow />}
              sx={{ borderRadius: 99, px: 5, py: 1.2, fontWeight: 'bold', fontSize: 18, boxShadow: '0 4px 16px 0 rgba(63,81,181,0.10)', mt: 2 }}
              onClick={handleStart}
            >
              بدء الامتحان
            </Button>
          </Box>
        )}
        {step === 'questions' && (
          <Box>
            <Typography variant="h6" fontWeight={700} mb={2} textAlign="center">
              الأسئلة
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {mockExam.questions.map((q, idx) => (
              <Paper key={q.id} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 0, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  {idx + 1}. {q.text}
                  <Chip label={`نقاط: ${q.points}`} color="info" size="small" sx={{ ml: 1 }} />
                </Typography>
                {q.type === 'multiple_choice' || q.type === 'true_false' ? (
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                  >
                    {q.options.map((opt, i) => (
                      <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
                    ))}
                  </RadioGroup>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="اكتب إجابتك هنا..."
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 3, px: 3 }}>إلغاء</Button>
              <Button
                variant="contained"
                color="success"
                endIcon={<Done />}
                onClick={handleSubmit}
                sx={{ borderRadius: 99, px: 5, py: 1.2, fontWeight: 'bold', fontSize: 18, boxShadow: '0 4px 16px 0 rgba(63,81,181,0.10)' }}
              >
                تسليم الامتحان
              </Button>
            </Box>
          </Box>
        )}
        {step === 'result' && (
          <ExamResult onClose={onClose} />
        )}
      </Paper>
    </Box>
  );
};

export default FinalExamModal; 