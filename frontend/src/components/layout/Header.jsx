import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider, 
  Button, 
  Container, 
  useTheme, 
  useMediaQuery, 
  InputBase, 
  Badge,
  Stack,
  alpha,
  keyframes
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { styled } from '@mui/material/styles';
import logo from '../../assets/images/logo.png';

// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  backgroundColor: scrolled ? 'rgba(26, 26, 46, 0.95)' : 'rgba(26, 26, 46, 0.98)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  animation: `${fadeIn} 0.5s ease-out`,
  '&.MuiAppBar-root': {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
  color: 'white',
  borderRadius: '25px',
  padding: '10px 25px',
  fontWeight: '600',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(78, 205, 196, 0.4)',
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '25px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: '100%',
  maxWidth: '400px',
  [theme.breakpoints.down('sm')]: {
    margin: '10px 0',
    width: '100%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#4ECDC4',
  pointerEvents: 'none',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#FFFFFF',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '12px 20px 12px 50px',
    width: '100%',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
      opacity: 1,
    },
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#FFFFFF',
  margin: theme.spacing(0, 0.5),
  fontWeight: '500',
  fontSize: '1rem',
  textTransform: 'none',
  position: 'relative',
  padding: '8px 12px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
  '&.active': {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  '& .MuiButton-endIcon': {
    marginRight: 4,
    marginLeft: -4,
    '& svg': {
      transition: 'transform 0.2s',
    },
  },
  '&[aria-expanded="true"]': {
    '& .MuiButton-endIcon svg': {
      transform: 'rotate(180deg)',
    },
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: '30px',
  '&:hover': {
    '& img': {
      transform: 'scale(1.05)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    marginRight: '15px',
  },
}));

const LogoImage = styled('img')({
  height: '42px',
  transition: 'transform 0.3s ease',
  '@media (max-width: 600px)': {
    height: '36px',
  },
});

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.4rem',
  background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginRight: '12px',
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

const UserMenu = styled(Menu)({
  '& .MuiPaper-root': {
    backgroundColor: '#1A1A2E',
    color: '#FFFFFF',
    marginTop: '10px',
    minWidth: '200px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    '& .MuiDivider-root': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
});

const UserMenuItem = styled(MenuItem)({
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  '& .MuiSvgIcon-root': {
    marginLeft: '10px',
    color: '#4ECDC4',
  },
});

const NotificationBadge = styled(Badge)({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF6B6B',
    color: '#FFFFFF',
    border: '2px solid #1A1A2E',
  },
});

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation items with dropdowns
  const navItems = [
    { 
      text: 'الرئيسية', 
      path: '/', 
      icon: <HomeIcon /> 
    },
    { 
      text: 'الأقسام', 
      path: '#',
      icon: <MenuBookIcon />,
      dropdown: [
        { text: 'تطوير الويب', path: '/courses?category=web-development' },
        { text: 'تطبيقات الموبايل', path: '/courses?category=mobile-apps' },
        { text: 'الذكاء الاصطناعي', path: '/courses?category=ai' },
        { text: 'تحليل البيانات', path: '/courses?category=data-science' },
        { text: 'التسويق الرقمي', path: '/courses?category=digital-marketing' },
      ]
    },
    { 
      text: 'منصتنا', 
      path: '#',
      icon: <SchoolIcon />,
      dropdown: [
        { text: 'عن المنصة', path: '/about' },
        { text: 'المدونة', path: '/articles' },
        { text: 'الأسئلة الشائعة', path: '/faq' },
        { text: 'اتصل بنا', path: '/contact' },
      ]
    },
    { 
      text: 'لوحة التحكم', 
      path: '/dashboard', 
      icon: <DashboardIcon />, 
      auth: true 
    },
  ];

  const menuId = 'primary-search-account-menu';

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const renderAuthButtons = () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button 
        component={RouterLink} 
        to="/login" 
        color="inherit"
        sx={{ 
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        تسجيل الدخول
      </Button>
      <GradientButton 
        component={RouterLink} 
        to="/register"
        variant="contained"
      >
        إنشاء حساب
      </GradientButton>
    </Stack>
  );

  const renderUserMenu = () => (
    <Box display="flex" alignItems="center">
      <NotificationBadge badgeContent={3} color="error">
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginLeft: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <NotificationsNoneIcon />
        </IconButton>
      </NotificationBadge>
      
      <IconButton
        onClick={handleProfileMenuOpen}
        size="small"
        sx={{ 
          ml: 2,
          p: 0,
          '&:hover': {
            '& .MuiAvatar-root': {
              transform: 'scale(1.1)',
              boxShadow: '0 0 0 2px #4ECDC4',
            },
          },
        }}
      >
        <Avatar 
          alt={user?.name || 'User'}
          src={user?.avatar}
          sx={{
            width: 40,
            height: 40,
            transition: 'all 0.3s ease',
            border: '2px solid #4ECDC4',
          }}
        />
      </IconButton>
      
      <UserMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.name || 'المستخدم'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>
        <Divider />
        <UserMenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <AccountCircleIcon />
          الملف الشخصي
        </UserMenuItem>
        <UserMenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
          <DashboardIcon />
          لوحة التحكم
        </UserMenuItem>
        <Divider />
        <UserMenuItem onClick={handleLogout}>
          <ExitToAppIcon />
          تسجيل الخروج
        </UserMenuItem>
      </UserMenu>
    </Box>
  );

  const renderMobileMenu = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '80%',
        maxWidth: '300px',
        height: '100vh',
        backgroundColor: '#1A1A2E',
        zIndex: 1300,
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '-5px 0 30px rgba(0, 0, 0, 0.3)',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <LogoContainer component={RouterLink} to="/" onClick={() => setMobileMenuOpen(false)}>
          <LogoImage src={logo} alt="شعار المنصة" />
        </LogoContainer>
        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#FFFFFF' }}>
          <Box component="span" sx={{ fontSize: '1.5rem' }}>×</Box>
        </IconButton>
      </Box>
      
      <Box mb={3}>
        <form onSubmit={handleSearch}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="ابحث عن دورة..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </form>
      </Box>
      
      <Box>
        {navItems.map((item) => (
          (!item.auth || isAuthenticated) && (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              fullWidth
              startIcon={item.icon}
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname === item.path ? '#4ECDC4' : '#FFFFFF',
                mb: 1,
                borderRadius: '8px',
                padding: '10px 15px',
                '&:hover': {
                  backgroundColor: 'rgba(78, 205, 196, 0.1)',
                },
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.text}
            </Button>
          )
        ))}
      </Box>
      
      <Box mt={3}>
        {isAuthenticated ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
            sx={{
              background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            تسجيل الخروج
          </Button>
        ) : (
          <>
            <Button
              fullWidth
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                mb: 1,
                '&:hover': {
                  borderColor: '#4ECDC4',
                  backgroundColor: 'rgba(78, 205, 196, 0.1)',
                },
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              تسجيل الدخول
            </Button>
            <Button
              fullWidth
              variant="contained"
              component={RouterLink}
              to="/register"
              sx={{
                background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              إنشاء حساب
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  const renderBackdrop = () => (
    <Box
      onClick={() => setMobileMenuOpen(false)}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    />
  );

  return (
    <>
      <StyledAppBar position="fixed" scrolled={scrolled}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, md: 0 } }}>
              <LogoContainer component={RouterLink} to="/">
                <LogoImage src={logo} alt="شعار المنصة" />
                {!isMobile && (
                  <LogoText variant="h6">
                    
                  </LogoText>
                )}
              </LogoContainer>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', md: 'flex' }, 
              ml: 4,
              '& > *:not(:last-child)': {
                mr: 1,
              },
            }}>
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                
                if (item.dropdown) {
                  const [anchorEl, setAnchorEl] = useState(null);
                  const open = Boolean(anchorEl);
                  
                  const handleClick = (event) => {
                    setAnchorEl(event.currentTarget);
                  };
                  
                  const handleClose = () => {
                    setAnchorEl(null);
                  };
                  
                  return (
                    <div key={item.text}>
                      <NavButton
                        aria-controls={open ? item.text : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        endIcon={<KeyboardArrowDown />}
                        className={location.pathname.startsWith(item.path) ? 'active' : ''}
                      >
                        {item.text}
                      </NavButton>
                      <Menu
                        id={item.text}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          'aria-labelledby': item.text,
                        }}
                        PaperProps={{
                          style: {
                            backgroundColor: '#1A1A2E',
                            color: '#FFFFFF',
                            marginTop: '10px',
                            minWidth: '200px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        {item.dropdown.map((subItem) => (
                          <MenuItem 
                            key={subItem.path}
                            component={RouterLink}
                            to={subItem.path}
                            onClick={handleClose}
                            sx={{
                              color: '#E6E6E6',
                              '&:hover': {
                                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                                color: '#4ECDC4',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                                color: '#4ECDC4',
                              },
                            }}
                          >
                            {subItem.text}
                          </MenuItem>
                        ))}
                      </Menu>
                    </div>
                  );
                }
                
                return (
                  <NavButton
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    {item.text}
                  </NavButton>
                );
              })}
            </Box>

            {/* Search */}
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', md: 'flex' },
              maxWidth: '500px',
              mx: 3,
            }}>
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="ابحث عن دورة..."
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Search>
              </form>
            </Box>

            {/* Auth Buttons / User Menu */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              ml: 'auto',
            }}>
              {isAuthenticated ? (
                <>
                  <IconButton
                    size="large"
                    aria-label="show notifications"
                    color="inherit"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      marginLeft: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsNoneIcon />
                    </Badge>
                  </IconButton>
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{ 
                      ml: 2,
                      p: 0,
                      '&:hover': {
                        '& .MuiAvatar-root': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 0 0 2px #4ECDC4',
                        },
                      },
                    }}
                  >
                    <Avatar 
                      alt={user?.name || 'User'}
                      src={user?.avatar}
                      sx={{
                        width: 40,
                        height: 40,
                        transition: 'all 0.3s ease',
                        border: '2px solid #4ECDC4',
                      }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Box px={2} py={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name || 'المستخدم'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email || 'user@example.com'}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                      <AccountCircleIcon sx={{ ml: 1 }} />
                      الملف الشخصي
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                      <DashboardIcon sx={{ ml: 1 }} />
                      لوحة التحكم
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToAppIcon sx={{ ml: 1 }} />
                      تسجيل الخروج
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    color="inherit"
                    sx={{ 
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    تسجيل الدخول
                  </Button>
                  <GradientButton 
                    component={RouterLink} 
                    to="/register"
                    variant="contained"
                  >
                    إنشاء حساب
                  </GradientButton>
                </Stack>
              )}
            </Box>

            {/* Mobile Menu Button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
              <IconButton
                size="large"
                aria-label="show menu"
                onClick={() => setMobileMenuOpen(true)}
                color="inherit"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '80%',
            maxWidth: '300px',
            height: '100vh',
            backgroundColor: '#1A1A2E',
            zIndex: 1300,
            boxShadow: '-5px 0 30px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            overflowY: 'auto',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <LogoContainer component={RouterLink} to="/" onClick={() => setMobileMenuOpen(false)}>
              <LogoImage src={logo} alt="شعار المنصة" />
              <LogoText variant="h6">أكاديمية التطوير</LogoText>
            </LogoContainer>
            <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#FFFFFF' }}>
              <Box component="span" sx={{ fontSize: '1.5rem' }}>×</Box>
            </IconButton>
          </Box>
          
          <Box mb={3}>
            <form onSubmit={handleSearch}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="ابحث عن دورة..."
                  inputProps={{ 'aria-label': 'search' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Search>
            </form>
          </Box>
          
          <Box>
            {navItems.map((item) => (
              (!item.auth || isAuthenticated) && (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  fullWidth
                  startIcon={item.icon}
                  sx={{
                    justifyContent: 'flex-start',
                    color: location.pathname === item.path ? '#4ECDC4' : '#FFFFFF',
                    mb: 1,
                    borderRadius: '8px',
                    padding: '10px 15px',
                    '&:hover': {
                      backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    },
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.text}
                </Button>
              )
            ))}
          </Box>
          
          <Box mt={3}>
            {isAuthenticated ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogout}
                startIcon={<ExitToAppIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                تسجيل الخروج
              </Button>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    mb: 1,
                    '&:hover': {
                      borderColor: '#4ECDC4',
                      backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    },
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  تسجيل الدخول
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)',
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  إنشاء حساب
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}
      
      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <Box
          onClick={() => setMobileMenuOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
        />
      )}
      
      {/* Add space for fixed header */}
      <Toolbar />
    </>
  );
};

export default Header;
