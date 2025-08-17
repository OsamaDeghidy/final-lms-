// Test file to check modules loading
import { courseAPI } from './services/courseService.js';

console.log('Testing modules loading...');

// Test function to load modules for a course
export const testModulesLoading = async (courseId) => {
  try {
    console.log(`🔍 Testing modules loading for course ID: ${courseId}`);
    
    // Test getCourseModules
    console.log('📖 Calling getCourseModules...');
    const modulesResponse = await courseAPI.getCourseModules(courseId);
    console.log('📦 Modules response:', modulesResponse);
    
    const modules = modulesResponse.results || modulesResponse || [];
    console.log(`✅ Found ${modules.length} modules`);
    
    modules.forEach((module, index) => {
      console.log(`  ${index + 1}. ${module.name} (ID: ${module.id})`);
    });
    
    return modules;
  } catch (error) {
    console.error('❌ Error loading modules:', error);
    return [];
  }
};

// Test function to load courses first
export const testCoursesLoading = async () => {
  try {
    console.log('📚 Loading courses...');
    const coursesResponse = await courseAPI.getCourses();
    console.log('📦 Courses response:', coursesResponse);
    
    const courses = coursesResponse.results || coursesResponse || [];
    console.log(`✅ Found ${courses.length} courses`);
    
    if (courses.length > 0) {
      console.log('🎯 First course:', courses[0]);
      return courses[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error loading courses:', error);
    return null;
  }
};

// Auto-test function
export const runModulesTest = async () => {
  console.log('🚀 Starting modules loading test...');
  
  const courseId = await testCoursesLoading();
  if (courseId) {
    await testModulesLoading(courseId);
  } else {
    console.log('❌ No courses found to test modules');
  }
};

// Export for browser console testing
window.testModulesLoading = testModulesLoading;
window.testCoursesLoading = testCoursesLoading;
window.runModulesTest = runModulesTest;

console.log('✅ Modules test functions loaded. Use runModulesTest() to test.');
