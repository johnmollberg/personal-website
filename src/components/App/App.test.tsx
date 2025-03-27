import { render, screen } from '@testing-library/react';
import { describe, expect, test, jest } from '@jest/globals';

// Mock the SVG imports
jest.mock('../../assets/react.svg', () => 'react-logo');
jest.mock('../../assets/vite.svg', () => 'vite-logo');

import App from './App';

describe('App component', () => {
  test('renders Vite + React heading', () => {
    render(<App />);
    // Test passes if the element is found (no assertion needed)
    screen.getByText("Vite + React");
  });
});