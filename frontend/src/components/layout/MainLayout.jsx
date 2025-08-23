import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { useAuth } from '../../contexts/AuthContext';
import profileImage from '../../assets/images/profile.jpg';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, Badge, InputBase, Paper
} from '@mui/material';
import {
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Assessment as AssessmentIcon, 
  Message as MessageIcon,
  Settings as SettingsIcon, 
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Grade as GradeIcon,
  Home as HomeIcon,
  Quiz as QuizIcon,
  VideoCall as VideoCallIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

const drawerWidth = 270;

// Navigation items for teacher
const teacherNavItems = [
  { text: 'الرئيسية', icon: <HomeIcon />, path: '/', exact: true },
  { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/teacher/dashboard' },
  { text: 'كورساتي', icon: <ClassIcon />, path: '/teacher/my-courses' },
  { text: 'الواجبات', icon: <AssignmentIcon />, path: '/teacher/assignments' },
  { text: 'الكويزات', icon: <QuizIcon />, path: '/teacher/quizzes' },
  { text: 'الامتحانات', icon: <AssessmentIcon />, path: '/teacher/exams' },
  { text: 'المحاضرات', icon: <VideoCallIcon />, path: '/teacher/meetings' },
  { text: 'المقالات', icon: <ArticleIcon />, path: '/teacher/articles' },
  { text: 'الإعدادات', icon: <SettingsIcon />, path: '/teacher/settings' },
];

// Navigation items for student
const studentNavItems = [
  { text: 'الرئيسية', icon: <HomeIcon />, path: '/', exact: true },
  { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/student/dashboard' },
  { text: 'كورساتي', icon: <ClassIcon />, path: '/student/my-courses' },
  { text: 'واجباتي', icon: <AssignmentIcon />, path: '/student/assignments' },
  { text: 'محاضراتي', icon: <VideoCallIcon />, path: '/student/meetings' },
  { text: 'شهاداتي', icon: <SchoolIcon />, path: '/student/certificates' },
  { text: 'الإعدادات', icon: <SettingsIcon />, path: '/student/settings' },
];

const MainLayout = ({ children, toggleDarkMode, isDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getUserRole, user } = useAuth(); // Get user data from auth context
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Sample notifications data
  const notifications = [
    { id: 1, text: 'لديك واجب جديد في مادة الرياضيات', time: 'منذ 10 دقائق', read: false },
    { id: 2, text: 'تم إضافة درجات الاختبار النصفي', time: 'منذ ساعة', read: false },
    { id: 3, text: 'محاضرة جديدة متاحة', time: 'منذ يوم', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get user data with fallbacks
  const getUserData = () => {
    if (user) {
      return {
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username || 'مستخدم',
        email: user.email || '',
        avatar: user.profile_picture || profileImage,
        role: getUserRole() === 'instructor' ? 'مدرس' : 'طالب',
        description: user.bio || (getUserRole() === 'instructor' ? 'مدرس في المنصة' : 'طالب في المنصة')
      };
    }
    return {
      name: 'مستخدم',
      email: '',
      avatar: profileImage,
      role: 'طالب',
      description: 'طالب في المنصة'
    };
  };

  const userData = getUserData();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifMenuOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
    handleMenuClose();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setAnchorEl(null);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get user role from useAuth hook
  const userRole = getUserRole();
  
  // Select navigation items based on user role
  const getNavItems = () => {
    switch(userRole) {
      case 'instructor':
      case 'teacher':
        return teacherNavItems;
      case 'student':
      default:
        return studentNavItems;
    }
  };
  
  const navItems = getNavItems();
  
  // Check if a nav item is active based on current path
  const isActive = (itemPath, exact = false) => {
    if (exact) {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath) && itemPath !== '/';
  };

  const drawer = (
    <Box sx={{
      height: '100%',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '24px 0 0 24px',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      {/* User Profile */}
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3,
        background: 'rgba(14,81,129,0.05)', borderRadius: 3, p: 2, boxShadow: '0 2px 8px 0 rgba(14,81,129,0.07)'
      }}>
        <Avatar 
          src={userData.avatar} 
          alt={userData.name}
          sx={{
            width: 90, height: 90, mb: 1, border: '3px solid #e5978b', boxShadow: '0 2px 8px 0 rgba(14,81,129,0.09)'
          }}
        />
        <Typography fontWeight={700}>{userData.name}</Typography>
        <Typography variant="caption" color="text.secondary">{userData.description}</Typography>
      </Box>
      <Divider sx={{ width: '100%', mb: 2 }} />
      {/* Navigation */}
      <List sx={{ width: '100%' }}>
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <NavLink
              key={item.text}
              to={item.path}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                marginBottom: '8px',
                borderRadius: '8px',
                background: active ? 'linear-gradient(90deg, rgba(14,81,129,0.1) 0%, #fff 100%)' : 'none',
                boxShadow: active ? '0 2px 8px 0 rgba(14,81,129,0.10)' : 'none',
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  color: active ? '#0e5181' : '#757575',
                  '&:hover': {
                    background: 'linear-gradient(90deg, rgba(14,81,129,0.05) 0%, #fff 100%)',
                    color: '#0e5181'
                  }
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 36,
                  color: active ? '#0e5181' : '#bdbdbd',
                  fontSize: 24
                }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ fontWeight: 600 }} />
                {item.badge && (
                  <Badge badgeContent={item.badge} color="secondary" sx={{ position: 'absolute', left: 16 }} />
                )}
              </ListItemButton>
            </NavLink>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%',
      background: '#f6f7fb', 
      direction: 'rtl', 
      overflow: 'hidden',
      '& *': {
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.02)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.15)',
          },
        },
      },
    }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: drawerWidth, 
        flexShrink: 0, 
        position: 'relative', 
        height: '100%', 
        overflowY: 'auto',
        overflowX: 'hidden',
        '&:hover': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}>
        <Drawer
          variant="permanent"
          anchor="right"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              position: 'relative',
              height: '100%',
              overflow: 'visible'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        width: '100%', // Changed to take full width
        '& > *:first-child': { // AppBar
          flexShrink: 0
        },
        '& > *:last-child': { // Content area
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 4,
          pt: 2,
          maxWidth: '100%', // Ensure content doesn't overflow
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.15)',
            },
          },
        }
      }}>
        {/* AppBar Wrapper */}
        <Box sx={{ position: 'relative', zIndex: 1000 }}>
        {/* AppBar */}
        <AppBar position="static" elevation={0} sx={{
          background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 10px 0 rgba(14,81,129,0.04)', mb: 3, borderRadius: 3
        }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Paper
              component="form"
              sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 250, background: '#fff', borderRadius: 2, boxShadow: 0 }}
            >
              <InputBase sx={{ ml: 1, flex: 1 }} placeholder="بحث..." inputProps={{ 'aria-label': 'بحث' }} />
            </Paper>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Notification Dropdown */}
              <Box ref={notifRef} sx={{ position: 'relative' }}>
                <IconButton 
                  color="inherit" 
                  sx={{ bgcolor: notifAnchorEl ? 'rgba(14,81,129,0.1)' : 'rgba(229,151,139,0.1)', p: 1.2 }}
                  onClick={handleNotifMenuOpen}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                
                {/* Notification Dropdown Menu */}
                {notifAnchorEl && (
                  <Paper 
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: 350,
                      maxHeight: 400,
                      overflowY: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      zIndex: 9999,
                      p: 2,
                      background: '#ffffff',
                      border: '1px solid #e0e0e0',
                      mt: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>الإشعارات</Typography>
                      <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>تمييز الكل كمقروء</Typography>
                    </Box>
                    <Divider />
                    <List sx={{ p: 0 }}>
                      {notifications.map((notification) => (
                        <ListItemButton 
                          key={notification.id}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: !notification.read ? 'rgba(14,81,129,0.05)' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(229,151,139,0.05)' }
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                              {notification.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.time}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      ))}
                    </List>
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        عرض الكل
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>

              {/* Profile Dropdown */}
              <Box ref={profileRef} sx={{ position: 'relative' }}>
                <IconButton 
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0, '&:hover': { opacity: 0.8 } }}
                >
                  <Avatar 
                    src={userData.avatar}
                    alt={userData.name}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      border: '2px solid #e5978b',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(14,81,129,0.3)'
                      }
                    }} 
                  />
                </IconButton>
                
                {/* Profile Dropdown Menu */}
                {anchorEl && (
                  <Paper 
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: 250,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      zIndex: 9999,
                      overflow: 'hidden',
                      background: '#ffffff',
                      border: '1px solid #e0e0e0',
                      mt: 1
                    }}
                  >
                    <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                      <Avatar 
                        src={userData.avatar}
                        alt={userData.name}
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          mb: 1,
                          mx: 'auto',
                          border: '2px solid #e5978b'
                        }} 
                      />
                      <Typography variant="subtitle1" fontWeight={600}>{userData.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{userData.role}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {userData.email}
                      </Typography>
                    </Box>
                    <List sx={{ p: 0 }}>
                      <ListItemButton sx={{ '&:hover': { bgcolor: 'rgba(14,81,129,0.05)' } }}>
                        <ListItemIcon sx={{ minWidth: 36 }}><SettingsIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="إعدادات الحساب" />
                      </ListItemButton>
                      <ListItemButton sx={{ '&:hover': { bgcolor: 'rgba(14,81,129,0.05)' } }}>
                        <ListItemIcon sx={{ minWidth: 36 }}><NotificationsIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="الإشعارات" />
                      </ListItemButton>
                      <Divider />
                      <ListItemButton 
                        onClick={handleLogout}
                        sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                        </ListItemIcon>
                        <ListItemText primary="تسجيل الخروج" />
                      </ListItemButton>
                    </List>
                  </Paper>
                )}
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        </Box>
        {/* Main Dashboard Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 0, pt: 0, width: '100%' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
