import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

// Mock the SVG imports
vi.mock('../../assets/react.svg', () => ({
  default: 'react-logo'
}))
vi.mock('../../assets/vite.svg', () => ({
  default: 'vite-logo'
}))

import {App} from './App'

describe('App component', () => {
  test('renders Vite + React heading', () => {
    render(<App />)
    // Test passes if the element is found (no assertion needed)
    screen.getByText("Vite + React")
  })
})