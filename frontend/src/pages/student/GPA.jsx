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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/material';
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
      setError('حدث خطأ في تحميل بيانات GPA');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        سجل GPA
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Average GPA Card */}
      {gpas.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  المعدل التراكمي العام
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {calculateAverageGPA()}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 60, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {gpas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد سجلات GPA متاحة
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الكورس</TableCell>
                <TableCell>الفصل الدراسي</TableCell>
                <TableCell>السنة الأكاديمية</TableCell>
                <TableCell>GPA</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell>آخر تحديث</TableCell>
                <TableCell>التفاصيل</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gpas.map((gpa) => (
                <TableRow key={gpa.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <School fontSize="small" />
                      <Typography>{gpa.course_title || 'عام'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{gpa.semester || '-'}</TableCell>
                  <TableCell>{gpa.academic_year || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={gpa.gpa}
                      color={getGPAColor(parseFloat(gpa.gpa))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(gpa.created_at)}</TableCell>
                  <TableCell>{formatDate(gpa.updated_at)}</TableCell>
                  <TableCell>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2">
                          <History fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          سجل التحديثات
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {gpa.history && gpa.history.length > 0 ? (
                          <Timeline>
                            {gpa.history.map((historyItem, index) => (
                              <TimelineItem key={historyItem.id}>
                                <TimelineSeparator>
                                  <TimelineDot color={getGPAColor(parseFloat(historyItem.new_gpa))} />
                                  {index < gpa.history.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                  <Typography variant="body2" fontWeight="bold">
                                    {historyItem.old_gpa !== null
                                      ? `${historyItem.old_gpa} → ${historyItem.new_gpa}`
                                      : `إنشاء جديد: ${historyItem.new_gpa}`}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {historyItem.changed_by_name || 'نظام'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {formatDate(historyItem.changed_at)}
                                  </Typography>
                                  {historyItem.change_reason && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {historyItem.change_reason}
                                    </Typography>
                                  )}
                                </TimelineContent>
                              </TimelineItem>
                            ))}
                          </Timeline>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            لا توجد تحديثات
                          </Typography>
                        )}
                        {gpa.notes && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              ملاحظات:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {gpa.notes}
                            </Typography>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
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

