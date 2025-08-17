// Test file to check examAPI import
import { examAPI } from './services/exam.service.js';

console.log('examAPI imported successfully:', examAPI);
console.log('Available methods:', Object.keys(examAPI));

// Test if examAPI has the expected methods
const expectedMethods = [
  'getExams',
  'getExam', 
  'createExam',
  'updateExam',
  'deleteExam',
  'getExamQuestions',
  'addQuestion',
  'updateQuestion',
  'deleteQuestion',
  'getExamAttempts',
  'getExamStatistics'
];

expectedMethods.forEach(method => {
  if (typeof examAPI[method] === 'function') {
    console.log(`✅ ${method} is available`);
  } else {
    console.log(`❌ ${method} is missing`);
  }
});

export { examAPI };
