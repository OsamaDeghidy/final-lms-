import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Paper, Stack, IconButton, Divider, Chip, CircularProgress, Alert, FormControlLabel, Switch } from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../../services/quiz.service';

const quizTypes = [
  { value: 'video', label: 'فيديو كويز' },
  { value: 'module', label: 'كويز وحدة' },
  { value: 'quick', label: 'كويز سريع' },
];

const questionTypes = [
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'true_false', label: 'صح أو خطأ' },
  { value: 'short_answer', label: 'إجابة قصيرة' },
];

const QuizForm = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const isEdit = Boolean(quizId);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    quiz_type: 'video',
    module: '',
    course: '',
    time_limit: 10,
    pass_mark: 60,
    is_active: true,
    questions: [],
  });

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchInitialData();
      // If editing, fetch quiz data after courses are loaded
      if (isEdit && quizId) {
        await fetchQuizData();
      }
    };
    loadData();
  }, [isEdit, quizId]);

  // Fetch modules when course changes
  useEffect(() => {
    if (quiz.course) {
      fetchModules(quiz.course);
    } else {
      setModules([]);
    }
  }, [quiz.course]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      console.log('Fetching courses...'); // للتأكد من البيانات
      const coursesData = await quizAPI.getCourses();
      console.log('Courses data:', coursesData); // للتأكد من البيانات
      const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData.results || coursesData.data || []);
      console.log('Processed courses:', coursesArray); // للتأكد من البيانات
      setCourses(coursesArray);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('حدث خطأ في تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const quizData = await quizAPI.getQuiz(quizId);
      console.log('Quiz data:', quizData); // للتأكد من البيانات
      
      // Process questions to handle true/false questions
      const processedQuestions = (quizData.questions || []).map(question => {
        if (question.question_type === 'true_false' && question.answers) {
          // Find the correct answer for true/false questions
          const correctAnswer = question.answers.find(answer => answer.is_correct);
          return {
            ...question,
            correct_answer: correctAnswer ? (correctAnswer.text === 'صح' ? 'true' : 'false') : null
          };
        }
        return question;
      });

      // Handle course and module data
      const courseId = quizData.course?.id || quizData.course;
      const moduleId = quizData.module?.id || quizData.module;

      console.log('Course ID:', courseId, 'Module ID:', moduleId); // للتأكد من البيانات

      setQuiz({
        title: quizData.title || '',
        description: quizData.description || '',
        quiz_type: quizData.quiz_type || 'video',
        module: moduleId || '',
        course: courseId || '',
        time_limit: quizData.time_limit || 10,
        pass_mark: quizData.pass_mark || 60,
        is_active: quizData.is_active !== undefined ? quizData.is_active : true,
        questions: processedQuestions,
      });

      // Fetch modules if course is available
      if (courseId) {
        await fetchModules(courseId);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError('حدث خطأ في تحميل بيانات الكويز');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId) => {
    try {
      console.log('Fetching modules for course:', courseId); // للتأكد من البيانات
      const modulesData = await quizAPI.getModules(courseId);
      console.log('Modules data:', modulesData); // للتأكد من البيانات
      const modulesArray = Array.isArray(modulesData) ? modulesData : (modulesData.results || modulesData.data || []);
      console.log('Processed modules:', modulesArray); // للتأكد من البيانات
      setModules(modulesArray);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuiz({ 
      ...quiz, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleAddQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: '',
          question_type: 'multiple_choice',
          points: 1,
          explanation: '',
          answers: [{ text: '', is_correct: false }],
          correct_answer: null, // للأسئلة من نوع صح أو خطأ
        },
      ],
    });
  };

  const handleQuestionChange = (idx, field, value) => {
    const questions = quiz.questions.map((q, i) => {
      if (i === idx) {
        const updatedQuestion = { ...q, [field]: value };
        
        // إذا تم تغيير نوع السؤال، قم بتحديث الإجابات
        if (field === 'question_type') {
          if (value === 'true_false') {
            // لأسئلة صح أو خطأ، احذف الإجابات المتعددة
            updatedQuestion.answers = [];
            updatedQuestion.correct_answer = null;
          } else if (value === 'multiple_choice') {
            // لأسئلة الاختيار من متعدد، أضف إجابة افتراضية
            updatedQuestion.answers = [{ text: '', is_correct: false }];
            updatedQuestion.correct_answer = null;
          } else if (value === 'short_answer') {
            // لأسئلة الإجابة القصيرة، احذف الإجابات
            updatedQuestion.answers = [];
            updatedQuestion.correct_answer = null;
          }
        }
        
        return updatedQuestion;
      }
      return q;
    });
    setQuiz({ ...quiz, questions });
  };

  const handleAddAnswer = (qIdx) => {
    const questions = quiz.questions.map((q, i) =>
      i === qIdx ? { ...q, answers: [...q.answers, { text: '', is_correct: false }] } : q
    );
    setQuiz({ ...quiz, questions });
  };

  const handleAnswerChange = (qIdx, aIdx, field, value) => {
    const questions = quiz.questions.map((q, i) =>
      i === qIdx
        ? {
            ...q,
            answers: q.answers.map((a, j) =>
              j === aIdx ? { ...a, [field]: value } : a
            ),
          }
        : q
    );
    setQuiz({ ...quiz, questions });
  };

  const handleDeleteQuestion = (idx) => {
    const questions = quiz.questions.filter((_, i) => i !== idx);
    setQuiz({ ...quiz, questions });
  };

  const handleDeleteAnswer = (qIdx, aIdx) => {
    const questions = quiz.questions.map((q, i) =>
      i === qIdx ? { ...q, answers: q.answers.filter((_, j) => j !== aIdx) } : q
    );
    setQuiz({ ...quiz, questions });
  };

  const validateForm = () => {
    if (!quiz.title.trim()) {
      setError('يرجى إدخال عنوان الكويز');
      return false;
    }
    
    if (!quiz.course) {
      setError('يرجى اختيار الكورس');
      return false;
    }

    if (quiz.questions.length === 0) {
      setError('يرجى إضافة سؤال واحد على الأقل');
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (!question.text.trim()) {
        setError(`يرجى إدخال نص السؤال رقم ${i + 1}`);
        return false;
      }

      if (question.question_type === 'multiple_choice' && question.answers.length < 2) {
        setError(`يرجى إضافة إجابتين على الأقل للسؤال رقم ${i + 1}`);
        return false;
      }

      if (question.question_type === 'multiple_choice') {
        const hasCorrectAnswer = question.answers.some(answer => answer.is_correct);
        if (!hasCorrectAnswer) {
          setError(`يرجى تحديد إجابة صحيحة للسؤال رقم ${i + 1}`);
          return false;
        }
      }

      if (question.question_type === 'true_false' && !question.correct_answer) {
        setError(`يرجى اختيار الإجابة الصحيحة للسؤال رقم ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare quiz data
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        quiz_type: quiz.quiz_type,
        course: quiz.course,
        module: quiz.module || null,
        time_limit: quiz.time_limit,
        pass_mark: quiz.pass_mark,
        is_active: quiz.is_active,
      };

            let savedQuiz;
      if (isEdit) {
        savedQuiz = await quizAPI.updateQuiz(quizId, quizData);
      } else {
        savedQuiz = await quizAPI.createQuiz(quizData);
      }

      console.log('Saved quiz:', savedQuiz); // للتأكد من البيانات

      // Check if quiz was saved successfully
      if (!savedQuiz || !savedQuiz.id) {
        throw new Error('فشل في حفظ الكويز');
      }

      // Save questions if there are any
      if (quiz.questions.length > 0) {
        for (const question of quiz.questions) {
          const questionData = {
            quiz: savedQuiz.id,
            text: question.text,
            question_type: question.question_type,
            points: question.points,
            explanation: question.explanation,
            order: quiz.questions.indexOf(question),
          };

          console.log('Question data:', questionData); // للتأكد من البيانات

          // Validate question data
          if (!questionData.quiz || !questionData.text || !questionData.question_type) {
            throw new Error(`بيانات السؤال غير مكتملة: ${JSON.stringify(questionData)}`);
          }

          let savedQuestion;
          if (question.id) {
            // Update existing question
            savedQuestion = await quizAPI.updateQuizQuestion(question.id, questionData);
          } else {
            // Create new question
            savedQuestion = await quizAPI.createQuizQuestion(questionData);
          }

          // Save answers for multiple choice questions
          if (question.question_type === 'multiple_choice' && question.answers.length > 0) {
            for (const answer of question.answers) {
              const answerData = {
                question: savedQuestion.id,
                text: answer.text,
                is_correct: answer.is_correct,
                explanation: '',
                order: question.answers.indexOf(answer),
              };

              if (answer.id) {
                // Update existing answer
                await quizAPI.updateQuizAnswer(answer.id, answerData);
              } else {
                // Create new answer
                await quizAPI.createQuizAnswer(answerData);
              }
            }
          }

          // Save answers for true/false questions
          if (question.question_type === 'true_false' && question.correct_answer) {
            console.log('Creating true/false answers for question:', savedQuestion.id);
            console.log('Correct answer:', question.correct_answer);
            
            // Create "صح" answer
            const trueAnswerData = {
              question: savedQuestion.id,
              text: 'صح',
              is_correct: question.correct_answer === 'true',
              explanation: '',
              order: 0,
            };
            console.log('True answer data:', trueAnswerData);
            await quizAPI.createQuizAnswer(trueAnswerData);

            // Create "خطأ" answer
            const falseAnswerData = {
              question: savedQuestion.id,
              text: 'خطأ',
              is_correct: question.correct_answer === 'false',
              explanation: '',
              order: 1,
            };
            console.log('False answer data:', falseAnswerData);
            await quizAPI.createQuizAnswer(falseAnswerData);
          }
        }
      }

      setSuccess(isEdit ? 'تم تحديث الكويز بنجاح' : 'تم إنشاء الكويز بنجاح');
      setTimeout(() => {
        navigate('/teacher/quizzes');
      }, 1500);

    } catch (err) {
      console.error('Error saving quiz:', err);
      setError('حدث خطأ في حفظ الكويز. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Button startIcon={<ArrowBack />} sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        العودة
      </Button>
      
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          {isEdit ? 'تعديل الكويز' : 'إضافة كويز جديد'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField 
            label="عنوان الكويز" 
            name="title" 
            value={quiz.title} 
            onChange={handleChange} 
            fullWidth 
            required
          />
          <TextField 
            label="وصف الكويز" 
            name="description" 
            value={quiz.description} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            rows={2} 
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              select 
              label="نوع الكويز" 
              name="quiz_type" 
              value={quiz.quiz_type} 
              onChange={handleChange} 
              sx={{ minWidth: 180 }}
            >
              {quizTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select 
              label="الكورس" 
              name="course" 
              value={quiz.course} 
              onChange={handleChange} 
              sx={{ minWidth: 180 }}
              required
            >
              <MenuItem value="">اختر الكورس</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
              ))}
            </TextField>
            <TextField 
              select 
              label="الوحدة" 
              name="module" 
              value={quiz.module} 
              onChange={handleChange} 
              sx={{ minWidth: 180 }}
              disabled={!quiz.course}
            >
              <MenuItem value="">اختر الوحدة (اختياري)</MenuItem>
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>{module.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              label="الزمن بالدقائق" 
              name="time_limit" 
              type="number" 
              value={quiz.time_limit} 
              onChange={handleChange} 
              sx={{ minWidth: 180 }} 
            />
            <TextField 
              label="درجة النجاح (%)" 
              name="pass_mark" 
              type="number" 
              value={quiz.pass_mark} 
              onChange={handleChange} 
              sx={{ minWidth: 180 }} 
            />
            <FormControlLabel
              control={
                <Switch
                  checked={quiz.is_active}
                  onChange={handleChange}
                  name="is_active"
                />
              }
              label="نشط"
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />
        
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              الأسئلة
            </Typography>
            <Button startIcon={<Add />} sx={{ ml: 2 }} onClick={handleAddQuestion}>
              إضافة سؤال
            </Button>
          </Box>
          
          <Stack spacing={3}>
            {quiz.questions.map((q, qIdx) => (
              <Paper key={qIdx} sx={{ p: 3, borderRadius: 2, position: 'relative' }}>
                <IconButton 
                  size="small" 
                  color="error" 
                  sx={{ position: 'absolute', top: 8, left: 8 }} 
                  onClick={() => handleDeleteQuestion(qIdx)}
                >
                  <Delete />
                </IconButton>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
                  <TextField 
                    label="نص السؤال" 
                    value={q.text} 
                    onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)} 
                    fullWidth 
                    required
                  />
                  <TextField 
                    select 
                    label="نوع السؤال" 
                    value={q.question_type} 
                    onChange={e => handleQuestionChange(qIdx, 'question_type', e.target.value)} 
                    sx={{ minWidth: 180 }}
                  >
                    {questionTypes.map((qt) => (
                      <MenuItem key={qt.value} value={qt.value}>{qt.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField 
                    label="الدرجة" 
                    type="number" 
                    value={q.points} 
                    onChange={e => handleQuestionChange(qIdx, 'points', e.target.value)} 
                    sx={{ minWidth: 120 }} 
                  />
                </Stack>
                
                <TextField 
                  label="شرح الإجابة (اختياري)" 
                  value={q.explanation || ''} 
                  onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)} 
                  fullWidth 
                  multiline 
                  rows={2}
                  sx={{ mb: 2 }}
                />

                {q.question_type === 'multiple_choice' && (
                  <Box>
                    <Typography variant="subtitle2" mb={1}>الإجابات</Typography>
                    <Stack spacing={1}>
                      {q.answers.map((a, aIdx) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={aIdx}>
                          <TextField 
                            label={`إجابة ${aIdx + 1}`} 
                            value={a.text} 
                            onChange={e => handleAnswerChange(qIdx, aIdx, 'text', e.target.value)} 
                            sx={{ flex: 1 }} 
                            required
                          />
                          <Chip
                            label={a.is_correct ? 'صحيحة' : 'خاطئة'}
                            color={a.is_correct ? 'success' : 'default'}
                            onClick={() => handleAnswerChange(qIdx, aIdx, 'is_correct', !a.is_correct)}
                            sx={{ cursor: 'pointer' }}
                          />
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteAnswer(qIdx, aIdx)}
                            disabled={q.answers.length <= 1}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                    <Button startIcon={<Add />} sx={{ mt: 1 }} onClick={() => handleAddAnswer(qIdx)}>
                      إضافة إجابة
                    </Button>
                  </Box>
                )}

                {q.question_type === 'true_false' && (
                  <Box>
                    <Typography variant="subtitle2" mb={1}>اختر الإجابة الصحيحة</Typography>
                    <Stack direction="row" spacing={2}>
                      <Chip
                        label="صح"
                        color={q.correct_answer === 'true' ? 'success' : 'default'}
                        onClick={() => handleQuestionChange(qIdx, 'correct_answer', 'true')}
                        sx={{ cursor: 'pointer', px: 3, py: 1 }}
                        variant={q.correct_answer === 'true' ? 'filled' : 'outlined'}
                      />
                      <Chip
                        label="خطأ"
                        color={q.correct_answer === 'false' ? 'success' : 'default'}
                        onClick={() => handleQuestionChange(qIdx, 'correct_answer', 'false')}
                        sx={{ cursor: 'pointer', px: 3, py: 1 }}
                        variant={q.correct_answer === 'false' ? 'filled' : 'outlined'}
                      />
                    </Stack>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>
            إلغاء
          </Button>
          <Button 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={20} /> : <Save />} 
            sx={{ fontWeight: 'bold', px: 4 }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'حفظ الكويز')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizForm; 