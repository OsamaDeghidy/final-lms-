import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, LinearProgress, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { EmojiEvents, Assessment, CheckCircle, Close } from '@mui/icons-material';
import { quizAPI } from '../../../services/quiz.service';

const QuizResult = ({ quizId, attemptId, onRetry, onClose }) => {
  const navigate = useNavigate();
  const { quizId: urlQuizId, attemptId: urlAttemptId } = useParams();
  const actualQuizId = quizId || urlQuizId;
  const actualAttemptId = attemptId || urlAttemptId;
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (actualAttemptId) {
    loadQuizResult();
    }
  }, [actualAttemptId]);

  const loadQuizResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!actualAttemptId) {
        setError('لم يتم العثور على معرف المحاولة.');
        return;
      }
      
      console.log('🔍 Loading quiz result for attempt:', actualAttemptId);
      
      // Get quiz attempt result
      const attemptResult = await quizAPI.getQuizAttemptResult(actualAttemptId);
      console.log('📊 Quiz attempt result:', attemptResult);
      setResult(attemptResult);
      
      // Try multiple endpoints for answers
      let answersData = null;
      try {
        console.log('📝 Trying result_answers endpoint...');
        answersData = await quizAPI.getQuizAttemptResultAnswers(actualAttemptId);
        console.log('📝 Quiz result answers data:', answersData);
      } catch (resultError) {
        console.log('⚠️ Result answers failed, trying regular answers...', resultError);
        try {
          answersData = await quizAPI.getQuizAttemptAnswers(actualAttemptId);
          console.log('📝 Quiz regular answers data:', answersData);
        } catch (regularError) {
          console.log('❌ Both answer endpoints failed:', regularError);
          // Try to get quiz questions as fallback
          try {
            console.log('🔄 Trying to get quiz questions as fallback...');
            const quizQuestions = await quizAPI.getQuizQuestions(actualQuizId);
            console.log('📝 Quiz questions fallback:', quizQuestions);
            // Create mock answers structure
            answersData = {
              results: quizQuestions.results?.map((question, index) => ({
                id: `mock-${index}`,
                question: question,
                text_answer: null,
                selected_answer_id: null,
                is_correct: false,
                points_earned: 0,
                feedback: null
              })) || []
            };
          } catch (fallbackError) {
            console.log('❌ Fallback also failed:', fallbackError);
            answersData = { results: [], answers: [] };
          }
        }
      }
      
      // Handle different response formats
      const answersArray = answersData?.results || answersData?.answers || answersData || [];
      console.log('📝 Processed answers array:', answersArray);
      console.log('📝 Answers count:', answersArray.length);
      console.log('📝 First answer structure:', answersArray[0]);
      setAnswers(answersArray);
      
    } catch (err) {
      console.error('❌ Error loading quiz result:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(`حدث خطأ في تحميل نتيجة الكويز: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
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
      <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadQuizResult}>إعادة المحاولة</Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 1, md: 3 } }}>
        <Alert severity="warning">لا توجد بيانات متاحة للنتيجة</Alert>
      </Box>
    );
  }

  const score = result.score || result.percentage || result.total_score || 0;
  const passMark = result.quiz?.pass_mark || result.pass_mark || 50; // Default passing score for quiz
  const passed = result.passed !== undefined ? result.passed : (score >= passMark);
  const totalPoints = result.quiz?.total_points || result.total_points || 100;
  
  console.log('📊 Result calculation:', { 
    score, 
    passed, 
    passMark, 
    totalPoints, 
    result: result 
  });

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Result Summary */}
      <Paper elevation={2} sx={{ borderRadius: 3, p: 4, mb: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 48, color: passed ? 'success.main' : 'error.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
          نتيجة الكويز
        </Typography>
        <Chip label={passed ? 'ناجح' : 'راسب'} color={passed ? 'success' : 'error'} sx={{ mb: 2, fontSize: 18 }} />
        <Typography variant="h4" fontWeight={800} color={passed ? 'success.main' : 'error.main'} mb={2}>
          {score.toFixed(1)}%
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={score} 
          sx={{ 
            mb: 2, 
            height: 10, 
            borderRadius: 2,
            '& .MuiLinearProgress-bar': {
              backgroundColor: passed ? 'success.main' : 'error.main'
            }
          }} 
        />
        <Typography variant="body1" mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
          الدرجة: {score.toFixed(1)} من {totalPoints}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
          درجة النجاح: {passMark}%
        </Typography>
        {answers && answers.length > 0 && (
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ direction: 'rtl', textAlign: 'center' }}>
            عدد الأسئلة: {answers.length} | الإجابات الصحيحة: {answers.filter(a => a.is_correct === true).length}
          </Typography>
        )}
        {passed ? (
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, mt: 2 }} onClick={onClose}>
            اكتمال
          </Button>
        ) : (
          <Button variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, mt: 2 }} onClick={onRetry || (() => window.location.reload())}>
            إعادة المحاولة
          </Button>
        )}
      </Paper>

      {/* Detailed Answers Review */}
      {answers && answers.length > 0 ? (
        <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3} sx={{ direction: 'rtl', textAlign: 'center' }}>
            مراجعة الإجابات ({answers.length} سؤال)
          </Typography>
          {answers.map((answer, index) => {
            console.log(`📝 Answer ${index + 1}:`, answer);
            
            // Handle different answer structures - more comprehensive
            let userAnswer = 'لم تجب على هذا السؤال';
            if (answer.text_answer) {
              userAnswer = answer.text_answer;
            } else if (answer.selected_answer?.text) {
              userAnswer = answer.selected_answer.text;
            } else if (answer.selected_answer_id) {
              // Try to find the selected answer text from question options
              const selectedOption = answer.question?.answers?.find(a => a.id === answer.selected_answer_id);
              userAnswer = selectedOption?.text || `إجابة مختارة (ID: ${answer.selected_answer_id})`;
            } else if (answer.answer_text) {
              userAnswer = answer.answer_text;
            } else if (answer.user_answer) {
              userAnswer = answer.user_answer;
            }
            
            // Get correct answer
            let correctAnswer = 'غير محدد';
            if (answer.question?.answers) {
              const correct = answer.question.answers.find(a => a.is_correct);
              if (correct) {
                correctAnswer = correct.text;
              }
            } else if (answer.correct_answer?.text) {
              correctAnswer = answer.correct_answer.text;
            }
            
            const isCorrect = answer.is_correct !== undefined ? answer.is_correct : false;
            const pointsEarned = answer.points_earned || answer.score || 0;
            const totalPoints = answer.question?.points || answer.total_points || 1;
            
            return (
              <Box key={answer.id || index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1} sx={{ direction: 'rtl', textAlign: 'right' }}>
                  السؤال {index + 1}: {answer.question?.text || answer.question_text || `سؤال ${index + 1}`}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ direction: 'rtl', textAlign: 'right' }}>
                    إجابتك:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    direction: 'rtl', 
                    textAlign: 'right',
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    {userAnswer}
                  </Typography>
                </Box>

                {answer.question?.question_type !== 'short_answer' && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ direction: 'rtl', textAlign: 'right' }}>
                      الإجابة الصحيحة:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      direction: 'rtl', 
                      textAlign: 'right',
                      p: 1,
                      bgcolor: isCorrect ? 'success.light' : 'error.light',
                      borderRadius: 1,
                      mb: 1
                    }}>
                      {correctAnswer}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip 
                    label={isCorrect ? 'صحيح' : 'خاطئ'} 
                    color={isCorrect ? 'success' : 'error'} 
                    size="small" 
                  />
                  <Typography variant="body2" color="text.secondary">
                    النقاط: {pointsEarned} / {totalPoints}
                  </Typography>
                </Box>

                {answer.feedback && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ direction: 'rtl', textAlign: 'right' }}>
                      ملاحظات:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      direction: 'rtl', 
                      textAlign: 'right',
                      p: 1,
                      bgcolor: 'info.light',
                      borderRadius: 1
                    }}>
                      {answer.feedback}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
          <Alert severity="warning" sx={{ textAlign: 'center' }}>
            لا توجد إجابات متاحة للعرض. قد تكون البيانات لم تصل بعد.
            <br />
            <small>Attempt ID: {actualAttemptId} | Quiz ID: {actualQuizId}</small>
            <br />
            <small>Debug: answers length = {answers?.length || 0}</small>
            <br />
            <Button 
              variant="outlined" 
              size="small" 
              onClick={loadQuizResult}
              sx={{ mt: 2 }}
            >
              إعادة تحميل البيانات
            </Button>
          </Alert>
        </Paper>
      )}
      
      {/* Back Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
          color="primary"
          onClick={onClose}
          sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold' }}
          >
          العودة
          </Button>
      </Box>
    </Box>
  );
};

export default QuizResult; 