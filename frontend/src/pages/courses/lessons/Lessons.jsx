import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Button,
  Grid,
  Divider,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  AddchartRounded,
  AddCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import LessonForm from './LessonForm';
import contentAPI from '../../../services/content.service';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `1px solid ${theme.palette.divider}`,
}));

const LessonCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '10px',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  }
}));

const Lessons = () => {
  const navigate = useNavigate();
  const { courseId, unitId } = useParams();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetLesson, setTargetLesson] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contentAPI.getModuleById(unitId);
        setModule(data);
      } catch (e) {
        setError('تعذر تحميل الدروس');
      } finally {
        setLoading(false);
      }
    };
    if (unitId) fetchModule();
  }, [unitId]);

  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

  const askDelete = (lesson) => {
    setTargetLesson(lesson);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!targetLesson) return;
    setDeleting(true);
    try {
      await contentAPI.deleteLesson(targetLesson.id);
      setModule((prev) => ({
        ...prev,
        lessons: (prev?.lessons || []).filter((l) => l.id !== targetLesson.id),
      }));
      setSnackbar({ open: true, message: 'تم حذف الدرس بنجاح', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'تعذر حذف الدرس', severity: 'error' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setTargetLesson(null);
    }
  };

  const getTypeIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'video':
        return <VideoIcon fontSize="small" />;
      case 'quiz':
        return <QuizIcon fontSize="small" />;
      default:
        return <ArticleIcon fontSize="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(`/teacher/courses/${courseId}/units`)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>دروس الوحدة</Typography>
            <Typography variant="body2" color="text.secondary">
              {module?.name || module?.title || ''}
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddCircle />} size="large" sx={{ mb: 2 }} onClick={() => navigate(`/teacher/courses/${courseId}/units/${unitId}/lessons/create`)}>
          إضافة درس
        </Button>
      </Box>

      <StyledPaper>
        {loading && (
          <Box sx={{ py: 3 }}>
            <LinearProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {!loading && !error && (
          lessons.length > 0 ? (
            <Grid container spacing={2}>
              {lessons.map((lesson) => (
                <Grid item xs={12} md={6} key={lesson.id}>
                  <LessonCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        {getTypeIcon(lesson.lesson_type)}
                        <Typography variant="subtitle1" fontWeight={600} dir="rtl">
                          {lesson.title}
                        </Typography>
                        {lesson.is_free && <Chip size="small" label="معاينة" color="primary" variant="outlined" />}
                      </Box>
                      <Box>
                        <Tooltip title="عرض">
                          <IconButton size="small" onClick={() => navigate(`/teacher/courses/${courseId}/units/${unitId}/lessons/${lesson.id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton size="small" onClick={() => navigate(`/teacher/courses/${courseId}/units/${unitId}/lessons/${lesson.id}/edit`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton size="small" color="error" onClick={() => askDelete(lesson)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {lesson.duration_minutes || 0} دقيقة
                        </Typography>
                      </Box>
                      <Chip size="small" label={lesson.lesson_type || 'article'} variant="outlined" />
                    </Box>
                  </LessonCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">لا توجد دروس في هذه الوحدة حتى الآن.</Typography>
          )
        )}
      </StyledPaper>

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          هل أنت متأكد من حذف الدرس: {targetLesson?.title}؟ هذا الإجراء لا يمكن التراجع عنه.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>إلغاء</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Lessons;


