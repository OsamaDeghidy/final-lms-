import React, { useState } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, LinearProgress, Chip } from '@mui/material';
import { Quiz, ArrowBack, ArrowForward, Done } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mockQuestions = [
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
];

const ExamTaking = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = mockQuestions[current];
  const total = mockQuestions.length;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAnswers({ ...answers, [q.id]: e.target.value });
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
        {q.type === 'multiple_choice' || q.type === 'true_false' ? (
          <RadioGroup value={answers[q.id] || ''} onChange={handleChange}>
            {q.options.map((opt, i) => (
              <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        ) : (
          <textarea style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #ddd', padding: 12, fontSize: 16 }} placeholder="اكتب إجابتك هنا..." value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>السابق</Button>
          {current < total - 1 ? (
            <Button variant="contained" endIcon={<ArrowForward />} onClick={() => setCurrent(c => c + 1)}>التالي</Button>
          ) : (
            <Button variant="contained" endIcon={<Done />} color="success" onClick={() => navigate('result')}>إنهاء الامتحان</Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ExamTaking; 