import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit, Delete, Visibility, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await examAPI.getExams();
      setExams(response.results || response);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('حدث خطأ في تحميل الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    try {
      await examAPI.deleteExam(examId);
      setExams(exams.filter(exam => exam.id !== examId));
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('حدث خطأ في حذف الامتحان');
    }
  };

  const openDeleteDialog = (exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} /> إدارة الامتحانات الشاملة
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
          onClick={() => navigate('/teacher/exams/create')}
        >
          إضافة امتحان جديد
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>العنوان</TableCell>
                <TableCell>الدورة</TableCell>
                <TableCell>الوحدة</TableCell>
                <TableCell>نهائي؟</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary">
                      لا توجد امتحانات متاحة
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id} hover>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.course?.title || '---'}</TableCell>
                    <TableCell>{exam.module?.name || '---'}</TableCell>
                    <TableCell>
                      {exam.is_final ? (
                        <Chip label="نهائي" color="success" size="small" />
                      ) : (
                        <Chip label="عادي" color="info" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {exam.is_active ? (
                        <Chip label="نشط" color="primary" size="small" />
                      ) : (
                        <Chip label="معطل" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(exam.created_at)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض التفاصيل">
                        <IconButton onClick={() => navigate(`/teacher/exams/${exam.id}`)}>
                          <Visibility color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}>
                          <Edit color="warning" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton onClick={() => openDeleteDialog(exam)}>
                          <Delete color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الامتحان "{examToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={() => handleDelete(examToDelete?.id)} 
            color="error" 
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamList; 