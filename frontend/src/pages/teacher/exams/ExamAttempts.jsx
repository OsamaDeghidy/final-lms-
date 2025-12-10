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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Edit, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';

const ExamAttempts = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [gradeData, setGradeData] = useState({
    manual_grade: '',
    is_grade_visible: false,
  });

  useEffect(() => {
    if (examId) {
      fetchAttempts();
    }
  }, [examId]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await examAPI.getAllExamAttempts(examId);
      const attemptsList = response.results || response || [];
      setAttempts(attemptsList);
    } catch (err) {
      console.error('Error fetching attempts:', err);
      setError('حدث خطأ في تحميل محاولات الاختبار');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeDialog = (attempt) => {
    setSelectedAttempt(attempt);
    setGradeData({
      manual_grade: attempt.manual_grade || attempt.score || '',
      is_grade_visible: attempt.is_grade_visible || false,
    });
    setGradeDialogOpen(true);
  };

  const handleCloseGradeDialog = () => {
    setGradeDialogOpen(false);
    setSelectedAttempt(null);
    setGradeData({
      manual_grade: '',
      is_grade_visible: false,
    });
  };

  const handleGradeSubmit = async () => {
    try {
      if (!gradeData.manual_grade || gradeData.manual_grade < 0 || gradeData.manual_grade > 100) {
        setError('الدرجة يجب أن تكون بين 0 و 100');
        return;
      }

      await examAPI.gradeExamAttempt(selectedAttempt.id, {
        manual_grade: parseFloat(gradeData.manual_grade),
        is_grade_visible: gradeData.is_grade_visible,
      });

      // تحديث القائمة
      await fetchAttempts();
      handleCloseGradeDialog();
      setError(null);
    } catch (err) {
      console.error('Error grading attempt:', err);
      setError(err.response?.data?.error || 'حدث خطأ في تعديل الدرجة');
    }
  };

  const getFinalScore = (attempt) => {
    if (attempt.is_manually_graded && attempt.manual_grade !== null) {
      return attempt.manual_grade;
    }
    return attempt.score || 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          محاولات الاختبار
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          رجوع
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {attempts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد محاولات لهذا الاختبار
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الطالب</TableCell>
                <TableCell>البريد الإلكتروني</TableCell>
                <TableCell>تاريخ البدء</TableCell>
                <TableCell>تاريخ الانتهاء</TableCell>
                <TableCell>الدرجة التلقائية</TableCell>
                <TableCell>الدرجة المعدلة</TableCell>
                <TableCell>الدرجة النهائية</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>ظاهرة للطالب</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts.map((attempt) => {
                const finalScore = getFinalScore(attempt);
                const passed = finalScore >= (attempt.exam?.pass_mark || 60);
                
                return (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      {attempt.user_name || attempt.user?.username || 'غير معروف'}
                    </TableCell>
                    <TableCell>
                      {attempt.user_email || attempt.user?.email || '-'}
                    </TableCell>
                    <TableCell>{formatDate(attempt.start_time)}</TableCell>
                    <TableCell>{formatDate(attempt.end_time)}</TableCell>
                    <TableCell>
                      {attempt.score !== null ? `${attempt.score.toFixed(2)}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {attempt.is_manually_graded && attempt.manual_grade !== null
                        ? `${attempt.manual_grade.toFixed(2)}%`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={passed ? 'success.main' : 'error.main'}
                      >
                        {finalScore.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={passed ? 'ناجح' : 'راسب'}
                        color={passed ? 'success' : 'error'}
                        size="small"
                        icon={passed ? <CheckCircle /> : <Cancel />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={attempt.is_grade_visible ? 'نعم' : 'لا'}
                        color={attempt.is_grade_visible ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="تعديل الدرجة">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenGradeDialog(attempt)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/teacher/exams/${examId}/attempts/${attempt.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog لتعديل الدرجة */}
      <Dialog open={gradeDialogOpen} onClose={handleCloseGradeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل درجة الاختبار</DialogTitle>
        <DialogContent>
          {selectedAttempt && (
            <Box sx={{ mt: 2 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    الطالب
                  </Typography>
                  <Typography variant="h6">
                    {selectedAttempt.user_name || selectedAttempt.user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedAttempt.user_email || selectedAttempt.user?.email}
                  </Typography>
                </CardContent>
              </Card>

              <TextField
                fullWidth
                label="الدرجة التلقائية"
                value={selectedAttempt.score !== null ? selectedAttempt.score.toFixed(2) : '-'}
                disabled
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="الدرجة المعدلة"
                type="number"
                value={gradeData.manual_grade}
                onChange={(e) =>
                  setGradeData({ ...gradeData, manual_grade: e.target.value })
                }
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="الدرجة يجب أن تكون بين 0 و 100"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={gradeData.is_grade_visible}
                    onChange={(e) =>
                      setGradeData({ ...gradeData, is_grade_visible: e.target.checked })
                    }
                  />
                }
                label="إظهار الدرجة للطالب"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGradeDialog}>إلغاء</Button>
          <Button onClick={handleGradeSubmit} variant="contained" color="primary">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamAttempts;

