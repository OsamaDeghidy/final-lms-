import React from 'react';
import { Box, Typography, Paper, Chip, Button, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip } from '@mui/material';
import { Edit, Delete, Add, Assessment, Quiz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const mockExam = {
  id: 1,
  title: 'الامتحان النهائي - تطوير الويب',
  course: 'تطوير تطبيقات الويب',
  module: 'مشروع التخرج',
  is_final: true,
  is_active: true,
  description: 'امتحان شامل يغطي جميع وحدات الدورة.',
  questions: [
    { id: 1, text: 'ما هو React؟', type: 'multiple_choice', points: 2 },
    { id: 2, text: 'هل HTML لغة برمجة؟', type: 'true_false', points: 1 },
    { id: 3, text: 'اشرح مفهوم SPA.', type: 'short_answer', points: 3 },
  ],
};

const ExamDetail = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>{mockExam.title}</Typography>
          {mockExam.is_final && <Chip label="نهائي" color="success" size="small" sx={{ ml: 2 }} />}
          {mockExam.is_active ? <Chip label="نشط" color="primary" size="small" sx={{ ml: 1 }} /> : <Chip label="معطل" color="default" size="small" sx={{ ml: 1 }} />}
        </Box>
        <Typography variant="subtitle1" color="text.secondary" mb={1}>الدورة: {mockExam.course}</Typography>
        <Typography variant="subtitle2" color="text.secondary" mb={2}>الوحدة: {mockExam.module || '---'}</Typography>
        <Typography variant="body1" mb={2}>{mockExam.description}</Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}><Quiz sx={{ mr: 1 }} /> الأسئلة ({mockExam.questions.length})</Typography>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, fontWeight: 'bold' }}>إضافة سؤال</Button>
        </Box>
        <List>
          {mockExam.questions.map((q) => (
            <ListItem key={q.id} divider>
              <ListItemText
                primary={<Typography fontWeight={600}>{q.text}</Typography>}
                secondary={<>
                  <Chip label={q.type === 'multiple_choice' ? 'اختيار من متعدد' : q.type === 'true_false' ? 'صح أو خطأ' : 'إجابة قصيرة'} size="small" sx={{ mr: 1 }} />
                  <Chip label={`نقاط: ${q.points}`} size="small" color="info" />
                </>}
              />
              <ListItemSecondaryAction>
                <Tooltip title="تعديل"><IconButton><Edit color="warning" /></IconButton></Tooltip>
                <Tooltip title="حذف"><IconButton><Delete color="error" /></IconButton></Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Button variant="outlined" onClick={() => navigate('/teacher/exams')}>عودة للقائمة</Button>
    </Box>
  );
};

export default ExamDetail; 