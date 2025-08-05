import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { 
  Person, 
  Email, 
  Phone, 
  LocationOn,
  Language,
  Save,
  Edit,
  CheckCircleOutline
} from '@mui/icons-material';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    location: 'الرياض, المملكة العربية السعودية',
    website: 'https://example.com',
  });
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        severity: 'success',
      });
      setEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
      <Box sx={{ mb: 4, textAlign: 'right' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          إعدادات الحساب
        </Typography>
        <Typography variant="body1" color="text.secondary">
          يمكنك تعديل معلومات حسابك الشخصي من هنا
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src="/placeholder-avatar.jpg"
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      border: '3px solid #f0f0f0'
                    }}
                  />
                  {editing && (
                    <IconButton
                      color="primary"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                {!editing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    sx={{ mt: 1 }}
                  >
                    تعديل الملف الشخصي
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setEditing(false)}
                    sx={{ mt: 1 }}
                  >
                    إلغاء
                  </Button>
                )}
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="الاسم الأول"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        readOnly: !editing,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
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
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        readOnly: !editing,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="البريد الإلكتروني"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        readOnly: !editing,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="رقم الجوال"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        readOnly: !editing,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="الموقع"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        readOnly: !editing,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="الموقع الإلكتروني"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        readOnly: !editing,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Language />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {editing && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-start',
                        gap: 2,
                        mt: 2
                      }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                          onClick={handleSaveProfile}
                          disabled={loading}
                          size="large"
                        >
                          حفظ التغييرات
                        </Button>
                        
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setEditing(false)}
                          size="large"
                        >
                          إلغاء
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ direction: 'rtl' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
