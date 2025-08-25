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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #0e5181 0%, #e5978b 100%)',
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate(`/teacher/my-courses`)} 
            sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
              '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'white' }}>
              وحدات الدورة
            </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
              إدارة وحدات الدورة التدريبية
            </Typography>
          </Box>
        </Box>
        
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={handleCreateUnit}
                sx={{ 
                  background: 'linear-gradient(45deg, #0e5181 30%, #e5978b 90%)',
                  color: 'white',
                  borderRadius: '25px',
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(14, 81, 129, 0.3)',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0a3f66 30%, #d88a7e 90%)',
                    boxShadow: '0 6px 20px rgba(14, 81, 129, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
          >
            إضافة وحدة جديدة
              </Button>
          {selectedUnit && (
                <Button
              variant="outlined"
              startIcon={<LibraryBooksIcon />}
              onClick={() => handleOpenLessons(selectedUnit)}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: 'white',
                    borderRadius: '25px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
            >
              الدروس
                </Button>
          )}
            </Box>
          </Box>
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

        {/* Units Table */}
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
          <>
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>الوحدة</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>الوصف</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>المدة</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>عدد الدروس</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>الحالة</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>التقدم</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, px: 3, textAlign: 'center' }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUnits
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((unit) => (
                    <TableRow key={unit.id} hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {getUnitIcon(unit)}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                              {unit.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                              الترتيب: {unit.order}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.4
                          }}
                        >
                          {unit.description || 'لا يوجد وصف'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {unit.duration} دقيقة
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <ArticleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {unit.lessonsCount} درس
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={getStatusText(unit.status)}
                            color={getStatusColor(unit.status)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, minWidth: 70 }}
                          />
                          {unit.isPreview && (
                            <Chip
                              label="معاينة"
                              color="primary"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, minWidth: 70 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                        <Box sx={{ width: 120, mx: 'auto' }}>
                          <LinearProgress
                            variant="determinate"
                            value={unit.lessonsCount ? (unit.completedLessons / unit.lessonsCount) * 100 : 0}
                            sx={{ 
                              height: 8, 
                              borderRadius: 4, 
                              mb: 1,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                              }
                            }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                            {unit.completedLessons} من {unit.lessonsCount}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="عرض الوحدة">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUnit(unit)}
                              sx={{ 
                                color: 'primary.main',
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="الدروس">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenLessons(unit)}
                              sx={{ 
                                color: 'success.main',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <LibraryBooksIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUnit(unit)}
                              sx={{ 
                                color: 'warning.main',
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="المزيد">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, unit)}
                              sx={{ 
                                backgroundColor: 'rgba(158, 158, 158, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(158, 158, 158, 0.2)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={sortedUnits.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="صفوف في الصفحة:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
            />
          </>
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