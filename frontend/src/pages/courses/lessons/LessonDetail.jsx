import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, IconButton, Paper, Divider, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';

const Wrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
}));

const LessonDetail = () => {
  const navigate = useNavigate();
  const { courseId, unitId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const moduleData = await contentAPI.getModuleById(unitId);
        const item = (moduleData?.lessons || []).find((l) => String(l.id) === String(lessonId));
        setLesson(item || null);
      } catch (e) {
        setError('تعذر تحميل الدرس');
      }
    };
    fetch();
  }, [unitId, lessonId]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>تفاصيل الدرس</Typography>
      </Box>
      <Wrapper>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {lesson ? (
          <>
            <Typography variant="h6" fontWeight={700} gutterBottom>{lesson.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip size="small" label={lesson.lesson_type} />
              <Chip size="small" label={`${lesson.duration_minutes || 0} دقيقة`} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" dir="rtl" sx={{ whiteSpace: 'pre-wrap' }}>
              {lesson.content || 'لا يوجد محتوى'}
            </Typography>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">لا يوجد درس.</Typography>
        )}
      </Wrapper>
    </Container>
  );
};

export default LessonDetail;


