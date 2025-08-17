import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Visibility, 
  Refresh,
  CheckCircle,
  Close,
  Schedule
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizHistory = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizHistory();
  }, [quizId]);

  const loadQuizHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get quiz details
      const quizData = await quizAPI.getQuiz(quizId);
      setQuiz(quizData);
      
      // Get user's attempts for this quiz
      const attemptsData = await quizAPI.getUserQuizAttempts({ quiz: quizId });
      setAttempts(attemptsData.results || attemptsData);
      
    } catch (err) {
      console.error('Error loading quiz history:', err);
      setError('حدث خطأ في تحميل تاريخ الكويز. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'لم ينته بعد';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} دقيقة`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} ساعة و ${mins} دقيقة`;
    }
  };

  const handleViewResult = (attemptId) => {
    navigate(`/student/quiz/${quizId}/result/${attemptId}`);
  };

  const handleRetakeQuiz = () => {
    navigate(`/student/quiz/${quizId}/start`);
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
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadQuizHistory}>إعادة المحاولة</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          تاريخ الكويز: {quiz?.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadQuizHistory}
        >
          تحديث
        </Button>
      </Stack>

      {attempts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            لا توجد محاولات سابقة لهذا الكويز
          </Typography>
          <Button
            variant="contained"
            onClick={handleRetakeQuiz}
          >
            بدء الكويز
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المحاولة</TableCell>
                  <TableCell>تاريخ البدء</TableCell>
                  <TableCell>تاريخ الانتهاء</TableCell>
                  <TableCell>المدة</TableCell>
                  <TableCell>النتيجة</TableCell>
                  <TableCell>الحالة</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.map((attempt, index) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        المحاولة {attempt.attempt_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(attempt.start_time)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {attempt.end_time ? formatDate(attempt.end_time) : 'لم ينته بعد'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(attempt.start_time, attempt.end_time)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {attempt.score !== null ? (
                        <Chip
                          label={`${attempt.score.toFixed(1)}%`}
                          color={attempt.score >= (quiz?.pass_mark || 60) ? 'success' : 'error'}
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="لم يتم التصحيح"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {attempt.passed === null ? (
                        <Chip
                          label="قيد التصحيح"
                          color="warning"
                          size="small"
                          icon={<Schedule />}
                        />
                      ) : attempt.passed ? (
                        <Chip
                          label="ناجح"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip
                          label="راسب"
                          color="error"
                          size="small"
                          icon={<Close />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض النتيجة">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewResult(attempt.id)}
                            disabled={attempt.score === null}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {!attempt.end_time && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/student/quiz/${quizId}/start`)}
                          >
                            استكمال
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={handleRetakeQuiz}
            >
              محاولة جديدة
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/student/quiz')}
            >
              العودة للكويزات
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default QuizHistory;
