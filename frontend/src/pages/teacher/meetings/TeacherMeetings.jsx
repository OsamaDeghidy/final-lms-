import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Fab, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Paper, Alert, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, VideoCall as VideoCallIcon, Group as GroupIcon,
  Schedule as ScheduleIcon, Edit as EditIcon, Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon, Stop as StopIcon, Chat as ChatIcon,
  Notifications as NotificationsIcon, Link as LinkIcon, FileCopy as FileCopyIcon,
  CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon,
  People as PeopleIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon
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

const TeacherMeetings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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
      isActive: true,
      creator: "أحمد محمد",
      enableScreenShare: true,
      enableChat: true,
      enableRecording: false,
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
      isActive: true,
      creator: "أحمد محمد",
      enableScreenShare: true,
      enableChat: true,
      enableRecording: true,
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
      isActive: false,
      creator: "أحمد محمد",
      enableScreenShare: false,
      enableChat: false,
      enableRecording: false,
    },
  ];

  const participants = [
    { id: 1, name: "علي أحمد", email: "ali@example.com", status: "attending", joinTime: "10:05" },
    { id: 2, name: "فاطمة محمد", email: "fatima@example.com", status: "attending", joinTime: "10:02" },
    { id: 3, name: "محمد علي", email: "mohamed@example.com", status: "absent", joinTime: null },
    { id: 4, name: "سارة أحمد", email: "sara@example.com", status: "attending", joinTime: "10:08" },
  ];

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

  const handleCreateMeeting = () => {
    setOpenCreateDialog(true);
  };

  const handleMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenDetailsDialog(true);
  };

  const handleStartLiveMeeting = (meetingId) => {
    // Logic to start live meeting
    console.log('Starting live meeting:', meetingId);
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.zoomLink) {
      window.open(meeting.zoomLink, '_blank');
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
            <VideoCallIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              إدارة الاجتماعات والمحاضرات
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            إنشاء وإدارة الاجتماعات والمحاضرات المباشرة
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
              {meetings.filter(m => getMeetingStatus(m) === 'upcoming').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              اجتماعات قادمة
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
          <PlayArrowIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {meetings.filter(m => getMeetingStatus(m) === 'ongoing').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              جارية الآن
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
          <CheckCircleIcon sx={{ color: '#7b1fa2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              {meetings.filter(m => getMeetingStatus(m) === 'completed').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              منتهية
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
          <PeopleIcon sx={{ color: '#f57c00', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="warning.main">
              {meetings.reduce((sum, m) => sum + m.participants, 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي المشاركين
            </Typography>
          </Box>
        </Box>
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

      {/* Create Meeting Button - Top Left */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon sx={{ fontSize: 24 }} />}
          onClick={handleCreateMeeting}
          sx={{
            px: 4,
            py: 2,
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: 3,
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
          إضافة اجتماع جديد
        </Button>
      </Box>

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
                      <EditIcon />
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
                    <GroupIcon sx={{ color: '#666', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {meeting.participants}/{meeting.maxParticipants} مشارك
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <VideoCallIcon sx={{ color: '#666', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {getMeetingTypeText(meeting.meetingType)}
                    </Typography>
                  </Box>

                  {/* Progress Bar for ongoing meetings */}
                  {status === 'ongoing' && (
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          معدل الحضور
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {Math.round((meeting.participants / meeting.maxParticipants) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(meeting.participants / meeting.maxParticipants) * 100}
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
                    {status === 'upcoming' && (
                      <>
                        <Button
                          variant="contained"
                          size="medium"
                          startIcon={<EditIcon />}
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
                          تعديل الاجتماع
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<NotificationsIcon />}
                          sx={{
                            borderColor: '#ff6b6b',
                            color: '#ff6b6b',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#ff5252',
                              backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            }
                          }}
                        >
                          إرسال إشعارات
                        </Button>
                      </>
                    )}
                    {status === 'ongoing' && (
                      <>
                        <Button
                          variant="contained"
                          size="medium"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleStartLiveMeeting(meeting.id)}
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
                          بدء المباشر
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ChatIcon />}
                          sx={{
                            borderColor: '#4caf50',
                            color: '#4caf50',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#43a047',
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            }
                          }}
                        >
                          إدارة الدردشة
                        </Button>
                      </>
                    )}
                    
                    {/* Secondary Actions Row */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {meeting.zoomLink && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LinkIcon />}
                          onClick={() => handleJoinMeeting(meeting)}
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
                          انضم للاجتماع
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileCopyIcon />}
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
                        نسخ الرابط
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Meeting Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 0, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'white', py: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AddIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              إنشاء اجتماع جديد
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenCreateDialog(false)} sx={{ color: 'white' }}>
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: '#f8f9fa' }}>
          <Box component="form" autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="عنوان الاجتماع"
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="وصف الاجتماع"
              variant="outlined"
              multiline
              rows={3}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <FormControl fullWidth>
              <InputLabel>نوع الاجتماع</InputLabel>
              <Select
                label="نوع الاجتماع"
                defaultValue="ZOOM"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ZOOM">اجتماع زووم</MenuItem>
                <MenuItem value="LIVE">اجتماع مباشر</MenuItem>
                <MenuItem value="NORMAL">اجتماع عادي</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الحد الأقصى للمشاركين"
              type="number"
              variant="outlined"
              defaultValue={50}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="تاريخ ووقت البدء"
              type="datetime-local"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
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
              label="رابط زووم (اختياري)"
              variant="outlined"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
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
            sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 700, background: 'linear-gradient(45deg, #673ab7 30%, #9c27b0 90%)', '&:hover': { background: 'linear-gradient(45deg, #5e35b1 30%, #8e24aa 90%)' } }}
          >
            إنشاء الاجتماع
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Meeting Details Dialog */}
      <MeetingDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        meeting={selectedMeeting}
        userRole="teacher"
        onEdit={(meeting) => {
          console.log('Edit meeting:', meeting);
          setOpenDetailsDialog(false);
        }}
        onStartLive={(meetingId) => {
          console.log('Start live meeting:', meetingId);
          setOpenDetailsDialog(false);
        }}
        onJoinMeeting={(meeting) => {
          if (meeting.zoomLink) {
            window.open(meeting.zoomLink, '_blank');
          }
        }}
      />
    </Box>
  );
};

export default TeacherMeetings; 