import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { gpaAPI } from '../../services/gpa.service';
import { courseAPI } from '../../services/courseService';

const GPAManagement = () => {
  const [gpas, setGpas] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGPA, setSelectedGPA] = useState(null);
  const [gpaData, setGpaData] = useState({
    student: '',
    course: '',
    gpa: '',
    gpa_scale: '4',
    semester_gpa: '',
    cumulative_gpa: '',
    grade_name: '',
    semester: '',
    academic_year: '',
    notes: '',
  });

  useEffect(() => {
    fetchGPAs();
    fetchCourses();
  }, []);

  const fetchGPAs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gpaAPI.getGPAs();
      const gpasList = response.results || response || [];
      setGpas(gpasList);
    } catch (err) {
      console.error('Error fetching GPAs:', err);
      setError('حدث خطأ في تحميل بيانات الدرجات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getCourses();
      const coursesList = response.results || response || [];
      setCourses(coursesList);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleOpenDialog = (gpa = null) => {
    if (gpa) {
      setSelectedGPA(gpa);
      setGpaData({
        student: gpa.student,
        course: gpa.course || '',
        gpa: gpa.gpa,
        gpa_scale: gpa.gpa_scale || '4',
        semester_gpa: gpa.semester_gpa || '',
        cumulative_gpa: gpa.cumulative_gpa || '',
        grade_name: gpa.grade_name || '',
        semester: gpa.semester || '',
        academic_year: gpa.academic_year || '',
        notes: gpa.notes || '',
      });
    } else {
      setSelectedGPA(null);
      setGpaData({
        student: '',
        course: '',
        gpa: '',
        gpa_scale: '4',
        semester_gpa: '',
        cumulative_gpa: '',
        grade_name: '',
        semester: '',
        academic_year: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGPA(null);
    setGpaData({
      student: '',
      course: '',
      gpa: '',
      semester: '',
      academic_year: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!gpaData.student || !gpaData.gpa) {
        setError('الطالب والدرجة مطلوبان');
        return;
      }

      if (gpaData.gpa < 0 || gpaData.gpa > 5.0) {
        setError('الدرجة يجب أن تكون بين 0 و 5.0');
        return;
      }

      if (gpaData.semester_gpa && (gpaData.semester_gpa < 0 || gpaData.semester_gpa > 5.0)) {
        setError('المعدل الفصلي يجب أن يكون بين 0 و 5.0');
        return;
      }

      if (gpaData.cumulative_gpa && (gpaData.cumulative_gpa < 0 || gpaData.cumulative_gpa > 5.0)) {
        setError('المعدل التراكمي يجب أن يكون بين 0 و 5.0');
        return;
      }

      if (selectedGPA) {
        await gpaAPI.updateGPA(selectedGPA.id, gpaData);
      } else {
        await gpaAPI.createGPA(gpaData);
      }

      await fetchGPAs();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      console.error('Error saving GPA:', err);
      setError(err.response?.data?.error || 'حدث خطأ في حفظ الدرجة');
    }
  };

  const handleDelete = async () => {
    try {
      await gpaAPI.deleteGPA(selectedGPA.id);
      await fetchGPAs();
      setDeleteDialogOpen(false);
      setSelectedGPA(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting GPA:', err);
      setError(err.response?.data?.error || 'حدث خطأ في حذف الدرجة');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return 'success';
    if (gpa >= 3.0) return 'info';
    if (gpa >= 2.5) return 'warning';
    return 'error';
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
          إدارة درجات الطلاب
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          إضافة درجة جديدة
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {gpas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد درجات
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم الطالب</TableCell>
                <TableCell>اسم الدرجة</TableCell>
                <TableCell>الدرجة</TableCell>
                <TableCell>أصل الدرجة</TableCell>
                <TableCell>الكورس</TableCell>
                <TableCell>الفصل الدراسي</TableCell>
                <TableCell>السنة الأكاديمية</TableCell>
                <TableCell>المعدل الفصلي</TableCell>
                <TableCell>المعدل التراكمي</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gpas.map((gpa) => (
                <TableRow key={gpa.id}>
                  <TableCell>{gpa.student_name || gpa.student}</TableCell>
                  <TableCell>{gpa.grade_name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={gpa.gpa}
                      color={getGPAColor(parseFloat(gpa.gpa))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={gpa.gpa_scale || '4'}
                      color="default"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{gpa.course_title || 'عام'}</TableCell>
                  <TableCell>{gpa.semester || '-'}</TableCell>
                  <TableCell>{gpa.academic_year || '-'}</TableCell>
                  <TableCell>{gpa.semester_gpa || '-'}</TableCell>
                  <TableCell>{gpa.cumulative_gpa || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(gpa)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedGPA(gpa);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog لإضافة/تعديل GPA */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGPA ? 'تعديل الدرجة' : 'إضافة درجة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="معرف الطالب"
              value={gpaData.student}
              onChange={(e) => setGpaData({ ...gpaData, student: e.target.value })}
              required
              helperText="أدخل معرف المستخدم للطالب"
            />

            <FormControl fullWidth>
              <InputLabel>الكورس (اختياري)</InputLabel>
              <Select
                value={gpaData.course}
                onChange={(e) => setGpaData({ ...gpaData, course: e.target.value })}
                label="الكورس (اختياري)"
              >
                <MenuItem value="">عام</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="الدرجة"
              type="number"
              value={gpaData.gpa}
              onChange={(e) => setGpaData({ ...gpaData, gpa: e.target.value })}
              required
              inputProps={{ min: 0, max: 5.0, step: 0.01 }}
              helperText="الدرجة يجب أن تكون بين 0 و 5.0"
            />

            <FormControl fullWidth>
              <InputLabel>أصل المعدل</InputLabel>
              <Select
                value={gpaData.gpa_scale}
                onChange={(e) => setGpaData({ ...gpaData, gpa_scale: e.target.value })}
                label="أصل المعدل"
              >
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="المعدل الفصلي (اختياري)"
              type="number"
              value={gpaData.semester_gpa}
              onChange={(e) => setGpaData({ ...gpaData, semester_gpa: e.target.value })}
              inputProps={{ min: 0, max: 5.0, step: 0.01 }}
              helperText="المعدل الفصلي يجب أن يكون بين 0 و 5.0"
            />

            <TextField
              fullWidth
              label="المعدل التراكمي (اختياري)"
              type="number"
              value={gpaData.cumulative_gpa}
              onChange={(e) => setGpaData({ ...gpaData, cumulative_gpa: e.target.value })}
              inputProps={{ min: 0, max: 5.0, step: 0.01 }}
              helperText="المعدل التراكمي يجب أن يكون بين 0 و 5.0"
            />

            <TextField
              fullWidth
              label="اسم الدرجة (اختياري)"
              value={gpaData.grade_name}
              onChange={(e) => setGpaData({ ...gpaData, grade_name: e.target.value })}
              helperText="مثل: امتياز، جيد جداً، جيد، مقبول"
            />

            <TextField
              fullWidth
              label="الفصل الدراسي (اختياري)"
              value={gpaData.semester}
              onChange={(e) => setGpaData({ ...gpaData, semester: e.target.value })}
            />

            <TextField
              fullWidth
              label="السنة الأكاديمية (اختياري)"
              value={gpaData.academic_year}
              onChange={(e) => setGpaData({ ...gpaData, academic_year: e.target.value })}
            />

            <TextField
              fullWidth
              label="ملاحظات (اختياري)"
              multiline
              rows={4}
              value={gpaData.notes}
              onChange={(e) => setGpaData({ ...gpaData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog للحذف */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الدرجة للطالب {selectedGPA?.student_name}؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GPAManagement;

