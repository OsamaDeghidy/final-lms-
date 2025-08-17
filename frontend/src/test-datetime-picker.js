// Test file for datetime picker functionality
console.log('Testing datetime picker functionality...');

// Test function to format datetime for API
export const testDateTimeFormatting = () => {
  console.log('🧪 Testing datetime formatting...');
  
  const testCases = [
    {
      input: '2024-01-15T09:30',
      expected: '2024-01-15T09:30:00.000Z',
      description: 'Local datetime to ISO'
    },
    {
      input: '2024-12-31T23:59',
      expected: '2024-12-31T23:59:00.000Z',
      description: 'End of year datetime'
    },
    {
      input: '',
      expected: null,
      description: 'Empty string'
    },
    {
      input: null,
      expected: null,
      description: 'Null value'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`✅ Test case ${index + 1}: ${testCase.description}`);
    console.log(`  - Input: ${testCase.input}`);
    console.log(`  - Expected: ${testCase.expected}`);
    
    if (testCase.input) {
      const date = new Date(testCase.input);
      const result = date.toISOString();
      console.log(`  - Result: ${result}`);
      console.log(`  - Match: ${result === testCase.expected ? '✅' : '❌'}`);
    }
  });
  
  return testCases;
};

// Test function to format datetime for input
export const testDateTimeForInput = () => {
  console.log('🧪 Testing datetime for input formatting...');
  
  const testCases = [
    {
      input: '2024-01-15T09:30:00.000Z',
      expected: '2024-01-15T09:30',
      description: 'ISO to local datetime'
    },
    {
      input: '2024-12-31T23:59:00.000Z',
      expected: '2024-12-31T23:59',
      description: 'End of year ISO'
    },
    {
      input: '',
      expected: '',
      description: 'Empty string'
    },
    {
      input: null,
      expected: '',
      description: 'Null value'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`✅ Test case ${index + 1}: ${testCase.description}`);
    console.log(`  - Input: ${testCase.input}`);
    console.log(`  - Expected: ${testCase.expected}`);
    
    if (testCase.input) {
      const date = new Date(testCase.input);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const result = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log(`  - Result: ${result}`);
      console.log(`  - Match: ${result === testCase.expected ? '✅' : '❌'}`);
    }
  });
  
  return testCases;
};

// Test function to validate date ranges
export const testDateValidation = () => {
  console.log('🧪 Testing date validation...');
  
  const testCases = [
    {
      startDate: '2024-01-15T09:00',
      endDate: '2024-01-15T10:00',
      expected: true,
      description: 'Valid range - same day'
    },
    {
      startDate: '2024-01-15T09:00',
      endDate: '2024-01-16T09:00',
      expected: true,
      description: 'Valid range - different days'
    },
    {
      startDate: '2024-01-15T10:00',
      endDate: '2024-01-15T09:00',
      expected: false,
      description: 'Invalid range - end before start'
    },
    {
      startDate: '2024-01-15T09:00',
      endDate: '2024-01-15T09:00',
      expected: false,
      description: 'Invalid range - same time'
    },
    {
      startDate: '',
      endDate: '2024-01-15T10:00',
      expected: true,
      description: 'Valid - only end date'
    },
    {
      startDate: '2024-01-15T09:00',
      endDate: '',
      expected: true,
      description: 'Valid - only start date'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`✅ Test case ${index + 1}: ${testCase.description}`);
    console.log(`  - Start: ${testCase.startDate}`);
    console.log(`  - End: ${testCase.endDate}`);
    console.log(`  - Expected: ${testCase.expected}`);
    
    if (testCase.startDate && testCase.endDate) {
      const startDate = new Date(testCase.startDate);
      const endDate = new Date(testCase.endDate);
      const isValid = startDate < endDate;
      console.log(`  - Result: ${isValid}`);
      console.log(`  - Match: ${isValid === testCase.expected ? '✅' : '❌'}`);
    } else {
      console.log(`  - Result: true (skipped validation)`);
      console.log(`  - Match: ${testCase.expected === true ? '✅' : '❌'}`);
    }
  });
  
  return testCases;
};

// Test function to simulate form data
export const testFormData = () => {
  console.log('🧪 Testing form data structure...');
  
  const formData = {
    title: 'امتحان تجريبي',
    description: 'وصف الامتحان',
    course: '1',
    module: '2',
    time_limit: '60',
    pass_mark: '70',
    total_points: '100',
    is_final: false,
    is_active: true,
    allow_multiple_attempts: true,
    max_attempts: '3',
    show_answers_after: true,
    randomize_questions: false,
    start_date: '2024-01-15T09:00',
    end_date: '2024-01-15T11:00'
  };
  
  console.log('✅ Form data structure:', formData);
  console.log('✅ Start date:', formData.start_date);
  console.log('✅ End date:', formData.end_date);
  
  return formData;
};

// Export for browser console testing
window.testDateTimeFormatting = testDateTimeFormatting;
window.testDateTimeForInput = testDateTimeForInput;
window.testDateValidation = testDateValidation;
window.testFormData = testFormData;

console.log('✅ Datetime picker test functions loaded. Use testDateTimeFormatting(), testDateTimeForInput(), testDateValidation(), or testFormData() to test.');
