import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Paper,
  LinearProgress, Alert, Divider, List, ListItem, ListItemText,
  ListItemIcon, Badge, Tooltip, Avatar, Fab
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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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
      submissions_count: 18,
      graded_count: 12,
      total_students: 25,
      average_grade: 85.5,
      questions_count: 5,
      total_points: 100,
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
      submissions_count: 10,
      graded_count: 3,
      total_students: 22,
      average_grade: 78.2,
      questions_count: 0,
      total_points: 150,
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
      is_active: false,
      created_at: '2024-01-10T09:00:00',
      submissions_count: 20,
      graded_count: 20,
      total_students: 20,
      average_grade: 82.1,
      questions_count: 0,
      total_points: 80,
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
      submissions_count: 0,
      graded_count: 0,
      total_students: 30,
      average_grade: 0,
      questions_count: 8,
      total_points: 200,
    },
  ];

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
    setOpenCreateDialog(true);
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

  const handleDownloadFile = (fileName) => {
    // Logic to download assignment file
    console.log('Downloading file:', fileName);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (tabValue === 0) return true; // All assignments
    if (tabValue === 1) return assignment.is_active;
    if (tabValue === 2) return !assignment.is_active;
    if (tabValue === 3) return assignment.submissions_count > 0;
    return true;
  });

  return (
    <Box className="assignments-container">
      {/* Compact Header */}
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

      {/* Create Assignment Button - Fixed */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <Fab
          color="primary"
          size="large"
          onClick={handleCreateAssignment}
          sx={{
            background: 'linear-gradient(45deg, #673ab7 30%, #9c27b0 90%)',
            boxShadow: '0 4px 20px rgba(103,58,183,0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5e35b1 30%, #8e24aa 90%)',
              boxShadow: '0 6px 25px rgba(103,58,183,0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Box>

      {/* Assignments Grid */}
      <Grid container spacing={3} sx={{ maxWidth: '100%', mx: 'auto' }}>
        {filteredAssignments.map((assignment) => {
          const status = assignment.is_active ? 'active' : 'inactive';
          const submissionRate = assignment.total_students > 0 ? (assignment.submissions_count / assignment.total_students) * 100 : 0;
          const gradingRate = assignment.submissions_count > 0 ? (assignment.graded_count / assignment.submissions_count) * 100 : 0;
          
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
                  border: status === 'active' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  background: status === 'active' ? 'linear-gradient(135deg, #f8fff8 0%, #ffffff 100%)' : '#ffffff',
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
                          label={getStatusText(status)}
                          status={status}
                          size="small"
                        />
                        {assignment.has_questions && (
                          <Chip
                            label={`${assignment.questions_count} سؤال`}
                            size="small"
                            icon={<QuizIcon />}
                            variant="outlined"
                            sx={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                      <IconButton
                        size="small"
                        onClick={() => handleEditAssignment(assignment.id)}
                        sx={{ 
                          color: '#673ab7',
                          '&:hover': { backgroundColor: 'rgba(103, 58, 183, 0.1)' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
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
                    <SchoolIcon sx={{ color: '#ff6b6b', fontSize: 20 }} />
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
                    <GradeIcon sx={{ color: '#666', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      الدرجة: {assignment.points} نقطة
                    </Typography>
                  </Box>

                  {/* Submission Stats */}
                  <Box sx={{ mb: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        معدل التسليم
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {Math.round(submissionRate)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={submissionRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e0e0e0',
                        mb: 2,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {assignment.submissions_count} من {assignment.total_students} طالب
                    </Typography>
                  </Box>

                  {/* Grading Progress */}
                  {assignment.submissions_count > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          معدل التصحيح
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {Math.round(gradingRate)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={gradingRate}
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
                        {assignment.graded_count} من {assignment.submissions_count} تم التصحيح
                      </Typography>
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
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<AssessmentIcon />}
                      onClick={() => handleViewSubmissions(assignment.id)}
                      sx={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        color: 'white',
                        fontWeight: 600,
                        py: 1,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ff5252 0%, #e64a19 100%)',
                        }
                      }}
                    >
                      تصحيح الواجبات
                    </Button>
                    
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
                            borderColor: '#ff6b6b',
                            color: '#ff6b6b',
                            fontWeight: 600,
                            flex: 1,
                            minWidth: '120px',
                            '&:hover': {
                              borderColor: '#ff5252',
                              backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            }
                          }}
                        >
                          تحميل الملف
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditAssignment(assignment.id)}
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
                        تعديل الواجب
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Assignment Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 0, overflow: 'hidden' }
        }}
      >
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
            <CreateIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              إنشاء واجب جديد
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenCreateDialog(false)} sx={{ color: 'white' }}>
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
          <Box component="form" autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="عنوان الواجب"
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="وصف الواجب"
              variant="outlined"
              multiline
              rows={3}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <FormControl fullWidth>
              <InputLabel>المقرر</InputLabel>
              <Select
                label="المقرر"
                defaultValue=""
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="math">الرياضيات 101</MenuItem>
                <MenuItem value="science">العلوم البيئية</MenuItem>
                <MenuItem value="arabic">اللغة العربية</MenuItem>
                <MenuItem value="programming">مقدمة في البرمجة</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الدرجة المخصصة"
              type="number"
              variant="outlined"
              defaultValue={100}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="تاريخ ووقت التسليم"
              type="datetime-local"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="المدة (بالدقائق)"
                type="number"
                variant="outlined"
                defaultValue={60}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="الحد الأقصى للمحاولات"
                type="number"
                variant="outlined"
                defaultValue={1}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
          </Box>
        </DialogContent>
                    <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 4, py: 1.5, borderColor: '#9e9e9e', color: '#9e9e9e', fontWeight: 600 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenCreateDialog(false)}
            sx={{ 
              borderRadius: 2, 
              px: 4, 
              py: 1.5, 
              fontWeight: 700, 
              background: 'linear-gradient(45deg, #673ab7 30%, #9c27b0 90%)',
              '&:hover': { 
                background: 'linear-gradient(45deg, #5e35b1 30%, #8e24aa 90%)' 
              } 
            }}
          >
            إنشاء الواجب
          </Button>
        </DialogActions>
      </Dialog>

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
                      <SchoolIcon sx={{ color: '#ff6b6b' }} />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <PeopleIcon sx={{ color: '#666' }} />
                      <Typography variant="body1">
                        عدد الطلاب: {selectedAssignment.total_students}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <AssignmentTurnedInIcon sx={{ color: '#2e7d32' }} />
                      <Typography variant="body1">
                        التسليمات: {selectedAssignment.submissions_count}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                    إحصائيات الواجب
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {selectedAssignment.submissions_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          تسليم
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {selectedAssignment.graded_count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          تم التصحيح
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h4" fontWeight={700} color="secondary.main">
                          {selectedAssignment.average_grade > 0 ? selectedAssignment.average_grade.toFixed(1) : 0}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          متوسط الدرجات
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
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
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #ff5252 0%, #e64a19 100%)' 
                  } 
                }}
              >
                تصحيح الواجبات
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TeacherAssignments; 