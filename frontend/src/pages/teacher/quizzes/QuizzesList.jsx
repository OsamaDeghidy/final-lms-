import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, IconButton, Grid, Tooltip, Chip, Stack, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          <Grid xs={12} md={3}>
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
          
          <Grid xs={12} md={4}>
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
          
          <Grid xs={12} md={4}>
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
          
          <Grid xs={12} md={1}>
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
        <Paper className="assignments-table" sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
                          <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #673ab7',
                  fontSize: '0.95rem',
                  textAlign: 'right',
                  py: 2
                }}>
                  عنوان الكويز
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #673ab7',
                  fontSize: '0.95rem',
                  textAlign: 'right',
                  py: 2
                }}>
                  الكورس والوحدة
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #673ab7',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  py: 2
                }}>
                  النوع
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #673ab7',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  py: 2
                }}>
                  الحالة
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #673ab7',
                  fontSize: '0.95rem',
                  textAlign: 'right',
                  py: 2
                }}>
                  الزمن ونسبة النجاح
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #673ab7',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  py: 2
                }}>
                  الإجراءات
                </TableCell>
              </TableRow>
            </TableHead>
              <TableBody>
                {quizzes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((quiz) => (
                  <TableRow 
                    key={quiz.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8f9fa',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%',
                            backgroundColor: '#f3e5f5',
                            color: '#673ab7'
                          }}>
                            <Quiz sx={{ fontSize: 18 }} />
                          </Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={700} 
                            color="#2c3e50"
                            sx={{ 
                              fontSize: '1rem',
                              lineHeight: 1.2,
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {quiz.title}
                          </Typography>
                        </Box>
                        {quiz.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '0.85rem',
                              lineHeight: 1.4,
                              maxWidth: 280,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              opacity: 0.8
                            }}
                          >
                            {quiz.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {quiz.course && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%',
                              backgroundColor: '#673ab7'
                            }} />
                            <Typography 
                              variant="body2" 
                              fontWeight={600} 
                              color="#2c3e50"
                              sx={{ 
                                fontSize: '0.9rem',
                                lineHeight: 1.2
                              }}
                            >
                              {quiz.course.title}
                            </Typography>
                          </Box>
                        )}
                        {quiz.module && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                            <Box sx={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%',
                              backgroundColor: '#9e9e9e'
                            }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: '0.8rem',
                                lineHeight: 1.2,
                                opacity: 0.8
                              }}
                            >
                              {quiz.module.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip 
                          label={getQuizTypeLabel(quiz.quiz_type)} 
                          size="small" 
                          color="secondary" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: '#f3e5f5',
                            color: '#673ab7',
                            border: '1px solid #e1bee7'
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip 
                          label={quiz.is_active ? 'نشط' : 'غير نشط'} 
                          size="small" 
                          color={quiz.is_active ? 'success' : 'warning'}
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: quiz.is_active ? '#e8f5e8' : '#fff3e0',
                            color: quiz.is_active ? '#2e7d32' : '#f57c00',
                            border: quiz.is_active ? '1px solid #c8e6c9' : '1px solid #ffcc80'
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {quiz.time_limit && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%',
                              backgroundColor: '#e3f2fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%',
                                backgroundColor: '#1976d2'
                              }} />
                            </Box>
                            <Typography 
                              variant="body2" 
                              fontWeight={600} 
                              color="#2c3e50"
                              sx={{ 
                                fontSize: '0.85rem',
                                lineHeight: 1.2
                              }}
                            >
                              {quiz.time_limit} دقيقة
                            </Typography>
                          </Box>
                        )}
                        {quiz.pass_mark && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%',
                              backgroundColor: '#e8f5e8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%',
                                backgroundColor: '#2e7d32'
                              }} />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: '0.85rem',
                                lineHeight: 1.2,
                                opacity: 0.8
                              }}
                            >
                              {quiz.pass_mark}% نجاح
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: 'center', 
                        flexWrap: 'wrap'
                      }}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)}
                            sx={{ 
                              color: '#1976d2',
                              backgroundColor: '#e3f2fd',
                              width: 32,
                              height: 32,
                              '&:hover': { 
                                backgroundColor: '#bbdefb',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Visibility sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل الكويز">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                            sx={{ 
                              color: '#9c27b0',
                              backgroundColor: '#f3e5f5',
                              width: 32,
                              height: 32,
                              '&:hover': { 
                                backgroundColor: '#e1bee7',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Edit sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف الكويز">
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(quiz)}
                            sx={{ 
                              color: '#d32f2f',
                              backgroundColor: '#ffebee',
                              width: 32,
                              height: 32,
                              '&:hover': { 
                                backgroundColor: '#ffcdd2',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Delete sx={{ fontSize: 16 }} />
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={quizzes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="صفوف في الصفحة:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
            sx={{
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0'
            }}
          />
        </Paper>
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