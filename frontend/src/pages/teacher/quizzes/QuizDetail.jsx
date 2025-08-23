import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, IconButton, Chip, Divider, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit, Delete, ArrowBack, Quiz } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const QuizDetail = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizData = await quizAPI.getQuiz(quizId);
      setQuiz(quizData);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('حدث خطأ في تحميل بيانات الكويز');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await quizAPI.deleteQuiz(quizId);
      setDeleteDialogOpen(false);
      navigate('/teacher/quizzes');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('حدث خطأ في حذف الكويز');
    }
  };

  const getQuizTypeLabel = (type) => {
    const typeLabels = {
      'video': 'فيديو',
      'module': 'وحدة',
      'quick': 'سريع'
    };
    return typeLabels[type] || type;
  };

  const getQuestionTypeLabel = (type) => {
    const typeLabels = {
      'multiple_choice': 'اختيار من متعدد',
      'true_false': 'صح أو خطأ',
      'short_answer': 'إجابة قصيرة'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        gap: 3
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          جاري تحميل بيانات الكويز...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Button 
          startIcon={<ArrowBack />} 
          variant="outlined"
          sx={{ 
            mb: 3,
            borderRadius: 2,
            px: 3
          }} 
          onClick={() => navigate(-1)}
        >
          العودة للقائمة
        </Button>
        <Paper sx={{ 
          p: 4, 
          borderRadius: 3, 
          textAlign: 'center',
          bgcolor: 'error.50',
          border: '1px solid',
          borderColor: 'error.200'
        }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => fetchQuizData()}
            sx={{ mt: 2 }}
          >
            إعادة المحاولة
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Button 
          startIcon={<ArrowBack />} 
          variant="outlined"
          sx={{ 
            mb: 3,
            borderRadius: 2,
            px: 3
          }} 
          onClick={() => navigate(-1)}
        >
          العودة للقائمة
        </Button>
        <Paper sx={{ 
          p: 6, 
          borderRadius: 3, 
          textAlign: 'center',
          bgcolor: 'warning.50',
          border: '1px solid',
          borderColor: 'warning.200'
        }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            الكويز غير موجود
          </Alert>
          <Typography variant="body1" color="text.secondary">
            قد يكون الكويز قد تم حذفه أو لا يوجد لديك صلاحية للوصول إليه
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header with Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          variant="outlined"
          sx={{ 
            mb: 2,
            borderRadius: 2,
            px: 3,
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white'
            }
          }} 
          onClick={() => navigate(-1)}
        >
          العودة للقائمة
        </Button>
      </Box>
      
      {/* Main Quiz Card */}
      <Paper sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: 4, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}>
        {/* Quiz Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 3,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flex: 1,
            minWidth: 0
          }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Quiz sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="h4" 
                fontWeight={700} 
                sx={{ 
                  mb: 0.5,
                  color: 'text.primary',
                  wordBreak: 'break-word'
                }}
              >
                {quiz.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={getQuizTypeLabel(quiz.quiz_type)} 
                  color="secondary" 
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
                {!quiz.is_active && (
                  <Chip 
                    label="غير نشط" 
                    color="warning" 
                    size="small"
                    sx={{ borderRadius: 2 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Quiz Description */}
        {quiz.description && (
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3, 
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {quiz.description}
            </Typography>
          </Paper>
        )}
        
        {/* Quiz Info Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          mb: 4
        }}>
          {quiz.course && (
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Typography variant="body2" color="primary.dark" fontWeight={600} mb={0.5}>
                الكورس
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {quiz.course.title}
              </Typography>
            </Paper>
          )}
          
          {quiz.module && (
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              bgcolor: 'secondary.50',
              border: '1px solid',
              borderColor: 'secondary.200'
            }}>
              <Typography variant="body2" color="secondary.dark" fontWeight={600} mb={0.5}>
                الوحدة
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {quiz.module.name}
              </Typography>
            </Paper>
          )}
          
          {(quiz.time_limit || quiz.pass_mark) && (
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              bgcolor: 'info.50',
              border: '1px solid',
              borderColor: 'info.200'
            }}>
              <Typography variant="body2" color="info.dark" fontWeight={600} mb={0.5}>
                الإعدادات
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {quiz.time_limit && `${quiz.time_limit} دقيقة`}
                {quiz.time_limit && quiz.pass_mark && ' | '}
                {quiz.pass_mark && `${quiz.pass_mark}% نجاح`}
              </Typography>
            </Paper>
          )}
        </Box>
        
        <Divider sx={{ my: 3, borderColor: 'grey.300' }} />
        
                 {/* Questions Section */}
         <Box sx={{ mb: 4 }}>
           <Box sx={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: 2, 
             mb: 4 
           }}>
             <Typography variant="h5" fontWeight={700} color="text.primary">
               الأسئلة والإجابات
             </Typography>
             <Chip 
               label={`${quiz.questions?.length || 0} سؤال`}
               color="primary"
               variant="outlined"
               sx={{ borderRadius: 2 }}
             />
           </Box>
           
           {quiz.questions && quiz.questions.length > 0 ? (
             <Stack spacing={4}>
               {quiz.questions.map((q, idx) => (
                 <Paper key={q.id || idx} sx={{ 
                   p: 4, 
                   borderRadius: 4, 
                   bgcolor: 'white',
                   border: '1px solid',
                   borderColor: 'grey.200',
                   boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                   '&:hover': {
                     boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                     transform: 'translateY(-2px)',
                     transition: 'all 0.3s ease-in-out'
                   }
                 }}>
                   {/* Question Number and Type */}
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 2, 
                     mb: 3 
                   }}>
                     <Box sx={{
                       minWidth: 50,
                       height: 50,
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                       color: 'white',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontWeight: 700,
                       fontSize: '1.2rem',
                       boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                     }}>
                       {idx + 1}
                     </Box>
                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                       <Chip 
                         label={getQuestionTypeLabel(q.question_type)} 
                         size="small"
                         color="secondary"
                         sx={{ 
                           borderRadius: 2,
                           fontWeight: 600
                         }}
                       />
                       <Chip 
                         label={`${q.points} درجة`} 
                         size="small" 
                         color="info"
                         variant="outlined"
                         sx={{ 
                           borderRadius: 2,
                           fontWeight: 600
                         }}
                       />
                     </Box>
                   </Box>
                   
                   {/* Question Text */}
                   <Box sx={{ mb: 3 }}>
                     <Typography 
                       variant="h6" 
                       fontWeight={600} 
                       sx={{ 
                         lineHeight: 1.6,
                         wordBreak: 'break-word',
                         color: 'text.primary',
                         fontSize: '1.1rem'
                       }}
                     >
                       {q.text}
                     </Typography>
                   </Box>
                   
                   {/* Question Explanation */}
                   {q.explanation && (
                     <Paper sx={{ 
                       p: 3, 
                       mb: 3, 
                       borderRadius: 3, 
                       bgcolor: 'warning.50',
                       border: '1px solid',
                       borderColor: 'warning.200',
                       position: 'relative',
                       overflow: 'hidden'
                     }}>
                       <Box sx={{
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         width: '4px',
                         height: '100%',
                         bgcolor: 'warning.main'
                       }} />
                       <Typography variant="body2" color="warning.dark" fontWeight={600} mb={1}>
                         💡 شرح السؤال:
                       </Typography>
                       <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                         {q.explanation}
                       </Typography>
                     </Paper>
                   )}
                   
                   {/* Answers Section */}
                   {q.answers && q.answers.length > 0 && (
                     <Box>
                       <Typography 
                         variant="h6" 
                         color="text.primary" 
                         fontWeight={600} 
                         mb={2}
                         sx={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           gap: 1 
                         }}
                       >
                         <Box sx={{
                           width: 8,
                           height: 8,
                           borderRadius: '50%',
                           bgcolor: 'primary.main'
                         }} />
                         الإجابات المتاحة:
                       </Typography>
                       
                       <Box sx={{ 
                         display: 'grid',
                         gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                         gap: 2
                       }}>
                         {q.answers.map((a, aIdx) => (
                           <Paper
                             key={a.id || aIdx}
                             sx={{ 
                               p: 2.5,
                               borderRadius: 3,
                               border: '2px solid',
                               borderColor: a.is_correct ? 'success.main' : 'grey.300',
                               bgcolor: a.is_correct ? 'success.50' : 'grey.50',
                               position: 'relative',
                               overflow: 'hidden',
                               transition: 'all 0.2s ease-in-out',
                               '&:hover': {
                                 transform: 'translateY(-1px)',
                                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                               }
                             }}
                           >
                             {/* Correct Answer Indicator */}
                             {a.is_correct && (
                               <Box sx={{
                                 position: 'absolute',
                                 top: 0,
                                 right: 0,
                                 width: 0,
                                 height: 0,
                                 borderStyle: 'solid',
                                 borderWidth: '0 30px 30px 0',
                                 borderColor: 'transparent success.main transparent transparent'
                               }} />
                             )}
                             
                             <Box sx={{ 
                               display: 'flex', 
                               alignItems: 'center', 
                               gap: 2 
                             }}>
                               <Box sx={{
                                 minWidth: 32,
                                 height: 32,
                                 borderRadius: '50%',
                                 bgcolor: a.is_correct ? 'success.main' : 'grey.400',
                                 color: 'white',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 fontWeight: 700,
                                 fontSize: '0.9rem'
                               }}>
                                 {String.fromCharCode(65 + aIdx)} {/* A, B, C, D... */}
                               </Box>
                               <Typography 
                                 variant="body1" 
                                 fontWeight={a.is_correct ? 600 : 500}
                                 sx={{ 
                                   color: a.is_correct ? 'success.dark' : 'text.primary',
                                   lineHeight: 1.4
                                 }}
                               >
                                 {a.text}
                               </Typography>
                             </Box>
                             
                             {/* Correct Answer Badge */}
                             {a.is_correct && (
                               <Box sx={{
                                 position: 'absolute',
                                 top: 8,
                                 right: 8,
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: 0.5
                               }}>
                                 <Typography 
                                   variant="caption" 
                                   sx={{ 
                                     color: 'success.main',
                                     fontWeight: 700,
                                     fontSize: '0.7rem'
                                   }}
                                 >
                                   ✓ الإجابة الصحيحة
                                 </Typography>
                               </Box>
                             )}
                           </Paper>
                         ))}
                       </Box>
                     </Box>
                   )}
                 </Paper>
               ))}
             </Stack>
           ) : (
             <Paper sx={{ 
               p: 8, 
               borderRadius: 4, 
               bgcolor: 'grey.50',
               border: '2px dashed',
               borderColor: 'grey.300',
               textAlign: 'center'
             }}>
               <Box sx={{
                 width: 80,
                 height: 80,
                 borderRadius: '50%',
                 bgcolor: 'grey.300',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 mx: 'auto',
                 mb: 3
               }}>
                 <Typography variant="h4" color="grey.500">
                   ?
                 </Typography>
               </Box>
               <Typography variant="h6" color="text.secondary" mb={2}>
                 لا توجد أسئلة
               </Typography>
               <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                 هذا الكويز لا يحتوي على أي أسئلة بعد. يمكنك إضافة أسئلة من خلال تعديل الكويز.
               </Typography>
             </Paper>
           )}
         </Box>
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Button 
            variant="outlined" 
            startIcon={<Edit />} 
            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600
            }}
          >
            تعديل الكويز
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600
            }}
          >
            حذف الكويز
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 500,
            width: '90%'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'error.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Delete sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              تأكيد حذف الكويز
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            هل أنت متأكد من حذف الكويز:
          </Typography>
          <Paper sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 2, 
            bgcolor: 'error.50',
            border: '1px solid',
            borderColor: 'error.200'
          }}>
            <Typography variant="h6" fontWeight={600} color="error.dark">
              "{quiz.title}"
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الكويز وجميع أسئلته وإجاباته نهائياً.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          gap: 2
        }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600
            }}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleDeleteQuiz} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600
            }}
          >
            حذف نهائياً
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizDetail; 