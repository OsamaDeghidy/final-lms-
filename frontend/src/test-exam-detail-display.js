// Test file for exam detail display
console.log('Testing exam detail display...');

// Test function to simulate exam data
export const testExamDisplay = () => {
  console.log('🧪 Testing exam display data...');
  
  const sampleExam = {
    id: 1,
    title: 'امتحان الوحدة الأولى',
    description: 'امتحان شامل للوحدة الأولى',
    course: {
      id: 1,
      title: 'مقدمة في البرمجة'
    },
    module: {
      id: 1,
      name: 'الوحدة الأولى: أساسيات البرمجة'
    },
    time_limit: 60,
    pass_mark: 70,
    total_points: 100,
    is_final: false,
    is_active: true,
    questions: [
      {
        id: 1,
        text: 'ما هي عاصمة مصر؟',
        question_type: 'multiple_choice',
        points: 5,
        answers: [
          { text: 'القاهرة', is_correct: true },
          { text: 'الإسكندرية', is_correct: false },
          { text: 'الأقصر', is_correct: false },
          { text: 'أسوان', is_correct: false }
        ]
      }
    ]
  };
  
  console.log('✅ Sample exam:', sampleExam);
  console.log('✅ Course:', sampleExam.course);
  console.log('✅ Module:', sampleExam.module);
  console.log('✅ Questions count:', sampleExam.questions.length);
  
  return sampleExam;
};

// Test function to check data structure
export const validateExamData = (exam) => {
  console.log('🧪 Validating exam data structure...');
  
  const issues = [];
  
  if (!exam.title) {
    issues.push('عنوان الامتحان مفقود');
  }
  
  if (!exam.course) {
    issues.push('بيانات الدورة مفقودة');
  } else if (!exam.course.title) {
    issues.push('عنوان الدورة مفقود');
  }
  
  if (!exam.module) {
    issues.push('بيانات الوحدة مفقودة');
  } else if (!exam.module.name) {
    issues.push('اسم الوحدة مفقود');
  }
  
  if (issues.length > 0) {
    console.log('❌ Data issues found:', issues);
  } else {
    console.log('✅ Exam data structure is valid');
  }
  
  return issues.length === 0;
};

// Test function to simulate API response
export const simulateAPIResponse = () => {
  console.log('🧪 Simulating API response...');
  
  const apiResponse = {
    id: 1,
    title: 'امتحان تجريبي',
    description: 'وصف الامتحان',
    course: {
      id: 1,
      title: 'دورة تجريبية'
    },
    module: {
      id: 1,
      name: 'وحدة تجريبية'
    },
    time_limit: 30,
    pass_mark: 60,
    total_points: 50,
    is_final: false,
    is_active: true,
    questions: []
  };
  
  console.log('✅ API Response:', apiResponse);
  console.log('✅ Course title:', apiResponse.course?.title);
  console.log('✅ Module name:', apiResponse.module?.name);
  
  return apiResponse;
};

// Export for browser console testing
window.testExamDisplay = testExamDisplay;
window.validateExamData = validateExamData;
window.simulateAPIResponse = simulateAPIResponse;

console.log('✅ Exam detail display test functions loaded. Use testExamDisplay(), validateExamData(), or simulateAPIResponse() to test.');
