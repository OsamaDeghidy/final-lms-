import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Grid, 
  Tooltip, 
  Chip, 
  Stack, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Quiz, Search, FilterList, Clear } from '@mui/icons-material';
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
  const [allQuizzes, setAllQuizzes] = useState([]);

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

  // Update modules when selected course changes
  useEffect(() => {
    const updateModulesForCourse = async () => {
      if (selectedCourse) {
        try {
          console.log('Fetching modules for selected course:', selectedCourse);
          const modulesData = await quizAPI.getModules(selectedCourse);
          
          // Handle different response formats
          let modulesArray = [];
          if (Array.isArray(modulesData)) {
            modulesArray = modulesData;
          } else if (modulesData && typeof modulesData === 'object') {
            if (Array.isArray(modulesData.modules)) {
              modulesArray = modulesData.modules;
            } else if (Array.isArray(modulesData.results)) {
              modulesArray = modulesData.results;
            } else if (Array.isArray(modulesData.data)) {
              modulesArray = modulesData.data;
            }
          }
          
          console.log('Updated modules for selected course:', modulesArray);
          setModules(modulesArray);
        } catch (err) {
          console.error('Error fetching modules for selected course:', err);
          setModules([]);
        }
      } else {
        // If no course is selected, clear modules
        setModules([]);
      }
      // Clear selected module when course changes
      setSelectedModule('');
    };

    updateModulesForCourse();
  }, [selectedCourse]);

  // Debug effect to log current state
  useEffect(() => {
    console.log('Current modules state:', modules);
    console.log('Current selected course:', selectedCourse);
    console.log('Current selected module:', selectedModule);
  }, [modules, selectedCourse, selectedModule]);

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
      
      // Log quiz details for debugging
      quizzesData.forEach((quiz, index) => {
        console.log(`Quiz ${index + 1}:`, {
          id: quiz.id,
          title: quiz.title,
          course: quiz.course,
          module: quiz.module,
          quiz_type: quiz.quiz_type
        });
      });
      
      setQuizzes(quizzesData);
      setAllQuizzes(quizzesData);
      
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
      
      // If we have a selected course, fetch its modules
      if (selectedCourse && modules.length === 0) {
        try {
          const modulesData = await quizAPI.getModules(selectedCourse);
          let modulesArray = [];
          if (Array.isArray(modulesData)) {
            modulesArray = modulesData;
          } else if (modulesData && typeof modulesData === 'object') {
            if (Array.isArray(modulesData.modules)) {
              modulesArray = modulesData.modules;
            } else if (Array.isArray(modulesData.results)) {
              modulesArray = modulesData.results;
            } else if (Array.isArray(modulesData.data)) {
              modulesArray = modulesData.data;
            }
          }
          setModules(modulesArray);
        } catch (err) {
          console.error('Error fetching modules for selected course:', err);
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
          
          // Handle different response formats
          let modulesArray = [];
          if (Array.isArray(modulesData)) {
            modulesArray = modulesData;
          } else if (modulesData && typeof modulesData === 'object') {
            if (Array.isArray(modulesData.modules)) {
              modulesArray = modulesData.modules;
            } else if (Array.isArray(modulesData.results)) {
              modulesArray = modulesData.results;
            } else if (Array.isArray(modulesData.data)) {
              modulesArray = modulesData.data;
            }
          }
          
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
            <Quiz sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: 'white' }}>
              إدارة الكويزات
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            إنشاء وإدارة الكويزات التفاعلية وتقييم أداء الطلاب
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
          <Quiz sx={{ color: '#e5978b', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {quizzes.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              إجمالي الكويزات
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
          <Quiz sx={{ color: '#2e7d32', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {quizzes.filter(quiz => quiz.is_active).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              كويزات نشطة
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
          <Quiz sx={{ color: '#1976d2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {quizzes.filter(quiz => quiz.quiz_type === 'video').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              كويزات فيديو
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
          <Quiz sx={{ color: '#7b1fa2', fontSize: 24 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              {quizzes.filter(quiz => quiz.quiz_type === 'module').length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              كويزات وحدة
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Create Quiz Button - Fixed */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={() => navigate('/teacher/quizzes/create')}
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="ابحث في الكويزات..."
              sx={{ 
                minWidth: 200,
                flex: '1 1 200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
              }}
            />
            
            {/* Course Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>الكورس</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="الكورس"
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <MenuItem value="">الكل</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Module Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>الوحدة</InputLabel>
              <Select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                label="الوحدة"
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <MenuItem value="">الكل</MenuItem>
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id}>
                    {module.name || module.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Results Counter */}
            <Chip 
              label={`${quizzes.length} من ${allQuizzes.length}`} 
              color={quizzes.length !== allQuizzes.length ? "secondary" : "primary"}
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
              disabled={!searchTerm && !selectedCourse && !selectedModule}
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

      {quizzes.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            لا توجد كويزات حتى الآن
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/teacher/quizzes/create')}
            sx={{
              background: 'linear-gradient(90deg, #0e5181 0%, #e5978b 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
              },
            }}
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
                  borderBottom: '3px solid #0e5181',
                  fontSize: '0.95rem',
                  textAlign: 'right',
                  py: 2
                }}>
                  عنوان الكويز
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #0e5181',
                  fontSize: '0.95rem',
                  textAlign: 'right',
                  py: 2
                }}>
                  الكورس والوحدة
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #0e5181',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  py: 2
                }}>
                  النوع
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #0e5181',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  py: 2
                }}>
                  الحالة
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #0e5181',
                  fontSize: '0.95rem',
                  textAlign: 'right',
                  py: 2
                }}>
                  الزمن ونسبة النجاح
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 800, 
                  color: '#2c3e50', 
                  borderBottom: '3px solid #0e5181',
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
                            color: '#0e5181'
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
                              backgroundColor: '#0e5181'
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
                              {quiz.module.name || quiz.module.title}
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
                            color: '#0e5181',
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
                              color: '#1976d2',
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