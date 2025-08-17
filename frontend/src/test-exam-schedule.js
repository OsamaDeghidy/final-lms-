// Test file for exam schedule display
console.log('Testing exam schedule display...');

// Test function to simulate exam with dates
export const testExamSchedule = () => {
  console.log('🧪 Testing exam schedule data...');
  
  const now = new Date();
  const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
  
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
    allow_multiple_attempts: true,
    max_attempts: 3,
    show_answers_after: true,
    randomize_questions: false,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    questions: []
  };
  
  console.log('✅ Sample exam with schedule:', sampleExam);
  console.log('✅ Start date:', sampleExam.start_date);
  console.log('✅ End date:', sampleExam.end_date);
  console.log('✅ Multiple attempts:', sampleExam.allow_multiple_attempts);
  console.log('✅ Max attempts:', sampleExam.max_attempts);
  
  return sampleExam;
};

// Test function to format dates
export const testDateFormatting = () => {
  console.log('🧪 Testing date formatting...');
  
  const testDates = [
    new Date().toISOString(),
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    null,
    'invalid-date'
  ];
  
  testDates.forEach((date, index) => {
    try {
      if (!date) {
        console.log(`✅ Date ${index}: null -> "غير محدد"`);
      } else {
        const formatted = new Date(date).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log(`✅ Date ${index}: ${date} -> ${formatted}`);
      }
    } catch (error) {
      console.log(`❌ Date ${index}: ${date} -> "غير محدد" (error: ${error.message})`);
    }
  });
};

// Test function to calculate time remaining
export const testTimeRemaining = () => {
  console.log('🧪 Testing time remaining calculation...');
  
  const now = new Date();
  const endDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000 + 30 * 60 * 1000); // 2 days, 5 hours, 30 minutes
  
  const timeRemaining = endDate - now;
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log('✅ Time remaining calculation:');
  console.log(`  - Total milliseconds: ${timeRemaining}`);
  console.log(`  - Days: ${days}`);
  console.log(`  - Hours: ${hours}`);
  console.log(`  - Minutes: ${minutes}`);
  console.log(`  - Formatted: ${days > 0 ? `${days} يوم ` : ''}${hours > 0 ? `${hours} ساعة ` : ''}${minutes} دقيقة`);
  
  return { days, hours, minutes };
};

// Test function to determine exam status
export const testExamStatus = (exam) => {
  console.log('🧪 Testing exam status determination...');
  
  const now = new Date();
  const startDate = exam.start_date ? new Date(exam.start_date) : null;
  const endDate = exam.end_date ? new Date(exam.end_date) : null;

  if (!exam.is_active) {
    console.log('✅ Status: معطل (inactive)');
    return { status: 'معطل', color: 'default' };
  }

  if (startDate && now < startDate) {
    console.log('✅ Status: لم يبدأ بعد (not started)');
    return { status: 'لم يبدأ بعد', color: 'warning' };
  }

  if (endDate && now > endDate) {
    console.log('✅ Status: منتهي (ended)');
    return { status: 'منتهي', color: 'error' };
  }

  if (startDate && endDate && now >= startDate && now <= endDate) {
    console.log('✅ Status: مفتوح (open)');
    return { status: 'مفتوح', color: 'success' };
  }

  console.log('✅ Status: متاح (available)');
  return { status: 'متاح', color: 'primary' };
};

// Export for browser console testing
window.testExamSchedule = testExamSchedule;
window.testDateFormatting = testDateFormatting;
window.testTimeRemaining = testTimeRemaining;
window.testExamStatus = testExamStatus;

console.log('✅ Exam schedule test functions loaded. Use testExamSchedule(), testDateFormatting(), testTimeRemaining(), or testExamStatus() to test.');
