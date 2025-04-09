import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock import.meta.env for tests
vi.mock('import.meta.env', () => ({
  MODE: 'test',
  DEV: true,
  PROD: false,
  PUBLIC_ENV__APP_ENV: 'test',
  PUBLIC_ENV__AWS_ACCOUNT_ID: '123456789012',
}))