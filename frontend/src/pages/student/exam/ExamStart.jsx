import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { Assessment, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';

const ExamStart = ({ examId, onStart, onClose }) => {
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const examData = await examAPI.getExam(examId);
      setExam(examData);
      
    } catch (err) {
      console.error('Error loading exam:', err);
      setError('حدث خطأ في تحميل الامتحان. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      const attemptData = await examAPI.startExamAttempt(examId);
      if (onStart) {
        onStart(attemptData.id);
      } else {
        navigate('taking');
      }
    } catch (err) {
      console.error('Error starting exam:', err);
      setError('حدث خطأ في بدء الامتحان. يرجى المحاولة مرة أخرى.');
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
      <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadExam}>إعادة المحاولة</Button>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="warning">لا توجد بيانات متاحة للامتحان</Alert>
      </Box>
    );
  }
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={2}>{exam.title}</Typography>
        <Typography variant="body1" mb={2}>{exam.description || 'امتحان شامل يغطي محتوى الدورة'}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {exam.time_limit && (
            <Chip label={`المدة: ${exam.time_limit} دقيقة`} color="info" />
          )}
          {exam.pass_mark && (
            <Chip label={`درجة النجاح: ${exam.pass_mark}%`} color="success" />
          )}
          {exam.total_points && (
            <Chip label={`الدرجة الكلية: ${exam.total_points}`} color="primary" />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          size="large"
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 5, py: 1.5 }}
          onClick={handleStart}
        >
          بدء الامتحان
        </Button>
      </Paper>
    </Box>
  );
};

export default ExamStart; 