import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Tooltip, 
  Chip, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Assessment, FilterList, Clear, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';
import { courseAPI } from '../../../services/courseService';
import api from '../../../services/api.service';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    course: '',
    module: '',
    isFinal: '',
    isActive: ''
  });
  
  // Data for filters
  const [courses, setCourses] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);
  
  // Apply filters when exams or filters change
  useEffect(() => {
    applyFilters();
  }, [exams, filters]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  // Filter modules when course changes
  useEffect(() => {
    if (filters.course) {
      // Filter modules to show only those belonging to the selected course
      const courseModules = allModules.filter(module => module.course === parseInt(filters.course));
      setFilteredModules(courseModules);
      
      // Reset module filter if the selected module doesn't belong to the new course
      if (filters.module) {
        const moduleExists = courseModules.some(module => module.id === parseInt(filters.module));
        if (!moduleExists) {
          setFilters(prev => ({ ...prev, module: '' }));
        }
      }
    } else {
      // If no course selected, show all modules
      setFilteredModules(allModules);
    }
  }, [filters.course, allModules]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await examAPI.getExams();
      setExams(response.results || response);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('حدث خطأ في تحميل الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setFiltersLoading(true);
      // Use getMyCourses to get courses that the teacher has access to
      const response = await courseAPI.getMyCourses();
      const coursesData = response.results || response;
      setCourses(coursesData);
      
      // Fetch modules from content API
      await fetchModules();
      
      console.log('Fetched courses:', coursesData.length);
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Fallback to public courses if my courses fails
      try {
        const publicResponse = await courseAPI.getCourses();
        const publicCoursesData = publicResponse.results || publicResponse;
        setCourses(publicCoursesData);
        
        // Fetch modules from content API
        await fetchModules();
        
        console.log('Fetched public courses:', publicCoursesData.length);
      } catch (fallbackErr) {
        console.error('Error fetching public courses:', fallbackErr);
      }
    } finally {
      setFiltersLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      // Fetch modules from content API
      const modulesResponse = await api.get('/content/modules/');
      const modulesArray = modulesResponse.data.results || modulesResponse.data;
      setAllModules(modulesArray);
      setFilteredModules(modulesArray);
      console.log('Fetched modules from content API:', modulesArray.length);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setAllModules([]);
      setFilteredModules([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...exams];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        exam.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter(exam => exam.course?.id === parseInt(filters.course));
    }

    // Module filter
    if (filters.module) {
      filtered = filtered.filter(exam => exam.module?.id === parseInt(filters.module));
    }

    // Final exam filter
    if (filters.isFinal !== '') {
      filtered = filtered.filter(exam => exam.is_final === (filters.isFinal === 'true'));
    }

    // Active status filter
    if (filters.isActive !== '') {
      filtered = filtered.filter(exam => exam.is_active === (filters.isActive === 'true'));
    }

    setFilteredExams(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      course: '',
      module: '',
      isFinal: '',
      isActive: ''
    });
  };

  const handleDelete = async (examId) => {
    try {
      await examAPI.deleteExam(examId);
      setExams(exams.filter(exam => exam.id !== examId));
      setFilteredExams(filteredExams.filter(exam => exam.id !== examId));
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('حدث خطأ في حذف الامتحان');
    }
  };

  const openDeleteDialog = (exam) => {
    setExamToDelete(exam);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
            {/* Compact Header */}
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
            <Assessment sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
          إدارة الامتحانات الشاملة
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            إنشاء وإدارة الامتحانات الشاملة ومتابعة أداء الطلاب
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
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Assessment sx={{ color: '#0e5181', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              {exams.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي الامتحانات
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Assessment sx={{ color: '#2e7d32', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {exams.filter(exam => exam.is_active).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              امتحانات نشطة
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Assessment sx={{ color: '#1976d2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {exams.filter(exam => exam.is_final).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              امتحانات نهائية
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          backgroundColor: 'background.paper', 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Assessment sx={{ color: '#7b1fa2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              {exams.filter(exam => !exam.is_final).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              امتحانات عادية
        </Typography>
          </Box>
        </Box>
      </Box>

      {/* Create Exam Button - Fixed */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={() => navigate('/teacher/exams/create')}
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
          <Add sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters Section - Compact */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: 2, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            flexWrap: 'wrap'
          }}>
            {/* Search Field */}
            <TextField
              label="البحث"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              size="small"
              placeholder="ابحث في الامتحانات..."
              sx={{ 
                minWidth: 200,
                flex: '1 1 200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
              }}
            />
            
            {/* Course Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>الدورة</InputLabel>
              <Select
                value={filters.course}
                onChange={(e) => handleFilterChange('course', e.target.value)}
                label="الدورة"
                disabled={filtersLoading}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <MenuItem value="">الكل</MenuItem>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {filtersLoading ? 'جاري التحميل...' : 'لا توجد دورات متاحة'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            {/* Module Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>الوحدة</InputLabel>
              <Select
                value={filters.module}
                onChange={(e) => handleFilterChange('module', e.target.value)}
                label="الوحدة"
                disabled={filtersLoading}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <MenuItem value="">الكل</MenuItem>
                {filteredModules.length > 0 ? (
                  filteredModules.map((module) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.name || module.title}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {filtersLoading ? 'جاري التحميل...' : 
                     filters.course ? 'لا توجد وحدات لهذه الدورة' : 'لا توجد وحدات متاحة'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            {/* Exam Type Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>النوع</InputLabel>
              <Select
                value={filters.isFinal}
                onChange={(e) => handleFilterChange('isFinal', e.target.value)}
                label="النوع"
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="true">نهائي</MenuItem>
                <MenuItem value="false">عادي</MenuItem>
              </Select>
            </FormControl>
            
            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                label="الحالة"
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <MenuItem value="">الكل</MenuItem>
                <MenuItem value="true">نشط</MenuItem>
                <MenuItem value="false">معطل</MenuItem>
              </Select>
            </FormControl>
            
            {/* Results Counter */}
            <Chip 
              label={`${filteredExams.length} من ${exams.length}`} 
              color={filteredExams.length !== exams.length ? "secondary" : "primary"}
              size="small" 
              variant="outlined"
              sx={{ 
                minWidth: 'fit-content',
                fontWeight: 'bold',
                borderRadius: 2
              }}
            />
            
            {/* Clear Filters Button */}
            <IconButton
              onClick={clearFilters}
              disabled={!filters.search && !filters.course && !filters.module && !filters.isFinal && !filters.isActive}
              size="small"
              sx={{ 
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: 'rgba(0,0,0,0.04)',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(244,67,54,0.1)',
                  color: 'error.main',
                  transform: 'scale(1.05)'
                },
                '&:disabled': {
                  opacity: 0.4,
                  cursor: 'not-allowed'
                },
                transition: 'all 0.2s ease'
              }}
              title="مسح الفلاتر"
            >
              <Clear sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>العنوان</TableCell>
                <TableCell>الدورة</TableCell>
                <TableCell>الوحدة</TableCell>
                <TableCell>نهائي؟</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الإنشاء</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="text.secondary">
                      {exams.length === 0 ? 'لا توجد امتحانات متاحة' : 'لا توجد نتائج تطابق الفلاتر المحددة'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => (
                  <TableRow key={exam.id} hover>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.course?.title || '---'}</TableCell>
                    <TableCell>{exam.module?.name || '---'}</TableCell>
                    <TableCell>
                      {exam.is_final ? (
                        <Chip label="نهائي" color="success" size="small" />
                      ) : (
                        <Chip label="عادي" color="info" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {exam.is_active ? (
                        <Chip label="نشط" color="primary" size="small" />
                      ) : (
                        <Chip label="معطل" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{formatDate(exam.created_at)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="عرض التفاصيل">
                        <IconButton onClick={() => navigate(`/teacher/exams/${exam.id}`)}>
                          <Visibility color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="تعديل">
                        <IconButton onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}>
                          <Edit color="warning" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton onClick={() => openDeleteDialog(exam)}>
                          <Delete color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الامتحان "{examToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={() => handleDelete(examToDelete?.id)} 
            color="error" 
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamList; 