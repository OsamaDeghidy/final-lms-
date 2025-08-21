import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Divider, List, ListItem, ListItemText,
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
  PendingActions as PendingActionsIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Sample data based on the Django model
  const assignments = [
    {
      id: 1,
      title: 'واجب الرياضيات - الجبر الخطي',
      description: 'حل مسائل من 1 إلى 10 في الكتاب مع شرح الخطوات بالتفصيل.',
      course: 'الرياضيات 101',
      module: 'الجبر الخطي',
      due_date: '2024-01-25T23:59:00',
      points: 100,
      allow_late_submissions: true,
      late_submission_penalty: 10,
      has_questions: true,
      has_file_upload: true,
      assignment_file: 'math_assignment.pdf',
      is_active: true,
      created_at: '2024-01-15T10:00:00',
      status: 'submitted',
      grade: 95,
      feedback: 'عمل ممتاز! الحلول واضحة ومنظمة.',
      is_late: false,
      submission_date: '2024-01-24T15:30:00',
      questions_count: 5,
      total_points: 100,
      earned_points: 95,
    },
    {
      id: 2,
      title: 'تقرير العلوم - دورة الماء',
      description: 'إعداد تقرير شامل عن دورة الماء في الطبيعة مع الرسوم التوضيحية.',
      course: 'العلوم البيئية',
      module: 'دورة الماء',
      due_date: '2024-01-28T23:59:00',
      points: 150,
      allow_late_submissions: false,
      late_submission_penalty: 0,
      has_questions: false,
      has_file_upload: true,
      assignment_file: 'science_report_guide.pdf',
      is_active: true,
      created_at: '2024-01-18T14:00:00',
      status: 'pending',
      grade: null,
      feedback: '',
      is_late: false,
      submission_date: null,
      questions_count: 0,
      total_points: 150,
      earned_points: 0,
    },
    {
      id: 3,
      title: 'موضوع تعبير - العطلة الصيفية',
      description: 'كتابة موضوع تعبير عن العطلة الصيفية بحد أدنى 500 كلمة.',
      course: 'اللغة العربية',
      module: 'التعبير الكتابي',
      due_date: '2024-01-20T23:59:00',
      points: 80,
      allow_late_submissions: true,
      late_submission_penalty: 5,
      has_questions: false,
      has_file_upload: true,
      assignment_file: 'essay_requirements.pdf',
      is_active: true,
      created_at: '2024-01-10T09:00:00',
      status: 'submitted',
      grade: 80,
      feedback: 'يرجى تحسين الخط والاهتمام بالعلامات الترقيمية.',
      is_late: true,
      submission_date: '2024-01-22T10:15:00',
      questions_count: 0,
      total_points: 80,
      earned_points: 76, // 80 - 4 (late penalty)
    },
    {
      id: 4,
      title: 'اختبار البرمجة - Python',
      description: 'حل مشاكل برمجية باستخدام Python مع شرح الكود.',
      course: 'مقدمة في البرمجة',
      module: 'Python Basics',
      due_date: '2024-01-30T23:59:00',
      points: 200,
      allow_late_submissions: false,
      late_submission_penalty: 0,
      has_questions: true,
      has_file_upload: true,
      assignment_file: 'python_assignment.pdf',
      is_active: true,
      created_at: '2024-01-20T16:00:00',
      status: 'pending',
      grade: null,
      feedback: '',
      is_late: false,
      submission_date: null,
      questions_count: 8,
      total_points: 200,
      earned_points: 0,
    },
  ];

  const assignmentStats = {
    totalAssignments: assignments.length,
    submitted: assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
    pending: assignments.filter(a => a.status === 'pending').length,
    averageGrade: Math.round(assignments.filter(a => a.grade !== null).reduce((sum, a) => sum + a.grade, 0) / assignments.filter(a => a.grade !== null).length),
  };

  const getStatusText = (status, isLate) => {
    if (status === 'submitted') return isLate ? 'مُرسل متأخر' : 'مُرسل';
    if (status === 'graded') return 'مُقيم';
    if (status === 'pending') return 'لم يتم التسليم';
    if (status === 'overdue') return 'منتهي الصلاحية';
    return 'غير محدد';
  };

  const getStatusColor = (status, isLate) => {
    if (status === 'submitted') return isLate ? 'error' : 'success';
    if (status === 'graded') return 'primary';
    if (status === 'pending') return 'warning';
    if (status === 'overdue') return 'error';
    return 'default';
  };

  const handleAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenDetailsDialog(true);
  };

  const handleSubmitAssignment = (assignmentId) => {
    navigate(`/student/assignments/${assignmentId}/submit`);
  };

  const handleDownloadFile = (fileName) => {
    // Logic to download assignment file
    console.log('Downloading file:', fileName);
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
    if (tabValue === 1) return assignment.status === 'pending';
    if (tabValue === 2) return assignment.status === 'submitted' || assignment.status === 'graded';
    if (tabValue === 3) return assignment.is_late;
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
        background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
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
          <AssignmentIcon sx={{ color: '#673ab7', fontSize: 24 }} />
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
          const isOverdue = new Date() > new Date(assignment.due_date) && assignment.status === 'pending';
          const status = isOverdue ? 'overdue' : assignment.status;
          
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
                            label={`${assignment.questions_count} سؤال`}
                            size="small"
                            icon={<QuizIcon />}
                            variant="outlined"
                              sx={{ borderColor: '#673ab7', color: '#673ab7', fontSize: '0.7rem' }}
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
                        <SchoolIcon sx={{ color: '#673ab7', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {assignment.course}
                        </Typography>
                      </Box>
                      {assignment.module && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {assignment.module}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={getStatusText(status, assignment.is_late)}
                        status={status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(assignment.due_date).toLocaleDateString('ar-SA')}
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
                      {(assignment.status === 'submitted' || assignment.status === 'graded') ? (
                        <Box className="table-progress-container">
                          <Typography variant="body2" fontWeight={600} color="success.main" sx={{ mb: 0.5 }}>
                            {assignment.earned_points}/{assignment.total_points}
                          </Typography>
                          <LinearProgress
                            className="table-progress-bar"
                            variant="determinate"
                            value={(assignment.earned_points / assignment.total_points) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round((assignment.earned_points / assignment.total_points) * 100)}%
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
                        color: '#673ab7',
                        '&:hover': { backgroundColor: 'rgba(103, 58, 183, 0.1)' }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                        </Tooltip>
                    {assignment.status === 'pending' && (
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
                          onClick={() => handleDownloadFile(assignment.assignment_file)}
                          sx={{
                                color: '#1976d2',
                                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                      )}
                      {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                          <Tooltip title="عرض التقييم">
                            <IconButton
                          size="small"
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
          sx: { borderRadius: 4, p: 0, overflow: 'hidden' }
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
            <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" fontWeight={600} color="primary">
                  {selectedAssignment.title}
                </Typography>
                
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  {selectedAssignment.description}
                </Typography>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <SchoolIcon sx={{ color: '#673ab7' }} />
                      <Typography variant="body1" fontWeight={500}>
                        المقرر: {selectedAssignment.course}
                      </Typography>
                    </Box>
                    {selectedAssignment.module && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <BookIcon sx={{ color: '#666' }} />
                        <Typography variant="body1">
                          الوحدة: {selectedAssignment.module}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <GradeIcon sx={{ color: '#666' }} />
                      <Typography variant="body1">
                        الدرجة: {selectedAssignment.points} نقطة
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <CalendarTodayIcon sx={{ color: '#666' }} />
                      <Typography variant="body1">
                        تاريخ التسليم: {new Date(selectedAssignment.due_date).toLocaleString('ar-SA')}
                      </Typography>
                    </Box>
                    {selectedAssignment.allow_late_submissions && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <WarningIcon sx={{ color: '#f57c00' }} />
                        <Typography variant="body1">
                          يسمح بالتسليم المتأخر (خصم {selectedAssignment.late_submission_penalty}%)
                        </Typography>
                      </Box>
                    )}
                    {selectedAssignment.submission_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <AssignmentTurnedInIcon sx={{ color: '#2e7d32' }} />
                        <Typography variant="body1">
                          تاريخ التسليم: {new Date(selectedAssignment.submission_date).toLocaleString('ar-SA')}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                {(selectedAssignment.status === 'submitted' || selectedAssignment.status === 'graded') && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                        التقييم
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {selectedAssignment.earned_points}/{selectedAssignment.total_points}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          ({Math.round((selectedAssignment.earned_points / selectedAssignment.total_points) * 100)}%)
                        </Typography>
                      </Box>
                      {selectedAssignment.feedback && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body1" fontWeight={500} gutterBottom>
                            ملاحظات المعلم:
                          </Typography>
                          <Typography variant="body2">
                            {selectedAssignment.feedback}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
              <Button
                onClick={() => setOpenDetailsDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 4, py: 1.5, borderColor: '#9e9e9e', color: '#9e9e9e', fontWeight: 600 }}
              >
                إغلاق
              </Button>
              {selectedAssignment.status === 'pending' && (
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
                    background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5e35b1 0%, #8e24aa 100%)' 
                    } 
                  }}
                >
                  تسليم الواجب
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentAssignments; 