import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Divider,
  List, ListItem, ListItemText, ListItemAvatar, Badge, LinearProgress, Alert,
  Tabs, Tab, Fab, Drawer, AppBar, Toolbar
} from '@mui/material';
import {
  VideoCall as VideoCallIcon, Mic as MicIcon, MicOff as MicOffIcon,
  Videocam as VideocamIcon, VideocamOff as VideocamOffIcon, Chat as ChatIcon,
  Settings as SettingsIcon, MoreVert as MoreVertIcon, Close as CloseIcon,
  Send as SendIcon, AttachFile as AttachFileIcon, EmojiEmotions as EmojiIcon,
  Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
  VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon, PanTool as HandIcon,
  School as SchoolIcon, Timer as TimerIcon, Notifications as NotificationsIcon,
  FileCopy as FileCopyIcon, Book as BookIcon, Download as DownloadIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#000',
  '&:hover .controls-overlay': {
    opacity: 1,
  },
}));

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  padding: theme.spacing(2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

const ChatMessage = styled(Box)(({ theme, isOwn }) => ({
  display: 'flex',
  flexDirection: isOwn ? 'row-reverse' : 'row',
  marginBottom: theme.spacing(1),
  '& .message-content': {
    maxWidth: '70%',
    padding: theme.spacing(1, 2),
    borderRadius: 16,
    background: isOwn ? '#673ab7' : '#f5f5f5',
    color: isOwn ? '#fff' : '#333',
    margin: theme.spacing(0, 1),
  },
}));

import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../../services/meeting.service';

const StudentLiveMeeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meeting details
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        setLoading(true);
        const response = await meetingAPI.getMeetingDetails(meetingId);
        setMeetingInfo(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('حدث خطأ في تحميل تفاصيل الاجتماع');
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId]);

  const participants = [
    { id: 1, name: "أحمد محمد", email: "ahmed@example.com", status: "online", isHost: true, isMuted: false, isVideoOn: true, joinTime: "10:00" },
    { id: 2, name: "علي أحمد", email: "ali@example.com", status: "online", isHost: false, isMuted: false, isVideoOn: true, joinTime: "10:05" },
    { id: 3, name: "فاطمة محمد", email: "fatima@example.com", status: "online", isHost: false, isMuted: true, isVideoOn: false, joinTime: "10:02" },
    { id: 4, name: "محمد علي", email: "mohamed@example.com", status: "online", isHost: false, isMuted: false, isVideoOn: true, joinTime: "10:08" },
    { id: 5, name: "سارة أحمد", email: "sara@example.com", status: "online", isHost: false, isMuted: false, isVideoOn: true, joinTime: "10:10" },
  ];

  const chatMessages = [
    { id: 1, user: "أحمد محمد", message: "أهلاً وسهلاً بالجميع، نبدأ المحاضرة", time: "10:00", isOwn: false, isTeacher: true },
    { id: 2, user: "علي أحمد", message: "مرحباً دكتور", time: "10:01", isOwn: true, isTeacher: false },
    { id: 3, user: "أحمد محمد", message: "هل يمكن رفع الشريحة الأولى؟", time: "10:02", isOwn: false, isTeacher: true },
    { id: 4, user: "فاطمة محمد", message: "نعم بالطبع", time: "10:03", isOwn: false, isTeacher: false },
    { id: 5, user: "أحمد محمد", message: "شكراً لكم، الآن نبدأ بالشرح", time: "10:04", isOwn: false, isTeacher: true },
  ];

  const materials = [
    { id: 1, name: "الشريحة الأولى - مقدمة في الجبر", type: "pdf", size: "2.5 MB" },
    { id: 2, name: "تمارين الفصل الأول", type: "pdf", size: "1.8 MB" },
    { id: 3, name: "ملخص المحاضرة", type: "docx", size: "1.2 MB" },
  ];

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Logic to send message
      console.log('Sending message:', chatMessage);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleHandRaise = () => setIsHandRaised(!isHandRaised);

  const handleLeaveMeeting = async () => {
    try {
      await meetingAPI.leaveMeeting(meetingId);
      // Close the window or navigate back
      window.close();
      // Alternative: navigate back
      // navigate('/student/meetings');
    } catch (err) {
      console.error('Error leaving meeting:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#673ab7', mb: 2 }} />
          <Typography variant="h6">جاري تحميل الاجتماع...</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error || !meetingInfo) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: '#1a1a1a',
        color: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            {error || 'حدث خطأ في تحميل الاجتماع'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/student/meetings')}
            sx={{ bgcolor: '#673ab7' }}
          >
            العودة لصفحة الاجتماعات
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2d2d2d', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {meetingInfo.title}
            </Typography>
            <Chip
              label="مباشر"
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {formatTime(elapsedTime)}
            </Typography>
            <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
            <IconButton color="inherit">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Main Video (Teacher) */}
          <VideoContainer sx={{ flex: 1, mb: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #333 30%, #555 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Box sx={{ textAlign: 'center', color: '#fff' }}>
                <VideocamIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">{meetingInfo.creator_name || 'المعلم'}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {isVideoOn ? 'فيديو نشط' : 'الفيديو معطل'}
                </Typography>
              </Box>
            </Box>
            <ControlsOverlay className="controls-overlay">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="#fff">
                  {meetingInfo.participants_count || 0} مشارك
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.3)' }}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Box>
              </Box>
            </ControlsOverlay>
          </VideoContainer>

          {/* Participants Grid */}
          <Grid container spacing={1} sx={{ height: 120 }}>
            {participants.slice(0, 6).map((participant) => (
              <Grid item xs={2} key={participant.id}>
                <VideoContainer sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, #444 30%, #666 90%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {participant.name.charAt(0)}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        left: 4,
                        display: 'flex',
                        gap: 0.5,
                      }}
                    >
                      {participant.isMuted && (
                        <MicOffIcon sx={{ fontSize: 16, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }} />
                      )}
                      {!participant.isVideoOn && (
                        <VideocamOffIcon sx={{ fontSize: 16, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1 }} />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        color: '#fff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {participant.name}
                    </Typography>
                  </Box>
                </VideoContainer>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <Paper sx={{ borderRadius: 0 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  flex: 1,
                },
              }}
            >
              <Tab
                icon={<ChatIcon />}
                label="الدردشة"
                onClick={() => setChatOpen(true)}
              />
              <Tab
                icon={<SchoolIcon />}
                label="المواد"
                onClick={() => setChatOpen(false)}
              />
            </Tabs>
          </Paper>

          {/* Chat Panel */}
          {tabValue === 0 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  الدردشة
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {participants.length} مشارك
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {chatMessages.map((msg) => (
                  <ChatMessage key={msg.id} isOwn={msg.isOwn}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                      {msg.user.charAt(0)}
                    </Avatar>
                    <Box className="message-content">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {msg.user}
                        </Typography>
                        {msg.isTeacher && (
                          <Chip label="المعلم" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                      <Typography variant="body2">
                        {msg.message}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {msg.time}
                      </Typography>
                    </Box>
                  </ChatMessage>
                ))}
              </Box>

              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <IconButton size="small">
                    <AttachFileIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EmojiIcon />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="اكتب رسالة..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  sx={{ mt: 1, borderRadius: 2 }}
                  disabled={!chatMessage.trim()}
                >
                  إرسال
                </Button>
              </Box>
            </Box>
          )}

          {/* Materials Panel */}
          {tabValue === 1 && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  المواد التعليمية
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {materials.length} ملف متاح
                </Typography>
              </Box>
              
              <List sx={{ flex: 1, overflowY: 'auto' }}>
                {materials.map((material) => (
                  <ListItem key={material.id} sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#673ab7' }}>
                        <BookIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={material.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {material.type.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {material.size}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => console.log('Downloading:', material.name)}
                      sx={{ color: '#673ab7' }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ p: 2, bgcolor: '#2d2d2d', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            onClick={toggleMic}
            sx={{
              bgcolor: isMicOn ? '#4caf50' : '#f44336',
              color: '#fff',
              '&:hover': {
                bgcolor: isMicOn ? '#45a049' : '#d32f2f',
              },
            }}
          >
            {isMicOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>

          <IconButton
            onClick={toggleVideo}
            sx={{
              bgcolor: isVideoOn ? '#4caf50' : '#f44336',
              color: '#fff',
              '&:hover': {
                bgcolor: isVideoOn ? '#45a049' : '#d32f2f',
              },
            }}
          >
            {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>

          <IconButton
            onClick={toggleHandRaise}
            sx={{
              bgcolor: isHandRaised ? '#ff9800' : '#666',
              color: '#fff',
              '&:hover': {
                bgcolor: isHandRaised ? '#f57c00' : '#555',
              },
            }}
          >
            <HandIcon />
          </IconButton>

          <IconButton
            onClick={toggleMute}
            sx={{
              bgcolor: isMuted ? '#ff9800' : '#666',
              color: '#fff',
              '&:hover': {
                bgcolor: isMuted ? '#f57c00' : '#555',
              },
            }}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#555' }} />

                     <Button
             variant="contained"
             color="error"
             startIcon={<CloseIcon />}
             onClick={handleLeaveMeeting}
             sx={{ borderRadius: 2 }}
           >
             مغادرة الاجتماع
           </Button>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          إعدادات الاجتماع
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                معلومات الاجتماع
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                 <Typography variant="body2">
                   <strong>العنوان:</strong> {meetingInfo.title}
                 </Typography>
                 <Typography variant="body2">
                   <strong>المعلم:</strong> {meetingInfo.creator_name || 'غير محدد'}
                 </Typography>
                 <Typography variant="body2">
                   <strong>المدة:</strong> {formatTime(elapsedTime)}
                 </Typography>
                 <Typography variant="body2">
                   <strong>المشاركون:</strong> {meetingInfo.participants_count || 0}/{meetingInfo.max_participants || 20}
                 </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                مشاركة الرابط
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <TextField
                   fullWidth
                   value={`${window.location.origin}/student/meetings/live/${meetingInfo.id}`}
                   variant="outlined"
                   size="small"
                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                 />
                 <IconButton
                   size="small"
                   onClick={() => navigator.clipboard.writeText(`${window.location.origin}/student/meetings/live/${meetingInfo.id}`)}
                   sx={{ color: '#673ab7' }}
                 >
                   <FileCopyIcon />
                 </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                إعدادات الصوت والفيديو
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">الميكروفون</Typography>
                  <Button
                    variant={isMicOn ? "contained" : "outlined"}
                    size="small"
                    onClick={toggleMic}
                    sx={{ borderRadius: 2 }}
                  >
                    {isMicOn ? "مفعل" : "معطل"}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">الكاميرا</Typography>
                  <Button
                    variant={isVideoOn ? "contained" : "outlined"}
                    size="small"
                    onClick={toggleVideo}
                    sx={{ borderRadius: 2 }}
                  >
                    {isVideoOn ? "مفعلة" : "معطلة"}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setSettingsOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentLiveMeeting; 