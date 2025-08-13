import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Avatar,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LibraryBooks as LibraryBooksIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  PlayCircleOutline as PlayIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
  VideoLibrary as VideoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
  ContentCopy as ContentCopyIcon,
  Archive as ArchiveIcon,
  RestoreFromTrash as RestoreIcon,
  AddCircleOutline,
  AddCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import contentAPI from '../../../services/content.service';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  background: theme.palette.background.paper,
  marginTop: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  maxWidth: 320,
  marginInline: 'auto',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 20px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const Units = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // يتم الجلب من API بدلاً من البيانات الوهمية

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const data = await contentAPI.getModules(courseId);
        const items = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : data?.modules || [];
        const mapped = items.map((m) => ({
          id: m.id,
          title: m.name || '',
          description: m.description || '',
          duration: typeof m.video_duration === 'number' ? Math.round(m.video_duration / 60) : 0,
          order: m.order,
          status: m.status || (m.is_active ? 'published' : 'draft'),
          isPreview: m.is_active === false,
          lessonsCount: Array.isArray(m.lessons) ? m.lessons.length : (m.lessons_count || 0),
          completedLessons: 0,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
        }));
        setUnits(mapped);
      } catch (error) {
        console.error('Error fetching units:', error);
        setSnackbar({
          open: true,
          message: 'حدث خطأ في تحميل الوحدات',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [courseId]);

  const handleMenuOpen = (event, unit) => {
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUnit(null);
  };

  const handleEditUnit = (unit) => {
    handleMenuClose();
    if (unit) {
      navigate(`/teacher/courses/${courseId}/units/${unit.id}/edit`);
    }
  };

  const handleViewUnit = (unit) => {
    handleMenuClose();
    if (unit) {
      navigate(`/teacher/courses/${courseId}/units/${unit.id}`);
    }
  };

  const handleOpenLessons = (unit) => {
    handleMenuClose();
    if (unit) {
      navigate(`/teacher/courses/${courseId}/units/${unit.id}/lessons`);
    }
  };

  const handleDeleteUnit = () => {
    handleMenuClose();
    setOpenDeleteDialog(true);
  };

  const confirmDeleteUnit = () => {
    if (selectedUnit) {
      // Simulate API call
      setUnits(prev => prev.filter(unit => unit.id !== selectedUnit.id));
      setSnackbar({
        open: true,
        message: 'تم حذف الوحدة بنجاح',
        severity: 'success'
      });
    }
    setOpenDeleteDialog(false);
    setSelectedUnit(null);
  };

  const handleCreateUnit = () => {
    navigate(`/teacher/courses/${courseId}/units/new`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'منشور';
      case 'draft':
        return 'مسودة';
      case 'archived':
        return 'مؤرشف';
      default:
        return 'غير معروف';
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || unit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedUnits = [...filteredUnits].sort((a, b) => {
    switch (sortBy) {
      case 'order':
        return a.order - b.order;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return b.duration - a.duration;
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return a.order - b.order;
    }
  });

  const getUnitIcon = (unit) => {
    // You can customize this based on unit type or content
    return <ArticleIcon />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(`/teacher/my-courses`)} 
            sx={{ 
              mr: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              وحدات الدورة
            </Typography>
            <Typography variant="body1" color="textSecondary">
              إدارة وحدات الدورة التدريبية
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<AddCircle />}
            onClick={handleCreateUnit}
            sx={{ borderRadius: '12px' }}
          >
            إضافة وحدة جديدة
          </StyledButton>
          {selectedUnit && (
            <StyledButton
              variant="outlined"
              startIcon={<LibraryBooksIcon />}
              onClick={() => handleOpenLessons(selectedUnit)}
            >
              الدروس
            </StyledButton>
          )}
        </Box>
      </Box>

      {/* Filters and Search */}
      <StyledPaper elevation={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <TextField
            fullWidth
            placeholder="البحث في الوحدات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="الحالة"
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="published">منشور</MenuItem>
              <MenuItem value="draft">مسودة</MenuItem>
              <MenuItem value="archived">مؤرشف</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>ترتيب حسب</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="ترتيب حسب"
            >
              <MenuItem value="order">الترتيب</MenuItem>
              <MenuItem value="title">العنوان</MenuItem>
              <MenuItem value="duration">المدة</MenuItem>
              <MenuItem value="created">تاريخ الإنشاء</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Units Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        ) : sortedUnits.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              لا توجد وحدات
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm || filterStatus !== 'all' 
                ? 'جرب تغيير معايير البحث' 
                : 'ابدأ بإضافة وحدة جديدة للدورة'
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
              {sortedUnits.map((unit) => (
              <Grid item xs={12} sm={6} md={3} lg={2} key={unit.id}>
                <StyledCard>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getUnitIcon(unit)}
                      </Avatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getStatusText(unit.status)}
                          color={getStatusColor(unit.status)}
                          size="small"
                          variant="outlined"
                        />
                        {unit.isPreview && (
                          <Chip
                            label="معاينة"
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, unit)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {unit.title}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                      {unit.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">
                          {unit.duration} دقيقة
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ArticleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">
                          {unit.lessonsCount} درس
                        </Typography>
                      </Box>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={unit.lessonsCount ? (unit.completedLessons / unit.lessonsCount) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3, mb: 1 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {unit.completedLessons} من {unit.lessonsCount} درس مكتمل
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="large"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewUnit(unit)}
                      sx={{ flex: 1 }}
                    >
                     
                    </Button>
                    <Button
                      size="large"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditUnit(unit)}
                      sx={{ flex: 1 }}
                    >
                      
                    </Button>
                      <Button
                        size="large"
                        startIcon={<AddCircleOutline />}
                        onClick={() => handleOpenLessons(unit)}
                        sx={{ flex: 1 }}
                      >
                       
                      </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </StyledPaper>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <MenuItem onClick={() => handleViewUnit(selectedUnit)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>عرض الوحدة</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenLessons(selectedUnit)}>
          <ListItemIcon>
            <LibraryBooksIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>الدروس</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditUnit(selectedUnit)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>تعديل الوحدة</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteUnit} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>حذف الوحدة</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: '12px' },
        }}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الوحدة "{selectedUnit?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            إلغاء
          </Button>
          <Button onClick={confirmDeleteUnit} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Units; 