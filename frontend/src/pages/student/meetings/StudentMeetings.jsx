import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Paper, Alert, LinearProgress
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  VideoCall as VideoCallIcon, Group as GroupIcon, Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon, Chat as ChatIcon, Notifications as NotificationsIcon,
  Link as LinkIcon, FileCopy as FileCopyIcon, CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon, People as PeopleIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, Download as DownloadIcon, Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon, School as SchoolIcon, Assignment as AssignmentIcon,
  Book as BookIcon, VideoLibrary as VideoLibraryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import '../../meetings/MeetingsCommon.css';
import MeetingDetailsDialog from '../../meetings/MeetingDetailsDialog';

// Styled Components
const StyledCard = styled(Card)(({ theme, status }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  border: status === 'ongoing' ? '2px solid #4caf50' : '1px solid #e0e0e0',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
  background: status === 'ongoing' ? 'linear-gradient(135deg, #f8fff8 0%, #ffffff 100%)' : '#ffffff',
}));

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: 20,
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'upcoming' && {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  }),
  ...(status === 'ongoing' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  }),
  ...(status === 'completed' && {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  }),
  ...(status === 'cancelled' && {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
  }),
}));

const AttendanceCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  border: '1px solid #e9ecef',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
  },
}));

const StudentMeetings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Sample data
  const meetings = [
    {
      id: 1,
      title: "محاضرة الرياضيات - الفصل الأول",
      description: "شرح مفصل للمفاهيم الأساسية في الجبر والهندسة",
      meetingType: "LIVE",
      startTime: "2024-01-15T10:00:00",
      duration: 90,
      participants: 25,
      maxParticipants: 50,
      status: "upcoming",
      zoomLink: "https://zoom.us/j/123456789",
      materials: "math_lecture_1.pdf",
      recordingUrl: "https://example.com/recording1.mp4",
      isActive: true,
      teacher: "د. أحمد محمد",
      course: "الرياضيات 101",
      attendanceStatus: "registered", // registered, attending, absent, completed
      attendanceTime: null,
      exitTime: null,
      attendanceDuration: null,
    },
    {
      id: 2,
      title: "مناقشة المشاريع النهائية",
      description: "عرض ومناقشة المشاريع المطلوبة من الطلاب",
      meetingType: "ZOOM",
      startTime: "2024-01-14T14:00:00",
      duration: 120,
      participants: 18,
      maxParticipants: 30,
      status: "ongoing",
      zoomLink: "https://zoom.us/j/987654321",
      materials: "final_projects_guide.pdf",
      recordingUrl: null,
      isActive: true,
      teacher: "د. فاطمة علي",
      course: "تطوير البرمجيات",
      attendanceStatus: "attending",
      attendanceTime: "2024-01-14T14:05:00",
      exitTime: null,
      attendanceDuration: null,
    },
    {
      id: 3,
      title: "مراجعة الامتحان النصفي",
      description: "مراجعة شاملة لأسئلة الامتحان النصفي وإجاباتها",
      meetingType: "NORMAL",
      startTime: "2024-01-13T09:00:00",
      duration: 60,
      participants: 30,
      maxParticipants: 40,
      status: "completed",
      zoomLink: null,
      materials: "midterm_review.pdf",
      recordingUrl: "https://example.com/recording3.mp4",
      isActive: false,
      teacher: "د. محمد أحمد",
      course: "الفيزياء 201",
      attendanceStatus: "completed",
      attendanceTime: "2024-01-13T09:02:00",
      exitTime: "2024-01-13T10:00:00",
      attendanceDuration: 58,
    },
    {
      id: 4,
      title: "محاضرة الكيمياء العضوية",
      description: "مقدمة في الكيمياء العضوية والمركبات الكربونية",
      meetingType: "LIVE",
      startTime: "2024-01-12T11:00:00",
      duration: 75,
      participants: 22,
      maxParticipants: 35,
      status: "completed",
      zoomLink: "https://zoom.us/j/555666777",
      materials: "organic_chemistry_notes.pdf",
      recordingUrl: "https://example.com/recording4.mp4",
      isActive: false,
      teacher: "د. سارة محمد",
      course: "الكيمياء العضوية",
      attendanceStatus: "absent",
      attendanceTime: null,
      exitTime: null,
      attendanceDuration: null,
    },
  ];

  const attendanceStats = {
    totalMeetings: meetings.length,
    attended: meetings.filter(m => m.attendanceStatus === 'completed' || m.attendanceStatus === 'attending').length,
    absent: meetings.filter(m => m.attendanceStatus === 'absent').length,
    attendanceRate: Math.round((meetings.filter(m => m.attendanceStatus === 'completed' || m.attendanceStatus === 'attending').length / meetings.length) * 100),
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);
    
    if (meeting.status === 'cancelled') return 'cancelled';
    if (now >= startTime && now <= endTime) return 'ongoing';
    if (now > endTime) return 'completed';
    return 'upcoming';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'قادم';
      case 'ongoing': return 'جاري الآن';
      case 'completed': return 'منتهي';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
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

  const handleMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenDetailsDialog(true);
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.zoomLink) {
      window.open(meeting.zoomLink, '_blank');
    }
  };

  const handleDownloadMaterial = (material) => {
    // Logic to download material
    console.log('Downloading material:', material);
  };

  const handleWatchRecording = (recordingUrl) => {
    if (recordingUrl) {
      window.open(recordingUrl, '_blank');
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (tabValue === 0) return true; // All meetings
    if (tabValue === 1) return getMeetingStatus(meeting) === 'upcoming';
    if (tabValue === 2) return getMeetingStatus(meeting) === 'ongoing';
    if (tabValue === 3) return getMeetingStatus(meeting) === 'completed';
    return true;
  });

  return (
    <Box className="meetings-container">
      {/* Compact Header */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <VideoCallIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              الاجتماعات والمحاضرات
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            متابعة الحضور والغياب والوصول للمواد التعليمية
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
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <VideoCallIcon sx={{ color: '#1976d2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              {attendanceStats.totalMeetings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي الاجتماعات
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {attendanceStats.attended}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              حضرت
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <CancelIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {attendanceStats.absent}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              غبت
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <TrendingUpIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              {attendanceStats.attendanceRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              معدل الحضور
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Compact Progress Section */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 3, 
        border: '1px solid #e0e0e0',
        mb: 4,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} color="primary">
            معدل الحضور العام
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {attendanceStats.attendanceRate}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={attendanceStats.attendanceRate}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: '#e0e0e0',
            mb: 2,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
            }
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          حضرت {attendanceStats.attended} من أصل {attendanceStats.totalMeetings} اجتماع
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper className="meetings-tabs">
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab label="جميع الاجتماعات" />
          <Tab label="قادمة" />
          <Tab label="جارية" />
          <Tab label="منتهية" />
        </Tabs>
      </Paper>

             {/* Meetings Grid */}
       <Grid container spacing={3} sx={{ maxWidth: '100%', mx: 'auto' }}>
         {filteredMeetings.map((meeting) => {
           const status = getMeetingStatus(meeting);
           return (
             <Grid item xs={12} md={6} lg={4} key={meeting.id}>
               <Card 
                 className={`meeting-card ${status === 'ongoing' ? 'ongoing' : ''}`}
                 sx={{
                   height: '100%',
                   display: 'flex',
                   flexDirection: 'column',
                   minHeight: 450,
                   maxHeight: 550,
                   borderRadius: 3,
                   boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                   transition: 'all 0.3s ease',
                   border: status === 'ongoing' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                   background: status === 'ongoing' ? 'linear-gradient(135deg, #f8fff8 0%, #ffffff 100%)' : '#ffffff',
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
                         {meeting.title}
                       </Typography>
                       <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                         <StatusChip
                           label={getStatusText(status)}
                           status={status}
                           size="small"
                         />
                         <Chip
                           label={getAttendanceStatusText(meeting.attendanceStatus)}
                           color={getAttendanceStatusColor(meeting.attendanceStatus)}
                           size="small"
                           variant="outlined"
                         />
                       </Box>
                     </Box>
                     <IconButton
                       size="small"
                       onClick={() => handleMeetingDetails(meeting)}
                       sx={{ 
                         color: '#667eea',
                         '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
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
                   {/* Course and Teacher */}
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <SchoolIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                     <Typography variant="body2" fontWeight={500} sx={{ color: '#2c3e50' }}>
                       {meeting.course}
                     </Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <GroupIcon sx={{ color: '#666', fontSize: 20 }} />
                     <Typography variant="body2" color="text.secondary">
                       {meeting.teacher}
                     </Typography>
                   </Box>

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
                     {meeting.description}
                   </Typography>

                   {/* Meeting Info */}
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <CalendarTodayIcon sx={{ color: '#666', fontSize: 18 }} />
                     <Typography variant="body2" sx={{ color: '#666' }}>
                       {new Date(meeting.startTime).toLocaleDateString('ar-SA')}
                     </Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <AccessTimeIcon sx={{ color: '#666', fontSize: 18 }} />
                     <Typography variant="body2" sx={{ color: '#666' }}>
                       {new Date(meeting.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - {meeting.duration} دقيقة
                     </Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <VideoCallIcon sx={{ color: '#666', fontSize: 18 }} />
                     <Typography variant="body2" sx={{ color: '#666' }}>
                       {getMeetingTypeText(meeting.meetingType)}
                     </Typography>
                   </Box>

                   {/* Attendance Info for completed meetings */}
                   {meeting.attendanceStatus === 'completed' && meeting.attendanceDuration && (
                     <Box sx={{ 
                       mt: 1, 
                       p: 2, 
                       bgcolor: '#f8f9fa', 
                       borderRadius: 2,
                       border: '1px solid #e9ecef'
                     }}>
                       <Typography variant="body2" fontWeight={500} gutterBottom sx={{ color: '#2c3e50' }}>
                         معلومات الحضور:
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                         وقت الانضمام: {new Date(meeting.attendanceTime).toLocaleTimeString('ar-SA')}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                         مدة الحضور: {meeting.attendanceDuration} دقيقة
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
                     {status === 'upcoming' && meeting.zoomLink && (
                       <Button
                         variant="contained"
                         size="medium"
                         startIcon={<LinkIcon />}
                         onClick={() => handleJoinMeeting(meeting)}
                         sx={{
                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                           color: 'white',
                           fontWeight: 600,
                           py: 1,
                           '&:hover': {
                             background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                           }
                         }}
                       >
                         انضم للاجتماع
                       </Button>
                     )}
                     {status === 'ongoing' && meeting.zoomLink && (
                       <Button
                         variant="contained"
                         size="medium"
                         startIcon={<PlayArrowIcon />}
                         onClick={() => handleJoinMeeting(meeting)}
                         sx={{
                           background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                           color: 'white',
                           fontWeight: 600,
                           py: 1,
                           '&:hover': {
                             background: 'linear-gradient(135deg, #43a047 0%, #5cb85c 100%)',
                           }
                         }}
                       >
                         انضم الآن
                       </Button>
                     )}
                     
                     {/* Secondary Actions Row */}
                     <Box sx={{ 
                       display: 'flex', 
                       gap: 1, 
                       flexWrap: 'wrap',
                       justifyContent: 'center'
                     }}>
                       {meeting.materials && (
                         <Button
                           variant="outlined"
                           size="small"
                           startIcon={<DownloadIcon />}
                           onClick={() => handleDownloadMaterial(meeting.materials)}
                           sx={{
                             borderColor: '#667eea',
                             color: '#667eea',
                             fontWeight: 600,
                             flex: 1,
                             minWidth: '120px',
                             '&:hover': {
                               borderColor: '#5a6fd8',
                               backgroundColor: 'rgba(102, 126, 234, 0.1)',
                             }
                           }}
                         >
                           تحميل المواد
                         </Button>
                       )}
                       {meeting.recordingUrl && (
                         <Button
                           variant="outlined"
                           size="small"
                           startIcon={<VideoLibraryIcon />}
                           onClick={() => handleWatchRecording(meeting.recordingUrl)}
                           sx={{
                             borderColor: '#7b1fa2',
                             color: '#7b1fa2',
                             fontWeight: 600,
                             flex: 1,
                             minWidth: '120px',
                             '&:hover': {
                               borderColor: '#6a1b9a',
                               backgroundColor: 'rgba(123, 31, 162, 0.1)',
                             }
                           }}
                         >
                           مشاهدة التسجيل
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

      {/* Enhanced Meeting Details Dialog */}
      <MeetingDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        meeting={selectedMeeting}
        userRole="student"
        onJoinMeeting={(meeting) => {
          if (meeting.zoomLink) {
            window.open(meeting.zoomLink, '_blank');
          }
        }}
        onDownloadMaterial={(material) => {
          console.log('Downloading material:', material);
        }}
        onWatchRecording={(recordingUrl) => {
          if (recordingUrl) {
            window.open(recordingUrl, '_blank');
          }
        }}
      />
    </Box>
  );
};

export default StudentMeetings; 