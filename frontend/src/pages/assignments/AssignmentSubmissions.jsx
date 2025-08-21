import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Tooltip, Avatar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Rating
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
    averageGrade: Math.round(submissions.filter(s => s.grade !== null).reduce((sum, s) => sum + s.grade, 0) / submissions.filter(s => s.grade !== null).length),
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

  const handleDownloadFile = (fileName) => {
    console.log('Downloading file:', fileName);
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
        <LinearProgress sx={{ width: '300px' }} />
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
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
                  {assignment.course_title || assignment.course}
              </Typography>
            </Box>
              {(assignment.module_name || assignment.module) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <BookIcon sx={{ color: '#666' }} />
                <Typography variant="body1" color="text.secondary">
                    {assignment.module_name || assignment.module}
                </Typography>
              </Box>
            )}
            <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
              {assignment.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CalendarTodayIcon sx={{ color: '#666' }} />
              <Typography variant="body1">
                تاريخ التسليم: {new Date(assignment.due_date).toLocaleString('ar-SA')}
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
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600 }}>الطالب</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>تاريخ التسليم</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الحالة</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الدرجة</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>التقييم</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((submission) => (
              <TableRow key={submission.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <TableCell>
                  <Typography variant="body2">
                    {new Date(submission.submitted_at).toLocaleString('ar-SA')}
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
                <TableCell>
                  <StatusChip
                    label={getStatusText(submission.status, submission.is_late)}
                    status={submission.status}
                    size="small"
                  />
                </TableCell>
                <TableCell>
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
                <TableCell>
                  {submission.status === 'graded' && submission.rubric_scores ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {Object.entries(submission.rubric_scores).map(([key, value]) => (
                        <Tooltip key={key} title={`${key}: ${value}/5`}>
                          <Rating value={value} readOnly size="small" />
                        </Tooltip>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
          sx: { borderRadius: 4, p: 0, overflow: 'hidden' }
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
            px: 4 
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
            <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Student Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                  <Avatar sx={{ backgroundColor: '#ff6b6b' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedSubmission.student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSubmission.student.email}
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
                          secondary={new Date(selectedSubmission.submitted_at).toLocaleString('ar-SA')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <StatusChip
                            label={getStatusText(selectedSubmission.status, selectedSubmission.is_late)}
                            status={selectedSubmission.status}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary="الحالة"
                          secondary={selectedSubmission.is_late ? 'متأخر' : 'في الوقت المحدد'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      الإجابات
                    </Typography>
                    <List dense>
                      {assignment.questions && assignment.questions.length > 0 ? (
                        assignment.questions.map((question, index) => (
                        <ListItem key={question.id}>
                          <ListItemIcon>
                            <QuizIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={`السؤال ${index + 1}`}
                            secondary={selectedSubmission.answers[question.id] || 'لم يتم الإجابة'}
                          />
                          {question.points && (
                            <Chip 
                              label={`${question.points} نقطة`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText 
                            primary="لا توجد أسئلة لهذا الواجب"
                            secondary="الواجب قد يكون عبارة عن رفع ملف أو كتابة نص فقط"
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                </Grid>

                <Divider />

                {/* Grading Section */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    التقييم
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="الدرجة"
                        type="number"
                        variant="outlined"
                        value={gradingData.grade}
                        onChange={(e) => setGradingData(prev => ({ ...prev, grade: Number(e.target.value) }))}
                        inputProps={{ min: 0, max: assignment.points }}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="ملاحظات المعلم"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData(prev => ({ ...prev, feedback: e.target.value }))}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        معايير التقييم
                      </Typography>
                      
                      {['accuracy', 'completeness', 'clarity', 'timeliness'].map((criterion) => (
                        <Box key={criterion} sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            {criterion === 'accuracy' && 'الدقة'}
                            {criterion === 'completeness' && 'الاكتمال'}
                            {criterion === 'clarity' && 'الوضوح'}
                            {criterion === 'timeliness' && 'الالتزام بالوقت'}
                          </Typography>
                          <Rating
                            value={gradingData.rubric_scores[criterion] || 0}
                            onChange={(event, newValue) => {
                              setGradingData(prev => ({
                                ...prev,
                                rubric_scores: {
                                  ...prev.rubric_scores,
                                  [criterion]: newValue
                                }
                              }));
                            }}
                            size="small"
                          />
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
              <Button
                onClick={() => setOpenGradeDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 2, px: 4, py: 1.5, borderColor: '#9e9e9e', color: '#9e9e9e', fontWeight: 600 }}
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
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #ff5252 0%, #e64a19 100%)' 
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