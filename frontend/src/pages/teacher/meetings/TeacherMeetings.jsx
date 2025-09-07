import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Fab, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Paper, Alert, LinearProgress, Snackbar, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, VideoCall as VideoCallIcon, Group as GroupIcon,
  Schedule as ScheduleIcon, Edit as EditIcon, Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon, Stop as StopIcon, Chat as ChatIcon,
  Notifications as NotificationsIcon, Link as LinkIcon, FileCopy as FileCopyIcon,
  CalendarToday as CalendarTodayIcon, AccessTime as AccessTimeIcon,
  People as PeopleIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import '../../meetings/MeetingsCommon.css';
import TeacherMeetingDetailsDialog from '../../meetings/TeacherMeetingDetailsDialog';
import { meetingAPI } from '../../../services/meeting.service';

// Styled Components
const StyledCard = styled(Card)(({ theme, status }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  border: status === 'ongoing' ? '2px solid #e5978b' : '1px solid #e0e0e0',
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
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state for creating/editing meetings
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_type: 'NORMAL',
    start_time: '',
    duration: 60,
    zoom_link: '',
    max_participants: 20,
    enable_screen_share: true,
    enable_chat: true,
    enable_recording: false,
  });

  // Load meetings on component mount and auto-refresh for ongoing meetings
  useEffect(() => {
    fetchMeetings();
    
    // Auto-refresh every 30 seconds for ongoing meetings
    const interval = setInterval(() => {
      const hasOngoingMeetings = meetings.some(meeting => getMeetingStatus(meeting) === 'ongoing');
      if (hasOngoingMeetings) {
        console.log('Auto-refreshing meetings due to ongoing meetings...');
        fetchMeetings();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      console.log('Fetching meetings...');
      const response = await meetingAPI.getMyMeetings();
      console.log('API Response:', response);
      
      // Handle different response formats
      let meetingsData = [];
      if (response?.meetings) {
        // If response has 'meetings' key
        meetingsData = response.meetings;
      } else if (response?.results) {
        // If response has 'results' key
        meetingsData = response.results;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        meetingsData = response;
      } else {
        // Fallback to empty array
        meetingsData = [];
      }
      
      console.log('Processed meetings data:', meetingsData);
      const processedMeetings = Array.isArray(meetingsData) ? meetingsData : [];
      setMeetings(processedMeetings);
      
      // Update selectedMeeting if it exists in the new data
      if (selectedMeeting) {
        const updatedMeeting = processedMeetings.find(m => m.id === selectedMeeting.id);
        if (updatedMeeting) {
          console.log('Updating selectedMeeting with fresh data:', updatedMeeting);
          setSelectedMeeting(updatedMeeting);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('حدث خطأ في تحميل الاجتماعات');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title?.trim()) {
      errors.push('عنوان الاجتماع مطلوب');
    }
    
    if (!formData.start_time) {
      errors.push('تاريخ ووقت البدء مطلوب');
    } else {
      const startTime = new Date(formData.start_time);
      const now = new Date();
      if (startTime <= now) {
        errors.push('تاريخ ووقت البدء يجب أن يكون في المستقبل');
      }
    }
    
    if (!formData.duration || formData.duration < 15) {
      errors.push('المدة يجب أن تكون 15 دقيقة على الأقل');
    }
    
    if (formData.duration > 480) {
      errors.push('المدة لا يمكن أن تتجاوز 8 ساعات');
    }
    
    if (formData.meeting_type === 'ZOOM' && !formData.zoom_link?.trim()) {
      errors.push('رابط زووم مطلوب لاجتماعات زووم');
    }
    
    if (formData.max_participants < 1 || formData.max_participants > 200) {
      errors.push('عدد المشاركين يجب أن يكون بين 1 و 200');
    }
    
    return errors;
  };

  const handleCreateMeeting = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join('\n'),
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await meetingAPI.createMeeting(formData);
      setSnackbar({
        open: true,
        message: 'تم إنشاء الاجتماع بنجاح',
        severity: 'success'
      });
      setOpenCreateDialog(false);
      resetForm();
      fetchMeetings();
    } catch (err) {
      console.error('Error creating meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'حدث خطأ في إنشاء الاجتماع',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeeting = async (meetingId) => {
    const errors = validateForm();
    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join('\n'),
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const updatedMeeting = await meetingAPI.updateMeeting(meetingId, formData);
      setSnackbar({
        open: true,
        message: 'تم تحديث الاجتماع بنجاح',
        severity: 'success'
      });
      setOpenCreateDialog(false);
      resetForm();
      
      // Update the selected meeting with new data
      if (selectedMeeting && selectedMeeting.id === meetingId) {
        console.log('Updating selectedMeeting after edit:', updatedMeeting);
        setSelectedMeeting(prev => ({
          ...prev,
          ...updatedMeeting,
          updated_at: new Date().toISOString() // Force refresh of details dialog
        }));
      }
      
      fetchMeetings();
    } catch (err) {
      console.error('Error updating meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'حدث خطأ في تحديث الاجتماع',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) {
      try {
        setLoading(true);
        await meetingAPI.deleteMeeting(meetingId);
        setSnackbar({
          open: true,
          message: 'تم حذف الاجتماع بنجاح',
          severity: 'success'
        });
        fetchMeetings();
      } catch (err) {
        console.error('Error deleting meeting:', err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'حدث خطأ في حذف الاجتماع',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartLiveMeeting = async (meetingId) => {
    try {
      setLoading(true);
      const response = await meetingAPI.startLiveMeeting(meetingId);
      setSnackbar({
        open: true,
        message: 'تم بدء الاجتماع المباشر بنجاح',
        severity: 'success'
      });
      
      // Refresh meetings to get updated status
      fetchMeetings();
      
      // Open live meeting in new window/tab
      window.open(`/teacher/meetings/live/${meetingId}`, '_blank');
      
      // Alternative: Navigate to live meeting page
      // window.location.href = `/teacher/meetings/live/${meetingId}`;
      
    } catch (err) {
      console.error('Error starting live meeting:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'حدث خطأ في بدء الاجتماع المباشر',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Set default start time to current time + 1 hour
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours() + 1);
    defaultStartTime.setMinutes(0);
    defaultStartTime.setSeconds(0);
    
    const formatDateTimeForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      title: '',
      description: '',
      meeting_type: 'NORMAL',
      start_time: formatDateTimeForInput(defaultStartTime),
      duration: 60,
      zoom_link: '',
      max_participants: 20,
      enable_screen_share: true,
      enable_chat: true,
      enable_recording: false,
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openEditDialog = (meeting) => {
    console.log('openEditDialog called with meeting:', meeting);
    
    // Format start_time for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateTimeForInput = (dateString) => {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateString);
          return '';
        }
        
        // Convert to local timezone and format as YYYY-MM-DDTHH:MM
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log('Formatted date:', formatted, 'from original:', dateString);
        return formatted;
      } catch (error) {
        console.error('Error formatting date:', error, 'dateString:', dateString);
        return '';
      }
    };

    const formattedStartTime = formatDateTimeForInput(meeting.start_time);
    console.log('Formatted start_time:', formattedStartTime);
    console.log('Meeting duration:', meeting.duration);

    setFormData({
      title: meeting.title || '',
      description: meeting.description || '',
      meeting_type: meeting.meeting_type || 'NORMAL',
      start_time: formattedStartTime,
      duration: meeting.duration || 60,
      zoom_link: meeting.zoom_link || '',
      max_participants: meeting.max_participants || 10,
      enable_screen_share: meeting.enable_screen_share || false,
      enable_chat: meeting.enable_chat || false,
      enable_recording: meeting.enable_recording || false,
    });
    setSelectedMeeting(meeting);
    setOpenCreateDialog(true);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setSelectedMeeting(null);
    setOpenCreateDialog(true);
  };

  const handleMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setOpenDetailsDialog(true);
  };

  const handleStartLiveMeetingClick = (meetingId) => {
    handleStartLiveMeeting(meetingId);
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.zoom_link) {
      window.open(meeting.zoom_link, '_blank');
    }
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    
    // Handle duration - it could be a string like "01:30:00" or a number in minutes
    let durationMinutes = 60; // default
    if (typeof meeting.duration === 'string') {
      // Parse duration string like "01:30:00"
      const parts = meeting.duration.split(':');
      if (parts.length === 3) {
        durationMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    } else if (typeof meeting.duration === 'number') {
      durationMinutes = meeting.duration;
    }
    
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
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

  // Date formatting functions
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date in formatDate:', dateString);
        return 'تاريخ غير صحيح';
      }
      
      console.log('Formatting date:', dateString, 'to:', date);
      
      return date.toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        calendar: 'gregory'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString);
      return 'تاريخ غير صحيح';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date in formatTime:', dateString);
        return 'وقت غير صحيح';
      }
      
      console.log('Formatting time:', dateString, 'to:', date);
      
      return date.toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'dateString:', dateString);
      return 'وقت غير صحيح';
    }
  };

  // Debug logging
  console.log('Current meetings state:', meetings);
  console.log('Meetings type:', typeof meetings);
  console.log('Is meetings array:', Array.isArray(meetings));
  
  // Filter meetings based on tab
  const filteredMeetings = Array.isArray(meetings) ? meetings.filter(meeting => {
    if (tabValue === 0) return true; // All meetings
    if (tabValue === 1) return getMeetingStatus(meeting) === 'upcoming';
    if (tabValue === 2) return getMeetingStatus(meeting) === 'ongoing';
    if (tabValue === 3) return getMeetingStatus(meeting) === 'completed';
    return true;
  }) : [];

  return (
    <Box className="meetings-container">
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

      {/* Create Meeting Button - Fixed */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={handleOpenCreateDialog}
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

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: '#ff6b6b',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ff6b6b',
            },
          }}
        >
          <Tab label={`جميع الاجتماعات (${filteredMeetings.length})`} />
          <Tab label={`قادمة (${meetings.filter(m => getMeetingStatus(m) === 'upcoming').length})`} />
          <Tab label={`جارية الآن (${meetings.filter(m => getMeetingStatus(m) === 'ongoing').length})`} />
          <Tab label={`منتهية (${meetings.filter(m => getMeetingStatus(m) === 'completed').length})`} />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading && (!Array.isArray(meetings) || meetings.length === 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>جاري تحميل الاجتماعات...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error}
            <Button 
              onClick={fetchMeetings} 
              sx={{ ml: 2 }}
              variant="outlined"
              size="small"
            >
              إعادة المحاولة
            </Button>
          </Alert>
        </Box>
      )}

      {/* Empty State */}
      {!loading && (!Array.isArray(meetings) || meetings.length === 0) && !error && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 8,
          textAlign: 'center'
        }}>
          <VideoCallIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            لا توجد اجتماعات بعد
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            ابدأ بإنشاء اجتماع جديد لإدارة المحاضرات والاجتماعات
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenCreateDialog}
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5
            }}
          >
            إنشاء اجتماع جديد
          </Button>
        </Box>
      )}

      {/* Meetings Grid */}
      <Grid container spacing={3}>
        {filteredMeetings.map((meeting) => {
          const status = getMeetingStatus(meeting);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={meeting.id}>
              <StyledCard status={status}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ 
                      color: 'primary.main',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {meeting.title}
                    </Typography>
                    <StatusChip 
                      label={getStatusText(status)} 
                      status={status}
                      size="small"
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 3,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {meeting.description}
                  </Typography>

                  {/* Meeting Info */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(meeting.start_time)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(meeting.start_time)} - {meeting.duration} دقيقة
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        المشاركين: {meeting.participants_count || 0} / {meeting.max_participants}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VideoCallIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        نوع الاجتماع: {getMeetingTypeText(meeting.meeting_type)}
                      </Typography>
                    </Box>

                    {meeting.zoom_link && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LinkIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                          رابط زووم متاح
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        تم الإنشاء: {formatDate(meeting.created_at)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status and Actions */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <StatusChip label={getStatusText(status)} status={status} />
                      {meeting.enable_chat && (
                        <Chip 
                          label="دردشة متاحة" 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#e8f5e8', 
                            color: '#2e7d32',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }} 
                        />
                      )}
                      {meeting.enable_screen_share && (
                        <Chip 
                          label="مشاركة شاشة" 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#fff3e0', 
                            color: '#f57c00',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }} 
                        />
                      )}
                      {meeting.enable_recording && (
                        <Chip 
                          label="تسجيل متاح" 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#f3e5f5', 
                            color: '#7b1fa2',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }} 
                        />
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMeetingDetails(meeting)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          minWidth: 'fit-content'
                        }}
                      >
                        التفاصيل
                      </Button>

                      {status === 'upcoming' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEditDialog(meeting)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content',
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.08)',
                            },
                          }}
                        >
                          تعديل
                        </Button>
                      )}

                      {status === 'ongoing' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStartLiveMeetingClick(meeting.id)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content',
                            '&:hover': {
                              backgroundColor: '#2e7d32',
                            },
                          }}
                        >
                          بدء المباشر
                        </Button>
                      )}

                      {status === 'upcoming' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 'fit-content',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            },
                          }}
                        >
                          حذف
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Meeting Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => {
          setOpenCreateDialog(false);
          // Force refresh of meeting details if we were editing
          if (selectedMeeting) {
            setSelectedMeeting(prev => ({
              ...prev,
              updated_at: new Date().toISOString()
            }));
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <VideoCallIcon />
          {selectedMeeting ? 'تعديل الاجتماع' : 'إنشاء اجتماع جديد'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <TextField
              fullWidth
              label="عنوان الاجتماع *"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              required
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            <TextField
              fullWidth
              label="وصف الاجتماع"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            <FormControl fullWidth>
              <InputLabel>نوع الاجتماع *</InputLabel>
              <Select
                value={formData.meeting_type}
                onChange={(e) => handleFormChange('meeting_type', e.target.value)}
                required
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
              value={formData.max_participants}
              onChange={(e) => handleFormChange('max_participants', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 200 }}
              helperText="الحد الأدنى: 1، الحد الأقصى: 200"
            />
            <TextField
              fullWidth
              label="تاريخ ووقت البدء *"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => handleFormChange('start_time', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              helperText="اختر تاريخ ووقت بدء الاجتماع"
            />
            <TextField
              fullWidth
              label="المدة (بالدقائق) *"
              type="number"
              value={formData.duration}
              onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
              inputProps={{ min: 15, max: 480 }}
              helperText="الحد الأدنى: 15 دقيقة، الحد الأقصى: 8 ساعات"
              required
            />
            <TextField
              fullWidth
              label="رابط زووم (اختياري)"
              value={formData.zoom_link}
              onChange={(e) => handleFormChange('zoom_link', e.target.value)}
              helperText="مطلوب فقط لاجتماعات زووم"
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenCreateDialog(false)} 
            disabled={loading}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={selectedMeeting ? () => handleUpdateMeeting(selectedMeeting.id) : handleCreateMeeting}
            disabled={loading}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                جاري الحفظ...
              </Box>
            ) : (
              selectedMeeting ? 'تحديث الاجتماع' : 'إنشاء الاجتماع'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Details Dialog */}
      <TeacherMeetingDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        meeting={selectedMeeting}
        onEdit={(meeting) => {
          console.log('Edit button clicked for meeting:', meeting);
          openEditDialog(meeting);
          setOpenDetailsDialog(false);
        }}
        onRefresh={() => {
          // Force refresh of meeting details
          if (selectedMeeting) {
            setSelectedMeeting(prev => ({
              ...prev,
              updated_at: new Date().toISOString()
            }));
          }
        }}
        onStartLive={(meetingId) => {
          handleStartLiveMeeting(meetingId);
          setOpenDetailsDialog(false);
        }}
        onJoinMeeting={(meeting) => {
          if (meeting.zoom_link) {
            window.open(meeting.zoom_link, '_blank');
          }
        }}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default TeacherMeetings;
