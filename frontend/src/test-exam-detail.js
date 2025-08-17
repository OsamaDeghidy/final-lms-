// Test file for ExamDetail functionality
console.log('Testing ExamDetail functionality...');

// Test function to simulate question data
export const testQuestionData = () => {
  console.log('🧪 Testing question data structure...');
  
  const sampleQuestion = {
    id: 1,
    text: 'ما هي عاصمة مصر؟',
    question_type: 'multiple_choice',
    points: 5,
    explanation: 'القاهرة هي عاصمة مصر',
    answers: [
      { text: 'القاهرة', is_correct: true },
      { text: 'الإسكندرية', is_correct: false },
      { text: 'الأقصر', is_correct: false },
      { text: 'أسوان', is_correct: false }
    ]
  };
  
  console.log('✅ Sample question:', sampleQuestion);
  console.log('✅ Question type:', sampleQuestion.question_type);
  console.log('✅ Answers count:', sampleQuestion.answers.length);
  console.log('✅ Correct answers:', sampleQuestion.answers.filter(a => a.is_correct).length);
  
  return sampleQuestion;
};

// Test function to simulate different question types
export const testQuestionTypes = () => {
  console.log('🧪 Testing different question types...');
  
  const questionTypes = [
    {
      type: 'multiple_choice',
      label: 'اختيار من متعدد',
      answers: [
        { text: 'الإجابة الأولى', is_correct: false },
        { text: 'الإجابة الثانية', is_correct: true },
        { text: 'الإجابة الثالثة', is_correct: false },
        { text: 'الإجابة الرابعة', is_correct: false }
      ]
    },
    {
      type: 'true_false',
      label: 'صح أو خطأ',
      answers: [
        { text: 'صح', is_correct: true },
        { text: 'خطأ', is_correct: false }
      ]
    },
    {
      type: 'short_answer',
      label: 'إجابة قصيرة',
      answers: [
        { text: 'الإجابة الصحيحة', is_correct: true }
      ]
    }
  ];
  
  questionTypes.forEach(qt => {
    console.log(`✅ ${qt.label}: ${qt.answers.length} إجابة`);
  });
  
  return questionTypes;
};

// Test function to validate question data
export const validateQuestion = (question) => {
  console.log('🧪 Validating question data...');
  
  const errors = [];
  
  if (!question.text || !question.text.trim()) {
    errors.push('نص السؤال مطلوب');
  }
  
  if (!question.answers || question.answers.length === 0) {
    errors.push('يجب وجود إجابات');
  }
  
  if (question.question_type === 'multiple_choice') {
    const validAnswers = question.answers.filter(a => a.text && a.text.trim());
    if (validAnswers.length < 2) {
      errors.push('يجب إدخال إجابتين على الأقل');
    }
    
    const correctAnswers = question.answers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) {
      errors.push('يجب اختيار إجابة صحيحة واحدة على الأقل');
    }
  }
  
  if (question.question_type === 'true_false') {
    const correctAnswers = question.answers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) {
      errors.push('يجب اختيار إجابة صحيحة');
    }
  }
  
  if (question.question_type === 'short_answer') {
    if (!question.answers[0] || !question.answers[0].text.trim()) {
      errors.push('يجب إدخال الإجابة الصحيحة');
    }
  }
  
  if (errors.length > 0) {
    console.log('❌ Validation errors:', errors);
  } else {
    console.log('✅ Question is valid');
  }
  
  return errors.length === 0;
};

// Export for browser console testing
window.testQuestionData = testQuestionData;
window.testQuestionTypes = testQuestionTypes;
window.validateQuestion = validateQuestion;

console.log('✅ ExamDetail test functions loaded. Use testQuestionData(), testQuestionTypes(), or validateQuestion() to test.');
