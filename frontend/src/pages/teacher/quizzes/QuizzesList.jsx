import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, IconButton, Grid, Tooltip, Chip, Stack, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Paper } from '@mui/material';
import { Add, Edit, Delete, Visibility, Quiz, Search, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizzesList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  
  // Available options for filters
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);

  // Fetch quizzes and filter options on component mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchFilterOptions(); // Fetch courses and modules first
      await fetchQuizzes(); // Then fetch quizzes
    };
    initializeData();
  }, []);

  // Refetch quizzes when filters change
  useEffect(() => {
    fetchQuizzes();
  }, [searchTerm, selectedCourse, selectedModule]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching quizzes...');
      
      // Build query parameters
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCourse) params.course = selectedCourse;
      if (selectedModule) params.module = selectedModule;
      
      const data = await quizAPI.getQuizzes(params);
      console.log('Raw quiz data:', data); // للتأكد من البيانات
      
      // Handle both array and paginated response
      const quizzesData = Array.isArray(data) ? data : (data.results || data.data || []);
      console.log('Processed quiz data:', quizzesData); // للتأكد من البيانات
      console.log('Number of quizzes:', quizzesData.length);
      
      setQuizzes(quizzesData);
      
      // Update modules from loaded quizzes if we don't have any modules yet
      if (modules.length === 0 && quizzesData.length > 0) {
        const uniqueModules = [];
        const moduleMap = new Map();
        
        quizzesData.forEach(quiz => {
          if (quiz.module && !moduleMap.has(quiz.module.id)) {
            moduleMap.set(quiz.module.id, quiz.module);
            uniqueModules.push(quiz.module);
          }
        });
        
        if (uniqueModules.length > 0) {
          setModules(uniqueModules);
          console.log('Updated modules from quizzes:', uniqueModules);
        }
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      console.error('Error details:', err.response?.data);
      setError('حدث خطأ في تحميل الكويزات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      console.log('Starting to fetch filter options...');
      
      // Fetch courses
      const coursesData = await quizAPI.getCourses();
      const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData.results || coursesData.data || []);
      console.log('Fetched courses:', coursesArray);
      setCourses(coursesArray);
      
      // Fetch all modules for the courses
      const allModules = [];
      const moduleMap = new Map();
      
      console.log('Fetching modules for each course...');
      for (const course of coursesArray) {
        try {
          console.log(`Fetching modules for course: ${course.title} (ID: ${course.id})`);
          const modulesData = await quizAPI.getModules(course.id);
          const modulesArray = Array.isArray(modulesData) ? modulesData : (modulesData.results || modulesData.data || []);
          console.log(`Modules for course ${course.title}:`, modulesArray);
          
          modulesArray.forEach(module => {
            if (!moduleMap.has(module.id)) {
              moduleMap.set(module.id, module);
              allModules.push(module);
            }
          });
        } catch (err) {
          console.error(`Error fetching modules for course ${course.id}:`, err);
        }
      }
      
      console.log('Final all modules:', allModules);
      setModules(allModules);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await quizAPI.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('حدث خطأ في حذف الكويز. يرجى المحاولة مرة أخرى.');
    }
  };

  const openDeleteDialog = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCourse('');
    setSelectedModule('');
  };

  const getQuizTypeLabel = (type) => {
    const typeLabels = {
      'video': 'فيديو',
      'module': 'وحدة',
      'quick': 'سريع'
    };
    return typeLabels[type] || type;
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
      {/* Debug info */}
      {console.log('Current modules state:', modules)}
      {console.log('Current courses state:', courses)}
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          إدارة الكويزات
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ borderRadius: 2, fontWeight: 'bold', px: 3, py: 1.2 }}
          onClick={() => navigate('/teacher/quizzes/create')}
        >
          إضافة كويز جديد
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight={600}>
            فلاتر البحث
          </Typography>
        </Stack>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="البحث في الكويزات"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في العنوان أو الوصف..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>الكورس</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="الكورس"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">جميع الكورسات</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>الوحدة</InputLabel>
              <Select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                label="الوحدة"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">جميع الوحدات</MenuItem>
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id}>
                    {module.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              fullWidth
              sx={{ height: 56 }}
            >
              مسح
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {quizzes.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            لا توجد كويزات حتى الآن
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/teacher/quizzes/create')}
          >
            إنشاء أول كويز
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} md={6} lg={4} key={quiz.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative', overflow: 'visible' }}>
                <Box sx={{ position: 'absolute', top: -28, right: 16, bgcolor: 'primary.main', borderRadius: '50%', p: 1 }}>
                  <Quiz sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
                    <Chip label={getQuizTypeLabel(quiz.quiz_type)} size="small" color="secondary" />
                    {!quiz.is_active && <Chip label="غير نشط" size="small" color="warning" />}
                  </Stack>
                  {quiz.description && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {quiz.description.length > 100 ? `${quiz.description.substring(0, 100)}...` : quiz.description}
                    </Typography>
                  )}
                  {quiz.course && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      الكورس: {quiz.course.title}
                    </Typography>
                  )}
                  {quiz.module && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      الوحدة: {quiz.module.name}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {quiz.time_limit && `الزمن: ${quiz.time_limit} دقيقة | `}
                    {quiz.pass_mark && `النجاح: ${quiz.pass_mark}%`}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pb: 2 }}>
                  <Tooltip title="عرض التفاصيل">
                    <IconButton color="primary" onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="تعديل الكويز">
                    <IconButton color="secondary" onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف الكويز">
                    <IconButton color="error" onClick={() => openDeleteDialog(quiz)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف الكويز "{quizToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>إلغاء</Button>
          <Button 
            onClick={() => handleDeleteQuiz(quizToDelete?.id)} 
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

export default QuizzesList; 