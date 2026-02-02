/**
 * Token Tracker API Tests
 * 
 * Run these tests with: npm test
 * Or manually test the endpoints after starting the dev server
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test configuration
const TEST_CONFIG = {
  // Test with your actual keys for manual verification
  anthropicAdminKey: process.env.TEST_ANTHROPIC_ADMIN_KEY || '',
  moonshotKey: process.env.TEST_MOONSHOT_KEY || '',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

async function runTest(name: string, fn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now();
  try {
    await fn();
    return { name, passed: true, duration: Date.now() - start };
  } catch (error) {
    return { 
      name, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start 
    };
  }
}

// Test 1: Verify API key validation accepts anthropic-admin provider
async function testApiKeyValidation() {
  // Test that the API accepts anthropic-admin as a provider
  const testKey = 'sk-ant-admin-test-key-123456789012345678901234567890';
  
  const response = await fetch(`${BASE_URL}/api/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'anthropic-admin', apiKey: testKey }),
  });

  // Should fail with 401 (unauthorized) since we're not logged in, 
  // NOT 400 (invalid provider)
  if (response.status === 400) {
    const data = await response.json();
    if (data.error === 'Invalid provider') {
      throw new Error('API rejected anthropic-admin as invalid provider');
    }
  }
  
  // Expected: 401 Unauthorized (since no session)
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

// Test 2: Verify Moonshot API endpoint is accessible
async function testMoonshotEndpointAccessible() {
  const response = await fetch(`${BASE_URL}/api/moonshot/usage`);
  
  // Should fail with 401 (unauthorized) since we're not logged in
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

// Test 3: Verify Anthropic usage endpoint is accessible
async function testAnthropicEndpointAccessible() {
  const response = await fetch(`${BASE_URL}/api/anthropic/usage`);
  
  // Should fail with 401 (unauthorized) since we're not logged in
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

// Test 4: Verify DELETE endpoint accepts anthropic-admin
async function testDeleteEndpoint() {
  const response = await fetch(`${BASE_URL}/api/keys?provider=anthropic-admin`, {
    method: 'DELETE',
  });

  // Should fail with 401 (unauthorized), NOT 400 (invalid provider)
  if (response.status === 400) {
    const data = await response.json();
    if (data.error === 'Invalid provider') {
      throw new Error('DELETE API rejected anthropic-admin as invalid provider');
    }
  }
  
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

// Test 5: Integration test - if we have a real moonshot key, test the full flow
async function testMoonshotIntegration() {
  if (!TEST_CONFIG.moonshotKey) {
    console.log('  ⚠️  Skipping Moonshot integration test - no test key provided');
    return;
  }

  // Note: This requires being logged in, so it will fail in automated tests
  // It's meant for manual verification
  const response = await fetch(`${BASE_URL}/api/moonshot/usage`, {
    headers: {
      // You'd need to include auth cookies here
    },
  });

  if (!response.ok) {
    throw new Error(`Moonshot API failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Verify response structure
  if (typeof data.balance !== 'string') {
    throw new Error('Invalid response structure: missing balance');
  }
  if (typeof data.currency !== 'string') {
    throw new Error('Invalid response structure: missing currency');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running Token Tracker API Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests = [
    runTest('API accepts anthropic-admin provider', testApiKeyValidation),
    runTest('Moonshot endpoint is accessible', testMoonshotEndpointAccessible),
    runTest('Anthropic endpoint is accessible', testAnthropicEndpointAccessible),
    runTest('DELETE accepts anthropic-admin provider', testDeleteEndpoint),
    runTest('Moonshot integration (optional)', testMoonshotIntegration),
  ];

  const results = await Promise.all(tests);
  
  // Print results
  console.log('\n📊 Test Results:\n');
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.duration}ms)`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
      failed++;
    } else {
      passed++;
    }
  }

  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export { runAllTests };
