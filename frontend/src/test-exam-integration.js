/**
 * Test script for exam integration in frontend
 * Run this in browser console to test the exam API integration
 */

// Test configuration
const API_BASE = 'http://localhost:8000/api';
const TEST_EXAM_DATA = {
  title: 'امتحان تجريبي للفرونت إند',
  description: 'امتحان لاختبار تكامل الفرونت إند مع الباك إند',
  course: 1, // Make sure this course exists
  time_limit: 30,
  pass_mark: 60,
  total_points: 50,
  is_final: false,
  is_active: true,
  allow_multiple_attempts: true,
  max_attempts: 2,
  show_answers_after: true,
  randomize_questions: false
};

// Helper function to get auth token
async function getAuthToken() {
  const loginData = {
    email: 'admin@example.com', // Replace with actual admin email
    password: 'admin123' // Replace with actual admin password
  };

  try {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Failed to get auth token');
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  return fetch(url, { ...defaultOptions, ...options });
}

// Test functions
async function testGetExams() {
  console.log('🧪 Testing GET /exams/...');
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/`);
    const data = await response.json();
    
    console.log('✅ GET /exams/ successful');
    console.log(`Found ${data.results ? data.results.length : data.length} exams`);
    return data;
  } catch (error) {
    console.error('❌ GET /exams/ failed:', error);
    return null;
  }
}

async function testCreateExam() {
  console.log('🧪 Testing POST /exams/...');
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/`, {
      method: 'POST',
      body: JSON.stringify(TEST_EXAM_DATA)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Create failed: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('✅ POST /exams/ successful');
    console.log('Created exam with ID:', data.id);
    return data;
  } catch (error) {
    console.error('❌ POST /exams/ failed:', error);
    return null;
  }
}

async function testGetExam(examId) {
  console.log(`🧪 Testing GET /exams/${examId}/...`);
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/${examId}/`);
    const data = await response.json();
    
    console.log('✅ GET /exams/{id}/ successful');
    console.log('Exam details:', data);
    return data;
  } catch (error) {
    console.error('❌ GET /exams/{id}/ failed:', error);
    return null;
  }
}

async function testUpdateExam(examId) {
  console.log(`🧪 Testing PUT /exams/${examId}/...`);
  
  const updateData = {
    ...TEST_EXAM_DATA,
    title: 'امتحان محدث للفرونت إند'
  };
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/${examId}/`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Update failed: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('✅ PUT /exams/{id}/ successful');
    console.log('Updated exam:', data);
    return data;
  } catch (error) {
    console.error('❌ PUT /exams/{id}/ failed:', error);
    return null;
  }
}

async function testGetExamQuestions(examId) {
  console.log(`🧪 Testing GET /exams/${examId}/questions/...`);
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/${examId}/questions/`);
    const data = await response.json();
    
    console.log('✅ GET /exams/{id}/questions/ successful');
    console.log(`Found ${data.length} questions`);
    return data;
  } catch (error) {
    console.error('❌ GET /exams/{id}/questions/ failed:', error);
    return null;
  }
}

async function testAddExamQuestion(examId) {
  console.log(`🧪 Testing POST /exams/${examId}/questions/add/...`);
  
  const questionData = {
    text: 'ما هو React؟',
    question_type: 'multiple_choice',
    points: 5,
    explanation: 'React هي مكتبة JavaScript لبناء واجهات المستخدم'
  };
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/${examId}/questions/add/`, {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Add question failed: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('✅ POST /exams/{id}/questions/add/ successful');
    console.log('Added question:', data);
    return data;
  } catch (error) {
    console.error('❌ POST /exams/{id}/questions/add/ failed:', error);
    return null;
  }
}

async function testGetExamStatistics(examId) {
  console.log(`🧪 Testing GET /exams/${examId}/statistics/...`);
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/${examId}/statistics/`);
    const data = await response.json();
    
    console.log('✅ GET /exams/{id}/statistics/ successful');
    console.log('Statistics:', data);
    return data;
  } catch (error) {
    console.error('❌ GET /exams/{id}/statistics/ failed:', error);
    return null;
  }
}

async function testDeleteExam(examId) {
  console.log(`🧪 Testing DELETE /exams/${examId}/...`);
  
  try {
    const response = await makeAuthenticatedRequest(`${API_BASE}/assignments/exams/${examId}/`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }
    
    console.log('✅ DELETE /exams/{id}/ successful');
    return true;
  } catch (error) {
    console.error('❌ DELETE /exams/{id}/ failed:', error);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Exam API Integration Tests...');
  console.log('=' .repeat(50));
  
  // Test 1: Get all exams
  const exams = await testGetExams();
  
  // Test 2: Create new exam
  const newExam = await testCreateExam();
  if (!newExam) {
    console.log('❌ Cannot continue tests without creating exam');
    return;
  }
  
  const examId = newExam.id;
  
  // Test 3: Get specific exam
  await testGetExam(examId);
  
  // Test 4: Update exam
  await testUpdateExam(examId);
  
  // Test 5: Get exam questions
  await testGetExamQuestions(examId);
  
  // Test 6: Add question to exam
  await testAddExamQuestion(examId);
  
  // Test 7: Get exam statistics
  await testGetExamStatistics(examId);
  
  // Test 8: Delete exam
  await testDeleteExam(examId);
  
  console.log('=' .repeat(50));
  console.log('🎉 All tests completed!');
}

// Export for use in browser console
window.testExamIntegration = {
  runAllTests,
  testGetExams,
  testCreateExam,
  testGetExam,
  testUpdateExam,
  testGetExamQuestions,
  testAddExamQuestion,
  testGetExamStatistics,
  testDeleteExam
};

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  console.log('📝 Exam Integration Test Script Loaded');
  console.log('Run: window.testExamIntegration.runAllTests() to start tests');
}

export {
  runAllTests,
  testGetExams,
  testCreateExam,
  testGetExam,
  testUpdateExam,
  testGetExamQuestions,
  testAddExamQuestion,
  testGetExamStatistics,
  testDeleteExam
};
