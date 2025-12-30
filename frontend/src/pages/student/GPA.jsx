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
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { ExpandMore, TrendingUp, School, History } from '@mui/icons-material';
import { gpaAPI } from '../../services/gpa.service';

const GPA = () => {
  const [gpas, setGpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGPAs();
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

  const calculateAverageGPA = () => {
    if (gpas.length === 0) return 0;
    const sum = gpas.reduce((acc, gpa) => acc + parseFloat(gpa.gpa), 0);
    return (sum / gpas.length).toFixed(2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // حساب المعدل الفصلي والتراكمي من السجلات
  const getSemesterGPA = () => {
    if (gpas.length === 0) return null;
    // يمكن تحسين هذا ليعتمد على الفصل الدراسي الحالي
    const latestGPA = gpas[0];
    return latestGPA.semester_gpa || null;
  };

  const getCumulativeGPA = () => {
    if (gpas.length === 0) return null;
    const latestGPA = gpas[0];
    return latestGPA.cumulative_gpa || null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        درجات الطلاب
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* GPA Cards */}
      {gpas.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {getSemesterGPA() !== null && (
            <Card sx={{ flex: 1, minWidth: 200, bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المعدل الفصلي
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {getSemesterGPA()}
                </Typography>
              </CardContent>
            </Card>
          )}
          {getCumulativeGPA() !== null && (
            <Card sx={{ flex: 1, minWidth: 200, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  المعدل التراكمي
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {getCumulativeGPA()}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {gpas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد درجات متاحة
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم الدرجة</TableCell>
                <TableCell>الدرجة</TableCell>
                <TableCell>أصل الدرجة</TableCell>
                <TableCell>الكورس</TableCell>
                <TableCell>الفصل الدراسي</TableCell>
                <TableCell>السنة الأكاديمية</TableCell>
                <TableCell>الملاحظات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gpas.map((gpa) => (
                <TableRow key={gpa.id}>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {gpa.grade_name || '-'}
                    </Typography>
                  </TableCell>
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
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <School fontSize="small" />
                      <Typography>{gpa.course_title || 'عام'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{gpa.semester || '-'}</TableCell>
                  <TableCell>{gpa.academic_year || '-'}</TableCell>
                  <TableCell>
                    {gpa.notes ? (
                      <Typography variant="body2" color="text.secondary">
                        {gpa.notes.length > 50 ? `${gpa.notes.substring(0, 50)}...` : gpa.notes}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default GPA;

