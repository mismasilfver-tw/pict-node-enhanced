/**
 * Custom Jest test results processor
 * Provides a summary of test results and visualizes the test pyramid distribution
 */

module.exports = function(results) {
  // Count tests by type based on file path
  const unitTests = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  const integrationTests = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  const e2eTests = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Process test results
  results.testResults.forEach(testFile => {
    const filePath = testFile.testFilePath;
    
    // Categorize tests based on file path
    let testCategory;
    if (filePath.includes('/e2e/')) {
      testCategory = e2eTests;
    } else if (filePath.includes('/api/')) {
      testCategory = integrationTests;
    } else {
      testCategory = unitTests;
    }
    
    // Count tests
    testFile.testResults.forEach(test => {
      testCategory.total++;
      
      if (test.status === 'passed') {
        testCategory.passed++;
      } else {
        testCategory.failed++;
      }
    });
  });
  
  // Calculate totals
  const totalTests = unitTests.total + integrationTests.total + e2eTests.total;
  const totalPassed = unitTests.passed + integrationTests.passed + e2eTests.passed;
  const totalFailed = unitTests.failed + integrationTests.failed + e2eTests.failed;
  
  // Calculate percentages for the pyramid
  const unitPercent = totalTests > 0 ? (unitTests.total / totalTests * 100).toFixed(1) : 0;
  const integrationPercent = totalTests > 0 ? (integrationTests.total / totalTests * 100).toFixed(1) : 0;
  const e2ePercent = totalTests > 0 ? (e2eTests.total / totalTests * 100).toFixed(1) : 0;
  
  // Create a visual representation of the test pyramid
  console.log('\n');
  console.log('=== TEST PYRAMID DISTRIBUTION ===');
  console.log(`E2E Tests:          ${'█'.repeat(Math.ceil(e2ePercent / 5))} ${e2ePercent}% (${e2eTests.total} tests)`);
  console.log(`Integration Tests:  ${'█'.repeat(Math.ceil(integrationPercent / 5))} ${integrationPercent}% (${integrationTests.total} tests)`);
  console.log(`Unit Tests:         ${'█'.repeat(Math.ceil(unitPercent / 5))} ${unitPercent}% (${unitTests.total} tests)`);
  console.log('\n');
  console.log('=== TEST RESULTS SUMMARY ===');
  console.log(`Total Tests:  ${totalTests}`);
  console.log(`Passed:       ${totalPassed}`);
  console.log(`Failed:       ${totalFailed}`);
  console.log(`Success Rate: ${totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0}%`);
  console.log('\n');
  
  // Check if the distribution matches the ideal test pyramid (70/20/10)
  const idealDistribution = {
    unit: 70,
    integration: 20,
    e2e: 10
  };
  
  if (totalTests >= 10) {
    console.log('=== TEST PYRAMID ANALYSIS ===');
    
    if (unitPercent < 60) {
      console.log('⚠️  Unit tests are underrepresented. Consider adding more unit tests.');
    }
    
    if (e2ePercent > 15) {
      console.log('⚠️  E2E tests are overrepresented. Consider focusing more on unit tests.');
    }
    
    if (unitPercent >= 60 && integrationPercent >= 15 && e2ePercent <= 15) {
      console.log('✅ Test distribution follows the test pyramid principle well!');
    }
    
    console.log('\n');
  }
  
  // Return the original results object
  return results;
};
