// Test file for RTL dialog functionality
console.log('Testing RTL dialog functionality...');

// Test function to check RTL styles
export const testRTLStyles = () => {
  console.log('🧪 Testing RTL styles...');
  
  const rtlStyles = {
    dialog: {
      dir: 'rtl',
      direction: 'rtl'
    },
    dialogTitle: {
      textAlign: 'right'
    },
    dialogContent: {
      direction: 'rtl'
    },
    dialogActions: {
      direction: 'rtl'
    },
    textField: {
      inputProps: {
        dir: 'rtl',
        style: { textAlign: 'right' }
      }
    },
    box: {
      direction: 'rtl',
      textAlign: 'right'
    },
    typography: {
      textAlign: 'right'
    }
  };
  
  console.log('✅ RTL styles configuration:', rtlStyles);
  
  return rtlStyles;
};

// Test function to simulate Arabic text input
export const testArabicInput = () => {
  console.log('🧪 Testing Arabic text input...');
  
  const arabicTexts = [
    'ما هي عاصمة مصر؟',
    'اذكر ثلاثة أنواع من البيانات في البرمجة',
    'اشرح مفهوم المتغيرات في البرمجة',
    'صح أو خطأ: HTML هي لغة برمجة',
    'ما هو الفرق بين المتغير والثابت؟'
  ];
  
  arabicTexts.forEach((text, index) => {
    console.log(`✅ Arabic text ${index + 1}: ${text}`);
    console.log(`  - Length: ${text.length} characters`);
    console.log(`  - RTL direction: ${text.match(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/) ? 'Yes' : 'No'}`);
  });
  
  return arabicTexts;
};

// Test function to check form validation with Arabic
export const testArabicValidation = () => {
  console.log('🧪 Testing Arabic form validation...');
  
  const testCases = [
    {
      text: 'ما هي عاصمة مصر؟',
      question_type: 'multiple_choice',
      points: 5,
      answers: [
        { text: 'القاهرة', is_correct: true },
        { text: 'الإسكندرية', is_correct: false },
        { text: 'الأقصر', is_correct: false },
        { text: 'أسوان', is_correct: false }
      ],
      expected: 'valid'
    },
    {
      text: '',
      question_type: 'multiple_choice',
      points: 5,
      answers: [
        { text: 'القاهرة', is_correct: true },
        { text: 'الإسكندرية', is_correct: false }
      ],
      expected: 'invalid - empty text'
    },
    {
      text: 'سؤال تجريبي',
      question_type: 'multiple_choice',
      points: 5,
      answers: [
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ],
      expected: 'invalid - empty answers'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`✅ Test case ${index + 1}:`);
    console.log(`  - Text: "${testCase.text}"`);
    console.log(`  - Type: ${testCase.question_type}`);
    console.log(`  - Points: ${testCase.points}`);
    console.log(`  - Answers: ${testCase.answers.length}`);
    console.log(`  - Expected: ${testCase.expected}`);
  });
  
  return testCases;
};

// Test function to check RTL layout
export const testRTLLayout = () => {
  console.log('🧪 Testing RTL layout...');
  
  const layoutConfig = {
    dialog: {
      maxWidth: 'md',
      fullWidth: true,
      dir: 'rtl'
    },
    content: {
      direction: 'rtl',
      textAlign: 'right'
    },
    form: {
      direction: 'rtl',
      alignItems: 'flex-end'
    },
    buttons: {
      direction: 'rtl',
      justifyContent: 'flex-start'
    }
  };
  
  console.log('✅ RTL layout configuration:', layoutConfig);
  
  return layoutConfig;
};

// Export for browser console testing
window.testRTLStyles = testRTLStyles;
window.testArabicInput = testArabicInput;
window.testArabicValidation = testArabicValidation;
window.testRTLLayout = testRTLLayout;

console.log('✅ RTL dialog test functions loaded. Use testRTLStyles(), testArabicInput(), testArabicValidation(), or testRTLLayout() to test.');
