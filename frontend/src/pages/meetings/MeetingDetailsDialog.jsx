import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  TextField,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Paper
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  VideoCall as VideoCallIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  FileCopy as FileCopyIcon,
  Download as DownloadIcon,
  VideoLibrary as VideoLibraryIcon,
  PlayArrow as PlayArrowIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  ScreenShare as ScreenShareIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const MeetingDetailsDialog = ({ 
  open, 
  onClose, 
  meeting, 
  userRole = 'student',
  onEdit,
  onStartLive,
  onJoinMeeting,
  onDownloadMaterial,
  onWatchRecording
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!meeting) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meeting.zoomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'completed';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'قادم';
      case 'ongoing': return 'جاري الآن';
      case 'completed': return 'منتهي';
      default: return 'غير محدد';
    }
  };

  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'registered': return 'مسجل';
      case 'attending': return 'حاضر';
      case 'completed': return 'حضر';
      case 'absent': return 'غائب';
      default: return 'غير محدد';
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'registered': return 'default';
      case 'attending': return 'success';
      case 'completed': return 'success';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getMeetingTypeText = (type) => {
    switch (type) {
      case 'ZOOM': return 'اجتماع زووم';
      case 'LIVE': return 'اجتماع مباشر';
      case 'NORMAL': return 'اجتماع عادي';
      default: return 'غير محدد';
    }
  };

  const status = getMeetingStatus(meeting);

  // Mock attendance data
  const attendanceData = {
    total: meeting.maxParticipants || 30,
    present: meeting.participants || 25,
    absent: (meeting.maxParticipants || 30) - (meeting.participants || 25),
    attendanceRate: Math.round(((meeting.participants || 25) / (meeting.maxParticipants || 30)) * 100)
  };

  const participantsList = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', status: 'attending', joinTime: '14:30', duration: 45 },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', status: 'attending', joinTime: '14:25', duration: 50 },
    { id: 3, name: 'محمد حسن', email: 'mohamed@example.com', status: 'absent' },
    { id: 4, name: 'سارة أحمد', email: 'sara@example.com', status: 'attending', joinTime: '14:35', duration: 40 },
    { id: 5, name: 'علي محمود', email: 'ali@example.com', status: 'attending', joinTime: '14:28', duration: 47 },
    { id: 6, name: 'نور الدين', email: 'nour@example.com', status: 'absent' },
    { id: 7, name: 'مريم سعيد', email: 'maryam@example.com', status: 'attending', joinTime: '14:32', duration: 43 },
    { id: 8, name: 'يوسف أحمد', email: 'youssef@example.com', status: 'attending', joinTime: '14:27', duration: 48 }
  ];

  const presentParticipants = participantsList.filter(p => p.status === 'attending');
  const absentParticipants = participantsList.filter(p => p.status === 'absent');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
          px: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VideoCallIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
            تفاصيل الاجتماع
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={getStatusText(status)}
            color={status === 'ongoing' ? 'success' : status === 'upcoming' ? 'primary' : 'default'}
            variant="filled"
            sx={{ 
              bgcolor: status === 'ongoing' ? '#4caf50' : status === 'upcoming' ? '#2196f3' : '#9e9e9e',
              color: 'white',
              fontWeight: 600
            }}
          />
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', height: 'calc(90vh - 140px)' }}>
          {/* Left Side - Main Content */}
          <Box sx={{ flex: 1, p: 4, overflow: 'auto', width: userRole === 'teacher' ? 'auto' : '100%' }}>
            {/* Meeting Title and Description */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius: 3 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary" sx={{ mb: 2 }}>
                {meeting.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7, mb: 3 }}>
                {meeting.description}
              </Typography>
              
              {/* Meeting Info Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <CalendarTodayIcon sx={{ color: '#667eea', mr: 2, fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {new Date(meeting.startTime).toLocaleDateString('ar-SA', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        تاريخ الاجتماع
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <AccessTimeIcon sx={{ color: '#667eea', mr: 2, fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {new Date(meeting.startTime).toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {meeting.duration} دقيقة
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        وقت البدء والمدة
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <VideoCallIcon sx={{ color: '#667eea', mr: 2, fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {getMeetingTypeText(meeting.meetingType)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        نوع الاجتماع
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <GroupIcon sx={{ color: '#667eea', mr: 2, fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {meeting.participants}/{meeting.maxParticipants} مشارك
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        عدد المشاركين
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Role-Specific Information */}
            {userRole === 'student' && (
              <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #bbdefb' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary" sx={{ mb: 3 }}>
                  معلومات المادة والمعلم
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e3f2fd' }}>
                      <SchoolIcon sx={{ color: '#1976d2', mr: 3, fontSize: 32 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={600} color="text.primary">
                          {meeting.course}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          المادة الدراسية
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e3f2fd' }}>
                      <PersonIcon sx={{ color: '#1976d2', mr: 3, fontSize: 32 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={600} color="text.primary">
                          {meeting.teacher}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          المعلم المسؤول
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Student Attendance Status */}
                <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e3f2fd' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                    حالة الحضور
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={getAttendanceStatusText(meeting.attendanceStatus)}
                      color={getAttendanceStatusColor(meeting.attendanceStatus)}
                      variant="filled"
                      size="large"
                      sx={{ fontSize: '1rem', fontWeight: 600 }}
                    />
                    {meeting.attendanceTime && (
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        <strong>وقت الانضمام:</strong> {new Date(meeting.attendanceTime).toLocaleTimeString('ar-SA')}
                      </Typography>
                    )}
                    {meeting.attendanceDuration && (
                      <Typography variant="body2">
                        <strong>مدة الحضور:</strong> {meeting.attendanceDuration} دقيقة
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Teacher Management Section */}
            {userRole === 'teacher' && (
              <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)', borderRadius: 3, border: '2px solid #ffb74d' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="primary" sx={{ mb: 3 }}>
                  أدوات إدارة الاجتماع
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<NotificationsIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        borderColor: '#ff9800', 
                        color: '#ff9800',
                        py: 1.5,
                        '&:hover': { borderColor: '#f57c00', bgcolor: '#fff3e0' }
                      }}
                    >
                      إرسال إشعار
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        borderColor: '#2196f3', 
                        color: '#2196f3',
                        py: 1.5,
                        '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' }
                      }}
                    >
                      تعديل الاجتماع
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FileCopyIcon />}
                      onClick={handleCopyLink}
                      sx={{ 
                        borderRadius: 2, 
                        borderColor: '#4caf50', 
                        color: '#4caf50',
                        py: 1.5,
                        '&:hover': { borderColor: '#388e3c', bgcolor: '#e8f5e8' }
                      }}
                    >
                      نسخ الرابط
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VideoLibraryIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        borderColor: '#9c27b0', 
                        color: '#9c27b0',
                        py: 1.5,
                        '&:hover': { borderColor: '#7b1fa2', bgcolor: '#f3e5f5' }
                      }}
                    >
                      إدارة التسجيل
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Meeting Settings */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e1bee7' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary" sx={{ mb: 3 }}>
                إعدادات الاجتماع
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={meeting.enableScreenShare ? "مشاركة الشاشة مفعلة" : "مشاركة الشاشة معطلة"}
                    size="medium"
                    color={meeting.enableScreenShare ? "success" : "default"}
                    icon={meeting.enableScreenShare ? <ScreenShareIcon /> : <VisibilityOffIcon />}
                    sx={{ width: '100%', py: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={meeting.enableChat ? "الدردشة مفعلة" : "الدردشة معطلة"}
                    size="medium"
                    color={meeting.enableChat ? "success" : "default"}
                    icon={meeting.enableChat ? <ChatIcon /> : <VisibilityOffIcon />}
                    sx={{ width: '100%', py: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={meeting.enableRecording ? "التسجيل مفعل" : "التسجيل معطل"}
                    size="medium"
                    color={meeting.enableRecording ? "success" : "default"}
                    icon={meeting.enableRecording ? <VideoLibraryIcon /> : <VisibilityOffIcon />}
                    sx={{ width: '100%', py: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={meeting.enableMic ? "الميكروفون مفعل" : "الميكروفون معطل"}
                    size="medium"
                    color={meeting.enableMic ? "success" : "default"}
                    icon={meeting.enableMic ? <MicIcon /> : <MicOffIcon />}
                    sx={{ width: '100%', py: 1 }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Attendance Statistics */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, background: userRole === 'teacher' ? 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)' : 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)', borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary" sx={{ mb: 3 }}>
                {userRole === 'teacher' ? 'إحصائيات الحضور والغياب' : 'معلومات الحضور'}
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {userRole === 'teacher' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                      <Typography variant="h3" fontWeight={700} color="primary" sx={{ mb: 1 }}>
                        {attendanceData.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        إجمالي الطلاب
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {userRole === 'teacher' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                      <Typography variant="h3" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                        {attendanceData.present}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        الحضور
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {userRole === 'teacher' && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                      <Typography variant="h3" fontWeight={700} color="error.main" sx={{ mb: 1 }}>
                        {attendanceData.absent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        الغياب
                      </Typography>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h3" fontWeight={700} color="info.main" sx={{ mb: 1 }}>
                      {attendanceData.attendanceRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      معدل الحضور
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {userRole === 'teacher' ? (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                      معدل الحضور في هذا الاجتماع
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                      {attendanceData.attendanceRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={attendanceData.attendanceRate}
                    sx={{
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 8,
                        background: 'linear-gradient(90deg, #2196f3 0%, #42a5f5 100%)'
                      }
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" fontWeight={600} color="success.main" sx={{ mb: 2 }}>
                    تم تسجيل حضورك بنجاح
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    يمكنك الآن الانضمام للاجتماع عند بدء المحاضرة
                  </Typography>
                </Box>
              )}
              
              {userRole === 'teacher' && (
                <Box sx={{ mt: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    يمكنك إرسال إشعار للطلاب الغائبين أو تعديل قائمة الحضور
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Right Side - Attendance List (Teacher Only) */}
          {userRole === 'teacher' && (
            <Box sx={{ width: 400, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                <Typography variant="h6" fontWeight={600} color="primary">
                  قائمة الطلاب والحضور
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  sx={{ 
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: '#f8f9fa',
                    '& .MuiTab-root': {
                      minHeight: 48,
                      fontWeight: 600
                    }
                  }}
                >
                  <Tab 
                    label={
                      <Badge badgeContent={presentParticipants.length} color="success">
                        الحضور
                      </Badge>
                    } 
                  />
                  <Tab 
                    label={
                      <Badge badgeContent={absentParticipants.length} color="error">
                        الغياب
                      </Badge>
                    } 
                  />
                  <Tab label="الكل" />
                </Tabs>

                <List sx={{ p: 0 }}>
                  {(tabValue === 0 ? presentParticipants : 
                    tabValue === 1 ? absentParticipants : 
                    participantsList).map((participant) => (
                    <ListItem
                      key={participant.id}
                      sx={{
                        borderBottom: '1px solid #f0f0f0',
                        bgcolor: participant.status === 'attending' ? '#f8fff8' : '#fff8f8',
                        '&:hover': {
                          bgcolor: participant.status === 'attending' ? '#f0fff0' : '#fff0f0'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: participant.status === 'attending' ? '#4caf50' : '#f44336',
                            width: 40,
                            height: 40,
                            fontWeight: 600
                          }}
                        >
                          {participant.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              {participant.name}
                            </Typography>
                            <Chip
                              label={getAttendanceStatusText(participant.status)}
                              color={getAttendanceStatusColor(participant.status)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {participant.email}
                            </Typography>
                            {participant.status === 'attending' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleIcon sx={{ fontSize: 14, color: '#4caf50' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    انضم: {participant.joinTime}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <TrendingUpIcon sx={{ fontSize: 14, color: '#4caf50' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {participant.duration} دقيقة
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ 
                            color: participant.status === 'attending' ? '#4caf50' : '#f44336',
                            '&:hover': { bgcolor: participant.status === 'attending' ? '#e8f5e8' : '#ffebee' }
                          }}
                        >
                          {participant.status === 'attending' ? <CheckCircleIcon /> : <CancelIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ 
                            color: '#2196f3',
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
                          <NotificationsIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 4, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            borderColor: '#9e9e9e',
            color: '#9e9e9e',
            '&:hover': { borderColor: '#757575', bgcolor: '#f5f5f5' }
          }}
        >
          إغلاق
        </Button>
        
        {userRole === 'teacher' && status === 'upcoming' && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit && onEdit(meeting)}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              borderColor: '#2196f3',
              color: '#2196f3',
              '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' }
            }}
          >
            تعديل
          </Button>
        )}
        
        {userRole === 'teacher' && status === 'ongoing' && (
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => onStartLive && onStartLive(meeting.id)}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #43a047 30%, #5cb85c 90%)',
              }
            }}
          >
            بدء المباشر
          </Button>
        )}
        
        {meeting.zoomLink && status !== 'completed' && (
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={() => onJoinMeeting && onJoinMeeting(meeting)}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
              }
            }}
          >
            انضم للاجتماع
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MeetingDetailsDialog; 