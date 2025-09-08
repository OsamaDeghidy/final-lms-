import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, RadioGroup, FormControlLabel, Radio, TextField, Chip, Divider, Stack, CircularProgress, Alert } from '@mui/material';
import { Assessment, Done, AccessTime, EmojiEvents, PlayArrow } from '@mui/icons-material';
import ExamResult from './exam/ExamResult';
import { examAPI } from '../../services/exam.service';

const mockExam = {
  id: 1,
  title: 'الامتحان النهائي - تطوير الويب',
  description: 'امتحان شامل يغطي جميع وحدات الدورة. لديك 60 دقيقة للإجابة.',
  time_limit: 60,
  pass_mark: 60,
  total_points: 100,
  questions: [
    {
      id: 1,
      text: 'ما هو React؟',
      type: 'multiple_choice',
      options: ['مكتبة جافاسكريبت', 'لغة برمجة', 'نظام تشغيل', 'متصفح'],
      points: 2,
    },
    {
      id: 2,
      text: 'هل HTML لغة برمجة؟',
      type: 'true_false',
      options: ['صح', 'خطأ'],
      points: 1,
    },
    {
      id: 3,
      text: 'اشرح مفهوم SPA.',
      type: 'short_answer',
      points: 3,
    },
  ],
};

const FinalExamModal = ({ onClose, finalExamData, courseId }) => {
  const [step, setStep] = useState('start'); // start | questions | result
  const [answers, setAnswers] = useState({});
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [hasCompletedExam, setHasCompletedExam] = useState(false);

  useEffect(() => {
    if (finalExamData) {
      setExam(finalExamData);
      console.log('FinalExamModal - Exam data:', finalExamData);
      console.log('FinalExamModal - Previous attempts:', finalExamData.previous_attempts);
      
      // Check for previous attempts
      if (finalExamData.previous_attempts && finalExamData.previous_attempts.length > 0) {
        setPreviousAttempts(finalExamData.previous_attempts);
        setHasCompletedExam(true);
        console.log('FinalExamModal - Has completed exam: true');
      } else {
        setHasCompletedExam(false);
        console.log('FinalExamModal - Has completed exam: false');
      }
    }
  }, [finalExamData]);

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleViewResults = () => {
    console.log('handleViewResults called');
    console.log('Previous attempts:', previousAttempts);
    
    // Get the latest attempt ID
    if (previousAttempts.length > 0) {
      const latestAttempt = previousAttempts[0];
      console.log('Latest attempt:', latestAttempt);
      setAttemptId(latestAttempt.id);
      setStep('result');
    } else {
      console.log('No previous attempts found');
    }
  };

  const handleStart = async () => {
    console.log('handleStart called with exam:', exam);
    
    if (!exam) {
      console.log('No exam data available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting exam attempt for exam ID:', exam.id);
      
      // Start exam attempt
      const attemptData = await examAPI.startExamAttempt(exam.id);
      console.log('Exam attempt started successfully:', attemptData);
      console.log('Attempt data keys:', Object.keys(attemptData));
      console.log('Attempt ID from response:', attemptData.id);
      
      if (!attemptData.id) {
        console.error('No ID in attempt data:', attemptData);
        setError('فشل في بدء الامتحان: لم يتم الحصول على معرف المحاولة.');
        return;
      }
      
      setAttemptId(attemptData.id);
      console.log('Set attemptId to:', attemptData.id);
      
      setStep('questions');
    } catch (err) {
      console.error('Error starting final exam:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle specific error messages
      const errorResponse = err.response?.data;
      if (Array.isArray(errorResponse) && errorResponse.length > 0) {
        const errorMessage = errorResponse[0];
        if (errorMessage.includes('استنفذت عدد المحاولات')) {
          setError('لقد استنفذت عدد المحاولات المسموحة لهذا الامتحان. يرجى التواصل مع المدرب.');
        } else if (errorMessage.includes('لا يمكنك تقديم هذا الامتحان مرة أخرى')) {
          setError('لقد قمت بتقديم هذا الامتحان من قبل. لا يمكنك تقديمه مرة أخرى.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('حدث خطأ في بدء الامتحان. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called', { attemptId, exam: exam?.id, answers, step });
    
    if (!attemptId || !exam) {
      console.log('Missing required data:', { attemptId, exam: exam?.id, step });
      setError('يجب بدء الامتحان أولاً قبل التسليم. يرجى الضغط على "بدء الامتحان".');
      return;
    }
    
    if (step !== 'questions') {
      console.log('Invalid step for submission:', step);
      setError('يجب أن تكون في صفحة الأسئلة لتسليم الامتحان.');
      return;
    }
    
    if (!attemptId) {
      console.log('No attemptId found, redirecting to start exam');
      setError('لم يتم بدء الامتحان بعد. يرجى الضغط على "بدء الامتحان" أولاً.');
      setStep('intro');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare answers for submission
      const answersToSubmit = exam.questions.map((question) => {
        const answer = answers[question.id];
        let selectedAnswerId = answer?.selected_answer || null;
        
        // Ensure selected_answer_id is not an array
        if (Array.isArray(selectedAnswerId)) {
          selectedAnswerId = selectedAnswerId[0] || null;
        }
        
        // Handle true/false questions - convert answer ID to true/false string
        if (question.question_type === 'true_false' && selectedAnswerId) {
          // Find the selected answer to get its text
          const selectedAnswer = question.answers?.find(a => a.id == selectedAnswerId);
          if (selectedAnswer) {
            // Convert Arabic text to true/false
            if (selectedAnswer.text === 'صح' || selectedAnswer.text === 'true') {
              selectedAnswerId = 'true';
            } else if (selectedAnswer.text === 'خطأ' || selectedAnswer.text === 'false') {
              selectedAnswerId = 'false';
            }
          }
        }
        
        const submission = {
          question_id: question.id,
          selected_answer_id: selectedAnswerId,
          text_answer: answer?.text_answer || null
        };
        console.log(`Question ${question.id} submission:`, submission);
        return submission;
      });

      console.log('Submitting answers:', answersToSubmit);
      
      // Submit answers
      const submitResult = await examAPI.submitExamAnswers(attemptId, answersToSubmit);
      console.log('Submit result:', submitResult);
      
      // Finish the attempt
      const finishResult = await examAPI.finishExamAttempt(attemptId);
      console.log('Finish result:', finishResult);
      
      setStep('result');
    } catch (err) {
      console.error('Error submitting final exam:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Handle specific error messages
      const errorResponse = err.response?.data;
      if (errorResponse && typeof errorResponse === 'object') {
        if (errorResponse.error) {
          setError(errorResponse.error);
        } else if (Array.isArray(errorResponse) && errorResponse.length > 0) {
          setError(errorResponse[0]);
        } else {
          setError('حدث خطأ في إرسال الإجابات. يرجى المحاولة مرة أخرى.');
        }
      } else {
        setError('حدث خطأ في إرسال الإجابات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', p: 0 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, p: 3, mb: 2, boxShadow: '0 4px 24px 0 rgba(63,81,181,0.10)' }}>
        {step === 'start' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={800} mb={1} sx={{ textAlign: 'center', letterSpacing: 1 }}>
              {exam?.title || 'الامتحان النهائي'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2} sx={{ textAlign: 'center', fontSize: 15 }}>
              {exam?.description || 'امتحان شامل يغطي جميع وحدات الدورة'}
            </Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip icon={<AccessTime />} label={`${exam?.time_limit || 60} دقيقة`} size="small" color="info" />
              <Chip icon={<EmojiEvents />} label={`النجاح: ${exam?.pass_mark || 60}%`} size="small" color="success" />
              <Chip label={`الدرجة: ${exam?.total_points || 100}`} size="small" color="primary" />
            </Stack>
            
            {hasCompletedExam && (
              <Alert severity="info" sx={{ mb: 2, direction: 'rtl', textAlign: 'right' }}>
                لديك محاولات سابقة لهذا الامتحان. يمكنك بدء محاولة جديدة أو عرض النتائج السابقة.
              </Alert>
            )}
            <Stack direction="column" spacing={2} sx={{ width: '100%', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                disabled={loading || !exam}
                sx={{ borderRadius: 99, px: 5, py: 1.2, fontWeight: 'bold', fontSize: 18, boxShadow: '0 4px 16px 0 rgba(63,81,181,0.10)' }}
                onClick={handleStart}
              >
                {loading ? 'جاري البدء...' : 'بدء الامتحان'}
              </Button>
              
              {hasCompletedExam && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  startIcon={<Assessment />}
                  sx={{ 
                    borderRadius: 99, 
                    px: 5, 
                    py: 1.2, 
                    fontWeight: 'bold', 
                    fontSize: 16, 
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: 'secondary.light',
                      color: 'white'
                    }
                  }}
                  onClick={handleViewResults}
                >
                  عرض النتائج السابقة
                </Button>
              )}
            </Stack>
          </Box>
        )}
        {step === 'questions' && (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="h6" fontWeight={700} mb={2} textAlign="center">
              الأسئلة ({exam?.questions?.length || 0})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {exam?.questions?.map((q, idx) => (
              <Paper key={q.id} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 0, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ direction: 'rtl', textAlign: 'right' }}>
                  {idx + 1}. {q.text}
                  <Chip label={`نقاط: ${q.points}`} color="info" size="small" sx={{ ml: 1 }} />
                </Typography>
                {q.question_type === 'multiple_choice' || q.question_type === 'true_false' ? (
                  <RadioGroup
                    value={answers[q.id]?.selected_answer || ''}
                    onChange={e => {
                      const value = Array.isArray(e.target.value) ? e.target.value[0] : e.target.value;
                      handleChange(q.id, { ...answers[q.id], selected_answer: value });
                    }}
                    sx={{ direction: 'rtl' }}
                  >
                    {q.answers?.map((answer) => (
                      <FormControlLabel 
                        key={answer.id} 
                        value={answer.id} 
                        control={<Radio />} 
                        label={answer.text}
                        sx={{ direction: 'rtl', textAlign: 'right' }}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="اكتب إجابتك هنا..."
                    value={answers[q.id]?.text_answer || ''}
                    onChange={e => handleChange(q.id, { ...answers[q.id], text_answer: e.target.value })}
                    sx={{ mt: 1, direction: 'rtl', textAlign: 'right' }}
                  />
                )}
              </Paper>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 3, px: 3 }}>إلغاء</Button>
              <Button
                variant="contained"
                color="success"
                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Done />}
                disabled={submitting}
                onClick={handleSubmit}
                sx={{ borderRadius: 99, px: 5, py: 1.2, fontWeight: 'bold', fontSize: 18, boxShadow: '0 4px 16px 0 rgba(63,81,181,0.10)' }}
              >
                {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
              </Button>
            </Box>
          </Box>
        )}
        {step === 'result' && (
          <ExamResult 
            examId={exam?.id} 
            attemptId={attemptId} 
            onClose={onClose} 
          />
        )}
      </Paper>
    </Box>
  );
};

export default FinalExamModal; 