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
      console.log('Fetching courses...');
      const coursesData = await quizAPI.getCourses();
      console.log('Courses data:', coursesData);
      const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData.results || coursesData.data || []);
      console.log('Processed courses:', coursesArray);
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
      console.log('Quiz data:', quizData);
      
      // Process questions to handle true/false questions
      const processedQuestions = (quizData.questions || []).map(question => {
        console.log('Processing question:', question);
        
        if (question.question_type === 'true_false' && question.answers) {
          // Find the correct answer for true/false questions
          const correctAnswer = question.answers.find(answer => answer.is_correct);
          console.log('True/false correct answer:', correctAnswer);
          
          if (correctAnswer) {
            // Determine if the correct answer is 'صح' or 'خطأ'
            const isTrue = correctAnswer.text === 'صح';
            return {
              ...question,
              correct_answer: isTrue ? 'true' : 'false'
            };
          } else {
            // If no correct answer found, set to null
            console.warn('No correct answer found for true/false question:', question.id);
            return {
              ...question,
              correct_answer: null
            };
          }
        }
        
        // For multiple choice questions, ensure answers are properly loaded
        if (question.question_type === 'multiple_choice' && question.answers) {
          console.log('Multiple choice answers:', question.answers);
          console.log('Raw answer data:', JSON.stringify(question.answers, null, 2));
          
          // Ensure answers have the correct structure and preserve is_correct flag
          const processedAnswers = question.answers.map((answer, index) => {
            console.log(`Processing answer ${index}:`, answer);
            console.log(`Answer ${index} is_correct:`, answer.is_correct, 'Type:', typeof answer.is_correct);
            
            return {
              ...answer,
              text: answer.text || '',
              is_correct: Boolean(answer.is_correct), // Ensure boolean value
              explanation: answer.explanation || ''
            };
          });
          
          console.log('Processed multiple choice answers:', processedAnswers);
          console.log('Correct answers found:', processedAnswers.filter(a => a.is_correct).length);
          
          return {
            ...question,
            answers: processedAnswers
          };
        }
        
        return question;
      });

      // Handle course and module data
      const courseId = quizData.course?.id || quizData.course;
      const moduleId = quizData.module?.id || quizData.module;

      console.log('Course ID:', courseId, 'Module ID:', moduleId);

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
        console.log('Fetching modules for course:', courseId);
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
      console.log('Fetching modules for course:', courseId);
      const modulesData = await quizAPI.getModules(courseId);
      console.log('Raw modules data:', modulesData);
      
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
      
      console.log('Processed modules:', modulesArray);
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
          console.log(`Changing question ${idx + 1} type from ${q.question_type} to ${value}`);
          
          if (value === 'true_false') {
            // لأسئلة صح أو خطأ، احذف الإجابات المتعددة
            console.log('Clearing answers for true/false question');
            updatedQuestion.answers = [];
            updatedQuestion.correct_answer = null;
          } else if (value === 'multiple_choice') {
            // لأسئلة الاختيار من متعدد، أضف إجابة افتراضية
            console.log('Setting up multiple choice answers');
            updatedQuestion.answers = [{ text: '', is_correct: false }];
            updatedQuestion.correct_answer = null;
          } else if (value === 'short_answer') {
            // لأسئلة الإجابة القصيرة، احذف الإجابات
            console.log('Clearing answers for short answer question');
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

  // Helper function to ensure question data is properly structured
  const ensureQuestionStructure = (question) => {
    const baseQuestion = {
      id: question.id || null,
      text: question.text || '',
      question_type: question.question_type || 'multiple_choice',
      points: question.points || 1,
      explanation: question.explanation || '',
      order: question.order || 0,
    };

    if (question.question_type === 'multiple_choice') {
      return {
        ...baseQuestion,
        answers: Array.isArray(question.answers) ? question.answers.map(answer => ({
          id: answer.id || null,
          text: answer.text || '',
          is_correct: answer.is_correct || false,
          explanation: answer.explanation || '',
          order: answer.order || 0,
        })) : [],
        correct_answer: null,
      };
    } else if (question.question_type === 'true_false') {
      return {
        ...baseQuestion,
        answers: [],
        correct_answer: question.correct_answer || null,
      };
    } else {
      return {
        ...baseQuestion,
        answers: [],
        correct_answer: null,
      };
    }
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
        // Validate each answer
        for (let j = 0; j < question.answers.length; j++) {
          const answer = question.answers[j];
          if (!answer.text || !answer.text.trim()) {
            setError(`يرجى إدخال نص الإجابة رقم ${j + 1} للسؤال رقم ${i + 1}`);
            return false;
          }
        }
        
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

      // Clean and validate quiz data before saving
      const cleanedQuiz = {
        ...quiz,
        questions: quiz.questions.map((question, index) => ({
          ...ensureQuestionStructure(question),
          order: index
        }))
      };

      console.log('🧹 Cleaned quiz data for saving:', cleanedQuiz);

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

      console.log('Saving quiz data:', quizData);
      
      // Validate that course is selected
      if (!quizData.course) {
        setError('يرجى اختيار الكورس');
        return;
      }

      let savedQuiz;
      if (isEdit) {
        savedQuiz = await quizAPI.updateQuiz(quizId, quizData);
      } else {
        savedQuiz = await quizAPI.createQuiz(quizData);
      }

      console.log('Saved quiz:', savedQuiz);

      // Check if quiz was saved successfully
      if (!savedQuiz || !savedQuiz.id) {
        throw new Error('فشل في حفظ الكويز');
      }

      // Save questions if there are any
      if (quiz.questions.length > 0) {
        // If editing, get existing questions and delete removed ones
        if (isEdit) {
          try {
            console.log('🔍 Checking for questions to delete...');
            const existingQuestionsResponse = await quizAPI.getQuizQuestions(savedQuiz.id);
            console.log('📋 Raw existing questions response:', existingQuestionsResponse);
            
            // Handle different response formats
            let existingQuestions = [];
            if (Array.isArray(existingQuestionsResponse)) {
              existingQuestions = existingQuestionsResponse;
            } else if (existingQuestionsResponse && typeof existingQuestionsResponse === 'object') {
              if (Array.isArray(existingQuestionsResponse.results)) {
                existingQuestions = existingQuestionsResponse.results;
              } else if (Array.isArray(existingQuestionsResponse.data)) {
                existingQuestions = existingQuestionsResponse.data;
              }
            }
            
            if (existingQuestions.length > 0) {
              console.log('📋 Existing questions from database:', existingQuestions.map(q => ({ id: q.id, text: q.text })));
              console.log('📋 Current questions in form:', quiz.questions.map(q => ({ id: q.id, text: q.text })));
              
              const currentQuestionIds = quiz.questions.filter(q => q.id).map(q => q.id);
              const existingQuestionIds = existingQuestions.map(q => q.id);
              
              console.log('🆔 Current question IDs:', currentQuestionIds);
              console.log('🆔 Existing question IDs:', existingQuestionIds);
              
              // Find questions to delete (questions that exist in DB but not in current form)
              const questionsToDelete = existingQuestionIds.filter(id => !currentQuestionIds.includes(id));
              
              console.log('🗑️ Questions to delete:', questionsToDelete);
              
              if (questionsToDelete.length > 0) {
                console.log(`🗑️ Deleting ${questionsToDelete.length} removed questions...`);
                for (const questionIdToDelete of questionsToDelete) {
                  try {
                    await quizAPI.deleteQuizQuestion(questionIdToDelete);
                    console.log(`✅ Deleted removed question ${questionIdToDelete}`);
                  } catch (error) {
                    console.error(`❌ Error deleting question ${questionIdToDelete}:`, error);
                  }
                }
              } else {
                console.log('✅ No questions to delete');
              }
            } else {
              console.log('📋 No existing questions found in database');
            }
          } catch (error) {
            console.error('❌ Error fetching existing questions:', error);
          }
        }
        
        for (let i = 0; i < cleanedQuiz.questions.length; i++) {
          const question = cleanedQuiz.questions[i];
          // Ensure question data is properly structured
          const structuredQuestion = ensureQuestionStructure(question);
          
          const questionData = {
            quiz: savedQuiz.id,
            text: structuredQuestion.text.trim(),
            question_type: structuredQuestion.question_type,
            points: parseInt(structuredQuestion.points) || 1,
            explanation: structuredQuestion.explanation || '',
            order: i, // Use the loop index instead of indexOf
          };

          console.log('🔍 Question data being sent:', JSON.stringify(questionData, null, 2));
          console.log('🔍 Quiz ID type:', typeof savedQuiz.id);
          console.log('🔍 Quiz ID value:', savedQuiz.id);
          console.log('🔍 Order value:', questionData.order, 'Type:', typeof questionData.order);

          // Validate question data
          if (!questionData.quiz) {
            throw new Error(`معرف الكويز مطلوب: ${JSON.stringify(questionData)}`);
          }
          if (!questionData.text || !questionData.text.trim()) {
            throw new Error(`نص السؤال مطلوب: ${JSON.stringify(questionData)}`);
          }
          if (!questionData.question_type) {
            throw new Error(`نوع السؤال مطلوب: ${JSON.stringify(questionData)}`);
          }
          
          // Ensure points is a positive integer
          if (questionData.points < 1) {
            questionData.points = 1;
          }
          
          // Ensure order is a non-negative integer
          if (questionData.order < 0) {
            questionData.order = 0;
          }
          
          // Final validation - ensure all required fields are present and valid
          console.log('🔍 Final question data validation:', {
            quiz: questionData.quiz,
            text: questionData.text,
            question_type: questionData.question_type,
            points: questionData.points,
            order: questionData.order,
            hasQuiz: !!questionData.quiz,
            hasText: !!questionData.text,
            hasQuestionType: !!questionData.question_type,
            hasPoints: !!questionData.points,
            hasOrder: questionData.order >= 0
          });

          let savedQuestion;
          if (question.id) {
            // Update existing question
            savedQuestion = await quizAPI.updateQuizQuestion(question.id, questionData);
          } else {
            // Create new question
            savedQuestion = await quizAPI.createQuizQuestion(questionData);
          }

          console.log('Saved question:', savedQuestion);
          
          // Ensure we have the question ID
          if (!savedQuestion || !savedQuestion.id) {
            throw new Error(`فشل في حفظ السؤال: ${JSON.stringify(savedQuestion)}`);
          }

          // Save answers for multiple choice questions
          if (structuredQuestion.question_type === 'multiple_choice' && structuredQuestion.answers.length > 0) {
            console.log('Processing multiple choice answers for question:', savedQuestion.id);
            console.log('All answers:', structuredQuestion.answers);
            
            // If editing, delete all existing answers from database first
            if (question.id) {
              console.log('Deleting existing answers for question:', question.id);
              try {
                // Get all existing answers for this question from database
                const existingAnswersResponse = await quizAPI.getQuestionAnswers(question.id);
                console.log('Raw existing answers response:', existingAnswersResponse);
                
                // Handle different response formats
                let existingAnswers = [];
                if (Array.isArray(existingAnswersResponse)) {
                  existingAnswers = existingAnswersResponse;
                } else if (existingAnswersResponse && typeof existingAnswersResponse === 'object') {
                  if (Array.isArray(existingAnswersResponse.results)) {
                    existingAnswers = existingAnswersResponse.results;
                  } else if (Array.isArray(existingAnswersResponse.data)) {
                    existingAnswers = existingAnswersResponse.data;
                  }
                }
                
                if (existingAnswers.length > 0) {
                  console.log('🗑️ Deleting existing answers:', existingAnswers.map(a => ({ id: a.id, text: a.text })));
                  for (const existingAnswer of existingAnswers) {
                    try {
                      await quizAPI.deleteQuizAnswer(existingAnswer.id);
                      console.log(`✅ Deleted existing answer ${existingAnswer.id}`);
                    } catch (error) {
                      console.error(`❌ Error deleting existing answer ${existingAnswer.id}:`, error);
                      // Continue with deletion even if some fail
                    }
                  }
                } else {
                  console.log('📋 No existing answers found for question:', question.id);
                }
              } catch (error) {
                console.error('❌ Error fetching existing answers:', error);
                // Continue anyway
              }
            }
            
            // Create all answers fresh
            for (let i = 0; i < structuredQuestion.answers.length; i++) {
              const answer = structuredQuestion.answers[i];
              
              // Validate answer data
              if (!answer.text || !answer.text.trim()) {
                throw new Error(`نص الإجابة مطلوب للإجابة رقم ${i + 1}`);
              }

              const answerData = {
                question: savedQuestion.id,
                text: answer.text.trim(),
                is_correct: answer.is_correct || false,
                explanation: answer.explanation || '',
                order: i,
              };

              console.log(`Creating answer ${i + 1} with data:`, answerData);

              try {
                await quizAPI.createQuizAnswer(answerData);
                console.log(`✅ Answer ${i + 1} created successfully`);
              } catch (error) {
                console.error(`❌ Error creating answer ${i + 1}:`, error);
                throw new Error(`فشل في إنشاء الإجابة رقم ${i + 1}: ${error.message}`);
              }
            }
          }

          // Save answer for true/false questions - only save the correct answer
          if (structuredQuestion.question_type === 'true_false' && structuredQuestion.correct_answer) {
            console.log('Processing true/false answer for question:', savedQuestion.id);
            console.log('Correct answer:', structuredQuestion.correct_answer);
            
            // If editing, delete all existing answers from database first
            if (question.id) {
              console.log('Deleting existing true/false answers for question:', question.id);
              try {
                // Get all existing answers for this question from database
                const existingAnswersResponse = await quizAPI.getQuestionAnswers(question.id);
                console.log('Raw existing true/false answers response:', existingAnswersResponse);
                
                // Handle different response formats
                let existingAnswers = [];
                if (Array.isArray(existingAnswersResponse)) {
                  existingAnswers = existingAnswersResponse;
                } else if (existingAnswersResponse && typeof existingAnswersResponse === 'object') {
                  if (Array.isArray(existingAnswersResponse.results)) {
                    existingAnswers = existingAnswersResponse.results;
                  } else if (Array.isArray(existingAnswersResponse.data)) {
                    existingAnswers = existingAnswersResponse.data;
                  }
                }
                
                if (existingAnswers.length > 0) {
                  console.log('🗑️ Deleting existing true/false answers:', existingAnswers.map(a => ({ id: a.id, text: a.text })));
                  for (const existingAnswer of existingAnswers) {
                    try {
                      await quizAPI.deleteQuizAnswer(existingAnswer.id);
                      console.log(`✅ Deleted existing answer ${existingAnswer.id}`);
                    } catch (error) {
                      console.error(`❌ Error deleting existing answer ${existingAnswer.id}:`, error);
                      // Continue with deletion even if some fail
                    }
                  }
                } else {
                  console.log('📋 No existing true/false answers found for question:', question.id);
                }
              } catch (error) {
                console.error('❌ Error fetching existing answers:', error);
                // Continue anyway
              }
            }
            
            // Create only the correct answer
            const correctAnswerText = structuredQuestion.correct_answer === 'true' ? 'صح' : 'خطأ';
            const correctAnswerData = {
              question: savedQuestion.id,
              text: correctAnswerText,
              is_correct: true, // Always true since this is the correct answer
              explanation: '',
              order: 0,
            };
            console.log('Creating correct answer with data:', correctAnswerData);
            
            try {
              await quizAPI.createQuizAnswer(correctAnswerData);
              console.log(`✅ Correct answer "${correctAnswerText}" created successfully`);
            } catch (error) {
              console.error('❌ Error creating correct answer:', error);
              throw new Error(`فشل في إنشاء الإجابة الصحيحة: ${error.message}`);
            }
          }
        }
      }

      setSuccess(isEdit ? 'تم تحديث الكويز بنجاح' : 'تم إنشاء الكويز بنجاح');
      setTimeout(() => {
        navigate('/teacher/quizzes');
      }, 1500);

    } catch (err) {
      console.error('Error saving quiz:', err);
      
      // Provide more specific error messages
      let errorMessage = 'حدث خطأ في حفظ الكويز. يرجى المحاولة مرة أخرى.';
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
                <MenuItem key={module.id} value={module.id}>{module.name || module.title}</MenuItem>
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
