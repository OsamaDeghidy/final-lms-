import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button, IconButton, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Tooltip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { Edit, Delete, Add, Assessment, Quiz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI } from '../../../services/exam.service';

const ExamDetail = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    question_type: 'multiple_choice',
    points: 1,
    explanation: ''
  });

  // Fetch exam and questions on component mount
  useEffect(() => {
    if (examId) {
      fetchExam();
      fetchQuestions();
    }
  }, [examId]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const examData = await examAPI.getExam(examId);
      setExam(examData);
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('حدث خطأ في تحميل بيانات الامتحان');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsData = await examAPI.getExamQuestions(examId);
      setQuestions(questionsData.results || questionsData);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('حدث خطأ في تحميل الأسئلة');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await examAPI.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('حدث خطأ في حذف السؤال');
    }
  };

  const handleAddQuestion = async () => {
    try {
      const questionData = {
        ...newQuestion,
        exam: examId,
        points: parseInt(newQuestion.points)
      };
      
      await examAPI.addQuestion(examId, questionData);
      setAddQuestionDialogOpen(false);
      setNewQuestion({
        text: '',
        question_type: 'multiple_choice',
        points: 1,
        explanation: ''
      });
      fetchQuestions(); // Refresh questions list
    } catch (err) {
      console.error('Error adding question:', err);
      setError('حدث خطأ في إضافة السؤال');
    }
  };

  const openDeleteDialog = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'اختيار من متعدد';
      case 'true_false':
        return 'صح أو خطأ';
      case 'short_answer':
        return 'إجابة قصيرة';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">لم يتم العثور على الامتحان</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Assessment sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>{exam.title}</Typography>
          {exam.is_final && <Chip label="نهائي" color="success" size="small" sx={{ ml: 2 }} />}
          {exam.is_active ? (
            <Chip label="نشط" color="primary" size="small" sx={{ ml: 1 }} />
          ) : (
            <Chip label="معطل" color="default" size="small" sx={{ ml: 1 }} />
          )}
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" mb={1}>
          الدورة: {exam.course?.title || '---'}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" mb={2}>
          الوحدة: {exam.module?.name || '---'}
        </Typography>
        
        {exam.description && (
          <Typography variant="body1" mb={2} dangerouslySetInnerHTML={{ __html: exam.description }} />
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip label={`الوقت: ${exam.time_limit || 'غير محدد'} دقيقة`} color="info" />
          <Chip label={`درجة النجاح: ${exam.pass_mark}%`} color="success" />
          <Chip label={`إجمالي النقاط: ${exam.total_points}`} color="warning" />
          {exam.allow_multiple_attempts && (
            <Chip label={`الحد الأقصى: ${exam.max_attempts} محاولة`} color="secondary" />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            <Quiz sx={{ mr: 1 }} /> الأسئلة ({questions.length})
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
            onClick={() => setAddQuestionDialogOpen(true)}
          >
            إضافة سؤال
          </Button>
        </Box>

        <List>
          {questions.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" color="text.secondary" align="center">
                    لا توجد أسئلة لهذا الامتحان
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            questions.map((question) => (
              <ListItem key={question.id} divider>
                <ListItemText
                  primary={<Typography fontWeight={600}>{question.text}</Typography>}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={getQuestionTypeLabel(question.question_type)} 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={`نقاط: ${question.points}`} 
                        size="small" 
                        color="info" 
                      />
                      {question.explanation && (
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          <strong>الشرح:</strong> {question.explanation}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="تعديل">
                    <IconButton onClick={() => navigate(`/teacher/exams/${examId}/questions/${question.id}/edit`)}>
                      <Edit color="warning" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="حذف">
                    <IconButton onClick={() => openDeleteDialog(question)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => navigate('/teacher/exams')}>
          عودة للقائمة
        </Button>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/teacher/exams/${examId}/edit`)}
          startIcon={<Edit />}
        >
          تعديل الامتحان
        </Button>
      </Box>

      {/* Delete Question Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد حذف السؤال</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف السؤال "{questionToDelete?.text}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={() => handleDeleteQuestion(questionToDelete?.id)} 
            color="error" 
            variant="contained"
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog 
        open={addQuestionDialogOpen} 
        onClose={() => setAddQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>إضافة سؤال جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="نص السؤال"
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              fullWidth
              multiline
              minRows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="نوع السؤال"
              value={newQuestion.question_type}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="multiple_choice">اختيار من متعدد</MenuItem>
              <MenuItem value="true_false">صح أو خطأ</MenuItem>
              <MenuItem value="short_answer">إجابة قصيرة</MenuItem>
            </TextField>
            <TextField
              label="النقاط"
              type="number"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="شرح الإجابة (اختياري)"
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddQuestionDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleAddQuestion}
            variant="contained"
            disabled={!newQuestion.text.trim()}
          >
            إضافة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamDetail; 