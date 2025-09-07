import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Snackbar, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Tooltip, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import {
  Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon, Grade as GradeIcon, Feedback as FeedbackIcon,
  FileUpload as FileUploadIcon, Quiz as QuizIcon, Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon,
  School as SchoolIcon, Book as BookIcon, Warning as WarningIcon,
  Download as DownloadIcon, Visibility as VisibilityIcon, Edit as EditIcon,
  TrendingUp as TrendingUpIcon, AssignmentTurnedIn as AssignmentTurnedInIcon,
  PendingActions as PendingActionsIcon, Cancel as CancelIcon, Add as AddIcon,
  People as PeopleIcon, Assessment as AssessmentIcon, Create as CreateIcon,
  Delete as DeleteIcon, Archive as ArchiveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import './Assignments.css';
import assignmentsAPI from '../../services/assignment.service';

// Styled Components
const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: 20,
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'active' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  }),
  ...(status === 'inactive' && {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  }),
  ...(status === 'draft' && {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  }),
}));

const TeacherAssignments = () => {
  const [tabValue, setTabValue] = useState(0);
  // Removed create dialog; use page route instead
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await assignmentsAPI.getAssignments();
        console.log('Assignments API response:', data);
        
        // The API now returns properly formatted data with statistics
        const items = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
        
        // Data should already be normalized from the backend
        setAssignments(items);
        setSnackbar({ 
          open: true, 
          message: `تم تحميل ${items.length} واجب بنجاح`, 
          severity: 'success' 
        });
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setSnackbar({ 
          open: true, 
          message: `تعذر تحميل الواجبات: ${err?.response?.data?.detail || err.message}`, 
          severity: 'error' 
        });
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const assignmentStats = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter(a => a.is_active).length,
    totalSubmissions: assignments.reduce((sum, a) => sum + a.submissions_count, 0),
    totalGraded: assignments.reduce((sum, a) => sum + a.graded_count, 0),
    averageGrade: Math.round(assignments.filter(a => a.average_grade > 0).reduce((sum, a) => sum + a.average_grade, 0) / assignments.filter(a => a.average_grade > 0).length),
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'draft': return 'مسودة';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const handleCreateAssignment = () => {
    navigate('/teacher/assignments/new');
  };

  const handleAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenDetailsDialog(true);
  };

  const handleEditAssignment = (assignmentId) => {
    navigate(`/teacher/assignments/${assignmentId}/edit`);
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/teacher/assignments/${assignmentId}/submissions`);
  };

  const handleManageQuestions = (assignmentId) => {
    navigate(`/teacher/assignments/${assignmentId}/questions`);
  };

  const handleDownloadFile = async (fileName, fileUrl) => {
    try {
      if (!fileUrl) {
        console.error('No file URL provided');
        return;
      }

      // Ensure the URL is absolute
      let downloadUrl = fileUrl;
      if (!fileUrl.startsWith('http')) {
        downloadUrl = `http://localhost:8000${fileUrl}`;
      }

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'assignment_file';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Downloading file:', fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (tabValue === 0) return true; // All assignments
    if (tabValue === 1) return assignment.is_active;
    if (tabValue === 2) return !assignment.is_active;
    if (tabValue === 3) return assignment.submissions_count > 0;
    return true;
  });

  const paginatedAssignments = filteredAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box className="assignments-container">
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          width: 100, 
          height: 100, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -30, 
          left: -30, 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.08)',
          zIndex: 1
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              إدارة الواجبات
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            إنشاء وإدارة الواجبات ومتابعة تسليمات الطلاب
          </Typography>
        </Box>
      </Box>

      {/* Compact Statistics Row */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <AssignmentIcon sx={{ color: '#ff6b6b', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {assignmentStats.totalAssignments}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي الواجبات
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <AssignmentTurnedInIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {assignmentStats.activeAssignments}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              واجبات نشطة
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <PeopleIcon sx={{ color: '#1976d2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {assignmentStats.totalSubmissions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي التسليمات
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <TrendingUpIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              {assignmentStats.averageGrade}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              متوسط الدرجات
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper className="assignments-tabs">
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab label="جميع الواجبات" />
          <Tab label="نشطة" />
          <Tab label="منتهية" />
          <Tab label="لها تسليمات" />
        </Tabs>
      </Paper>

      {/* Create Assignment Button - Fixed (navigates to page) */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={handleCreateAssignment}
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
            boxShadow: '0 4px 20px rgba(14, 81, 129, 0.3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
              boxShadow: '0 6px 25px rgba(14, 81, 129, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {/* Assignments Table */}
      <Paper className="assignments-table" sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  عنوان الواجب
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  المقرر
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  الحالة
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  تاريخ التسليم
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  التسليمات
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  معدل التسليم
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  الدرجة
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center' }}>
                  الإجراءات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAssignments.map((assignment) => {
          const status = assignment.is_active ? 'active' : 'inactive';
          const submissionRate = assignment.total_students > 0 ? (assignment.submissions_count / assignment.total_students) * 100 : 0;
          
          return (
                  <TableRow 
                    key={assignment.id}
                sx={{
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box className="table-cell-content">
                        <Typography className="table-cell-title" variant="subtitle1" fontWeight={600} color="#2c3e50" sx={{ mb: 0.5 }}>
                          {assignment.title}
                        </Typography>
                        <Typography className="table-cell-description" variant="body2" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 200
                        }}>
                          {assignment.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className="table-cell-meta">
                        <SchoolIcon sx={{ color: '#ff6b6b', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {assignment.course_title}
                        </Typography>
                      </Box>
                      {assignment.module_name && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {assignment.module_name}
                      </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                        <StatusChip
                          label={getStatusText(status)}
                          status={status}
                          size="small"
                        />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(assignment.due_date).toLocaleDateString('en-GB')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {assignment.submissions_count} / {assignment.total_students}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignment.graded_count} تم التصحيح
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className="table-progress-container">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(submissionRate)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          className="table-progress-bar"
                          variant="determinate"
                          value={submissionRate}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color="#2c3e50">
                        {assignment.points} نقطة
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="table-cell-actions">
                        <Tooltip title="عرض التفاصيل">
                      <IconButton
                        size="small"
                        onClick={() => handleAssignmentDetails(assignment)}
                        sx={{ 
                          color: '#ff6b6b',
                          '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل الواجب">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAssignment(assignment.id)}
                        sx={{ 
                          color: '#0e5181',
                          '&:hover': { backgroundColor: 'rgba(103, 58, 183, 0.1)' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                        </Tooltip>
                        <Tooltip title="تصحيح الواجبات">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSubmissions(assignment.id)}
                            sx={{
                              color: '#2e7d32',
                              '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' }
                            }}
                          >
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="إدارة الأسئلة">
                          <IconButton
                          size="small"
                          onClick={() => handleManageQuestions(assignment.id)}
                          sx={{
                            color: '#e5978b',
                              '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                            }}
                          >
                            <QuizIcon />
                          </IconButton>
                        </Tooltip>
                  </Box>
                    </TableCell>
                  </TableRow>
          );
        })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAssignments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="صفوف في الصفحة:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
          sx={{
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0'
          }}
        />
      </Paper>

      {/* Snackbar */}
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

      {/* Assignment Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4, 
            p: 0, 
            overflow: 'hidden',
            direction: 'rtl'
          }
        }}
      >
        {selectedAssignment && (
          <>
                    <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: 'primary.main', 
          color: 'white', 
          py: 3, 
          px: 4 
        }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  تفاصيل الواجب
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenDetailsDialog(false)} sx={{ color: 'white' }}>
                <CancelIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa', direction: 'rtl' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* العنوان والوصف */}
                <Box>
                  <Typography variant="h5" fontWeight={600} color="primary" sx={{ mb: 2, textAlign: 'right' }}>
                    {selectedAssignment.title}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: '#666', 
                    lineHeight: 1.8, 
                    textAlign: 'right',
                    backgroundColor: 'white',
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    minHeight: 80
                  }}>
                    {selectedAssignment.description || 'لا يوجد وصف للواجب'}
                  </Typography>
                </Box>

                <Divider />

                {/* معلومات الواجب الأساسية */}
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ textAlign: 'right', mb: 2 }}>
                    معلومات الواجب
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: 'white', 
                        p: 3, 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        height: '100%'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <SchoolIcon sx={{ color: '#ff6b6b' }} />
                          <Typography variant="body1" fontWeight={500} sx={{ textAlign: 'right' }}>
                            المقرر: {selectedAssignment.course_title}
                          </Typography>
                        </Box>
                        {selectedAssignment.module_name && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <BookIcon sx={{ color: '#666' }} />
                            <Typography variant="body1" sx={{ textAlign: 'right' }}>
                              الوحدة: {selectedAssignment.module_name}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <GradeIcon sx={{ color: '#666' }} />
                          <Typography variant="body1" sx={{ textAlign: 'right' }}>
                            الدرجة: {selectedAssignment.points} نقطة
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <StatusChip
                            label={getStatusText(selectedAssignment.is_active ? 'active' : 'inactive')}
                            status={selectedAssignment.is_active ? 'active' : 'inactive'}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ textAlign: 'right' }}>
                            الحالة
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: 'white', 
                        p: 3, 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        height: '100%'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <CalendarTodayIcon sx={{ color: '#666' }} />
                          <Typography variant="body1" sx={{ textAlign: 'right' }}>
                            تاريخ التسليم: {new Date(selectedAssignment.due_date).toLocaleString('ar-SA')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <PeopleIcon sx={{ color: '#666' }} />
                          <Typography variant="body1" sx={{ textAlign: 'right' }}>
                            عدد الطلاب: {selectedAssignment.total_students}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <AssignmentTurnedInIcon sx={{ color: '#2e7d32' }} />
                          <Typography variant="body1" sx={{ textAlign: 'right' }}>
                            التسليمات: {selectedAssignment.submissions_count}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <AccessTimeIcon sx={{ color: '#666' }} />
                          <Typography variant="body1" sx={{ textAlign: 'right' }}>
                            تاريخ الإنشاء: {new Date(selectedAssignment.created_at).toLocaleString('ar-SA')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* إحصائيات الواجب */}
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ textAlign: 'right', mb: 3 }}>
                    إحصائيات الواجب
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid xs={12} md={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {selectedAssignment.submissions_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          إجمالي التسليمات
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} md={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {selectedAssignment.graded_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          تم التصحيح
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} md={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {selectedAssignment.submissions_count - selectedAssignment.graded_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          في انتظار التصحيح
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} md={3}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        backgroundColor: 'white', 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="h4" fontWeight={700} color="secondary.main">
                          {selectedAssignment.average_grade > 0 ? selectedAssignment.average_grade.toFixed(1) : 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          متوسط الدرجات
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* معدل التسليم */}
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ textAlign: 'right', mb: 2 }}>
                    معدل التسليم
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'white', 
                    p: 3, 
                    borderRadius: 2, 
                    border: '1px solid #e0e0e0'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                        {selectedAssignment.total_students > 0 ? Math.round((selectedAssignment.submissions_count / selectedAssignment.total_students) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAssignment.submissions_count} من {selectedAssignment.total_students} طالب
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={selectedAssignment.total_students > 0 ? (selectedAssignment.submissions_count / selectedAssignment.total_students) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', direction: 'rtl' }}>
              <Button
                variant="contained"
                onClick={() => {
                  setOpenDetailsDialog(false);
                  handleViewSubmissions(selectedAssignment.id);
                }}
                sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  py: 1.5, 
                  fontWeight: 700, 
                  background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)' 
                  } 
                }}
              >
                تصحيح الواجبات
              </Button>
              <Button
                onClick={() => setOpenDetailsDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 4, py: 1.5, borderColor: '#9e9e9e', color: '#9e9e9e', fontWeight: 600 }}
              >
                إغلاق
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TeacherAssignments; 