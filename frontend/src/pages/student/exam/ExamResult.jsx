import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, LinearProgress, CircularProgress, Alert } from '@mui/material';
import { EmojiEvents, Assessment, CheckCircle, Close } from '@mui/icons-material';
import { examAPI } from '../../../services/exam.service';

const ExamResult = ({ examId, attemptId, onRetry, onClose }) => {
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (attemptId) {
      loadExamResult();
    }
  }, [attemptId]);

  const loadExamResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!attemptId) {
        setError('لم يتم العثور على معرف المحاولة.');
        return;
      }
      
      // Get exam attempt result
      const attemptResult = await examAPI.getExamAttemptResult(attemptId);
      setResult(attemptResult);
      
      // Get exam attempt answers with correct answers
      const answersData = await examAPI.getExamAttemptResultAnswers(attemptId);
      setAnswers(answersData.results || answersData);
      
    } catch (err) {
      console.error('Error loading exam result:', err);
      setError('حدث خطأ في تحميل نتيجة الامتحان. يرجى المحاولة مرة أخرى.');
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
      <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadExamResult}>إعادة المحاولة</Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="warning">لا توجد بيانات متاحة للنتيجة</Alert>
      </Box>
    );
  }

  const score = result.score || 0;
  const passMark = result.exam?.pass_mark || 60;
  const passed = score >= passMark;
  const totalPoints = result.exam?.total_points || 100;
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Result Summary */}
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 48, color: passed ? 'success.main' : 'error.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
          نتيجة الامتحان
        </Typography>
        <Chip label={passed ? 'ناجح' : 'راسب'} color={passed ? 'success' : 'error'} sx={{ mb: 2, fontSize: 18 }} />
        <Typography variant="h4" fontWeight={800} color={passed ? 'success.main' : 'error.main'} mb={2}>
          {score.toFixed(1)}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={score} 
          sx={{ 
            mb: 2, 
            height: 10, 
            borderRadius: 2,
            '& .MuiLinearProgress-bar': {
              backgroundColor: passed ? 'success.main' : 'error.main'
            }
          }} 
        />
        <Typography variant="body1" mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
          الدرجة: {score.toFixed(1)} من {totalPoints}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
          درجة النجاح: {passMark}%
        </Typography>
        {passed ? (
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, mt: 2 }} onClick={onClose}>
            اكتمال
          </Button>
        ) : (
          <Button variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, mt: 2 }} onClick={onRetry || (() => window.location.reload())}>
            إعادة المحاولة
          </Button>
        )}
      </Paper>

      {/* Detailed Answers Review */}
      {answers && answers.length > 0 && (
        <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3} sx={{ direction: 'rtl', textAlign: 'center' }}>
            مراجعة الإجابات
          </Typography>
          {answers.map((answer, index) => (
            <Box key={answer.id || index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1} sx={{ direction: 'rtl', textAlign: 'right' }}>
                السؤال {index + 1}: {answer.question?.text}
              </Typography>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ direction: 'rtl', textAlign: 'right' }}>
                  إجابتك:
                </Typography>
                <Typography variant="body1" sx={{ 
                  direction: 'rtl', 
                  textAlign: 'right',
                  p: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  mb: 1
                }}>
                  {answer.text_answer || answer.selected_answer?.text || 'لم تجب على هذا السؤال'}
                </Typography>
              </Box>

              {answer.question?.question_type !== 'short_answer' && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ direction: 'rtl', textAlign: 'right' }}>
                    الإجابة الصحيحة:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    direction: 'rtl', 
                    textAlign: 'right',
                    p: 1,
                    bgcolor: answer.is_correct ? 'success.light' : 'error.light',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    {answer.question?.answers?.find(a => a.is_correct)?.text || 'غير محدد'}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip 
                  label={answer.is_correct ? 'صحيح' : 'خاطئ'} 
                  color={answer.is_correct ? 'success' : 'error'} 
                  size="small" 
                />
                <Typography variant="body2" color="text.secondary">
                  النقاط: {answer.points_earned || 0} / {answer.question?.points || 0}
                </Typography>
              </Box>

              {answer.feedback && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ direction: 'rtl', textAlign: 'right' }}>
                    ملاحظات:
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    direction: 'rtl', 
                    textAlign: 'right',
                    p: 1,
                    bgcolor: 'info.light',
                    borderRadius: 1
                  }}>
                    {answer.feedback}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      )}
      
      {/* Back Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold' }}
        >
          العودة
        </Button>
      </Box>
    </Box>
  );
};

export default ExamResult; 