import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  Divider, 
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Badge,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Slide,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Lock, 
  Email, 
  Phone, 
  LocationOn, 
  School, 
  Work, 
  CalendarToday, 
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Add,
  Close,
  DeleteOutline,
  Security,
  Notifications,
  Palette,
  Language,
  Person,
  PhotoCamera,
  CloudUpload,
  Star,
  TrendingUp,
  Assignment,
  VideoCall,
  Article,
  Settings,
  AccountCircle,
  VerifiedUser,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  VideoCall as VideoCallIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Schedule as ScheduleIcon,
  ExpandMore,
  MoreVert,
  Favorite,
  Share,
  Bookmark,
  BookmarkBorder,
  Grade,
  EmojiEvents,
  Psychology,
  Code,
  Business,
  Science,
  SportsEsports,
  MusicNote,
  Movie,
  CameraAlt,
  Videocam,
  Headphones,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  FitnessCenter,
  Restaurant,
  LocalHospital
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import profileImage from '../../assets/images/profile.jpg';

// Styled Components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #0e5181 0%, #e5978b 100%)`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  }
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(14, 81, 129, 0.1)',
  border: '1px solid',
  borderColor: alpha('#0e5181', 0.08),
  transition: 'all 0.3s ease',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(229, 151, 139, 0.02) 100%)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(14, 81, 129, 0.15)',
    borderColor: alpha('#0e5181', 0.15),
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${alpha('#0e5181', 0.03)} 0%, ${alpha('#e5978b', 0.03)} 100%)`,
  border: '1px solid',
  borderColor: alpha('#0e5181', 0.08),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(14, 81, 129, 0.12)',
  }
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  background: `linear-gradient(135deg, ${alpha('#0e5181', 0.1)} 0%, ${alpha('#e5978b', 0.1)} 100%)`,
  border: `1px solid ${alpha('#0e5181', 0.2)}`,
  color: '#0e5181',
  '&:hover': {
    transform: 'scale(1.05)',
    background: `linear-gradient(135deg, ${alpha('#0e5181', 0.15)} 0%, ${alpha('#e5978b', 0.15)} 100%)`,
  }
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, getUserRole, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
    bio: user?.bio || '',
    avatar: user?.profile_picture || profileImage,
    coverImage: 'https://source.unsplash.com/random/1200x300?programming',
    joinDate: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('ar-EG') : '',
    skills: user?.skills || [],
    education: user?.education || [],
    experience: user?.experience || [],
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificates: 0,
    lectures: 0,
    lastActive: 'منذ ساعتين',
    isVerified: user?.is_verified || false,
    profileCompletion: 0
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: {
      courseAnnouncements: true,
      privateMessages: true,
      promotionalOffers: false,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true,
      allowMessages: true
    },
    appearance: {
      theme: 'auto',
      language: 'ar',
      fontSize: 'medium'
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSettingsChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare profile data
      const profileUpdateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
        bio: profileData.bio
      };
      
      // Try to update profile
      let updatedProfile;
      try {
        updatedProfile = await profileService.updateProfile(profileUpdateData);
      } catch (error) {
        console.warn('Profile update failed, using local update:', error);
        // If API fails, update locally
        updatedProfile = {
          ...user,
          ...profileUpdateData
        };
      }
      
      // Update user context
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      setSnackbar({
        open: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        severity: 'success',
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      try {
        await profileService.updateSettings(settings);
      } catch (error) {
        console.warn('Settings update failed, saving locally:', error);
        // If API fails, save locally
        localStorage.setItem('userSettings', JSON.stringify(settings));
      }
      
      setSnackbar({
        open: true,
        message: 'تم حفظ الإعدادات بنجاح',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'فشل حفظ الإعدادات. يرجى المحاولة مرة أخرى',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profile data from API
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setInitialLoading(true);
        
        // Try to load profile data
        let profileData = {};
        let statistics = {};
        
        try {
          profileData = await profileService.getProfile();
        } catch (error) {
          console.warn('Could not load profile data:', error);
          // Use user data from context as fallback
          profileData = {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            website: user?.website || '',
            bio: user?.bio || '',
            profile_picture: user?.profile_picture || profileImage,
            date_joined: user?.date_joined || '',
            skills: user?.skills || [],
            education: user?.education || [],
            experience: user?.experience || [],
            is_verified: user?.is_verified || false
          };
        }
        
        try {
          statistics = await profileService.getStatistics();
        } catch (error) {
          console.warn('Could not load statistics:', error);
          // Use default statistics
          statistics = {
            coursesEnrolled: 0,
            coursesCompleted: 0,
            certificates: 0,
            lectures: 0
          };
        }
        
        setProfileData(prev => ({
          ...prev,
          ...profileData,
          ...statistics
        }));
      } catch (error) {
        console.error('Error loading profile data:', error);
        setSnackbar({
          open: true,
          message: 'فشل تحميل بيانات الملف الشخصي',
          severity: 'error',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setSnackbar({
        open: true,
        message: 'كلمة المرور الجديدة غير متطابقة',
        severity: 'error',
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setSnackbar({
        open: true,
        message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      try {
        await profileService.changePassword(passwordData);
      } catch (error) {
        console.warn('Password change failed:', error);
        // Show specific error message
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.detail || 
                           'فشل تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية.';
        throw new Error(errorMessage);
      }
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setSnackbar({
        open: true,
        message: 'تم تغيير كلمة المرور بنجاح',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.message || 'فشل تغيير كلمة المرور',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'يرجى اختيار ملف صورة صحيح',
        severity: 'error',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      
      try {
        const result = await profileService.uploadProfilePicture(file);
        
        setProfileData(prev => ({
          ...prev,
          avatar: result.profile_picture
        }));
        
        // Update user context
        if (updateUser) {
          updateUser({ ...user, profile_picture: result.profile_picture });
        }
        
        setSnackbar({
          open: true,
          message: 'تم تحديث الصورة الشخصية بنجاح',
          severity: 'success',
        });
      } catch (error) {
        console.warn('Profile picture upload failed, using local preview:', error);
        // If API fails, create local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileData(prev => ({
            ...prev,
            avatar: e.target.result
          }));
        };
        reader.readAsDataURL(file);
        
        setSnackbar({
          open: true,
          message: 'تم تحديث الصورة محلياً (فشل في الحفظ على الخادم)',
          severity: 'warning',
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'فشل تحديث الصورة الشخصية',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'الكورسات المسجلة',
      value: profileData.coursesEnrolled || 0,
      icon: <SchoolIcon />,
      color: 'primary',
      gradient: 'linear-gradient(135deg, #667eea 0%, #0e5181 100%)'
    },
    {
      title: 'الكورسات المكتملة',
      value: profileData.coursesCompleted || 0,
      icon: <AssignmentIcon />,
      color: 'success',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'الشهادات',
      value: profileData.certificates || 0,
      icon: <AssessmentIcon />,
      color: 'warning',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'المحاضرات',
      value: profileData.lectures || 0,
      icon: <VideoCallIcon />,
      color: 'info',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  // Show loading screen
  if (initialLoading) {
  return (
      <Container maxWidth="xl" sx={{ py: 4, direction: 'rtl' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6, direction: 'rtl' }}>

      <Grid container spacing={4}>
        {/* Single Block - All Profile Information */}
        <Grid item xs={12}>
          <Slide direction="up" in timeout={1000}>
            <ProfileCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4,
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: alpha('#0e5181', 0.1)
                }}>
                  <Typography variant="h5" fontWeight="bold" color="#0e5181">
                    معلومات الملف الشخصي
                  </Typography>
                  <Button 
                    variant={editMode ? "contained" : "outlined"} 
                    sx={{
                      backgroundColor: editMode ? '#0e5181' : 'transparent',
                      color: editMode ? 'white' : '#0e5181',
                      borderColor: '#0e5181',
                      '&:hover': {
                        backgroundColor: editMode ? '#0a3d5f' : alpha('#0e5181', 0.1),
                      },
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold'
                    }}
                    startIcon={editMode ? <Save /> : <Edit />}
                    onClick={editMode ? handleSaveProfile : handleEditToggle}
                    disabled={loading}
                  >
                    {editMode ? 'حفظ التغييرات' : 'تعديل الملف الشخصي'}
                  </Button>
                </Box>

                <Grid container spacing={4}>
                  {/* Left Side - Profile Picture and Password */}
                  <Grid item xs={12} md={4}>
                    {/* Profile Picture Section */}
                    <Box sx={{ 
                      textAlign: 'center', 
                      mb: 4,
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#0e5181', 0.02)} 0%, ${alpha('#e5978b', 0.02)} 100%)`,
                      border: '1px solid',
                      borderColor: alpha('#0e5181', 0.08)
                    }}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar 
                          src={profileData.avatar} 
                          alt={`${profileData.firstName} ${profileData.lastName}`}
                          sx={{ 
                            width: 140, 
                            height: 140,
                            border: '4px solid',
                            borderColor: '#0e5181',
                            mb: 3,
                            boxShadow: '0 8px 25px rgba(14, 81, 129, 0.2)'
                          }}
                        />
                        {editMode && (
                          <IconButton 
                            color="error"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              backgroundColor: 'error.main',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'error.dark',
                              },
                            }}
                            onClick={() => setProfileData(prev => ({ ...prev, avatar: profileImage }))}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {editMode && (
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCamera />}
                          onClick={() => fileInputRef.current?.click()}
                          fullWidth
                          sx={{ 
                            mb: 2,
                            borderColor: '#0e5181',
                            color: '#0e5181',
                            '&:hover': {
                              borderColor: '#0a3d5f',
                              backgroundColor: alpha('#0e5181', 0.05),
                            }
                          }}
                        >
                          تحميل صورة
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleProfilePictureUpload}
                      />
                    </Box>
                    
                    {/* Password Change Section */}
                    <Box sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#0e5181', 0.02)} 0%, ${alpha('#e5978b', 0.02)} 100%)`,
                      border: '1px solid',
                      borderColor: alpha('#0e5181', 0.08)
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#0e5181' }}>
                        تغيير كلمة المرور
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="كلمة المرور الحالية"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            size="small"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              current_password: e.target.value
                            }))}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    sx={{ color: '#0e5181' }}
                                  >
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="كلمة المرور الجديدة"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            size="small"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({
                              ...prev,
                              new_password: e.target.value
                            }))}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                            onClick={handlePasswordChange}
                            disabled={loading}
                            sx={{
                              backgroundColor: '#0e5181',
                              '&:hover': {
                                backgroundColor: '#0a3d5f',
                              },
                              py: 1.5,
                              borderRadius: 2,
                              fontWeight: 'bold'
                            }}
                          >
                            تغيير كلمة المرور
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Right Side - Profile Information */}
                  <Grid item xs={12} md={8}>
                    {/* Profile Information Section */}
                    <Box sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#0e5181', 0.02)} 0%, ${alpha('#e5978b', 0.02)} 100%)`,
                      border: '1px solid',
                      borderColor: alpha('#0e5181', 0.08),
                      mb: 4
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#0e5181' }}>
                        المعلومات الشخصية
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="اسم المستخدم"
                            name="username"
                            value={user?.username || ''}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="الاسم الأول"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="الاسم المستعار"
                            name="nickname"
                            value={profileData.nickname || ''}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="الدور"
                            name="role"
                            value={getUserRole() === 'instructor' ? 'مدرس' : 'طالب'}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="اسم العائلة"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="الاسم المعروض للجميع"
                            name="displayName"
                            value={profileData.displayName || `${profileData.firstName} ${profileData.lastName}`}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                          
                    {/* Contact Info Section */}
                    <Box sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#0e5181', 0.02)} 0%, ${alpha('#e5978b', 0.02)} 100%)`,
                      border: '1px solid',
                      borderColor: alpha('#0e5181', 0.08),
                      mb: 4
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#0e5181' }}>
                        معلومات التواصل
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="البريد الإلكتروني (مطلوب)"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="واتساب"
                            name="whatsapp"
                            value={profileData.whatsapp || ''}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="الموقع الإلكتروني"
                            name="website"
                            value={profileData.website}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="تيليجرام"
                            name="telegram"
                            value={profileData.telegram || ''}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="رقم الجوال"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: alpha('#0e5181', 0.2),
                                },
                                '&:hover fieldset': {
                                  borderColor: alpha('#0e5181', 0.4),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#0e5181',
                                },
                              },
                            }}
                            InputProps={{
                              readOnly: !editMode,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* About User Section */}
                    <Box sx={{
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#0e5181', 0.02)} 0%, ${alpha('#e5978b', 0.02)} 100%)`,
                      border: '1px solid',
                      borderColor: alpha('#0e5181', 0.08)
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 3, color: '#0e5181' }}>
                        نبذة عن المستخدم
                      </Typography>
                      <TextField
                        fullWidth
                        label="المعلومات السيرة الذاتية"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        multiline
                        rows={6}
                        variant="outlined"
                        size="small"
                        placeholder="أخبرنا عن نفسك، خبراتك، اهتماماتك..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: alpha('#0e5181', 0.2),
                            },
                            '&:hover fieldset': {
                              borderColor: alpha('#0e5181', 0.4),
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0e5181',
                            },
                          },
                        }}
                        InputProps={{
                          readOnly: !editMode,
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
            </CardContent>
            </ProfileCard>
          </Slide>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        aria-label="edit"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          backgroundColor: '#0e5181',
          color: 'white',
          '&:hover': {
            backgroundColor: '#0a3d5f',
            transform: 'scale(1.1)',
          },
          boxShadow: '0 8px 25px rgba(14, 81, 129, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onClick={handleEditToggle}
      >
        <Edit />
      </Fab>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ direction: 'rtl' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;