import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Tooltip, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon, Grade as GradeIcon, Feedback as FeedbackIcon,
  FileUpload as FileUploadIcon, Quiz as QuizIcon, Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon,
  School as SchoolIcon, Book as BookIcon, Warning as WarningIcon,
  Download as DownloadIcon, Visibility as VisibilityIcon, Edit as EditIcon,
  TrendingUp as TrendingUpIcon, AssignmentTurnedIn as AssignmentTurnedInIcon,
  PendingActions as PendingActionsIcon, Cancel as CancelIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import assignmentsAPI from '../../services/assignment.service';
import './Assignments.css';

// Styled Components
const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: 20,
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'submitted' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  }),
  ...(status === 'graded' && {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  }),
  ...(status === 'pending' && {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  }),
  ...(status === 'overdue' && {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  }),
}));

const StudentAssignments = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch assignments from API
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await assignmentsAPI.getAssignments();
        console.log('Fetched assignments:', data);
        
        // Transform the data to match our frontend expectations
        const transformedAssignments = data.results || data || [];
        
        setAssignments(transformedAssignments);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('تعذر تحميل الواجبات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const assignmentStats = {
    totalAssignments: assignments.length,
    submitted: assignments.filter(a => a.submission_status === 'submitted' || a.submission_status === 'graded').length,
    pending: assignments.filter(a => a.submission_status === 'pending' || !a.submission_status).length,
    averageGrade: Math.round(assignments.filter(a => a.grade !== null).reduce((sum, a) => sum + (a.grade || 0), 0) / assignments.filter(a => a.grade !== null).length) || 0,
  };

  const getStatusText = (assignment) => {
    const status = assignment.submission_status;
    const isLate = assignment.is_late;
    
    if (status === 'submitted') return isLate ? 'مُرسل متأخر' : 'مُرسل';
    if (status === 'graded') return 'مُقيم';
    if (status === 'pending' || !status) return 'لم يتم التسليم';
    if (assignment.is_overdue) return 'منتهي الصلاحية';
    return 'غير محدد';
  };

  const getStatusColor = (assignment) => {
    const status = assignment.submission_status;
    const isLate = assignment.is_late;
    
    if (status === 'submitted') return isLate ? 'error' : 'success';
    if (status === 'graded') return 'primary';
    if (status === 'pending' || !status) return 'warning';
    if (assignment.is_overdue) return 'error';
    return 'default';
  };

  const handleAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenDetailsDialog(true);
  };

  const handleSubmitAssignment = (assignmentId) => {
    navigate(`/student/assignments/${assignmentId}/submit`);
  };

  const handleViewGrade = async (assignment) => {
    try {
      // جلب تفاصيل التسليم مع التقييم
      const submissions = await assignmentsAPI.getMySubmissions({ assignment: assignment.id });
      if (submissions && submissions.length > 0) {
        const submission = submissions[0];
        setSelectedGrade({
          assignment: assignment,
          submission: submission
        });
        setOpenGradeDialog(true);
      }
    } catch (error) {
      console.error('Error fetching grade:', error);
    }
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
    if (tabValue === 1) return assignment.submission_status === 'pending' || !assignment.submission_status;
    if (tabValue === 2) return assignment.submission_status === 'submitted' || assignment.submission_status === 'graded';
    if (tabValue === 3) return assignment.is_late || assignment.is_overdue;
    return true;
  });

  const paginatedAssignments = filteredAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Show loading state
  if (loading) {
    return (
      <Box className="assignments-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box className="assignments-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()} variant="contained">
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box className="assignments-container">
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
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
              واجباتي
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            متابعة الواجبات والتسليمات والدرجات
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
          <AssignmentIcon sx={{ color: '#0e5181', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
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
              {assignmentStats.submitted}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              تم التسليم
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
          <PendingActionsIcon sx={{ color: '#f57c00', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {assignmentStats.pending}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              قيد الانتظار
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
          <Tab label="قيد الانتظار" />
          <Tab label="تم التسليم" />
          <Tab label="متأخر" />
        </Tabs>
      </Paper>

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
                  الدرجة
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                  النتيجة
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center' }}>
                  الإجراءات
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAssignments.map((assignment) => {
                const isOverdue = new Date() > new Date(assignment.due_date) && (assignment.submission_status === 'pending' || !assignment.submission_status);
                const status = isOverdue ? 'overdue' : assignment.submission_status;
                
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
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          {assignment.has_questions && (
                            <Chip
                              label={`${assignment.questions_count || 0} سؤال`}
                              size="small"
                              icon={<QuizIcon />}
                              variant="outlined"
                              sx={{ borderColor: '#0e5181', color: '#0e5181', fontSize: '0.7rem' }}
                            />
                          )}
                          {assignment.has_file_upload && (
                            <Chip
                              label="رفع ملف"
                              size="small"
                              icon={<FileUploadIcon />}
                              variant="outlined"
                              sx={{ borderColor: '#2e7d32', color: '#2e7d32', fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box className="table-cell-meta">
                        <SchoolIcon sx={{ color: '#0e5181', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {assignment.course_title || assignment.course?.title}
                        </Typography>
                      </Box>
                      {assignment.module_name || assignment.module?.name && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {assignment.module_name || assignment.module?.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={getStatusText(assignment)}
                        status={status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(assignment.due_date).toLocaleDateString('en-GB')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {new Date(assignment.due_date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color="#2c3e50">
                        {assignment.points} نقطة
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(assignment.submission_status === 'submitted' || assignment.submission_status === 'graded') ? (
                        <Box className="table-progress-container">
                          <Typography variant="body2" fontWeight={600} color="success.main" sx={{ mb: 0.5 }}>
                            {assignment.grade || 0}/{assignment.points}
                          </Typography>
                          <LinearProgress
                            className="table-progress-bar"
                            variant="determinate"
                            value={((assignment.grade || 0) / assignment.points) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #e5978b 0%, #66bb6a 100%)'
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(((assignment.grade || 0) / assignment.points) * 100)}%
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          لم يتم التسليم
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box className="table-cell-actions">
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => handleAssignmentDetails(assignment)}
                            sx={{ 
                              color: '#0e5181',
                              '&:hover': { backgroundColor: 'rgba(103, 58, 183, 0.1)' }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {(assignment.submission_status === 'pending' || !assignment.submission_status) && (
                          <Tooltip title="تسليم الواجب">
                            <IconButton
                              size="small"
                              onClick={() => handleSubmitAssignment(assignment.id)}
                              sx={{
                                color: '#2e7d32',
                                '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' }
                              }}
                            >
                              <AssignmentTurnedInIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {assignment.assignment_file && (
                          <Tooltip title="تحميل الملف">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile('assignment_file', assignment.assignment_file)}
                              sx={{
                                color: '#1976d2',
                                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(assignment.submission_status === 'submitted' || assignment.submission_status === 'graded') && (
                          <Tooltip title="عرض التقييم">
                            <IconButton
                              size="small"
                              onClick={() => handleViewGrade(assignment)}
                              sx={{
                                color: '#f57c00',
                                '&:hover': { backgroundColor: 'rgba(245, 124, 0, 0.1)' }
                              }}
                            >
                              <FeedbackIcon />
                            </IconButton>
                          </Tooltip>
                        )}
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
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: 'white', 
                        p: 3, 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        height: '100%'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <SchoolIcon sx={{ color: '#0e5181' }} />
                          <Typography variant="body1" fontWeight={500} sx={{ textAlign: 'right' }}>
                            المقرر: {selectedAssignment.course_title || selectedAssignment.course?.title}
                          </Typography>
                        </Box>
                        {(selectedAssignment.module_name || selectedAssignment.module?.name) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <BookIcon sx={{ color: '#666' }} />
                            <Typography variant="body1" sx={{ textAlign: 'right' }}>
                              الوحدة: {selectedAssignment.module_name || selectedAssignment.module?.name}
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
                            label={getStatusText(selectedAssignment)}
                            status={selectedAssignment.submission_status || 'pending'}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ textAlign: 'right' }}>
                            الحالة
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                        {selectedAssignment.allow_late_submissions && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <WarningIcon sx={{ color: '#f57c00' }} />
                            <Typography variant="body1" sx={{ textAlign: 'right' }}>
                              يسمح بالتسليم المتأخر (خصم {selectedAssignment.late_submission_penalty}%)
                            </Typography>
                          </Box>
                        )}
                        {selectedAssignment.submission_date && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <AssignmentTurnedInIcon sx={{ color: '#2e7d32' }} />
                            <Typography variant="body1" sx={{ textAlign: 'right' }}>
                              تاريخ التسليم: {new Date(selectedAssignment.submission_date).toLocaleString('ar-SA')}
                            </Typography>
                          </Box>
                        )}
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

                {/* معلومات إضافية */}
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ textAlign: 'right', mb: 2 }}>
                    معلومات إضافية
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: 'white', 
                        p: 2, 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <QuizIcon sx={{ color: '#0e5181', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ textAlign: 'right' }}>
                            عدد الأسئلة: {selectedAssignment.questions_count || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <FileUploadIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ textAlign: 'right' }}>
                            {selectedAssignment.has_file_upload ? 'يسمح برفع ملفات' : 'لا يسمح برفع ملفات'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: 'white', 
                        p: 2, 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PeopleIcon sx={{ color: '#666', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ textAlign: 'right' }}>
                            إجمالي الطلاب: {selectedAssignment.total_students || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <AssignmentTurnedInIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ textAlign: 'right' }}>
                            تم التسليم: {selectedAssignment.submissions_count || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* التقييم */}
                {(selectedAssignment.submission_status === 'submitted' || selectedAssignment.submission_status === 'graded') && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="primary" gutterBottom sx={{ textAlign: 'right', mb: 3 }}>
                        التقييم
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: 'white', 
                        p: 3, 
                        borderRadius: 2, 
                        border: '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                          <Typography variant="h3" fontWeight={700} color="success.main">
                            {selectedAssignment.grade || 0}/{selectedAssignment.points}
                          </Typography>
                          <Typography variant="h5" color="text.secondary">
                            ({Math.round(((selectedAssignment.grade || 0) / selectedAssignment.points) * 100)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={((selectedAssignment.grade || 0) / selectedAssignment.points) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)'
                            }
                          }}
                        />
                        {selectedAssignment.feedback && (
                          <Alert severity="info" sx={{ mt: 3, textAlign: 'right' }}>
                            <Typography variant="body1" fontWeight={500} gutterBottom>
                              ملاحظات المعلم:
                            </Typography>
                            <Typography variant="body2">
                              {selectedAssignment.feedback}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', direction: 'rtl' }}>
              {(selectedAssignment.submission_status === 'pending' || !selectedAssignment.submission_status) && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setOpenDetailsDialog(false);
                    handleSubmitAssignment(selectedAssignment.id);
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
                  تسليم الواجب
                </Button>
              )}
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
      
      {/* Grade Dialog */}
      <Dialog
        open={openGradeDialog}
        onClose={() => setOpenGradeDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 0, overflow: 'hidden' }
        }}
      >
        {selectedGrade && (
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
                <FeedbackIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  تقييم الواجب
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenGradeDialog(false)} sx={{ color: 'white' }}>
                <CancelIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Assignment Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                  <AssignmentIcon sx={{ color: '#0e5181', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedGrade.assignment.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedGrade.assignment.course_title}
                    </Typography>
                  </Box>
                </Box>

                {/* Submission Details */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      تفاصيل التسليم
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarTodayIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="تاريخ التسليم"
                          secondary={new Date(selectedGrade.submission.submitted_at).toLocaleString('en-GB')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <StatusChip
                            label={getStatusText(selectedGrade.assignment, selectedGrade.submission.is_late)}
                            status={selectedGrade.submission.status}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary="الحالة"
                          secondary={selectedGrade.submission.is_late ? 'متأخر' : 'في الوقت المحدد'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      التقييم
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {selectedGrade.submission.grade || 0}/{selectedGrade.assignment.points}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        ({Math.round(((selectedGrade.submission.grade || 0) / selectedGrade.assignment.points) * 100)}%)
                      </Typography>
                    </Box>
                    {selectedGrade.submission.feedback && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body1" fontWeight={500} gutterBottom>
                          ملاحظات المعلم:
                        </Typography>
                        <Typography variant="body2">
                          {selectedGrade.submission.feedback}
                        </Typography>
                      </Alert>
                    )}
                  </Grid>
                </Grid>

                {/* Question Responses */}
                {selectedGrade.submission.question_responses && selectedGrade.submission.question_responses.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        إجاباتك على الأسئلة
                      </Typography>
                      {selectedGrade.submission.question_responses.map((response, index) => (
                        <Box key={response.id || index} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                            السؤال {index + 1}: {response.question_text || 'سؤال'}
                          </Typography>
                          {response.text_answer && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>إجابتك النصية:</strong> {response.text_answer}
                            </Typography>
                          )}
                          {response.selected_answer_text && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>إجابتك المختارة:</strong> {response.selected_answer_text}
                            </Typography>
                          )}
                          {response.file_answer && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                الملف المرفوع:
                              </Typography>
                              <Button 
                                variant="text" 
                                startIcon={<FileUploadIcon />}
                                onClick={() => window.open(response.file_answer, '_blank')}
                                size="small"
                              >
                                عرض الملف
                              </Button>
                            </Box>
                          )}
                          {response.points_earned !== undefined && (
                            <Typography variant="body2" color="success.main" fontWeight={600}>
                              الدرجة المكتسبة: {response.points_earned}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
              <Button
                onClick={() => setOpenGradeDialog(false)}
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

export default StudentAssignments; 