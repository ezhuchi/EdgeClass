#!/usr/bin/env node

/**
 * Edge Class Smoke Tests
 * Automated tests to verify core functionality
 * 
 * Usage: node scripts/smoke.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log(`
╔════════════════════════════════════════╗
║   Edge Class Smoke Tests           ║
║   Testing: ${API_URL.padEnd(24)}║
╚════════════════════════════════════════╝
`);

let passedTests = 0;
let failedTests = 0;

// Utility function for making HTTP requests
async function request(method, endpoint, data = null) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  const json = await response.json();
  return { status: response.status, data: json };
}

// Test helper
function test(name, fn) {
  return async () => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passedTests++;
    } catch (error) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${error.message}`);
      failedTests++;
    }
  };
}

// Assert helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test Suite
const tests = [
  test('Health endpoint returns 200', async () => {
    const { status, data } = await request('GET', '/health');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.status === 'healthy', 'Health check failed');
  }),

  test('Sync user endpoint accepts valid data', async () => {
    const user = {
      id: `test_user_${Date.now()}`,
      deviceId: `test_device_${Date.now()}`,
      username: 'smoke_test_user',
      role: 'teacher',
      createdAt: Date.now()
    };
    
    const { status, data } = await request('POST', '/api/sync/users', { items: [user] });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.synced === 1, 'Expected 1 user synced');
  }),

  test('Sync quiz endpoint accepts valid data', async () => {
    const quiz = {
      id: `test_quiz_${Date.now()}`,
      title: 'Smoke Test Quiz',
      description: 'Automated test quiz',
      createdBy: 'smoke_test_user',
      createdAt: Date.now(),
      syncStatus: 'synced',
      updatedAt: Date.now()
    };
    
    const { status, data } = await request('POST', '/api/sync/quizzes', { items: [quiz] });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.synced === 1, 'Expected 1 quiz synced');
  }),

  test('Sync questions endpoint accepts batch data', async () => {
    const questions = [
      {
        id: `test_q1_${Date.now()}`,
        quizId: `test_quiz_${Date.now()}`,
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        order: 0
      },
      {
        id: `test_q2_${Date.now()}`,
        quizId: `test_quiz_${Date.now()}`,
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 1,
        order: 1
      }
    ];
    
    const { status, data } = await request('POST', '/api/sync/questions', { items: questions });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.synced === 2, 'Expected 2 questions synced');
  }),

  test('Sync attempts endpoint accepts valid data', async () => {
    const attempt = {
      id: `test_attempt_${Date.now()}`,
      quizId: `test_quiz_${Date.now()}`,
      userId: `test_user_${Date.now()}`,
      answers: { q1: 1, q2: 1 },
      score: 100,
      completedAt: Date.now(),
      syncStatus: 'synced',
      updatedAt: Date.now(),
      deviceId: `test_device_${Date.now()}`
    };
    
    const { status, data } = await request('POST', '/api/sync/attempts', { items: [attempt] });
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.synced === 1, 'Expected 1 attempt synced');
  }),

  test('Stats endpoint returns data', async () => {
    const { status, data } = await request('GET', '/api/stats');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(typeof data.totalUsers === 'number', 'Stats should include totalUsers');
    assert(typeof data.totalQuizzes === 'number', 'Stats should include totalQuizzes');
  }),

  test('Invalid sync data returns 400', async () => {
    const { status } = await request('POST', '/api/sync/users', { items: [{ invalid: 'data' }] });
    assert(status === 400 || status === 500, `Expected 400/500 for invalid data, got ${status}`);
  }),

  test('Rate limiting headers are present', async () => {
    const url = `${API_URL}/api/sync/users`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    });
    
    const hasRateLimitHeaders = 
      response.headers.has('ratelimit-limit') || 
      response.headers.has('x-ratelimit-limit');
    
    assert(hasRateLimitHeaders, 'Rate limit headers not found');
  }),
];

// Run all tests
(async () => {
  console.log(`\nRunning ${tests.length} tests...\n`);
  
  for (const testFn of tests) {
    await testFn();
  }
  
  console.log(`
╔════════════════════════════════════════╗
║   Test Results                     ║
╠════════════════════════════════════════╣
║   Passed: ${passedTests.toString().padEnd(27)}║
║   Failed: ${failedTests.toString().padEnd(27)}║
║   Total:  ${tests.length.toString().padEnd(27)}║
╚════════════════════════════════════════╝
`);

  if (failedTests > 0) {
    console.error('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
})();
