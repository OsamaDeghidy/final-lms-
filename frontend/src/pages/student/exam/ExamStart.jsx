import React from 'react';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { Assessment, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mockExam = {
  id: 1,
  title: 'الامتحان النهائي - تطوير الويب',
  description: 'امتحان شامل يغطي جميع وحدات الدورة. لديك 60 دقيقة للإجابة.',
  time_limit: 60,
  pass_mark: 60,
  total_points: 100,
};

const ExamStart = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={2}>{mockExam.title}</Typography>
        <Typography variant="body1" mb={2}>{mockExam.description}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Chip label={`المدة: ${mockExam.time_limit} دقيقة`} color="info" />
          <Chip label={`درجة النجاح: ${mockExam.pass_mark}%`} color="success" />
          <Chip label={`الدرجة الكلية: ${mockExam.total_points}`} color="primary" />
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          size="large"
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 5, py: 1.5 }}
          onClick={() => navigate('taking')}
        >
          بدء الامتحان
        </Button>
      </Paper>
    </Box>
  );
};

export default ExamStart; 