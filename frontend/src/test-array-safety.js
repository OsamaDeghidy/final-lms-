// Test file to check array safety
console.log('Testing array safety...');

// Test function to simulate different response types
export const testArraySafety = () => {
  console.log('🧪 Testing array safety functions...');
  
  // Test 1: Normal array
  const normalArray = [1, 2, 3];
  console.log('✅ Normal array:', Array.isArray(normalArray));
  
  // Test 2: Null
  const nullValue = null;
  console.log('✅ Null value:', Array.isArray(nullValue));
  
  // Test 3: Undefined
  const undefinedValue = undefined;
  console.log('✅ Undefined value:', Array.isArray(undefinedValue));
  
  // Test 4: Object
  const objectValue = { results: [1, 2, 3] };
  console.log('✅ Object value:', Array.isArray(objectValue));
  
  // Test 5: String
  const stringValue = "test";
  console.log('✅ String value:', Array.isArray(stringValue));
  
  // Test 6: Number
  const numberValue = 123;
  console.log('✅ Number value:', Array.isArray(numberValue));
  
  // Test map safety
  console.log('\n🧪 Testing map safety...');
  
  // Safe map function
  const safeMap = (array, callback) => {
    if (Array.isArray(array)) {
      return array.map(callback);
    }
    return [];
  };
  
  console.log('✅ Safe map with array:', safeMap([1, 2, 3], x => x * 2));
  console.log('✅ Safe map with null:', safeMap(null, x => x * 2));
  console.log('✅ Safe map with object:', safeMap({}, x => x * 2));
  
  return 'Array safety tests completed!';
};

// Export for browser console testing
window.testArraySafety = testArraySafety;

console.log('✅ Array safety test functions loaded. Use testArraySafety() to test.');
