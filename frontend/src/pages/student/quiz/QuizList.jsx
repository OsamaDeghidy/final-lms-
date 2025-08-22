import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Stack, 
  Chip, 
  CircularProgress, 
  Alert,
  Grid,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { 
  PlayArrow, 
  History, 
  Timer, 
  School,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.results || response);
      
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('حدث خطأ في تحميل الكويزات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getQuizTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayArrow />;
      case 'module':
        return <School />;
      case 'quick':
        return <Timer />;
      default:
        return <Assignment />;
    }
  };

  const getQuizTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'كويز فيديو';
      case 'module':
        return 'كويز وحدة';
      case 'quick':
        return 'كويز سريع';
      default:
        return 'كويز';
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}/start`);
  };

  const handleViewHistory = (quizId) => {
    navigate(`/student/quiz/${quizId}/history`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadQuizzes}>إعادة المحاولة</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
        الكويزات المتاحة
      </Typography>

      {quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            لا توجد كويزات متاحة حالياً
          </Typography>
        </Paper>
      ) : (
        <Paper className="assignments-table" sx={{ width: '100%', overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                    عنوان الكويز
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                    الكورس والوحدة
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                    النوع
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                    الزمن
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0' }}>
                    نسبة النجاح
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50', borderBottom: '2px solid #e0e0e0', textAlign: 'center' }}>
                    الإجراءات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((quiz) => (
                  <TableRow 
                    key={quiz.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box className="table-cell-content">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Tooltip title={getQuizTypeLabel(quiz.quiz_type)}>
                      <IconButton size="small" color="primary">
                        {getQuizTypeIcon(quiz.quiz_type)}
                      </IconButton>
                    </Tooltip>
                          <Typography className="table-cell-title" variant="subtitle1" fontWeight={600} color="#2c3e50">
                      {quiz.title}
                    </Typography>
                        </Box>
                  {quiz.description && (
                          <Typography className="table-cell-description" variant="body2" color="text.secondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 250
                          }}>
                      {quiz.description}
                    </Typography>
                  )}
                      </Box>
                    </TableCell>
                    <TableCell>
                    {quiz.course && (
                        <Box className="table-cell-meta">
                          <Typography variant="body2" fontWeight={500} color="#2c3e50">
                            {quiz.course.title}
                          </Typography>
                        </Box>
                    )}
                    {quiz.module && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {quiz.module.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getQuizTypeLabel(quiz.quiz_type)} 
                        size="small" 
                        color="secondary" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {quiz.time_limit ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Timer sx={{ color: '#1976d2', fontSize: 18 }} />
                          <Typography variant="body2" fontWeight={500} color="#2c3e50">
                            {quiz.time_limit} دقيقة
                          </Typography>
                        </Box>
                      ) : (
                    <Typography variant="body2" color="text.secondary">
                          غير محدد
                    </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                    <Chip 
                      label={`${quiz.pass_mark}%`} 
                      size="small" 
                      color={quiz.pass_mark >= 60 ? 'success' : 'warning'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box className="table-cell-actions">
                        <Tooltip title="بدء الكويز">
                          <IconButton
                            size="small"
                      onClick={() => handleStartQuiz(quiz.id)}
                            sx={{ 
                              color: '#2e7d32',
                              '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.1)' }
                            }}
                    >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                    <Tooltip title="عرض المحاولات السابقة">
                      <IconButton
                            size="small"
                        onClick={() => handleViewHistory(quiz.id)}
                            sx={{ 
                              color: '#1976d2',
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                            }}
                      >
                        <History />
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
    </Box>
  );
};

export default QuizList;
