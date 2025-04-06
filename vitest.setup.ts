import '@testing-library/jest-dom'

// Mock import.meta.env for tests
vi.mock('import.meta.env', () => ({
  MODE: 'test',
  DEV: true,
  PROD: false,
  PUBLIC_ENV__APP_ENV: 'test',
  SERVER_ENV__AWS_ACCOUNT_ID: '123456789012',
}))