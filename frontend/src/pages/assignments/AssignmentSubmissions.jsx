import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Tooltip, Avatar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Rating, CircularProgress
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
  Delete as DeleteIcon, Archive as ArchiveIcon, Person as PersonIcon,
  Email as EmailIcon, Check as CheckIcon, Close as CloseIcon,
  Star as StarIcon, StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import './Assignments.css';
import assignmentsAPI from '../../services/assignment.service';

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
  ...(status === 'late' && {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  }),
  ...(status === 'pending' && {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
  }),
}));

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingData, setGradingData] = useState({
    grade: 0,
    feedback: '',
    rubric_scores: {}
  });

  // State for real data
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assignment and submissions data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch assignment details
        const assignmentData = await assignmentsAPI.getAssignmentById(assignmentId);
        setAssignment(assignmentData);

        // Fetch submissions for this assignment
        const submissionsData = await assignmentsAPI.getAssignmentSubmissions(assignmentId);
        
        // Transform submissions data to match frontend expectations
        const transformedSubmissions = submissionsData.map(sub => ({
          id: sub.id,
          student: {
            id: sub.user,
            name: sub.student_name,
            email: sub.student_email,
            avatar: null
          },
          submitted_at: sub.submitted_at,
          status: sub.status,
          grade: sub.grade,
          feedback: sub.feedback,
          is_late: sub.is_late,
          answers: sub.question_responses ? sub.question_responses.reduce((acc, resp) => {
            acc[resp.question] = resp.text_answer || resp.selected_answer || resp.file_answer;
            return acc;
          }, {}) : {},
          rubric_scores: {}
        }));

        setSubmissions(transformedSubmissions);
      } catch (err) {
        console.error('Error fetching assignment data:', err);
        setError(`تعذر تحميل بيانات الواجب: ${err?.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  const submissionStats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    late: submissions.filter(s => s.is_late).length,
    averageGrade: Math.round(submissions.filter(s => s.grade !== null).reduce((sum, s) => sum + s.grade, 0) / submissions.filter(s => s.grade !== null).length) || 0,
  };

  const getStatusText = (status, isLate) => {
    if (status === 'submitted') return isLate ? 'مُرسل متأخر' : 'مُرسل';
    if (status === 'graded') return 'مُقيم';
    if (status === 'pending') return 'لم يتم التسليم';
    return 'غير محدد';
  };

  const getStatusColor = (status, isLate) => {
    if (status === 'submitted') return isLate ? 'error' : 'success';
    if (status === 'graded') return 'primary';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradingData({
      grade: submission.grade || 0,
      feedback: submission.feedback || '',
      rubric_scores: submission.rubric_scores || {}
    });
    setOpenGradeDialog(true);
  };

  const handleSaveGrade = async () => {
    try {
      // Call the real API to grade the submission
      const gradePayload = {
        grade: gradingData.grade,
        feedback: gradingData.feedback,
        status: 'graded'
      };

      await assignmentsAPI.gradeSubmission(selectedSubmission.id, gradePayload);
      
      // Update local state to reflect the changes
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { 
              ...sub, 
              grade: gradingData.grade, 
              feedback: gradingData.feedback,
              status: 'graded',
              rubric_scores: gradingData.rubric_scores
            }
          : sub
      ));

      setOpenGradeDialog(false);
      console.log('Grade saved successfully');
    } catch (error) {
      console.error('Error saving grade:', error);
      // Could add error handling/notification here
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

  const filteredSubmissions = submissions.filter(submission => {
    if (tabValue === 0) return true; // All submissions
    if (tabValue === 1) return submission.status === 'submitted';
    if (tabValue === 2) return submission.status === 'graded';
    if (tabValue === 3) return submission.is_late;
    return true;
  });

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
        <Button onClick={() => navigate('/teacher/assignments')} variant="contained">
          العودة إلى الواجبات
        </Button>
      </Box>
    );
  }

  // Show message if no assignment found
  if (!assignment) {
    return (
      <Box className="assignments-container">
        <Alert severity="warning" sx={{ mb: 2 }}>
          لم يتم العثور على الواجب المطلوب
        </Alert>
        <Button onClick={() => navigate('/teacher/assignments')} variant="contained">
          العودة إلى الواجبات
        </Button>
      </Box>
    );
  }

  return (
    <Box className="assignments-container">
      {/* Header */}
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
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              تصحيح الواجبات
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            {assignment.title}
          </Typography>
        </Box>
      </Box>

      {/* Assignment Info Card */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <SchoolIcon sx={{ color: '#ff6b6b' }} />
              <Typography variant="h6" fontWeight={600}>
                {assignment.course_title || assignment.course?.title}
              </Typography>
            </Box>
            {(assignment.module_name || assignment.module?.name) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <BookIcon sx={{ color: '#666' }} />
                <Typography variant="body1" color="text.secondary">
                  {assignment.module_name || assignment.module?.name}
                </Typography>
              </Box>
            )}
            <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
              {assignment.description}
            </Typography>
            {assignment.assignment_file && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <FileUploadIcon sx={{ color: '#1976d2' }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadFile('assignment_file', assignment.assignment_file)}
                  sx={{ color: '#1976d2', borderColor: '#1976d2' }}
                >
                  تحميل ملف الواجب
                </Button>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CalendarTodayIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                تاريخ التسليم: {new Date(assignment.due_date).toLocaleString('en-GB')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <GradeIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                الدرجة: {assignment.points} نقطة
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PeopleIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                الطلاب: {assignment.submissions_count || submissions.length}/{assignment.total_students || 0}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Statistics Row */}
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
          <AssignmentTurnedInIcon sx={{ color: '#1976d2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              {submissionStats.submitted}
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
          <AssessmentIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {submissionStats.graded}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              تم التصحيح
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
          <WarningIcon sx={{ color: '#f57c00', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {submissionStats.late}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              متأخر
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
              {submissionStats.averageGrade}%
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
          <Tab label="جميع التسليمات" />
          <Tab label="قيد التصحيح" />
          <Tab label="تم التصحيح" />
          <Tab label="متأخر" />
        </Tabs>
      </Paper>

      {/* Submissions Table */}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', direction: 'rtl' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>الطالب</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>تاريخ التسليم</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الحالة</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الدرجة</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>التقييم</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((submission) => (
              <TableRow key={submission.id} hover>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: 'row-reverse' }}>
                    <Avatar sx={{ backgroundColor: '#ff6b6b' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {submission.student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {submission.student.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    {new Date(submission.submitted_at).toLocaleString('en-GB')}
                  </Typography>
                  {submission.is_late && (
                    <Chip 
                      label="متأخر" 
                      size="small" 
                      color="error" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <StatusChip
                    label={getStatusText(submission.status, submission.is_late)}
                    status={submission.status}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {submission.grade !== null ? (
                    <Typography variant="body1" fontWeight={600} color="primary">
                      {submission.grade}/{assignment.points}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  {submission.status === 'graded' && submission.rubric_scores ? (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {Object.entries(submission.rubric_scores).map(([key, value]) => (
                        <Tooltip key={key} title={`${key}: ${value}/5`}>
                          <Rating value={value} readOnly size="small" sx={{ direction: 'ltr' }} />
                        </Tooltip>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="عرض التفاصيل">
                      <IconButton
                        size="small"
                        onClick={() => handleGradeSubmission(submission)}
                        sx={{ color: '#ff6b6b' }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {submission.status === 'submitted' && (
                      <Tooltip title="تصحيح الواجب">
                        <IconButton
                          size="small"
                          onClick={() => handleGradeSubmission(submission)}
                          sx={{ color: '#2e7d32' }}
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {submission.answers && Object.keys(submission.answers).length > 0 && (
                      <Tooltip title="تحميل ملفات الواجب">
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Find file answers in the submission
                            const fileAnswers = Object.values(submission.answers).filter(answer => 
                              typeof answer === 'string' && answer.includes('http')
                            );
                            if (fileAnswers.length > 0) {
                              handleDownloadFile('assignment_files.zip', fileAnswers[0]);
                            }
                          }}
                          sx={{ color: '#1976d2' }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Grade Dialog */}
      <Dialog
        open={openGradeDialog}
        onClose={() => setOpenGradeDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4, 
            p: 0, 
            overflow: 'hidden',
            direction: 'rtl' // إضافة اتجاه RTL للـ popup
          }
        }}
      >
        {selectedSubmission && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              backgroundColor: 'primary.main', 
              color: 'white', 
              py: 3, 
              px: 4,
              direction: 'rtl' // إضافة اتجاه RTL للـ header
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={700}>
                  تصحيح واجب الطالب
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenGradeDialog(false)} sx={{ color: 'white' }}>
                <CancelIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa', direction: 'rtl' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Student Info */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 3, 
                  backgroundColor: 'white', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}>
                  <Avatar sx={{ backgroundColor: '#ff6b6b', width: 56, height: 56 }}>
                    <PersonIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {selectedSubmission.student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {selectedSubmission.student.email}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <StatusChip
                        label={getStatusText(selectedSubmission.status, selectedSubmission.is_late)}
                        status={selectedSubmission.status}
                        size="small"
                      />
                      {selectedSubmission.is_late && (
                        <Chip 
                          label="متأخر" 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Submission Details */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                      تفاصيل التسليم
                    </Typography>
                      <List dense sx={{ p: 0 }}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CalendarTodayIcon sx={{ color: '#0e5181' }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary={
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                تاريخ التسليم
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {new Date(selectedSubmission.submitted_at).toLocaleString('ar-SA')}
                              </Typography>
                            }
                        />
                      </ListItem>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <AccessTimeIcon sx={{ color: '#0e5181' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                الحالة
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {selectedSubmission.is_late ? 'متأخر' : 'في الوقت المحدد'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {selectedSubmission.grade !== null && (
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <GradeIcon sx={{ color: '#0e5181' }} />
                        </ListItemIcon>
                        <ListItemText 
                              primary={
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  الدرجة الحالية
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="primary" fontWeight={600}>
                                  {selectedSubmission.grade}/{assignment.points}
                                </Typography>
                              }
                        />
                      </ListItem>
                        )}
                    </List>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                      الإجابات
                    </Typography>
                      <List dense sx={{ p: 0 }}>
                      {assignment.questions && assignment.questions.length > 0 ? (
                        assignment.questions.map((question, index) => {
                          const response = selectedSubmission.answers[question.id];
                          return (
                              <ListItem key={question.id} sx={{ 
                                flexDirection: 'column', 
                                alignItems: 'flex-start', 
                                px: 0, 
                                py: 2,
                                borderBottom: index < assignment.questions.length - 1 ? '1px solid #e0e0e0' : 'none'
                              }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1, 
                                  mb: 1, 
                                  width: '100%',
                                  justifyContent: 'space-between'
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <QuizIcon sx={{ color: '#0e5181' }} />
                                <Typography variant="subtitle2" fontWeight={600} color="primary">
                                      السؤال {index + 1}
                                </Typography>
                                  </Box>
                            {question.points && (
                              <Chip 
                                label={`${question.points} نقطة`} 
                                size="small" 
                                variant="outlined"
                                      sx={{ backgroundColor: '#f5f5f5' }}
                                  />
                                )}
                              </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, width: '100%' }}>
                                  {question.text}
                                </Typography>
                                <Box sx={{ width: '100%', pl: 2 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                    إجابة الطالب:
                                </Typography>
                                {response ? (
                                  <Box>
                                    {typeof response === 'string' && response.includes('http') ? (
                                        <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 1,
                                          p: 2,
                                          backgroundColor: '#f8f9fa',
                                          borderRadius: 1,
                                          border: '1px solid #e0e0e0'
                                        }}>
                                          <FileUploadIcon sx={{ color: '#1976d2' }} />
                                          <Typography variant="body2" sx={{ flex: 1 }}>
                                          ملف مرفوع
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDownloadFile(`question_${index + 1}_file`, response)}
                                          sx={{ color: '#1976d2' }}
                                        >
                                          <DownloadIcon />
                                        </IconButton>
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" sx={{ 
                                          p: 2, 
                                          backgroundColor: '#f8f9fa', 
                                        borderRadius: 1,
                                          border: '1px solid #e0e0e0',
                                          lineHeight: 1.6
                                      }}>
                                        {response}
                                      </Typography>
                                    )}
                                  </Box>
                                ) : (
                                    <Typography variant="body2" color="error" sx={{ 
                                      p: 2, 
                                      backgroundColor: '#ffebee', 
                                      borderRadius: 1,
                                      border: '1px solid #ffcdd2'
                                    }}>
                                    لم يتم الإجابة
                                  </Typography>
                                )}
                              </Box>
                          </ListItem>
                          );
                        })
                      ) : (
                          <ListItem sx={{ px: 0, py: 2 }}>
                          <ListItemText 
                              primary={
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  لا توجد أسئلة لهذا الواجب
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary">
                                  الواجب قد يكون عبارة عن رفع ملف أو كتابة نص فقط
                                </Typography>
                              }
                          />
                        </ListItem>
                      )}
                    </List>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Grading Section */}
                 <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                     <GradeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                     <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                       التقييم والدرجات
                  </Typography>
                   </Box>
                  
                  <Grid container spacing={3}>
                      {/* الدرجة والملاحظات */}
                      <Grid item xs={12} md={9}>
                        <Card sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 4 }}>
                            الدرجة والملاحظات
                          </Typography>
                          
                          <Grid container spacing={4}>
                            {/* الدرجة والنسبة المئوية */}
                            <Grid item xs={12} md={5}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* الدرجة */}
                                <Box>
                                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                                    الدرجة (من {assignment.points})
                                  </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        variant="outlined"
                        value={gradingData.grade}
                        onChange={(e) => setGradingData(prev => ({ ...prev, grade: Number(e.target.value) }))}
                                    inputProps={{ 
                                      min: 0, 
                                      max: assignment.points,
                                      step: 0.5
                                    }}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                        fontSize: '1.1rem'
                                      }
                                    }}
                                  />
                                </Box>
                                
                                {/* النسبة المئوية */}
                                <Box sx={{ 
                                  p: 3, 
                                  backgroundColor: 'white', 
                                  borderRadius: 2,
                                  border: '1px solid #e0e0e0',
                                  textAlign: 'center',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                  <Typography variant="h3" fontWeight={700} color="primary">
                                    {assignment.points > 0 ? Math.round((gradingData.grade / assignment.points) * 100) : 0}%
                                  </Typography>
                                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                    النسبة المئوية
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            {/* ملاحظات المعلم */}
                            <Grid item xs={12} md={7}>
                              <Box>
                                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
                                  ملاحظات المعلم
                                </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        multiline
                                  rows={12}
                                  placeholder="اكتب ملاحظاتك للطالب هنا..."
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData(prev => ({ ...prev, feedback: e.target.value }))}
                                  sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      backgroundColor: 'white',
                                      fontSize: '1rem'
                                    }
                                  }}
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </Card>
                    </Grid>
                    
                      {/* معايير التقييم */}
                      <Grid item xs={12} md={3}>
                       <Card sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                         <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                           معايير التقييم التفصيلية
                      </Typography>
                      
                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                           {[
                             { 
                               key: 'accuracy', 
                               label: 'الدقة في الإجابة', 
                               description: 'مدى صحة ودقة الإجابات المقدمة'
                             },
                             { 
                               key: 'completeness', 
                               label: 'اكتمال الإجابة', 
                               description: 'مدى شمولية واكتمال الإجابة'
                             },
                             { 
                               key: 'clarity', 
                               label: 'وضوح العرض', 
                               description: 'مدى وضوح وسهولة فهم الإجابة'
                             },
                             { 
                               key: 'timeliness', 
                               label: 'الالتزام بالوقت', 
                               description: 'مدى الالتزام بموعد التسليم'
                             }
                           ].map((criterion) => (
                             <Box key={criterion.key} sx={{ 
                               p: 2, 
                               backgroundColor: 'white', 
                               borderRadius: 1,
                               border: '1px solid #e0e0e0'
                             }}>
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                 <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                   {criterion.label}
                                 </Typography>
                                 <Typography variant="body2" color="primary" fontWeight={600}>
                                   {gradingData.rubric_scores[criterion.key] || 0}/5
                                 </Typography>
                               </Box>
                               <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                 {criterion.description}
                          </Typography>
                          <Rating
                                 value={gradingData.rubric_scores[criterion.key] || 0}
                            onChange={(event, newValue) => {
                              setGradingData(prev => ({
                                ...prev,
                                rubric_scores: {
                                  ...prev.rubric_scores,
                                       [criterion.key]: newValue
                                }
                              }));
                            }}
                            size="small"
                                 sx={{ direction: 'ltr' }}
                          />
                        </Box>
                      ))}
                           
                           {/* متوسط التقييم */}
                           <Box sx={{ 
                             p: 2, 
                             backgroundColor: 'primary.main', 
                             borderRadius: 1,
                             color: 'white',
                             textAlign: 'center'
                           }}>
                             <Typography variant="h6" fontWeight={700}>
                               {(() => {
                                 const scores = Object.values(gradingData.rubric_scores);
                                 const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                                 return average.toFixed(1);
                               })()}/5
                             </Typography>
                             <Typography variant="body2">
                               متوسط التقييم التفصيلي
                             </Typography>
                           </Box>
                         </Box>
                       </Card>
                    </Grid>
                  </Grid>
                   
                   {/* ملخص التقييم */}
                   <Box sx={{ 
                     mt: 3, 
                     p: 2, 
                     backgroundColor: '#e3f2fd', 
                     borderRadius: 1,
                     border: '1px solid #bbdefb'
                   }}>
                     <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                       ملخص التقييم:
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       الدرجة: {gradingData.grade}/{assignment.points} | 
                       النسبة: {assignment.points > 0 ? Math.round((gradingData.grade / assignment.points) * 100) : 0}% | 
                       متوسط التقييم التفصيلي: {(() => {
                         const scores = Object.values(gradingData.rubric_scores);
                         const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                         return average.toFixed(1);
                       })()}/5
                     </Typography>
                </Box>
                 </Card>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', direction: 'rtl' }}>
              <Button
                onClick={() => setOpenGradeDialog(false)}
                variant="outlined"
                sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  py: 1.5, 
                  borderColor: '#9e9e9e', 
                  color: '#9e9e9e', 
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#757575',
                    color: '#757575'
                  }
                }}
              >
                إلغاء
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveGrade}
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
                حفظ التقييم
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AssignmentSubmissions; 