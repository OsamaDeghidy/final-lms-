import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Badge
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
  VisibilityOff
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

const Profile = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Mock user data - replace with actual API call
  const mockProfile = {
    id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Senior Software Engineer with 5+ years of experience in web development. Passionate about teaching and learning new technologies.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    coverImage: 'https://source.unsplash.com/random/1200x300?programming',
    joinDate: 'January 2023',
    skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Docker'],
    education: [
      {
        id: 1,
        degree: 'Master of Computer Science',
        institution: 'Stanford University',
        year: '2018 - 2020',
        description: 'Specialized in Artificial Intelligence and Machine Learning.'
      },
      {
        id: 2,
        degree: 'Bachelor of Technology',
        institution: 'MIT',
        year: '2014 - 2018',
        description: 'Computer Science and Engineering'
      }
    ],
    experience: [
      {
        id: 1,
        position: 'Senior Software Engineer',
        company: 'TechCorp',
        duration: '2021 - Present',
        description: 'Leading the frontend development team and implementing new features.'
      },
      {
        id: 2,
        position: 'Software Developer',
        company: 'WebSolutions',
        duration: '2019 - 2021',
        description: 'Developed and maintained web applications using React and Node.js.'
      }
    ],
    coursesEnrolled: 12,
    coursesCompleted: 8,
    certificates: 5,
    lastActive: '2 hours ago',
    isVerified: true
  };

  useEffect(() => {
    // Simulate API call
    const fetchProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProfile(mockProfile);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = () => {
    // Handle save logic here
    setEditMode(false);
    // Show success message
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Profile not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cover Photo */}
      <Box 
        sx={{ 
          height: 200, 
          borderRadius: 2, 
          overflow: 'hidden',
          mb: -8,
          position: 'relative',
          bgcolor: 'primary.main',
          backgroundImage: `url(${profile.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }
        }}
      />
      
      <Grid container spacing={4}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'relative', mb: 3 }}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <Avatar 
                  src={profile.avatar} 
                  alt={`${profile.firstName} ${profile.lastName}`}
                  sx={{ 
                    width: 150, 
                    height: 150,
                    border: '4px solid white',
                    boxShadow: 3,
                    mt: -8,
                    mb: 2
                  }}
                />
              </StyledBadge>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  {`${profile.firstName} ${profile.lastName}`}
                  {profile.isVerified && (
                    <CheckCircle 
                      color="primary" 
                      fontSize="small" 
                      sx={{ ml: 0.5, verticalAlign: 'middle' }} 
                    />
                  )}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Senior Software Engineer at TechCorp
                </Typography>
                <Chip 
                  label="Instructor" 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Profile Completion</Typography>
                  <Typography variant="body2" color="primary">85%</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 6, bgcolor: 'grey.200', borderRadius: 3, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      width: '85%', 
                      height: '100%', 
                      bgcolor: 'primary.main',
                      borderRadius: 3
                    }} 
                  />
                </Box>
              </Box>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Email color="action" fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Phone color="action" fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">{profile.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <LocationOn color="action" fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">{profile.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday color="action" fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography variant="body2">Joined {profile.joinDate}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {profile.skills.map((skill, index) => (
                    <Chip 
                      key={index} 
                      label={skill} 
                      size="small" 
                      variant="outlined"
                      onClick={() => editMode && console.log('Edit skill:', skill)}
                      onDelete={editMode ? () => console.log('Delete skill:', skill) : null}
                    />
                  ))}
                  {editMode && (
                    <Chip 
                      label="+ Add Skill" 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      onClick={() => console.log('Add new skill')}
                    />
                  )}
                </Box>
              </Box>
              
              <Button 
                variant={editMode ? "contained" : "outlined"} 
                color="primary"
                startIcon={editMode ? <Save /> : <Edit />}
                fullWidth
                onClick={editMode ? handleSave : handleEditToggle}
                sx={{ mt: 2 }}
              >
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
              
              {!editMode && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<Lock />}
                  fullWidth
                  sx={{ mt: 1.5 }}
                  onClick={() => navigate('/settings/security')}
                >
                  Change Password
                </Button>
              )}
            </Box>
          </Card>
          
          {/* Stats Card */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Learning Stats</Typography>
              <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                <Grid item xs={4}>
                  <Typography variant="h5" color="primary">{profile.coursesEnrolled}</Typography>
                  <Typography variant="body2" color="text.secondary">Enrolled</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5" color="success.main">{profile.coursesCompleted}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5" color="warning.main">{profile.certificates}</Typography>
                  <Typography variant="body2" color="text.secondary">Certificates</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="profile tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="About" />
                <Tab label="Courses" />
                <Tab label="Activity" />
                <Tab label="Settings" />
              </Tabs>
            </Box>
            
            <CardContent>
              {tabValue === 0 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>About Me</Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {profile.bio || 'No bio available.'}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Education</Typography>
                      {editMode && (
                        <Button size="small" startIcon={<Add />}>
                          Add Education
                        </Button>
                      )}
                    </Box>
                    
                    {profile.education.length > 0 ? (
                      profile.education.map((edu) => (
                        <Box key={edu.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, position: 'relative' }}>
                          {editMode && (
                            <IconButton 
                              size="small" 
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                              onClick={() => console.log('Delete education:', edu.id)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <School color="action" sx={{ mr: 1.5 }} />
                            <Box>
                              <Typography variant="subtitle1">{edu.degree}</Typography>
                              <Typography variant="body2" color="text.secondary">{edu.institution}</Typography>
                              <Typography variant="body2" color="text.secondary">{edu.year}</Typography>
                            </Box>
                          </Box>
                          {edu.description && (
                            <Typography variant="body2" sx={{ mt: 1, ml: 4.5 }}>
                              {edu.description}
                            </Typography>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No education information available.
                      </Typography>
                    )}
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Work Experience</Typography>
                      {editMode && (
                        <Button size="small" startIcon={<Add />}>
                          Add Experience
                        </Button>
                      )}
                    </Box>
                    
                    {profile.experience.length > 0 ? (
                      profile.experience.map((exp) => (
                        <Box key={exp.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, position: 'relative' }}>
                          {editMode && (
                            <IconButton 
                              size="small" 
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                              onClick={() => console.log('Delete experience:', exp.id)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Work color="action" sx={{ mr: 1.5 }} />
                            <Box>
                              <Typography variant="subtitle1">{exp.position}</Typography>
                              <Typography variant="body2" color="text.secondary">{exp.company}</Typography>
                              <Typography variant="body2" color="text.secondary">{exp.duration}</Typography>
                            </Box>
                          </Box>
                          {exp.description && (
                            <Typography variant="body2" sx={{ mt: 1, ml: 4.5 }}>
                              {exp.description}
                            </Typography>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No work experience available.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>My Courses</Typography>
                  <Typography variant="body1" color="text.secondary">
                    You haven't enrolled in any courses yet. {' '}
                    <RouterLink to="/courses" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                      Browse courses
                    </RouterLink>{' '}
                    to get started.
                  </Typography>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                  <Typography variant="body1" color="text.secondary">
                    No recent activity to show.
                  </Typography>
                </Box>
              )}
              
              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Account Settings</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Manage your account settings and preferences.
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Email Notifications</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Switch defaultChecked />
                      <Typography variant="body2">Course announcements and updates</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Switch defaultChecked />
                      <Typography variant="body2">Private messages</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Switch defaultChecked />
                      <Typography variant="body2">Promotional offers</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Danger Zone</Typography>
                    <Button 
                      variant="outlined" 
                      color="error"
                      startIcon={<DeleteOutline />}
                      onClick={() => console.log('Delete account')}
                    >
                      Delete My Account
                    </Button>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Warning: This action cannot be undone. All your data will be permanently deleted.
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
