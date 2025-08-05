import React from 'react';
import { Box, Typography, Paper, Button, Chip, LinearProgress } from '@mui/material';
import { EmojiEvents, Assessment } from '@mui/icons-material';

const mockResult = {
  score: 78,
  pass_mark: 60,
  passed: true,
  total_points: 100,
  correct: 7,
  total: 10,
};

const ExamResult = ({ result = mockResult, onRetry, onClose }) => {
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 48, color: result.passed ? 'success.main' : 'error.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={2}>نتيجة الامتحان الشامل</Typography>
        <Chip label={result.passed ? 'ناجح' : 'راسب'} color={result.passed ? 'success' : 'error'} sx={{ mb: 2, fontSize: 18 }} />
        <Typography variant="h4" fontWeight={800} color={result.passed ? 'success.main' : 'error.main'} mb={2}>{result.score} / {result.total_points}</Typography>
        <LinearProgress variant="determinate" value={result.score} sx={{ mb: 2, height: 10, borderRadius: 2 }} />
        <Typography variant="body1" mb={2}>عدد الإجابات الصحيحة: {result.correct} من {result.total}</Typography>
        {result.passed ? (
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, mt: 2 }} onClick={onClose}>
            اكتمال
          </Button>
        ) : (
          <Button variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, mt: 2 }} onClick={onRetry || (() => window.location.reload())}>
            إعادة المحاولة
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default ExamResult; 