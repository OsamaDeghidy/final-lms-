import React from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, IconButton, Grid, Tooltip, Chip, Stack } from '@mui/material';
import { Add, Edit, Delete, Visibility, Quiz } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const mockQuizzes = [
  {
    id: 1,
    title: 'كويز الوحدة الأولى',
    type: 'module',
    module: 'مقدمة في تطوير الويب',
    course: 'دورة تطوير تطبيقات الويب المتقدمة',
    questions: 10,
    time_limit: 20,
    pass_mark: 60,
    is_active: true,
  },
  {
    id: 2,
    title: 'كويز فيديو: Flexbox',
    type: 'video',
    module: 'CSS المتقدم',
    course: 'دورة تطوير تطبيقات الويب المتقدمة',
    questions: 5,
    time_limit: 10,
    pass_mark: 50,
    is_active: false,
  },
  {
    id: 3,
    title: 'كويز سريع',
    type: 'quick',
    module: 'جافاسكريبت الحديثة',
    course: 'دورة تطوير تطبيقات الويب المتقدمة',
    questions: 7,
    time_limit: 7,
    pass_mark: 70,
    is_active: true,
  },
];

const QuizzesList = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          إدارة الكويزات
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 3, py: 1.2 }}
          onClick={() => navigate('/teacher/quizzes/create')}
        >
          إضافة كويز جديد
        </Button>
      </Box>
      <Grid container spacing={3}>
        {mockQuizzes.map((quiz) => (
          <Grid item xs={12} md={6} lg={4} key={quiz.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative', overflow: 'visible' }}>
              <Box sx={{ position: 'absolute', top: -28, right: 16, bgcolor: 'primary.main', borderRadius: '50%', p: 1 }}>
                <Quiz sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
                  <Chip label={quiz.type === 'video' ? 'فيديو' : quiz.type === 'module' ? 'وحدة' : 'سريع'} size="small" color="secondary" />
                  {!quiz.is_active && <Chip label="غير نشط" size="small" color="warning" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  الكورس: {quiz.course}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  الوحدة: {quiz.module}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  عدد الأسئلة: {quiz.questions} | الزمن: {quiz.time_limit} دقيقة | النجاح: {quiz.pass_mark}%
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pb: 2 }}>
                <Tooltip title="عرض التفاصيل">
                  <IconButton color="primary" onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}>
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Tooltip title="تعديل الكويز">
                  <IconButton color="secondary" onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="حذف الكويز">
                  <IconButton color="error">
                    <Delete />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuizzesList; 