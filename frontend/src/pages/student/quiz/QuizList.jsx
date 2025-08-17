import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Stack, 
  Chip, 
  CircularProgress, 
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  PlayArrow, 
  History, 
  Timer, 
  School,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.results || response);
      
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('حدث خطأ في تحميل الكويزات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getQuizTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayArrow />;
      case 'module':
        return <School />;
      case 'quick':
        return <Timer />;
      default:
        return <Assignment />;
    }
  };

  const getQuizTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'كويز فيديو';
      case 'module':
        return 'كويز وحدة';
      case 'quick':
        return 'كويز سريع';
      default:
        return 'كويز';
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}/start`);
  };

  const handleViewHistory = (quizId) => {
    navigate(`/student/quiz/${quizId}/history`);
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadQuizzes}>إعادة المحاولة</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
        الكويزات المتاحة
      </Typography>

      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد كويزات متاحة حالياً
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Tooltip title={getQuizTypeLabel(quiz.quiz_type)}>
                      <IconButton size="small" color="primary">
                        {getQuizTypeIcon(quiz.quiz_type)}
                      </IconButton>
                    </Tooltip>
                    <Typography variant="h6" fontWeight={600}>
                      {quiz.title}
                    </Typography>
                  </Stack>

                  {quiz.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {quiz.description}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                    {quiz.course && (
                      <Chip 
                        label={quiz.course.title} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {quiz.module && (
                      <Chip 
                        label={quiz.module.name} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    )}
                    {quiz.time_limit && (
                      <Chip 
                        label={`${quiz.time_limit} دقيقة`} 
                        size="small" 
                        color="info" 
                        variant="outlined"
                        icon={<Timer />}
                      />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      نسبة النجاح:
                    </Typography>
                    <Chip 
                      label={`${quiz.pass_mark}%`} 
                      size="small" 
                      color={quiz.pass_mark >= 60 ? 'success' : 'warning'}
                    />
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartQuiz(quiz.id)}
                      sx={{ flex: 1 }}
                    >
                      بدء الكويز
                    </Button>
                    <Tooltip title="عرض المحاولات السابقة">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewHistory(quiz.id)}
                      >
                        <History />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default QuizList;
