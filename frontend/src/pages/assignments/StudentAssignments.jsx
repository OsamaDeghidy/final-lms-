import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Tooltip, Avatar
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

  const filteredAssignments = assignments.filter(assignment => {
    if (tabValue === 0) return true; // All assignments
    if (tabValue === 1) return assignment.status === 'pending';
    if (tabValue === 2) return assignment.status === 'submitted' || assignment.status === 'graded';
    if (tabValue === 3) return assignment.is_late;
    return true;
  });

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

      {/* Assignments Grid */}
      <Grid container spacing={3} sx={{ maxWidth: '100%', mx: 'auto' }}>
        {filteredAssignments.map((assignment) => {
          const isOverdue = new Date() > new Date(assignment.due_date) && assignment.status === 'pending';
          const status = isOverdue ? 'overdue' : assignment.status;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={assignment.id}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 450,
                  maxHeight: 550,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: status === 'overdue' ? '2px solid #d32f2f' : '1px solid #e0e0e0',
                  background: status === 'overdue' ? 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)' : '#ffffff',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  },
                }}
              >
                {/* Card Header */}
                <Box sx={{ 
                  p: 2.5, 
                  borderBottom: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '12px 12px 0 0'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, minHeight: 60 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          lineHeight: 1.3,
                          mb: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {assignment.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <StatusChip
                          label={getStatusText(status, assignment.is_late)}
                          status={status}
                          size="small"
                        />
                        {assignment.has_questions && (
                          <Chip
                            label={`${assignment.questions_count} سؤال`}
                            size="small"
                            icon={<QuizIcon />}
                            variant="outlined"
                            sx={{ borderColor: '#673ab7', color: '#673ab7' }}
                          />
                        )}
                        {assignment.has_file_upload && (
                          <Chip
                            label="رفع ملف"
                            size="small"
                            icon={<FileUploadIcon />}
                            variant="outlined"
                            sx={{ borderColor: '#2e7d32', color: '#2e7d32' }}
                          />
                        )}
                      </Box>
                    </Box>
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
                  </Box>
                </Box>
                
                {/* Card Content */}
                <Box sx={{ 
                  p: 2.5, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5
                }}>
                  {/* Course and Module */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SchoolIcon sx={{ color: '#673ab7', fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500} sx={{ color: '#2c3e50' }}>
                      {assignment.course}
                    </Typography>
                  </Box>
                  {assignment.module && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <BookIcon sx={{ color: '#666', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {assignment.module}
                      </Typography>
                    </Box>
                  )}

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      lineHeight: 1.5,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: 60
                    }}
                  >
                    {assignment.description}
                  </Typography>

                  {/* Assignment Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarTodayIcon sx={{ color: '#666', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      تاريخ التسليم: {new Date(assignment.due_date).toLocaleDateString('ar-SA')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTimeIcon sx={{ color: '#666', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {new Date(assignment.due_date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GradeIcon sx={{ color: '#666', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      الدرجة: {assignment.points} نقطة
                    </Typography>
                  </Box>

                  {/* Grade Progress for submitted assignments */}
                  {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          الدرجة المحققة
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {assignment.earned_points}/{assignment.total_points}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(assignment.earned_points / assignment.total_points) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                          }
                        }}
                      />
                    </Box>
                  )}

                  {/* Actions - Fixed at bottom with better spacing */}
                  <Box sx={{ 
                    mt: 'auto', 
                    pt: 3,
                    pb: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    {assignment.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<AssignmentTurnedInIcon />}
                        onClick={() => handleSubmitAssignment(assignment.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #673ab7 0%, #9c27b0 100%)',
                          color: 'white',
                          fontWeight: 600,
                          py: 1,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5e35b1 0%, #8e24aa 100%)',
                          }
                        }}
                      >
                        تسليم الواجب
                      </Button>
                    )}
                    
                    {/* Secondary Actions Row */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {assignment.assignment_file && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadFile(assignment.assignment_file)}
                          sx={{
                            borderColor: '#673ab7',
                            color: '#673ab7',
                            fontWeight: 600,
                            flex: 1,
                            minWidth: '120px',
                            '&:hover': {
                              borderColor: '#5e35b1',
                              backgroundColor: 'rgba(103, 58, 183, 0.1)',
                            }
                          }}
                        >
                          تحميل الملف
                        </Button>
                      )}
                      {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FeedbackIcon />}
                          sx={{
                            borderColor: '#2e7d32',
                            color: '#2e7d32',
                            fontWeight: 600,
                            flex: 1,
                            minWidth: '120px',
                            '&:hover': {
                              borderColor: '#1b5e20',
                              backgroundColor: 'rgba(46, 125, 50, 0.1)',
                            }
                          }}
                        >
                          عرض التقييم
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

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