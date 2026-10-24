import assert from 'node:assert/strict';
import test from 'node:test';
import { apiRequest, ApiRequestError } from './api-client.mjs';

test('joins auth endpoint to the configured API base without duplicating /api', async () => {
  let requestedUrl;
  const response = await apiRequest(
    'https://api.example.test/api/',
    '/auth/login',
    { method: 'POST' },
    async (url) => {
      requestedUrl = url.href;
      return { ok: true, status: 200, json: async () => ({ token: 'test-token' }) };
    }
  );

  assert.equal(requestedUrl, 'https://api.example.test/api/auth/login');
  assert.deepEqual(response, { token: 'test-token' });
});

test('preserves backend validation messages and HTTP status', async () => {
  await assert.rejects(
    apiRequest('https://api.example.test/api', 'auth/signup', {}, async () => ({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Name is required.' })
    })),
    (error) => error instanceof ApiRequestError
      && error.kind === 'validation'
      && error.status === 400
      && error.message === 'Name is required. (HTTP 400)'
  );
});

test('reports an unreadable non-2xx response using its HTTP status', async () => {
  await assert.rejects(
    apiRequest('https://api.example.test/api', 'auth/login', {}, async () => ({
      ok: false,
      status: 503,
      json: async () => { throw new SyntaxError('not JSON'); }
    })),
    (error) => error instanceof ApiRequestError
      && error.kind === 'server'
      && error.status === 503
      && error.message === 'API request failed. (HTTP 503)'
  );
});

test('classifies fetch rejection as a browser-level connection failure', async () => {
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await assert.rejects(
      apiRequest('https://api.example.test/api', 'auth/login', {}, async () => {
        throw new TypeError('Failed to fetch');
      }),
      (error) => error instanceof ApiRequestError
        && error.kind === 'connection'
        && error.status === null
        && error.message.includes('CORS block')
    );
  } finally {
    console.warn = originalWarn;
  }
});
